import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  X
} from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  // Define variant-specific styles and icons
  const variantStyles = {
    info: {
      containerClass: 'bg-primary-50 border-primary-200',
      titleClass: 'text-primary-800',
      messageClass: 'text-primary-700',
      icon: <Info className="h-5 w-5 text-primary-400" />,
    },
    success: {
      containerClass: 'bg-success-50 border-success-200',
      titleClass: 'text-success-800',
      messageClass: 'text-success-700',
      icon: <CheckCircle className="h-5 w-5 text-success-400" />,
    },
    warning: {
      containerClass: 'bg-warning-50 border-warning-200',
      titleClass: 'text-warning-800',
      messageClass: 'text-warning-700',
      icon: <AlertTriangle className="h-5 w-5 text-warning-400" />,
    },
    error: {
      containerClass: 'bg-error-50 border-error-200',
      titleClass: 'text-error-800',
      messageClass: 'text-error-700',
      icon: <XCircle className="h-5 w-5 text-error-400" />,
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`rounded-md border p-4 ${styles.containerClass} ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.titleClass}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${styles.messageClass} ${title ? 'mt-2' : ''}`}>
            {message}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 
                  ${variant === 'info' ? 'text-primary-500 hover:bg-primary-100' : ''}
                  ${variant === 'success' ? 'text-success-500 hover:bg-success-100' : ''}
                  ${variant === 'warning' ? 'text-warning-500 hover:bg-warning-100' : ''}
                  ${variant === 'error' ? 'text-error-500 hover:bg-error-100' : ''}
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${variant === 'info' ? 'focus:ring-primary-500' : ''}
                  ${variant === 'success' ? 'focus:ring-success-500' : ''}
                  ${variant === 'warning' ? 'focus:ring-warning-500' : ''}
                  ${variant === 'error' ? 'focus:ring-error-500' : ''}
                `}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;