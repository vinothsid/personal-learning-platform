import { FlashCard } from '@/types';

export const SM2_MIN_EASE_FACTOR = 1.3;

export interface ReviewResult {
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReview: Date;
}

/**
 * Calculates the next review parameters using the SM-2 algorithm
 * @param card - The flashcard being reviewed
 * @param quality - Quality of response (0-5)
 * @returns Updated review parameters
 * @throws {Error} When quality is out of range
 */
export function calculateNextReview(
  card: FlashCard,
  quality: number
): ReviewResult {
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5');
  }

  const { repetitions, easeFactor, interval } = card;

  // Calculate new ease factor using SM-2 formula
  // EF' = EF + (0.1 - (5-q)*(0.08+(5-q)*0.02))
  const newEaseFactor = Math.max(
    SM2_MIN_EASE_FACTOR,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  let newRepetitions: number;
  let newInterval: number;

  if (quality < 3) {
    // Failed review - reset repetitions and set interval to 1
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Successful review - increment repetitions and calculate new interval
    newRepetitions = repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      // For subsequent reviews, multiply previous interval by ease factor
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    repetitions: newRepetitions,
    easeFactor: Math.round(newEaseFactor * 100) / 100, // Round to 2 decimal places
    interval: newInterval,
    nextReview,
  };
}

/**
 * Updates a flashcard after a review session
 * @param card - The flashcard being reviewed
 * @param quality - Quality of response (0-5)
 * @param reviewDate - Date of the review (defaults to current time)
 * @returns Updated flashcard (does not mutate original)
 */
export function updateCardAfterReview(
  card: FlashCard,
  quality: number,
  reviewDate: Date = new Date()
): FlashCard {
  const reviewResult = calculateNextReview(card, quality);

  return {
    ...card,
    repetitions: reviewResult.repetitions,
    easeFactor: reviewResult.easeFactor,
    interval: reviewResult.interval,
    lastReviewed: reviewDate,
    nextReview: reviewResult.nextReview,
    updatedAt: new Date(),
  };
}

/**
 * Gets all cards that are due for review
 * @param cards - Array of flashcards
 * @param currentDate - Current date (defaults to now)
 * @returns Array of due cards sorted by review urgency (most overdue first)
 */
export function getDueCards(
  cards: FlashCard[],
  currentDate: Date = new Date()
): FlashCard[] {
  return cards
    .filter(card => card.nextReview <= currentDate)
    .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
}

/**
 * Gets the count of cards due for review
 * @param cards - Array of flashcards
 * @param currentDate - Current date (defaults to now)
 * @returns Number of due cards
 */
export function getDueCardsCount(
  cards: FlashCard[],
  currentDate: Date = new Date()
): number {
  return cards.filter(card => card.nextReview <= currentDate).length;
}

/**
 * Gets cards due for review grouped by urgency
 * @param cards - Array of flashcards
 * @param currentDate - Current date (defaults to now)
 * @returns Object with overdue, due today, and upcoming cards
 */
export function getCardsByUrgency(
  cards: FlashCard[],
  currentDate: Date = new Date()
) {
  const today = new Date(currentDate);
  today.setHours(23, 59, 59, 999); // End of today

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const overdue: FlashCard[] = [];
  const dueToday: FlashCard[] = [];
  const dueTomorrow: FlashCard[] = [];
  const upcoming: FlashCard[] = [];

  cards.forEach(card => {
    if (card.nextReview < currentDate) {
      // Card was due before today
      if (card.nextReview.toDateString() !== currentDate.toDateString()) {
        overdue.push(card);
      } else {
        dueToday.push(card);
      }
    } else if (card.nextReview <= today) {
      dueToday.push(card);
    } else if (card.nextReview <= tomorrow) {
      dueTomorrow.push(card);
    } else {
      upcoming.push(card);
    }
  });

  // Sort each group by next review date
  const sortByNextReview = (a: FlashCard, b: FlashCard) =>
    a.nextReview.getTime() - b.nextReview.getTime();

  return {
    overdue: overdue.sort(sortByNextReview),
    dueToday: dueToday.sort(sortByNextReview),
    dueTomorrow: dueTomorrow.sort(sortByNextReview),
    upcoming: upcoming.sort(sortByNextReview),
  };
}
