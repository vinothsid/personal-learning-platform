import { StorageService } from '../storage';
import {
  FlashCard,
  createFlashCard,
  createContent,
  createStudySession,
  ContentType,
} from '@/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    store, // Expose store for testing
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    // Clear the store manually
    Object.keys(localStorageMock.store).forEach(key => {
      delete localStorageMock.store[key];
    });

    jest.clearAllMocks();

    // Reset mock implementations to default behavior
    localStorageMock.setItem.mockImplementation(
      (key: string, value: string) => {
        localStorageMock.store[key] = value;
      }
    );
    localStorageMock.getItem.mockImplementation((key: string) => {
      return localStorageMock.store[key] || null;
    });
    localStorageMock.removeItem.mockImplementation((key: string) => {
      delete localStorageMock.store[key];
    });

    storageService = new StorageService();
  });

  describe('FlashCard Storage', () => {
    it('should save and retrieve a flashcard', async () => {
      const card = createFlashCard({
        question: 'What is React?',
        answer: 'A JavaScript library',
      });

      await storageService.saveFlashCard(card);
      const retrieved = await storageService.getFlashCard(card.id);

      expect(retrieved).toEqual(card);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `flashcard_${card.id}`,
        JSON.stringify(card)
      );
    });

    it('should return null for non-existent flashcard', async () => {
      const result = await storageService.getFlashCard('non-existent');
      expect(result).toBeNull();
    });

    it('should get all flashcards', async () => {
      const card1 = createFlashCard({ question: 'Q1', answer: 'A1' });
      const card2 = createFlashCard({ question: 'Q2', answer: 'A2' });

      await storageService.saveFlashCard(card1);
      await storageService.saveFlashCard(card2);

      const allCards = await storageService.getAllFlashCards();

      expect(allCards).toHaveLength(2);
      expect(allCards.map(c => c.id)).toContain(card1.id);
      expect(allCards.map(c => c.id)).toContain(card2.id);
    });

    it('should update existing flashcard', async () => {
      const card = createFlashCard({ question: 'Original', answer: 'Answer' });
      await storageService.saveFlashCard(card);

      const updatedCard = {
        ...card,
        question: 'Updated',
        updatedAt: new Date(),
      };
      await storageService.saveFlashCard(updatedCard);

      const retrieved = await storageService.getFlashCard(card.id);
      expect(retrieved?.question).toBe('Updated');
    });

    it('should delete a flashcard', async () => {
      const card = createFlashCard({ question: 'To Delete', answer: 'Answer' });
      await storageService.saveFlashCard(card);

      const deleted = await storageService.deleteFlashCard(card.id);
      expect(deleted).toBe(true);

      const retrieved = await storageService.getFlashCard(card.id);
      expect(retrieved).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        `flashcard_${card.id}`
      );
    });

    it('should return false when deleting non-existent flashcard', async () => {
      const deleted = await storageService.deleteFlashCard('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('Content Storage', () => {
    it('should save and retrieve content', async () => {
      const content = createContent({
        title: 'Test Document',
        type: ContentType.DOCUMENT,
        filePath: '/path/to/doc.pdf',
      });

      await storageService.saveContent(content);
      const retrieved = await storageService.getContent(content.id);

      expect(retrieved).toEqual(content);
    });

    it('should get all content', async () => {
      const content1 = createContent({
        title: 'Doc 1',
        type: ContentType.DOCUMENT,
        filePath: '/doc1.pdf',
      });
      const content2 = createContent({
        title: 'Video 1',
        type: ContentType.VIDEO,
        youtubeUrl: 'https://youtube.com/watch?v=123',
      });

      await storageService.saveContent(content1);
      await storageService.saveContent(content2);

      const allContent = await storageService.getAllContent();

      expect(allContent).toHaveLength(2);
      expect(allContent.map(c => c.id)).toContain(content1.id);
      expect(allContent.map(c => c.id)).toContain(content2.id);
    });

    it('should delete content', async () => {
      const content = createContent({
        title: 'To Delete',
        type: ContentType.NOTE,
      });
      await storageService.saveContent(content);

      const deleted = await storageService.deleteContent(content.id);
      expect(deleted).toBe(true);

      const retrieved = await storageService.getContent(content.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('StudySession Storage', () => {
    it('should save and retrieve study session', async () => {
      const session = createStudySession();

      await storageService.saveStudySession(session);
      const retrieved = await storageService.getStudySession(session.id);

      expect(retrieved).toEqual(session);
    });

    it('should get all study sessions', async () => {
      const session1 = createStudySession();
      const session2 = createStudySession();

      await storageService.saveStudySession(session1);
      await storageService.saveStudySession(session2);

      const allSessions = await storageService.getAllStudySessions();

      expect(allSessions).toHaveLength(2);
      expect(allSessions.map(s => s.id)).toContain(session1.id);
      expect(allSessions.map(s => s.id)).toContain(session2.id);
    });

    it('should delete study session', async () => {
      const session = createStudySession();
      await storageService.saveStudySession(session);

      const deleted = await storageService.deleteStudySession(session.id);
      expect(deleted).toBe(true);

      const retrieved = await storageService.getStudySession(session.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('Data Management', () => {
    it('should export all data', async () => {
      const card = createFlashCard({ question: 'Q', answer: 'A' });
      const content = createContent({
        title: 'Content',
        type: ContentType.NOTE,
      });
      const session = createStudySession();

      await storageService.saveFlashCard(card);
      await storageService.saveContent(content);
      await storageService.saveStudySession(session);

      const exportData = await storageService.exportAllData();

      expect(exportData.flashCards).toHaveLength(1);
      expect(exportData.content).toHaveLength(1);
      expect(exportData.studySessions).toHaveLength(1);
      expect(exportData.exportDate).toBeInstanceOf(Date);
      expect(exportData.version).toBe('1.0');
    });

    it('should import data and overwrite existing', async () => {
      // Create existing data
      const existingCard = createFlashCard({
        question: 'Existing',
        answer: 'Card',
      });
      await storageService.saveFlashCard(existingCard);

      // Import new data
      const importCard = createFlashCard({
        question: 'Imported',
        answer: 'Card',
      });
      const importData = {
        flashCards: [importCard],
        content: [],
        studySessions: [],
        exportDate: new Date(),
        version: '1.0',
      };

      await storageService.importData(importData);

      const allCards = await storageService.getAllFlashCards();
      expect(allCards).toHaveLength(1);
      expect(allCards[0].question).toBe('Imported');
    });

    it('should clear all data', async () => {
      const card = createFlashCard({ question: 'Q', answer: 'A' });
      const content = createContent({
        title: 'Content',
        type: ContentType.NOTE,
      });
      const session = createStudySession();

      await storageService.saveFlashCard(card);
      await storageService.saveContent(content);
      await storageService.saveStudySession(session);

      await storageService.clearAllData();

      const allCards = await storageService.getAllFlashCards();
      const allContent = await storageService.getAllContent();
      const allSessions = await storageService.getAllStudySessions();

      expect(allCards).toHaveLength(0);
      expect(allContent).toHaveLength(0);
      expect(allSessions).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      const originalSetItem = localStorageMock.setItem;

      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const card = createFlashCard({ question: 'Q', answer: 'A' });

      await expect(storageService.saveFlashCard(card)).rejects.toThrow(
        'Storage quota exceeded'
      );

      // Restore original implementation
      localStorageMock.setItem.mockImplementation(originalSetItem);
    });

    it('should handle invalid JSON in localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = await storageService.getFlashCard('test-id');
      expect(result).toBeNull();
    });

    it('should validate data before saving', async () => {
      const invalidCard = {
        id: 'test',
        question: '', // Invalid - empty question
        answer: 'Answer',
      } as FlashCard;

      await expect(storageService.saveFlashCard(invalidCard)).rejects.toThrow();
    });
  });

  describe('Search and Filter', () => {
    beforeEach(async () => {
      const cards = [
        createFlashCard({
          question: 'What is React?',
          answer: 'JavaScript library',
          tags: ['react', 'javascript'],
        }),
        createFlashCard({
          question: 'What is TypeScript?',
          answer: 'Typed JavaScript',
          tags: ['typescript', 'javascript'],
        }),
        createFlashCard({
          question: 'What is Vue?',
          answer: 'Progressive framework',
          tags: ['vue', 'javascript'],
        }),
      ];

      for (const card of cards) {
        await storageService.saveFlashCard(card);
      }
    });

    it('should search flashcards by text', async () => {
      const results = await storageService.searchFlashCards('React');
      expect(results).toHaveLength(1);
      expect(results[0].question).toContain('React');
    });

    it('should search flashcards by tag', async () => {
      const results = await storageService.getFlashCardsByTag('typescript');
      expect(results).toHaveLength(1);
      expect(results[0].question).toContain('TypeScript');
    });

    it('should get flashcards by multiple tags', async () => {
      const results = await storageService.getFlashCardsByTags([
        'javascript',
        'react',
      ]);
      expect(results).toHaveLength(1);
      expect(results[0].question).toContain('React');
    });
  });
});
