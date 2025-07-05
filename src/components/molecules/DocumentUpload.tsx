import { useRef, useState, DragEvent, ChangeEvent, useEffect } from 'react';
import { Button } from '../atoms/Button';

export interface UploadStatus {
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
  uploadedFiles?: File[];
}

export interface DocumentUploadProps {
  onFileSelect: (files: File[]) => void;
  onError: (error: string) => void;
  onUploadComplete?: (files: File[]) => void;
  loading?: boolean;
  maxSize?: number; // in bytes, default 10MB
  acceptedTypes?: string[];
  uploadStatus?: UploadStatus;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ACCEPTED_TYPES = ['.pdf', '.doc', '.docx', '.txt'];
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export function DocumentUpload({
  onFileSelect,
  onError,
  onUploadComplete,
  loading = false,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  uploadStatus = { status: 'idle' },
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [internalStatus, setInternalStatus] = useState<UploadStatus>({
    status: 'idle',
  });

  // Use external status if provided, otherwise use internal status
  const currentStatus =
    uploadStatus.status !== 'idle' ? uploadStatus : internalStatus;

  // Auto-clear success/error messages after 5 seconds
  useEffect(() => {
    if (
      currentStatus.status === 'success' ||
      currentStatus.status === 'error'
    ) {
      const timer = setTimeout(() => {
        setInternalStatus({ status: 'idle' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentStatus.status]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File ${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}.`;
    }

    // Check file type
    const isValidType =
      ACCEPTED_MIME_TYPES.includes(file.type) ||
      acceptedTypes.some(type =>
        file.name.toLowerCase().endsWith(type.toLowerCase())
      );

    if (!isValidType) {
      return `File ${file.name} has unsupported format. Supported formats: PDF, DOC, DOCX, TXT`;
    }

    return null;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    // Validate files
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        setInternalStatus({ status: 'error', message: error });
        onError(error);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      // Set uploading status
      setInternalStatus({
        status: 'uploading',
        message: `Uploading ${validFiles.length} file${validFiles.length > 1 ? 's' : ''}...`,
      });

      try {
        // Call the file select handler
        await onFileSelect(validFiles);

        // Set success status
        setInternalStatus({
          status: 'success',
          message: `Successfully uploaded ${validFiles.length} file${validFiles.length > 1 ? 's' : ''}`,
          uploadedFiles: validFiles,
        });

        // Call completion callback if provided
        onUploadComplete?.(validFiles);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';
        setInternalStatus({ status: 'error', message: errorMessage });
        onError(errorMessage);
      }
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    handleFiles(event.dataTransfer.files);
  };

  const getStatusIcon = () => {
    switch (currentStatus.status) {
      case 'uploading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📁';
    }
  };

  const getStatusColor = () => {
    switch (currentStatus.status) {
      case 'uploading':
        return 'border-blue-400 bg-blue-50';
      case 'success':
        return 'border-green-400 bg-green-50';
      case 'error':
        return 'border-red-400 bg-red-50';
      default:
        return isDragOver
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400';
    }
  };

  const isDisabled = loading || currentStatus.status === 'uploading';

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${getStatusColor()}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-4xl mb-4">{getStatusIcon()}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload your study materials
        </h3>
        <p className="text-gray-600 mb-4">
          Support for PDF, DOC, TXT files to create flashcards from your content
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Upload documents"
          disabled={isDisabled}
        />

        <Button
          variant="primary"
          size="large"
          onClick={handleButtonClick}
          disabled={isDisabled}
        >
          {currentStatus.status === 'uploading'
            ? 'Uploading...'
            : 'Choose Files'}
        </Button>

        <p className="text-sm text-gray-500 mt-2">
          or drag and drop files here
        </p>

        <p className="text-xs text-gray-400 mt-2">
          Maximum file size: {formatFileSize(maxSize)}
        </p>
      </div>

      {/* Status Message */}
      {currentStatus.message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm ${
            currentStatus.status === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : currentStatus.status === 'error'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}
        >
          <div className="flex items-center">
            <span className="mr-2">
              {currentStatus.status === 'success'
                ? '✅'
                : currentStatus.status === 'error'
                  ? '❌'
                  : '⏳'}
            </span>
            {currentStatus.message}
          </div>
          {currentStatus.uploadedFiles &&
            currentStatus.uploadedFiles.length > 0 && (
              <div className="mt-2 text-xs">
                <strong>Uploaded files:</strong>
                <ul className="list-disc list-inside ml-2">
                  {currentStatus.uploadedFiles.map((file, index) => (
                    <li key={index}>
                      {file.name} ({formatFileSize(file.size)})
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
