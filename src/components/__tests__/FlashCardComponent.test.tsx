import { render, screen, fireEvent } from '@testing-library/react';
import { FlashCardComponent } from '../molecules/FlashCardComponent';
import { createFlashCard } from '@/types';

describe('FlashCardComponent', () => {
  const mockCard = createFlashCard({
    question: 'What is React?',
    answer: 'A JavaScript library for building user interfaces',
    tags: ['react', 'javascript'],
  });

  it('should render flashcard with question initially', () => {
    render(<FlashCardComponent card={mockCard} />);

    expect(screen.getByText('What is React?')).toBeInTheDocument();
    expect(
      screen.queryByText('A JavaScript library for building user interfaces')
    ).not.toBeInTheDocument();
  });

  it('should reveal answer when clicked', () => {
    render(<FlashCardComponent card={mockCard} />);

    const card = screen.getByTestId('flashcard');
    fireEvent.click(card);

    expect(
      screen.getByText('A JavaScript library for building user interfaces')
    ).toBeInTheDocument();
    expect(screen.getByText('What is React?')).toBeInTheDocument();
  });

  it('should toggle between question and answer on multiple clicks', () => {
    render(<FlashCardComponent card={mockCard} />);

    const card = screen.getByTestId('flashcard');

    // Initially shows question
    expect(screen.getByText('What is React?')).toBeInTheDocument();
    expect(screen.queryByText('A JavaScript library')).not.toBeInTheDocument();

    // Click to show answer
    fireEvent.click(card);
    expect(
      screen.getByText('A JavaScript library for building user interfaces')
    ).toBeInTheDocument();

    // Click again to hide answer
    fireEvent.click(card);
    expect(screen.queryByText('A JavaScript library')).not.toBeInTheDocument();
  });

  it('should display tags', () => {
    render(<FlashCardComponent card={mockCard} showTags />);

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
  });

  it('should not display tags when showTags is false', () => {
    render(<FlashCardComponent card={mockCard} showTags={false} />);

    expect(screen.queryByText('react')).not.toBeInTheDocument();
    expect(screen.queryByText('javascript')).not.toBeInTheDocument();
  });

  it('should call onReveal callback when answer is revealed', () => {
    const onReveal = jest.fn();
    render(<FlashCardComponent card={mockCard} onReveal={onReveal} />);

    const card = screen.getByTestId('flashcard');
    fireEvent.click(card);

    expect(onReveal).toHaveBeenCalledWith(mockCard.id);
  });

  it('should show study mode with rating buttons when in study mode', () => {
    render(<FlashCardComponent card={mockCard} studyMode />);

    const card = screen.getByTestId('flashcard');
    fireEvent.click(card);

    expect(screen.getByText('Again')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('should call onRate callback when rating button is clicked', () => {
    const onRate = jest.fn();
    render(<FlashCardComponent card={mockCard} studyMode onRate={onRate} />);

    const card = screen.getByTestId('flashcard');
    fireEvent.click(card);

    const goodButton = screen.getByText('Good');
    fireEvent.click(goodButton);

    expect(onRate).toHaveBeenCalledWith(mockCard.id, 4);
  });

  it('should show content source when linked to content', () => {
    const cardWithSource = {
      ...mockCard,
      contentSourceId: 'content-123',
    };

    render(
      <FlashCardComponent
        card={cardWithSource}
        contentTitle="React Documentation"
        showContentSource
      />
    );

    expect(screen.getByText(/React Documentation/)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <FlashCardComponent card={mockCard} className="custom-class" />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });
});
