import { Content, ContentType, createContent, validateContent } from '../content';

describe('Content', () => {
  describe('createContent', () => {
    it('should create document content with default values', () => {
      const content = createContent({
        title: 'React Documentation',
        type: ContentType.DOCUMENT,
        filePath: '/documents/react-docs.pdf',
      });

      expect(content).toEqual({
        id: expect.any(String),
        title: 'React Documentation',
        type: ContentType.DOCUMENT,
        filePath: '/documents/react-docs.pdf',
        youtubeUrl: null,
        metadata: {},
        tags: [],
        associatedCardIds: [],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should create YouTube content with metadata', () => {
      const content = createContent({
        title: 'React Tutorial Video',
        type: ContentType.VIDEO,
        youtubeUrl: 'https://youtube.com/watch?v=abc123',
        metadata: {
          duration: 1800,
          thumbnail: 'https://img.youtube.com/vi/abc123/maxresdefault.jpg',
          channel: 'React Channel',
        },
      });

      expect(content.type).toBe(ContentType.VIDEO);
      expect(content.youtubeUrl).toBe('https://youtube.com/watch?v=abc123');
      expect(content.metadata.duration).toBe(1800);
      expect(content.metadata.channel).toBe('React Channel');
    });

    it('should generate unique IDs for different content', () => {
      const content1 = createContent({
        title: 'Content 1',
        type: ContentType.NOTE,
      });
      const content2 = createContent({
        title: 'Content 2',
        type: ContentType.NOTE,
      });

      expect(content1.id).not.toBe(content2.id);
    });
  });

  describe('validateContent', () => {
    it('should return true for valid document content', () => {
      const validContent: Content = {
        id: '123',
        title: 'Valid Document',
        type: ContentType.DOCUMENT,
        filePath: '/path/to/document.pdf',
        youtubeUrl: null,
        metadata: {},
        tags: [],
        associatedCardIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(validateContent(validContent)).toBe(true);
    });

    it('should return true for valid YouTube content', () => {
      const validContent: Content = {
        id: '123',
        title: 'Valid Video',
        type: ContentType.VIDEO,
        filePath: null,
        youtubeUrl: 'https://youtube.com/watch?v=abc123',
        metadata: { duration: 300 },
        tags: [],
        associatedCardIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(validateContent(validContent)).toBe(true);
    });

    it('should return false for content with empty title', () => {
      const invalidContent: Content = {
        id: '123',
        title: '',
        type: ContentType.NOTE,
        filePath: null,
        youtubeUrl: null,
        metadata: {},
        tags: [],
        associatedCardIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(validateContent(invalidContent)).toBe(false);
    });

    it('should return false for document content without file path', () => {
      const invalidContent: Content = {
        id: '123',
        title: 'Document without path',
        type: ContentType.DOCUMENT,
        filePath: null,
        youtubeUrl: null,
        metadata: {},
        tags: [],
        associatedCardIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(validateContent(invalidContent)).toBe(false);
    });

    it('should return false for video content without YouTube URL', () => {
      const invalidContent: Content = {
        id: '123',
        title: 'Video without URL',
        type: ContentType.VIDEO,
        filePath: null,
        youtubeUrl: null,
        metadata: {},
        tags: [],
        associatedCardIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(validateContent(invalidContent)).toBe(false);
    });
  });
});