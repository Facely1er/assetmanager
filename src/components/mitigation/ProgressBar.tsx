import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className }) => {
  const getProgressColor = () => {
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-orange-500';
    if (progress < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className || ''}`}>
      <div
        className={`h-2.5 rounded-full transition-all ${getProgressColor()}`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
  );
};

