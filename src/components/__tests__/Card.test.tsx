import { render, screen } from '@testing-library/react';
import { Card } from '../atoms/Card';

describe('Card', () => {
  it('should render card with children', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should apply default styling', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass(
      'bg-white',
      'border',
      'border-gray-200',
      'rounded-lg',
      'shadow-sm'
    );
  });

  it('should apply padding variants', () => {
    const { rerender, container } = render(<Card padding="none">Content</Card>);
    let card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass('p-4', 'p-6');

    rerender(<Card padding="small">Content</Card>);
    card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-4');

    rerender(<Card padding="large">Content</Card>);
    card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-8');
  });

  it('should apply shadow variants', () => {
    const { rerender, container } = render(<Card shadow="none">Content</Card>);
    let card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('shadow-none');

    rerender(<Card shadow="small">Content</Card>);
    card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('shadow-sm');

    rerender(<Card shadow="medium">Content</Card>);
    card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('shadow-md');

    rerender(<Card shadow="large">Content</Card>);
    card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('shadow-lg');
  });

  it('should support hover effects', () => {
    const { container } = render(<Card hover>Content</Card>);
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('hover:shadow-md', 'transition-shadow');
  });

  it('should apply custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('custom-class');
  });

  it('should render as different HTML elements', () => {
    const { rerender, container } = render(<Card as="section">Content</Card>);
    expect(container.querySelector('section')).toBeInTheDocument();

    rerender(<Card as="article">Content</Card>);
    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
