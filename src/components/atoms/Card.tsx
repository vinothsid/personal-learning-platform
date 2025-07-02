import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
  hover?: boolean;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside';
}

/**
 * A flexible card component for displaying content with consistent styling
 */
export const Card: React.FC<CardProps> = ({
  children,
  padding = 'medium',
  shadow = 'small',
  hover = false,
  className,
  as: Component = 'div',
  ...props
}) => {
  const baseClasses = ['bg-white', 'border', 'border-gray-200', 'rounded-lg'];

  const paddingClasses = {
    none: [],
    small: ['p-4'],
    medium: ['p-6'],
    large: ['p-8'],
  };

  const shadowClasses = {
    none: ['shadow-none'],
    small: ['shadow-sm'],
    medium: ['shadow-md'],
    large: ['shadow-lg'],
  };

  const hoverClasses = hover
    ? ['hover:shadow-md', 'transition-shadow', 'duration-200']
    : [];

  const classes = clsx(
    baseClasses,
    paddingClasses[padding],
    shadowClasses[shadow],
    hoverClasses,
    className
  );

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};
