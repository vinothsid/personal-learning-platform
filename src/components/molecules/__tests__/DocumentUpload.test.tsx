import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentUpload, DocumentUploadProps } from '../DocumentUpload';

// Mock file for testing
const createMockFile = (name: string, type: string, size: number): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('DocumentUpload', () => {
  const defaultProps: DocumentUploadProps = {
    onFileSelect: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render upload area with correct content', () => {
      render(<DocumentUpload {...defaultProps} />);

      expect(
        screen.getByText('Upload your study materials')
      ).toBeInTheDocument();
      expect(screen.getByText('Choose Files')).toBeInTheDocument();
      expect(
        screen.getByText('or drag and drop files here')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Support for PDF, DOC, TXT files to create flashcards from your content'
        )
      ).toBeInTheDocument();
    });

    it('should render file input with correct attributes', () => {
      render(<DocumentUpload {...defaultProps} />);

      const fileInput = screen.getByLabelText('Upload documents');
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', '.pdf,.doc,.docx,.txt');
      expect(fileInput).toHaveAttribute('multiple');
    });

    it('should show loading state when uploading', () => {
      render(<DocumentUpload {...defaultProps} loading />);

      expect(screen.getByText('Uploading...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('File Selection', () => {
    it('should handle single file selection', async () => {
      const onFileSelect = jest.fn();
      render(<DocumentUpload {...defaultProps} onFileSelect={onFileSelect} />);

      const file = createMockFile('test.pdf', 'application/pdf', 1024);
      const fileInput = screen.getByLabelText('Upload documents');

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalledWith([file]);
      });
    });

    it('should handle multiple file selection', async () => {
      const onFileSelect = jest.fn();
      render(<DocumentUpload {...defaultProps} onFileSelect={onFileSelect} />);

      const files = [
        createMockFile('test1.pdf', 'application/pdf', 1024),
        createMockFile('test2.txt', 'text/plain', 512),
      ];
      const fileInput = screen.getByLabelText('Upload documents');

      fireEvent.change(fileInput, { target: { files } });

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalledWith(files);
      });
    });

    it('should trigger file input when button is clicked', () => {
      render(<DocumentUpload {...defaultProps} />);

      const button = screen.getByText('Choose Files');
      const fileInput = screen.getByLabelText('Upload documents');

      const clickSpy = jest.spyOn(fileInput, 'click');
      fireEvent.click(button);

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag over events', () => {
      render(<DocumentUpload {...defaultProps} />);

      const dropZone = screen
        .getByText('Upload your study materials')
        .closest('div');

      fireEvent.dragOver(dropZone!, { dataTransfer: { files: [] } });

      expect(dropZone).toHaveClass('border-blue-400');
    });

    it('should handle drag leave events', () => {
      render(<DocumentUpload {...defaultProps} />);

      const dropZone = screen
        .getByText('Upload your study materials')
        .closest('div');

      fireEvent.dragOver(dropZone!, { dataTransfer: { files: [] } });
      fireEvent.dragLeave(dropZone!);

      expect(dropZone).toHaveClass('border-gray-300');
    });

    it('should handle file drop', async () => {
      const onFileSelect = jest.fn();
      render(<DocumentUpload {...defaultProps} onFileSelect={onFileSelect} />);

      const file = createMockFile('dropped.pdf', 'application/pdf', 1024);
      const dropZone = screen
        .getByText('Upload your study materials')
        .closest('div');

      fireEvent.drop(dropZone!, {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalledWith([file]);
      });
    });
  });

  describe('File Validation', () => {
    it('should reject files that are too large', async () => {
      const onError = jest.fn();
      render(
        <DocumentUpload {...defaultProps} onError={onError} maxSize={1024} />
      );

      const largeFile = createMockFile('large.pdf', 'application/pdf', 2048);
      const fileInput = screen.getByLabelText('Upload documents');

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          'File large.pdf is too large. Maximum size is 1KB.'
        );
      });
    });

    it('should reject unsupported file types', async () => {
      const onError = jest.fn();
      render(<DocumentUpload {...defaultProps} onError={onError} />);

      const unsupportedFile = createMockFile(
        'test.exe',
        'application/exe',
        1024
      );
      const fileInput = screen.getByLabelText('Upload documents');

      fireEvent.change(fileInput, { target: { files: [unsupportedFile] } });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          'File test.exe has unsupported format. Supported formats: PDF, DOC, DOCX, TXT'
        );
      });
    });

    it('should accept valid files', async () => {
      const onFileSelect = jest.fn();
      const onError = jest.fn();
      render(
        <DocumentUpload
          {...defaultProps}
          onFileSelect={onFileSelect}
          onError={onError}
        />
      );

      const validFile = createMockFile('valid.pdf', 'application/pdf', 1024);
      const fileInput = screen.getByLabelText('Upload documents');

      fireEvent.change(fileInput, { target: { files: [validFile] } });

      await waitFor(() => {
        expect(onFileSelect).toHaveBeenCalledWith([validFile]);
        expect(onError).not.toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<DocumentUpload {...defaultProps} />);

      const fileInput = screen.getByLabelText('Upload documents');
      const dropZone = screen.getByRole('button', { name: /choose files/i });

      expect(fileInput).toBeInTheDocument();
      expect(dropZone).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<DocumentUpload {...defaultProps} />);

      const button = screen.getByText('Choose Files');
      button.focus();

      expect(button).toHaveFocus();
    });
  });
});
