import {
  FlashCard,
  Content,
  StudySession,
  validateFlashCard,
  validateContent,
  ContentType,
} from '@/types';

interface SerializedFlashCard {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  contentSourceId: string | null;
  contentTimestamp: number | null;
  repetitions: number;
  easeFactor: number;
  interval: number;
  lastReviewed: string | null;
  nextReview: string;
  createdAt: string;
  updatedAt: string;
}

interface SerializedContent {
  id: string;
  title: string;
  type: string;
  filePath: string | null;
  youtubeUrl: string | null;
  metadata: Record<string, unknown>;
  tags: string[];
  associatedCardIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface SerializedStudySession {
  id: string;
  startTime: string;
  endTime: string | null;
  cardsReviewed: Array<{
    cardId: string;
    quality: number;
    responseTime: number;
    timestamp: string;
  }>;
  totalCards: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageResponseTime: number;
  isCompleted: boolean;
}

export interface ExportData {
  flashCards: FlashCard[];
  content: Content[];
  studySessions: StudySession[];
  exportDate: Date;
  version: string;
}

export interface StorageInterface {
  // FlashCard operations
  saveFlashCard(card: FlashCard): Promise<void>;
  getFlashCard(id: string): Promise<FlashCard | null>;
  getAllFlashCards(): Promise<FlashCard[]>;
  deleteFlashCard(id: string): Promise<boolean>;

  // Content operations
  saveContent(content: Content): Promise<void>;
  getContent(id: string): Promise<Content | null>;
  getAllContent(): Promise<Content[]>;
  deleteContent(id: string): Promise<boolean>;

  // StudySession operations
  saveStudySession(session: StudySession): Promise<void>;
  getStudySession(id: string): Promise<StudySession | null>;
  getAllStudySessions(): Promise<StudySession[]>;
  deleteStudySession(id: string): Promise<boolean>;

  // Search and filter operations
  searchFlashCards(query: string): Promise<FlashCard[]>;
  getFlashCardsByTag(tag: string): Promise<FlashCard[]>;
  getFlashCardsByTags(tags: string[]): Promise<FlashCard[]>;

  // Data management
  exportAllData(): Promise<ExportData>;
  importData(data: ExportData): Promise<void>;
  clearAllData(): Promise<void>;
}

/**
 * Local storage implementation of the storage interface
 * Provides persistent storage using browser localStorage
 */
export class StorageService implements StorageInterface {
  private static readonly FLASHCARD_PREFIX = 'flashcard_';
  private static readonly CONTENT_PREFIX = 'content_';
  private static readonly STUDY_SESSION_PREFIX = 'study_session_';
  private static readonly VERSION = '1.0';

  // FlashCard operations
  async saveFlashCard(card: FlashCard): Promise<void> {
    this.validateFlashCard(card);

    try {
      const key = this.getFlashCardKey(card.id);
      const serialized = JSON.stringify(this.serializeCard(card));
      localStorage.setItem(key, serialized);
    } catch (error) {
      throw new Error(
        `Failed to save flashcard: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getFlashCard(id: string): Promise<FlashCard | null> {
    try {
      const key = this.getFlashCardKey(id);
      const serialized = localStorage.getItem(key);

      if (!serialized) {
        return null;
      }

      const parsed = JSON.parse(serialized);
      return this.deserializeCard(parsed);
    } catch {
      // Return null for invalid JSON or other parsing errors
      return null;
    }
  }

  async getAllFlashCards(): Promise<FlashCard[]> {
    const cards: FlashCard[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(StorageService.FLASHCARD_PREFIX)) {
        const card = await this.getFlashCard(
          this.extractIdFromKey(key, StorageService.FLASHCARD_PREFIX)
        );
        if (card) {
          cards.push(card);
        }
      }
    }

    return cards.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async deleteFlashCard(id: string): Promise<boolean> {
    const key = this.getFlashCardKey(id);
    const exists = localStorage.getItem(key) !== null;

    if (exists) {
      localStorage.removeItem(key);
      return true;
    }

    return false;
  }

  // Content operations
  async saveContent(content: Content): Promise<void> {
    this.validateContent(content);

    try {
      const key = this.getContentKey(content.id);
      const serialized = JSON.stringify(this.serializeContent(content));
      localStorage.setItem(key, serialized);
    } catch (error) {
      throw new Error(
        `Failed to save content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getContent(id: string): Promise<Content | null> {
    try {
      const key = this.getContentKey(id);
      const serialized = localStorage.getItem(key);

      if (!serialized) {
        return null;
      }

      const parsed = JSON.parse(serialized);
      return this.deserializeContent(parsed);
    } catch {
      return null;
    }
  }

  async getAllContent(): Promise<Content[]> {
    const content: Content[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(StorageService.CONTENT_PREFIX)) {
        const item = await this.getContent(
          this.extractIdFromKey(key, StorageService.CONTENT_PREFIX)
        );
        if (item) {
          content.push(item);
        }
      }
    }

    return content.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async deleteContent(id: string): Promise<boolean> {
    const key = this.getContentKey(id);
    const exists = localStorage.getItem(key) !== null;

    if (exists) {
      localStorage.removeItem(key);
      return true;
    }

    return false;
  }

  // StudySession operations
  async saveStudySession(session: StudySession): Promise<void> {
    try {
      const key = this.getStudySessionKey(session.id);
      const serialized = JSON.stringify(this.serializeStudySession(session));
      localStorage.setItem(key, serialized);
    } catch (error) {
      throw new Error(
        `Failed to save study session: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getStudySession(id: string): Promise<StudySession | null> {
    try {
      const key = this.getStudySessionKey(id);
      const serialized = localStorage.getItem(key);

      if (!serialized) {
        return null;
      }

      const parsed = JSON.parse(serialized);
      return this.deserializeStudySession(parsed);
    } catch {
      return null;
    }
  }

  async getAllStudySessions(): Promise<StudySession[]> {
    const sessions: StudySession[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(StorageService.STUDY_SESSION_PREFIX)) {
        const session = await this.getStudySession(
          this.extractIdFromKey(key, StorageService.STUDY_SESSION_PREFIX)
        );
        if (session) {
          sessions.push(session);
        }
      }
    }

    return sessions.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  async deleteStudySession(id: string): Promise<boolean> {
    const key = this.getStudySessionKey(id);
    const exists = localStorage.getItem(key) !== null;

    if (exists) {
      localStorage.removeItem(key);
      return true;
    }

    return false;
  }

  // Search and filter operations
  async searchFlashCards(query: string): Promise<FlashCard[]> {
    const allCards = await this.getAllFlashCards();
    const lowercaseQuery = query.toLowerCase();

    return allCards.filter(
      card =>
        card.question.toLowerCase().includes(lowercaseQuery) ||
        card.answer.toLowerCase().includes(lowercaseQuery) ||
        card.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getFlashCardsByTag(tag: string): Promise<FlashCard[]> {
    const allCards = await this.getAllFlashCards();
    return allCards.filter(card => card.tags.includes(tag));
  }

  async getFlashCardsByTags(tags: string[]): Promise<FlashCard[]> {
    const allCards = await this.getAllFlashCards();
    return allCards.filter(card => tags.every(tag => card.tags.includes(tag)));
  }

  // Data management
  async exportAllData(): Promise<ExportData> {
    const [flashCards, content, studySessions] = await Promise.all([
      this.getAllFlashCards(),
      this.getAllContent(),
      this.getAllStudySessions(),
    ]);

    return {
      flashCards,
      content,
      studySessions,
      exportDate: new Date(),
      version: StorageService.VERSION,
    };
  }

  async importData(data: ExportData): Promise<void> {
    // Clear existing data
    await this.clearAllData();

    // Import new data
    const promises: Promise<void>[] = [];

    data.flashCards.forEach(card => {
      promises.push(this.saveFlashCard(card));
    });

    data.content.forEach(content => {
      promises.push(this.saveContent(content));
    });

    data.studySessions.forEach(session => {
      promises.push(this.saveStudySession(session));
    });

    await Promise.all(promises);
  }

  async clearAllData(): Promise<void> {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith(StorageService.FLASHCARD_PREFIX) ||
          key.startsWith(StorageService.CONTENT_PREFIX) ||
          key.startsWith(StorageService.STUDY_SESSION_PREFIX))
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // Private helper methods
  private getFlashCardKey(id: string): string {
    return `${StorageService.FLASHCARD_PREFIX}${id}`;
  }

  private getContentKey(id: string): string {
    return `${StorageService.CONTENT_PREFIX}${id}`;
  }

  private getStudySessionKey(id: string): string {
    return `${StorageService.STUDY_SESSION_PREFIX}${id}`;
  }

  private extractIdFromKey(key: string, prefix: string): string {
    return key.substring(prefix.length);
  }

  private validateFlashCard(card: FlashCard): void {
    if (!validateFlashCard(card)) {
      throw new Error('Invalid flashcard data');
    }
  }

  private validateContent(content: Content): void {
    if (!validateContent(content)) {
      throw new Error('Invalid content data');
    }
  }

  // Serialization methods to handle Date objects
  private serializeCard(card: FlashCard): SerializedFlashCard {
    return {
      ...card,
      lastReviewed: card.lastReviewed?.toISOString() || null,
      nextReview: card.nextReview.toISOString(),
      createdAt: card.createdAt.toISOString(),
      updatedAt: card.updatedAt.toISOString(),
    };
  }

  private deserializeCard(data: SerializedFlashCard): FlashCard {
    return {
      ...data,
      lastReviewed: data.lastReviewed ? new Date(data.lastReviewed) : null,
      nextReview: new Date(data.nextReview),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  private serializeContent(content: Content): SerializedContent {
    return {
      ...content,
      createdAt: content.createdAt.toISOString(),
      updatedAt: content.updatedAt.toISOString(),
    };
  }

  private deserializeContent(data: SerializedContent): Content {
    return {
      ...data,
      type: data.type as ContentType,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  private serializeStudySession(session: StudySession): SerializedStudySession {
    return {
      ...session,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime?.toISOString() || null,
      cardsReviewed: session.cardsReviewed.map(review => ({
        ...review,
        timestamp: review.timestamp.toISOString(),
      })),
    };
  }

  private deserializeStudySession(data: SerializedStudySession): StudySession {
    return {
      ...data,
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : null,
      cardsReviewed: data.cardsReviewed.map(review => ({
        ...review,
        timestamp: new Date(review.timestamp),
      })),
    };
  }
}
