'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FlashCard } from '@/types';
import { FlashCardComponent, Button, Card } from '@/components';
import { StorageService } from '@/services';

export interface FlashcardListProps {
  /** Filter flashcards by content source ID */
  contentSourceId?: string;
  /** Filter flashcards by tags */
  tags?: string[];
  /** Maximum number of flashcards to display */
  maxCards?: number;
  /** Enable study mode for flashcards */
  studyMode?: boolean;
  /** Callback when flashcard is rated in study mode */
  onCardRated?: (cardId: string, quality: number) => void;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Component for displaying a list of flashcards with optional filtering and study mode
 */
export function FlashcardList({
  contentSourceId,
  tags,
  maxCards = 20,
  studyMode = false,
  onCardRated,
  className = '',
}: FlashcardListProps) {
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyStats, setStudyStats] = useState({
    totalCards: 0,
    completedCards: 0,
    averageRating: 0,
  });

  const storageService = useMemo(() => new StorageService(), []);

  // Load flashcards based on filters
  const loadFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let allCards: FlashCard[] = [];

      if (contentSourceId) {
        // Load flashcards for specific content
        const allFlashcards = await storageService.getAllFlashCards();
        allCards = allFlashcards.filter(
          card => card.contentSourceId === contentSourceId
        );
      } else if (tags && tags.length > 0) {
        // Load flashcards by tags
        const allFlashcards = await storageService.getAllFlashCards();
        allCards = allFlashcards.filter(card =>
          tags.some(tag => card.tags.includes(tag))
        );
      } else {
        // Load all flashcards
        allCards = await storageService.getAllFlashCards();
      }

      // Apply maxCards limit
      const limitedCards = allCards.slice(0, maxCards);
      setFlashcards(limitedCards);
      setStudyStats({
        totalCards: limitedCards.length,
        completedCards: 0,
        averageRating: 0,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load flashcards';
      setError(errorMessage);
      console.error('Error loading flashcards:', err);
    } finally {
      setLoading(false);
    }
  }, [contentSourceId, tags, maxCards, storageService]);

  // Load flashcards on mount and when filters change
  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  const handleCardReveal = useCallback((cardId: string) => {
    console.log('Card revealed:', cardId);
  }, []);

  const handleCardRate = useCallback(
    (cardId: string, quality: number) => {
      console.log('Card rated:', cardId, 'Quality:', quality);

      // Update study stats
      setStudyStats(prev => ({
        ...prev,
        completedCards: prev.completedCards + 1,
        averageRating:
          (prev.averageRating * prev.completedCards + quality) /
          (prev.completedCards + 1),
      }));

      // Move to next card in study mode
      if (studyMode && currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      }

      // Call parent callback if provided
      if (onCardRated) {
        onCardRated(cardId, quality);
      }
    },
    [currentCardIndex, flashcards.length, onCardRated, studyMode]
  );

  const handlePreviousCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  }, [currentCardIndex]);

  const handleNextCard = useCallback(() => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  }, [currentCardIndex, flashcards.length]);

  const handleResetStudy = useCallback(() => {
    setCurrentCardIndex(0);
    setStudyStats({
      totalCards: flashcards.length,
      completedCards: 0,
      averageRating: 0,
    });
  }, [flashcards.length]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="text-center">
          <div className="text-2xl mb-2">📚</div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-8 ${className}`}>
        <Card>
          <div className="text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Error Loading Flashcards
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={loadFlashcards} variant="primary">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className={`py-8 ${className}`}>
        <Card>
          <div className="text-center">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Flashcards Found
            </h3>
            <p className="text-gray-600">
              {contentSourceId
                ? 'No flashcards found for this content.'
                : tags && tags.length > 0
                  ? `No flashcards found with tags: ${tags.join(', ')}`
                  : 'No flashcards available. Upload some documents to get started!'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (studyMode) {
    const currentCard = flashcards[currentCardIndex];

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Study Progress */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Study Session
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {currentCardIndex + 1} / {flashcards.length}
              </span>
              <Button onClick={handleResetStudy} variant="ghost" size="small">
                Reset
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {studyStats.totalCards}
              </div>
              <div className="text-sm text-gray-600">Total Cards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {studyStats.completedCards}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {studyStats.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentCardIndex + 1) / flashcards.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </Card>

        {/* Current Flashcard */}
        <div className="max-w-2xl mx-auto">
          <FlashCardComponent
            card={currentCard}
            studyMode={true}
            onReveal={handleCardReveal}
            onRate={handleCardRate}
          />
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handlePreviousCard}
            disabled={currentCardIndex === 0}
            variant="ghost"
          >
            ← Previous
          </Button>
          <Button
            onClick={handleNextCard}
            disabled={currentCardIndex === flashcards.length - 1}
            variant="ghost"
          >
            Next →
          </Button>
        </div>
      </div>
    );
  }

  // Grid view for non-study mode
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Flashcards</h3>
            <p className="text-sm text-gray-600">
              {flashcards.length} card{flashcards.length !== 1 ? 's' : ''}{' '}
              available
            </p>
          </div>
          <Button onClick={loadFlashcards} variant="ghost" size="small">
            Refresh
          </Button>
        </div>
      </Card>

      {/* Flashcards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {flashcards.map(card => (
          <div
            key={card.id}
            className="transform transition-transform hover:scale-105"
          >
            <FlashCardComponent
              card={card}
              studyMode={false}
              onReveal={handleCardReveal}
              onRate={handleCardRate}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
