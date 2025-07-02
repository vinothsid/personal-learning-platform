import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * A reusable button component with multiple variants and sizes
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-md',
    'font-medium',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
  ];

  const variantClasses = {
    primary: [
      'bg-blue-600',
      'text-white',
      'hover:bg-blue-700',
      'focus:ring-blue-500',
    ],
    secondary: [
      'bg-gray-600',
      'text-white',
      'hover:bg-gray-700',
      'focus:ring-gray-500',
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'hover:bg-red-700',
      'focus:ring-red-500',
    ],
    ghost: [
      'bg-transparent',
      'text-gray-700',
      'hover:bg-gray-100',
      'focus:ring-gray-500',
      'border',
      'border-gray-300',
    ],
  };

  const sizeClasses = {
    small: ['px-2', 'py-1', 'text-sm'],
    medium: ['px-4', 'py-2', 'text-base'],
    large: ['px-6', 'py-3', 'text-lg'],
  };

  const widthClasses = fullWidth ? ['w-full'] : [];

  const disabledClasses =
    disabled || loading ? ['opacity-50', 'cursor-not-allowed'] : [];

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    disabledClasses,
    className
  );

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <div
          className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current"
          data-testid="loading-spinner"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};
