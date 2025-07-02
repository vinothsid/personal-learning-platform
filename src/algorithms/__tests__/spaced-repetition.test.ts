import {
  calculateNextReview,
  updateCardAfterReview,
  getDueCards,
  SM2_MIN_EASE_FACTOR,
} from '../spaced-repetition';
import { createFlashCard } from '@/types';

describe('SpacedRepetition', () => {
  describe('calculateNextReview', () => {
    it('should schedule first review for 1 day with good response (quality 4)', () => {
      const card = createFlashCard({
        question: 'Test question',
        answer: 'Test answer',
      });
      const quality = 4;

      const result = calculateNextReview(card, quality);

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
      // EF = 2.5 + (0.1 - (5-4)*(0.08+(5-4)*0.02)) = 2.5 + (0.1 - 1*0.1) = 2.5
      expect(result.easeFactor).toBe(2.5);

      // Next review should be tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(result.nextReview.toDateString()).toBe(tomorrow.toDateString());
    });

    it('should schedule second review for 6 days with good response (quality 4)', () => {
      const card = createFlashCard({
        question: 'Test question',
        answer: 'Test answer',
      });
      // Simulate first review
      card.repetitions = 1;
      card.interval = 1;
      card.lastReviewed = new Date();

      const quality = 4;

      const result = calculateNextReview(card, quality);

      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
      expect(result.easeFactor).toBe(2.5); // Same calculation as above
    });

    it('should calculate correct interval for subsequent reviews', () => {
      const card = createFlashCard({
        question: 'Test question',
        answer: 'Test answer',
      });
      // Simulate second review
      card.repetitions = 2;
      card.interval = 6;
      card.easeFactor = 2.6;
      card.lastReviewed = new Date();

      const quality = 4;

      const result = calculateNextReview(card, quality);

      // The ease factor gets updated first, then used to calculate interval
      // EF = 2.6 + (0.1 - (5-4)*(0.08+(5-4)*0.02)) = 2.6 + (0.1 - 0.1) = 2.6
      // Interval = 6 * 2.6 = 15.6, rounded to 16
      expect(result.interval).toBe(16);
      expect(result.repetitions).toBe(3);
      expect(result.easeFactor).toBe(2.6); // Uses the updated ease factor
    });

    it('should increase ease factor for excellent response (quality 5)', () => {
      const card = createFlashCard({
        question: 'Test question',
        answer: 'Test answer',
      });
      card.repetitions = 1;
      card.interval = 1;
      card.easeFactor = 2.5;

      const quality = 5;

      const result = calculateNextReview(card, quality);

      // Ease factor should increase: 2.5 + (0.1 - (5-5)*(0.08+(5-5)*0.02)) = 2.5 + 0.1 = 2.6
      expect(result.easeFactor).toBe(2.6);
    });

    it('should decrease ease factor for hard response (quality 3)', () => {
      const card = createFlashCard({
        question: 'Test question',
        answer: 'Test answer',
      });
      card.repetitions = 1;
      card.interval = 1;
      card.easeFactor = 2.5;

      const quality = 3;

      const result = calculateNextReview(card, quality);

      // Ease factor should decrease: 2.5 + (0.1 - (5-3)*(0.08+(5-3)*0.02))
      // = 2.5 + (0.1 - 2*(0.08+2*0.02)) = 2.5 + (0.1 - 2*0.12) = 2.5 - 0.14 = 2.36
      expect(result.easeFactor).toBe(2.36);
    });

    it('should reset repetitions and set interval to 1 for failed response (quality < 3)', () => {
      const card = createFlashCard({
        question: 'Test question',
        answer: 'Test answer',
      });
      card.repetitions = 5;
      card.interval = 30;
      card.easeFactor = 2.8;

      const quality = 2;

      const result = calculateNextReview(card, quality);

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      // Ease factor should still be adjusted but not go below minimum
      expect(result.easeFactor).toBeGreaterThanOrEqual(SM2_MIN_EASE_FACTOR);
    });

    it('should not let ease factor go below minimum', () => {
      const card = createFlashCard({
        question: 'Test question',
        answer: 'Test answer',
      });
      card.easeFactor = 1.35; // Close to minimum

      const quality = 0; // Worst possible response

      const result = calculateNextReview(card, quality);

      expect(result.easeFactor).toBe(SM2_MIN_EASE_FACTOR);
    });

    it('should throw error for invalid quality value', () => {
      const card = createFlashCard({
        question: 'Test question',
        answer: 'Test answer',
      });

      expect(() => calculateNextReview(card, -1)).toThrow(
        'Quality must be between 0 and 5'
      );
      expect(() => calculateNextReview(card, 6)).toThrow(
        'Quality must be between 0 and 5'
      );
    });
  });

  describe('updateCardAfterReview', () => {
    it('should update card with new review data', () => {
      const card = createFlashCard({
        question: 'Test question',
        answer: 'Test answer',
      });
      const quality = 4;
      const reviewDate = new Date();

      const updatedCard = updateCardAfterReview(card, quality, reviewDate);

      expect(updatedCard.lastReviewed).toBe(reviewDate);
      expect(updatedCard.repetitions).toBe(1);
      expect(updatedCard.interval).toBe(1);
      expect(updatedCard.nextReview > reviewDate).toBe(true);
      expect(updatedCard.updatedAt >= reviewDate).toBe(true);
    });

    it('should not mutate original card', () => {
      const card = createFlashCard({
        question: 'Test question',
        answer: 'Test answer',
      });
      const originalCard = { ...card };
      const quality = 4;

      updateCardAfterReview(card, quality);

      // Original card should be unchanged
      expect(card).toEqual(originalCard);
    });
  });

  describe('getDueCards', () => {
    it('should return cards that are due for review', () => {
      const now = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dueCard = createFlashCard({
        question: 'Due card',
        answer: 'Answer',
      });
      dueCard.nextReview = yesterday;

      const notDueCard = createFlashCard({
        question: 'Not due card',
        answer: 'Answer',
      });
      notDueCard.nextReview = tomorrow;

      const newCard = createFlashCard({
        question: 'New card',
        answer: 'Answer',
      });
      // New cards have nextReview set to creation time, so they should be due

      const cards = [dueCard, notDueCard, newCard];

      const dueCards = getDueCards(cards, now);

      expect(dueCards).toHaveLength(2);
      expect(dueCards.map(c => c.question)).toContain('Due card');
      expect(dueCards.map(c => c.question)).toContain('New card');
      expect(dueCards.map(c => c.question)).not.toContain('Not due card');
    });

    it('should sort due cards by next review date', () => {
      const now = new Date();
      const longOverdue = new Date();
      longOverdue.setDate(longOverdue.getDate() - 3);
      const recentlyDue = new Date();
      recentlyDue.setDate(recentlyDue.getDate() - 1);

      const card1 = createFlashCard({ question: 'Card 1', answer: 'Answer' });
      card1.nextReview = recentlyDue;

      const card2 = createFlashCard({ question: 'Card 2', answer: 'Answer' });
      card2.nextReview = longOverdue;

      const cards = [card1, card2];

      const dueCards = getDueCards(cards, now);

      // Should be sorted with most overdue first
      expect(dueCards[0].question).toBe('Card 2');
      expect(dueCards[1].question).toBe('Card 1');
    });

    it('should return empty array when no cards are due', () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const card = createFlashCard({
        question: 'Not due card',
        answer: 'Answer',
      });
      card.nextReview = tomorrow;

      const cards = [card];

      const dueCards = getDueCards(cards, now);

      expect(dueCards).toHaveLength(0);
    });
  });
});
