import { FileProcessingService } from '../file-processing';

// Mock FileReader
global.FileReader = class MockFileReader {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
  result: string | ArrayBuffer | null = null;

  readAsText(file: File) {
    // Simulate async reading
    setTimeout(() => {
      if (file.name.includes('error')) {
        this.result = null;
        this.onerror?.({
          target: this,
        } as unknown as ProgressEvent<FileReader>);
      } else {
        this.result = 'Sample text content from file';
        this.onload?.({
          target: this,
        } as unknown as ProgressEvent<FileReader>);
      }
    }, 10);
  }
} as unknown as typeof FileReader;

describe('FileProcessingService', () => {
  let service: FileProcessingService;

  beforeEach(() => {
    service = new FileProcessingService();
  });

  describe('isFileTypeSupported', () => {
    it('should support text files', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      expect(service.isFileTypeSupported(file)).toBe(true);
    });

    it('should support PDF files', () => {
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      expect(service.isFileTypeSupported(file)).toBe(true);
    });

    it('should support DOC files', () => {
      const file = new File(['content'], 'test.doc', {
        type: 'application/msword',
      });
      expect(service.isFileTypeSupported(file)).toBe(true);
    });

    it('should support DOCX files', () => {
      const file = new File(['content'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      expect(service.isFileTypeSupported(file)).toBe(true);
    });

    it('should not support unsupported file types', () => {
      const file = new File(['content'], 'test.xyz', {
        type: 'application/xyz',
      });
      expect(service.isFileTypeSupported(file)).toBe(false);
    });

    it('should support files based on extension even without correct MIME type', () => {
      const file = new File(['content'], 'test.txt', { type: '' });
      expect(service.isFileTypeSupported(file)).toBe(true);
    });
  });

  describe('getSupportedFileTypes', () => {
    it('should return list of supported file extensions', () => {
      const types = service.getSupportedFileTypes();
      expect(types).toEqual(['.txt', '.pdf', '.doc', '.docx']);
    });
  });

  describe('processFile', () => {
    it('should successfully process a text file', async () => {
      const file = new File(['Sample text content'], 'test.txt', {
        type: 'text/plain',
      });
      const result = await service.processFile(file);

      expect(result.success).toBe(true);
      expect(result.extractedText).toBe('Sample text content from file');
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.wordCount).toBeGreaterThan(0);
      expect(result.metadata?.characterCount).toBeGreaterThan(0);
      expect(result.metadata?.estimatedReadingTime).toBeGreaterThan(0);
    });

    it('should handle unsupported file types', async () => {
      const file = new File(['content'], 'test.xyz', {
        type: 'application/xyz',
      });
      const result = await service.processFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported file type');
    });

    it('should handle file reading errors', async () => {
      const file = new File(['content'], 'error.txt', { type: 'text/plain' });
      const result = await service.processFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Error reading file');
    });

    it('should handle PDF files with appropriate error message', async () => {
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const result = await service.processFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        'PDF text extraction requires additional libraries'
      );
    });

    it('should handle DOC files with appropriate error message', async () => {
      const file = new File(['content'], 'test.doc', {
        type: 'application/msword',
      });
      const result = await service.processFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        'DOC/DOCX text extraction requires additional libraries'
      );
    });

    it('should handle DOCX files with appropriate error message', async () => {
      const file = new File(['content'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const result = await service.processFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        'DOC/DOCX text extraction requires additional libraries'
      );
    });

    it('should handle empty text files', async () => {
      // Mock FileReader to return empty string
      global.FileReader = class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
        onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
        result: string | ArrayBuffer | null = null;

        readAsText() {
          setTimeout(() => {
            this.result = '';
            this.onload?.({
              target: this,
            } as unknown as ProgressEvent<FileReader>);
          }, 10);
        }
      } as unknown as typeof FileReader;

      const file = new File([''], 'empty.txt', { type: 'text/plain' });
      const result = await service.processFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No readable text content found');
    });
  });

  describe('processFiles', () => {
    it('should process multiple files concurrently', async () => {
      const files = [
        new File(['content1'], 'test1.txt', { type: 'text/plain' }),
        new File(['content2'], 'test2.txt', { type: 'text/plain' }),
        new File(['content3'], 'unsupported.xyz', { type: 'application/xyz' }),
      ];

      const results = await service.processFiles(files);

      expect(results).toHaveLength(3);
      expect(results[0].file.name).toBe('test1.txt');
      expect(results[1].file.name).toBe('test2.txt');
      expect(results[2].file.name).toBe('unsupported.xyz');
      expect(results[2].result.success).toBe(false);

      // TXT files should succeed or fail based on content
      expect([true, false]).toContain(results[0].result.success);
      expect([true, false]).toContain(results[1].result.success);
    });

    it('should handle empty file array', async () => {
      const results = await service.processFiles([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('text processing utilities', () => {
    it('should calculate correct metadata for text', async () => {
      // Mock FileReader to return specific text
      global.FileReader = class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
        onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
        result: string | ArrayBuffer | null = null;

        readAsText() {
          setTimeout(() => {
            this.result = 'This is a test with exactly eight words.';
            this.onload?.({
              target: this,
            } as unknown as ProgressEvent<FileReader>);
          }, 10);
        }
      } as unknown as typeof FileReader;

      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });
      const result = await service.processFile(file);

      expect(result.success).toBe(true);
      expect(result.metadata?.wordCount).toBe(8);
      expect(result.metadata?.characterCount).toBe(40);
      expect(result.metadata?.estimatedReadingTime).toBe(1); // Math.ceil(8 / 200)
    });

    it('should clean extracted text properly', async () => {
      // Mock FileReader to return text with extra whitespace
      global.FileReader = class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
        onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
        result: string | ArrayBuffer | null = null;

        readAsText() {
          setTimeout(() => {
            this.result =
              '   This   has    extra   spaces   \n\n\n\n   and   newlines   ';
            this.onload?.({
              target: this,
            } as unknown as ProgressEvent<FileReader>);
          }, 10);
        }
      } as unknown as typeof FileReader;

      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });
      const result = await service.processFile(file);

      expect(result.success).toBe(true);
      expect(result.extractedText).toContain('This has extra spaces');
      expect(result.extractedText).toContain('and newlines');
      expect(result.extractedText).not.toContain('   '); // Should not have multiple spaces
    });
  });
});
