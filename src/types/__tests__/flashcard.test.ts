import { FlashCard, validateFlashCard, createFlashCard } from '../flashcard';

describe('FlashCard', () => {
  describe('createFlashCard', () => {
    it('should create a new flashcard with default values', () => {
      const card = createFlashCard({
        question: 'What is React?',
        answer: 'A JavaScript library for building user interfaces',
      });

      expect(card).toEqual({
        id: expect.any(String),
        question: 'What is React?',
        answer: 'A JavaScript library for building user interfaces',
        tags: [],
        contentSourceId: null,
        contentTimestamp: null,
        repetitions: 0,
        easeFactor: 2.5,
        interval: 0,
        lastReviewed: null,
        nextReview: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should create a flashcard with custom values', () => {
      const customCard = createFlashCard({
        question: 'What is TypeScript?',
        answer: 'A typed superset of JavaScript',
        tags: ['programming', 'typescript'],
        contentSourceId: 'source-123',
        contentTimestamp: 120,
      });

      expect(customCard.tags).toEqual(['programming', 'typescript']);
      expect(customCard.contentSourceId).toBe('source-123');
      expect(customCard.contentTimestamp).toBe(120);
    });

    it('should generate unique IDs for different cards', () => {
      const card1 = createFlashCard({
        question: 'Question 1',
        answer: 'Answer 1',
      });
      const card2 = createFlashCard({
        question: 'Question 2',
        answer: 'Answer 2',
      });

      expect(card1.id).not.toBe(card2.id);
    });
  });

  describe('validateFlashCard', () => {
    it('should return true for valid flashcard', () => {
      const validCard: FlashCard = {
        id: '123',
        question: 'Valid question?',
        answer: 'Valid answer',
        tags: [],
        contentSourceId: null,
        contentTimestamp: null,
        repetitions: 0,
        easeFactor: 2.5,
        interval: 0,
        lastReviewed: null,
        nextReview: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(validateFlashCard(validCard)).toBe(true);
    });

    it('should return false for flashcard with empty question', () => {
      const invalidCard: FlashCard = {
        id: '123',
        question: '',
        answer: 'Valid answer',
        tags: [],
        contentSourceId: null,
        contentTimestamp: null,
        repetitions: 0,
        easeFactor: 2.5,
        interval: 0,
        lastReviewed: null,
        nextReview: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(validateFlashCard(invalidCard)).toBe(false);
    });

    it('should return false for flashcard with empty answer', () => {
      const invalidCard: FlashCard = {
        id: '123',
        question: 'Valid question?',
        answer: '',
        tags: [],
        contentSourceId: null,
        contentTimestamp: null,
        repetitions: 0,
        easeFactor: 2.5,
        interval: 0,
        lastReviewed: null,
        nextReview: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(validateFlashCard(invalidCard)).toBe(false);
    });

    it('should return false for flashcard with invalid ease factor', () => {
      const invalidCard: FlashCard = {
        id: '123',
        question: 'Valid question?',
        answer: 'Valid answer',
        tags: [],
        contentSourceId: null,
        contentTimestamp: null,
        repetitions: 0,
        easeFactor: 1.0, // Below minimum of 1.3
        interval: 0,
        lastReviewed: null,
        nextReview: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(validateFlashCard(invalidCard)).toBe(false);
    });
  });
});