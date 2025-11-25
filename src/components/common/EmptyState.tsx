import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'default' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'default' | 'outline';
  };
  children?: React.ReactNode;
  className?: string;
  illustration?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  className = '',
  illustration
}) => {
  return (
    <div className={`text-center py-12 px-6 animate-fade-in ${className}`}>
      {illustration && (
        <div className="mx-auto mb-6 max-w-xs">
          {illustration}
        </div>
      )}
      
      {!illustration && Icon && (
        <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full">
          <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {action && (
          <Button
            onClick={action.onClick}
            icon={action.icon}
            variant={action.variant || 'default'}
          >
            {action.label}
          </Button>
        )}
        
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            icon={secondaryAction.icon}
            variant={secondaryAction.variant || 'outline'}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
      
      {children}
    </div>
  );
};

export default EmptyState;
export { EmptyState };

