import React, { HTMLAttributes } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  outlined?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  outlined = false,
  className = '',
  children,
  ...rest
}) => {
  // Define variant classes
  const variantClasses = {
    primary: outlined 
      ? 'border-primary-500 text-primary-700 bg-primary-50' 
      : 'bg-primary-100 text-primary-800',
    secondary: outlined 
      ? 'border-secondary-500 text-secondary-700 bg-secondary-50'
      : 'bg-secondary-100 text-secondary-800',
    accent: outlined 
      ? 'border-accent-500 text-accent-700 bg-accent-50'
      : 'bg-accent-100 text-accent-800',
    success: outlined 
      ? 'border-success-500 text-success-700 bg-success-50'
      : 'bg-success-100 text-success-800',
    warning: outlined 
      ? 'border-warning-500 text-warning-700 bg-warning-50'
      : 'bg-warning-100 text-warning-800',
    error: outlined 
      ? 'border-error-500 text-error-700 bg-error-50'
      : 'bg-error-100 text-error-800',
    neutral: outlined 
      ? 'border-gray-500 text-gray-700 bg-gray-50'
      : 'bg-gray-100 text-gray-800',
  };

  // Define size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'px-3 py-1',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${outlined ? 'border' : ''}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...rest}
    >
      {children}
    </span>
  );
};

export default Badge;