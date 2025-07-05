// File processing interfaces and types

export interface FileProcessingResult {
  success: boolean;
  extractedText?: string;
  error?: string;
  metadata?: {
    wordCount: number;
    characterCount: number;
    estimatedReadingTime: number; // in minutes
  };
}

export interface ProcessedFile {
  file: File;
  result: FileProcessingResult;
}

export interface FileProcessingInterface {
  /**
   * Process a file and extract text content
   */
  processFile(file: File): Promise<FileProcessingResult>;

  /**
   * Check if a file type is supported for processing
   */
  isFileTypeSupported(file: File): boolean;

  /**
   * Get supported file types
   */
  getSupportedFileTypes(): string[];

  /**
   * Process multiple files concurrently
   */
  processFiles(files: File[]): Promise<ProcessedFile[]>;
}

/**
 * File processing service that extracts text content from various file formats
 */
export class FileProcessingService implements FileProcessingInterface {
  private readonly supportedTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  private readonly supportedExtensions = ['.txt', '.pdf', '.doc', '.docx'];

  /**
   * Process a single file and extract text content
   */
  async processFile(file: File): Promise<FileProcessingResult> {
    try {
      if (!this.isFileTypeSupported(file)) {
        return {
          success: false,
          error: `Unsupported file type: ${file.type || 'unknown'}`,
        };
      }

      let extractedText: string;

      // Process based on file type
      if (
        file.type === 'text/plain' ||
        this.getFileExtension(file.name) === '.txt'
      ) {
        extractedText = await this.extractTextFromTxt(file);
      } else if (
        file.type === 'application/pdf' ||
        this.getFileExtension(file.name) === '.pdf'
      ) {
        extractedText = await this.extractTextFromPdf(file);
      } else if (
        file.type === 'application/msword' ||
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        ['.doc', '.docx'].includes(this.getFileExtension(file.name))
      ) {
        extractedText = await this.extractTextFromDoc(file);
      } else {
        return {
          success: false,
          error: `Unable to process file type: ${file.type}`,
        };
      }

      // Clean and validate extracted text
      const cleanedText = this.cleanExtractedText(extractedText);

      if (!cleanedText.trim()) {
        return {
          success: false,
          error: 'No readable text content found in the file',
        };
      }

      // Calculate metadata
      const metadata = this.calculateTextMetadata(cleanedText);

      return {
        success: true,
        extractedText: cleanedText,
        metadata,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: `Failed to process file: ${errorMessage}`,
      };
    }
  }

  /**
   * Check if a file type is supported
   */
  isFileTypeSupported(file: File): boolean {
    const extension = this.getFileExtension(file.name);
    return (
      this.supportedTypes.includes(file.type) ||
      this.supportedExtensions.includes(extension)
    );
  }

  /**
   * Get list of supported file types
   */
  getSupportedFileTypes(): string[] {
    return [...this.supportedExtensions];
  }

  /**
   * Process multiple files concurrently
   */
  async processFiles(files: File[]): Promise<ProcessedFile[]> {
    const promises = files.map(async file => ({
      file,
      result: await this.processFile(file),
    }));

    return Promise.all(promises);
  }

  /**
   * Extract text from TXT files
   */
  private async extractTextFromTxt(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        if (typeof event.target?.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error('Failed to read text file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Extract text from PDF files (basic implementation)
   * Note: This is a placeholder - in a real implementation, you'd use a library like pdf-parse
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async extractTextFromPdf(_file: File): Promise<string> {
    // For now, return a placeholder indicating PDF processing is not fully implemented
    // In a real implementation, you would use a library like pdf-parse or pdf2pic
    throw new Error(
      'PDF text extraction requires additional libraries. Please use TXT files for now.'
    );
  }

  /**
   * Extract text from DOC/DOCX files (basic implementation)
   * Note: This is a placeholder - in a real implementation, you'd use a library like mammoth.js
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async extractTextFromDoc(_file: File): Promise<string> {
    // For now, return a placeholder indicating DOC processing is not fully implemented
    // In a real implementation, you would use a library like mammoth.js for DOCX or textract for DOC
    throw new Error(
      'DOC/DOCX text extraction requires additional libraries. Please use TXT files for now.'
    );
  }

  /**
   * Clean and normalize extracted text
   */
  private cleanExtractedText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n') // Handle old Mac line endings
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
      .trim();
  }

  /**
   * Calculate metadata for extracted text
   */
  private calculateTextMetadata(text: string) {
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = text.length;
    const estimatedReadingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

    return {
      wordCount,
      characterCount,
      estimatedReadingTime,
    };
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1
      ? filename.substring(lastDotIndex).toLowerCase()
      : '';
  }
}
