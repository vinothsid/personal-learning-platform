import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../atoms/Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply variant styles', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveClass('bg-blue-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(button).toHaveClass('bg-gray-600');

    rerender(<Button variant="danger">Danger</Button>);
    expect(button).toHaveClass('bg-red-600');
  });

  it('should apply size styles', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveClass('px-2', 'py-1', 'text-sm');

    rerender(<Button size="medium">Medium</Button>);
    expect(button).toHaveClass('px-4', 'py-2', 'text-base');

    rerender(<Button size="large">Large</Button>);
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should show loading state', () => {
    render(<Button loading>Loading</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should support full width', () => {
    render(<Button fullWidth>Full Width</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full');
  });
});
