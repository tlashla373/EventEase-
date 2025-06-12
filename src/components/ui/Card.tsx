import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  bordered?: boolean;
}

const Card: React.FC<CardProps> = ({
  hoverable = false,
  bordered = false,
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={`
        card 
        ${hoverable ? 'hover:shadow-lg transition-shadow duration-200' : ''}
        ${bordered ? 'border border-gray-200' : ''}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-200 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardBody: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...rest}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={`px-6 py-4 border-t border-gray-200 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;