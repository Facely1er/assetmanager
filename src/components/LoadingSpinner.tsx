import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Inline loading spinner for buttons
export const InlineSpinner: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => (
  <div
    className={`w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ${className}`}
    role="status"
    aria-label="Loading"
  />
);

// Full page loading spinner
export const FullPageSpinner: React.FC<{ text?: string }> = ({ text }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <LoadingSpinner size="lg" text={text || "Loading..."} />
  </div>
);

// Table loading skeleton
export const TableLoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    ))}
  </div>
);