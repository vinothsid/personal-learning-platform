import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { UploadedItemsList } from '../UploadedItemsList';
import { StorageService } from '../../../services/storage';

// Mock the storage service
jest.mock('../../../services/storage', () => ({
  StorageService: jest.fn().mockImplementation(() => ({
    getAllContent: jest.fn(),
    deleteContent: jest.fn(),
  })),
}));

const mockStorageService = {
  getAllContent: jest.fn(),
  deleteContent: jest.fn(),
};

// Mock the StorageService constructor
(StorageService as unknown as jest.Mock).mockImplementation(
  () => mockStorageService
);

describe('UploadedItemsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      mockStorageService.getAllContent.mockResolvedValue([]);

      render(<UploadedItemsList />);

      expect(screen.getByText('Loading uploaded items...')).toBeInTheDocument();
      expect(screen.getByText('⏳')).toBeInTheDocument();
    });

    it('should render empty state when no items exist', async () => {
      mockStorageService.getAllContent.mockResolvedValue([]);

      render(<UploadedItemsList />);

      await waitFor(() => {
        expect(screen.getByText('No items uploaded yet')).toBeInTheDocument();
      });

      expect(
        screen.getByText('Upload documents or add YouTube links to get started')
      ).toBeInTheDocument();
    });

    it('should render items list with documents', async () => {
      const mockContent = [
        {
          id: '1',
          title: 'test.pdf',
          type: 'pdf',
          filePath: 'test.pdf',
          youtubeUrl: null,
          metadata: { fileSize: 1024 },
          tags: ['uploaded'],
          associatedCardIds: [],
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: '2',
          title: 'YouTube Video',
          type: 'video',
          filePath: null,
          youtubeUrl: 'https://youtube.com/watch?v=123',
          metadata: {},
          tags: ['youtube'],
          associatedCardIds: [],
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
        },
      ];

      mockStorageService.getAllContent.mockResolvedValue(mockContent);

      render(<UploadedItemsList />);

      await waitFor(() => {
        expect(screen.getByText('Uploaded Items (2)')).toBeInTheDocument();
      });

      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getAllByText('YouTube Video')).toHaveLength(2); // Title and type for video
      expect(screen.getByText('Document')).toBeInTheDocument(); // PDF type
      expect(screen.getByText('1KB')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should handle refresh button click', async () => {
      const onRefresh = jest.fn();
      mockStorageService.getAllContent.mockResolvedValue([]);

      render(<UploadedItemsList onRefresh={onRefresh} />);

      await waitFor(() => {
        expect(screen.getByText('🔄 Refresh')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('🔄 Refresh'));

      expect(onRefresh).toHaveBeenCalled();
    });

    it('should handle item deletion', async () => {
      const onItemDelete = jest.fn();
      const mockContent = [
        {
          id: '1',
          title: 'test.pdf',
          type: 'pdf',
          filePath: 'test.pdf',
          youtubeUrl: null,
          metadata: { fileSize: 1024 },
          tags: ['uploaded'],
          associatedCardIds: [],
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
      ];

      mockStorageService.getAllContent.mockResolvedValue(mockContent);
      mockStorageService.deleteContent.mockResolvedValue(true);

      render(<UploadedItemsList onItemDelete={onItemDelete} />);

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(mockStorageService.deleteContent).toHaveBeenCalledWith('1');
      });

      expect(onItemDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('Error Handling', () => {
    it('should handle loading errors', async () => {
      mockStorageService.getAllContent.mockRejectedValue(
        new Error('Failed to load')
      );

      render(<UploadedItemsList />);

      await waitFor(() => {
        expect(
          screen.getByText('Failed to load uploaded items')
        ).toBeInTheDocument();
      });

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should handle deletion errors', async () => {
      const mockContent = [
        {
          id: '1',
          title: 'test.pdf',
          type: 'pdf',
          filePath: 'test.pdf',
          youtubeUrl: null,
          metadata: { fileSize: 1024 },
          tags: ['uploaded'],
          associatedCardIds: [],
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
      ];

      mockStorageService.getAllContent.mockResolvedValue(mockContent);
      mockStorageService.deleteContent.mockRejectedValue(
        new Error('Delete failed')
      );

      render(<UploadedItemsList />);

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.getByText('Failed to delete item')).toBeInTheDocument();
      });
    });
  });

  describe('Utility Functions', () => {
    it('should format file sizes correctly', async () => {
      const mockContent = [
        {
          id: '1',
          title: 'small.txt',
          type: 'text',
          filePath: 'small.txt',
          youtubeUrl: null,
          metadata: { fileSize: 500 },
          tags: ['uploaded'],
          associatedCardIds: [],
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: '2',
          title: 'large.pdf',
          type: 'pdf',
          filePath: 'large.pdf',
          youtubeUrl: null,
          metadata: { fileSize: 5 * 1024 * 1024 }, // 5MB
          tags: ['uploaded'],
          associatedCardIds: [],
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
      ];

      mockStorageService.getAllContent.mockResolvedValue(mockContent);

      render(<UploadedItemsList />);

      await waitFor(() => {
        expect(screen.getByText('500B')).toBeInTheDocument();
        expect(screen.getByText('5MB')).toBeInTheDocument();
      });
    });

    it('should format dates correctly', async () => {
      const mockContent = [
        {
          id: '1',
          title: 'test.pdf',
          type: 'pdf',
          filePath: 'test.pdf',
          youtubeUrl: null,
          metadata: { fileSize: 1024 },
          tags: ['uploaded'],
          associatedCardIds: [],
          createdAt: new Date('2023-01-01T10:30:00Z'),
          updatedAt: new Date('2023-01-01T10:30:00Z'),
        },
      ];

      mockStorageService.getAllContent.mockResolvedValue(mockContent);

      render(<UploadedItemsList />);

      await waitFor(() => {
        expect(screen.getByText(/Uploaded.*2023/)).toBeInTheDocument();
      });
    });
  });
});
