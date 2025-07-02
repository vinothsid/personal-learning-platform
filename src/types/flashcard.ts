export interface FlashCard {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  contentSourceId: string | null;
  contentTimestamp: number | null; // For video content, timestamp in seconds
  repetitions: number;
  easeFactor: number;
  interval: number; // Days until next review
  lastReviewed: Date | null;
  nextReview: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFlashCardInput {
  question: string;
  answer: string;
  tags?: string[];
  contentSourceId?: string | null;
  contentTimestamp?: number | null;
}

/**
 * Creates a new flashcard with default SM-2 algorithm values
 */
export function createFlashCard(input: CreateFlashCardInput): FlashCard {
  const now = new Date();
  const id = generateId();
  
  return {
    id,
    question: input.question,
    answer: input.answer,
    tags: input.tags || [],
    contentSourceId: input.contentSourceId || null,
    contentTimestamp: input.contentTimestamp || null,
    repetitions: 0,
    easeFactor: 2.5, // Default ease factor for SM-2
    interval: 0,
    lastReviewed: null,
    nextReview: now, // New cards are due immediately
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Validates a flashcard object
 */
export function validateFlashCard(card: FlashCard): boolean {
  // Check required fields
  if (!card.question.trim() || !card.answer.trim()) {
    return false;
  }
  
  // Check ease factor bounds (SM-2 algorithm constraint)
  if (card.easeFactor < 1.3) {
    return false;
  }
  
  // Check repetitions is non-negative
  if (card.repetitions < 0) {
    return false;
  }
  
  // Check interval is non-negative
  if (card.interval < 0) {
    return false;
  }
  
  return true;
}

/**
 * Generates a unique ID for entities
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}