import { StudySession, createStudySession, updateStudySession, calculateSessionStats } from '../study-session';

describe('StudySession', () => {
  describe('createStudySession', () => {
    it('should create a new study session with default values', () => {
      const session = createStudySession();

      expect(session).toEqual({
        id: expect.any(String),
        startTime: expect.any(Date),
        endTime: null,
        cardsReviewed: [],
        totalCards: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        averageResponseTime: 0,
        isCompleted: false,
      });
    });
  });

  describe('updateStudySession', () => {
    it('should add a card review to the session', () => {
      const session = createStudySession();
      const cardReview = {
        cardId: 'card-123',
        quality: 4,
        responseTime: 5000, // 5 seconds
        timestamp: new Date(),
      };

      const updatedSession = updateStudySession(session, cardReview);

      expect(updatedSession.cardsReviewed).toHaveLength(1);
      expect(updatedSession.cardsReviewed[0]).toEqual(cardReview);
      expect(updatedSession.totalCards).toBe(1);
      expect(updatedSession.correctAnswers).toBe(1); // Quality 4 is correct
      expect(updatedSession.incorrectAnswers).toBe(0);
    });

    it('should mark incorrect answer for quality less than 3', () => {
      const session = createStudySession();
      const cardReview = {
        cardId: 'card-123',
        quality: 2,
        responseTime: 8000,
        timestamp: new Date(),
      };

      const updatedSession = updateStudySession(session, cardReview);

      expect(updatedSession.correctAnswers).toBe(0);
      expect(updatedSession.incorrectAnswers).toBe(1);
    });

    it('should calculate average response time correctly', () => {
      let session = createStudySession();
      
      // Add first review
      session = updateStudySession(session, {
        cardId: 'card-1',
        quality: 4,
        responseTime: 4000,
        timestamp: new Date(),
      });
      
      // Add second review
      session = updateStudySession(session, {
        cardId: 'card-2',
        quality: 3,
        responseTime: 6000,
        timestamp: new Date(),
      });

      expect(session.averageResponseTime).toBe(5000); // (4000 + 6000) / 2
    });

    it('should complete session when endTime is provided', () => {
      const session = createStudySession();
      const endTime = new Date();
      
      const completedSession = updateStudySession(session, null, endTime);

      expect(completedSession.endTime).toBe(endTime);
      expect(completedSession.isCompleted).toBe(true);
    });
  });

  describe('calculateSessionStats', () => {
    it('should calculate correct statistics for a session', () => {
      let session = createStudySession();
      
      // Add multiple reviews
      session = updateStudySession(session, {
        cardId: 'card-1',
        quality: 4,
        responseTime: 3000,
        timestamp: new Date(),
      });
      
      session = updateStudySession(session, {
        cardId: 'card-2',
        quality: 2,
        responseTime: 7000,
        timestamp: new Date(),
      });
      
      session = updateStudySession(session, {
        cardId: 'card-3',
        quality: 5,
        responseTime: 2000,
        timestamp: new Date(),
      });

      const stats = calculateSessionStats(session);

      expect(stats).toEqual({
        totalCards: 3,
        correctAnswers: 2,
        incorrectAnswers: 1,
        accuracyPercentage: Math.round((2 / 3) * 100),
        averageResponseTime: 4000, // (3000 + 7000 + 2000) / 3
        sessionDuration: 0, // Session not completed
      });
    });

    it('should calculate session duration for completed session', () => {
      const startTime = new Date('2023-01-01T10:00:00Z');
      const endTime = new Date('2023-01-01T10:15:30Z');
      
      const session: StudySession = {
        id: '123',
        startTime,
        endTime,
        cardsReviewed: [],
        totalCards: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        averageResponseTime: 0,
        isCompleted: true,
      };

      const stats = calculateSessionStats(session);

      expect(stats.sessionDuration).toBe(930); // 15 minutes 30 seconds in seconds
    });
  });
});