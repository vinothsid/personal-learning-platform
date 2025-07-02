import React, { useState } from 'react';
import { FlashCard } from '@/types';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { clsx } from 'clsx';

export interface FlashCardComponentProps {
  card: FlashCard;
  studyMode?: boolean;
  showTags?: boolean;
  showContentSource?: boolean;
  contentTitle?: string;
  className?: string;
  onReveal?: (cardId: string) => void;
  onRate?: (cardId: string, quality: number) => void;
  onContentClick?: (contentId: string) => void;
}

/**
 * A component for displaying flashcards with interactive reveal and study features
 */
export const FlashCardComponent: React.FC<FlashCardComponentProps> = ({
  card,
  studyMode = false,
  showTags = true,
  showContentSource = false,
  contentTitle,
  className,
  onReveal,
  onRate,
  onContentClick,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleCardClick = (): void => {
    if (!isRevealed && onReveal) {
      onReveal(card.id);
    }
    setIsRevealed(!isRevealed);
  };

  const handleRating = (quality: number): void => {
    if (onRate) {
      onRate(card.id, quality);
    }
    setIsRevealed(false);
  };

  const ratingButtons = [
    { label: 'Again', quality: 1, variant: 'danger' as const },
    { label: 'Hard', quality: 2, variant: 'secondary' as const },
    { label: 'Good', quality: 4, variant: 'primary' as const },
    { label: 'Easy', quality: 5, variant: 'ghost' as const },
  ];

  return (
    <Card
      className={clsx('cursor-pointer select-none', className)}
      hover={!isRevealed}
      onClick={handleCardClick}
      data-testid="flashcard"
    >
      {/* Question */}
      <div className="mb-4">
        <div className="text-lg font-medium text-gray-900 mb-2">
          {card.question}
        </div>

        {/* Tags */}
        {showTags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.map(tag => (
              <span
                key={tag}
                className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content Source */}
      {showContentSource && card.contentSourceId && contentTitle && (
        <div className="mb-4">
          <button
            className="text-sm text-blue-600 hover:text-blue-800 underline"
            onClick={e => {
              e.stopPropagation();
              if (onContentClick && card.contentSourceId) {
                onContentClick(card.contentSourceId);
              }
            }}
          >
            📄 {contentTitle}
            {card.contentTimestamp && (
              <span className="text-gray-500 ml-1">
                @{Math.floor(card.contentTimestamp / 60)}:
                {String(card.contentTimestamp % 60).padStart(2, '0')}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Answer (revealed) */}
      {isRevealed && (
        <div className="border-t border-gray-200 pt-4">
          <div className="text-gray-700 mb-4">{card.answer}</div>

          {/* Study Mode Rating Buttons */}
          {studyMode && (
            <div className="flex gap-2 justify-center">
              {ratingButtons.map(({ label, quality, variant }) => (
                <Button
                  key={quality}
                  variant={variant}
                  size="small"
                  onClick={e => {
                    e.stopPropagation();
                    handleRating(quality);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Click hint */}
      {!isRevealed && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Click to reveal answer
        </div>
      )}
    </Card>
  );
};
