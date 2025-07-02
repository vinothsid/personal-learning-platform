export interface CardReview {
  cardId: string;
  quality: number; // SM-2 quality rating (0-5)
  responseTime: number; // Time taken to answer in milliseconds
  timestamp: Date;
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  cardsReviewed: CardReview[];
  totalCards: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageResponseTime: number; // Average response time in milliseconds
  isCompleted: boolean;
}

export interface SessionStats {
  totalCards: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercentage: number;
  averageResponseTime: number;
  sessionDuration: number; // Duration in seconds
}

/**
 * Creates a new study session
 */
export function createStudySession(): StudySession {
  const now = new Date();
  const id = generateId();
  
  return {
    id,
    startTime: now,
    endTime: null,
    cardsReviewed: [],
    totalCards: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    averageResponseTime: 0,
    isCompleted: false,
  };
}

/**
 * Updates a study session with a new card review or completion
 */
export function updateStudySession(
  session: StudySession,
  cardReview?: CardReview | null,
  endTime?: Date
): StudySession {
  const updatedSession = { ...session };
  
  // Add card review if provided
  if (cardReview) {
    updatedSession.cardsReviewed = [...session.cardsReviewed, cardReview];
    updatedSession.totalCards = updatedSession.cardsReviewed.length;
    
    // Update correct/incorrect counts (quality >= 3 is considered correct)
    if (cardReview.quality >= 3) {
      updatedSession.correctAnswers = session.correctAnswers + 1;
    } else {
      updatedSession.incorrectAnswers = session.incorrectAnswers + 1;
    }
    
    // Recalculate average response time
    const totalResponseTime = updatedSession.cardsReviewed.reduce(
      (sum, review) => sum + review.responseTime,
      0
    );
    updatedSession.averageResponseTime = Math.round(
      totalResponseTime / updatedSession.cardsReviewed.length
    );
  }
  
  // Complete session if end time provided
  if (endTime) {
    updatedSession.endTime = endTime;
    updatedSession.isCompleted = true;
  }
  
  return updatedSession;
}

/**
 * Calculates statistics for a study session
 */
export function calculateSessionStats(session: StudySession): SessionStats {
  const accuracyPercentage = session.totalCards > 0 
    ? Math.round((session.correctAnswers / session.totalCards) * 100)
    : 0;
  
  const sessionDuration = session.endTime && session.startTime
    ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000)
    : 0;
  
  return {
    totalCards: session.totalCards,
    correctAnswers: session.correctAnswers,
    incorrectAnswers: session.incorrectAnswers,
    accuracyPercentage,
    averageResponseTime: session.averageResponseTime,
    sessionDuration,
  };
}

/**
 * Generates a unique ID for entities
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}