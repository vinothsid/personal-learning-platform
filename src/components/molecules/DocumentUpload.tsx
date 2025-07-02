import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { Button } from '../atoms/Button';

export interface DocumentUploadProps {
  onFileSelect: (files: File[]) => void;
  onError: (error: string) => void;
  loading?: boolean;
  maxSize?: number; // in bytes, default 10MB
  acceptedTypes?: string[];
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
  loading = false,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        onError(error);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFileSelect(validFiles);
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

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragOver
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-4xl mb-4">{loading ? '⏳' : '📁'}</div>
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
        disabled={loading}
      />

      <Button
        variant="primary"
        size="large"
        onClick={handleButtonClick}
        disabled={loading}
      >
        {loading ? 'Uploading...' : 'Choose Files'}
      </Button>

      <p className="text-sm text-gray-500 mt-2">or drag and drop files here</p>

      <p className="text-xs text-gray-400 mt-2">
        Maximum file size: {formatFileSize(maxSize)}
      </p>
    </div>
  );
}
