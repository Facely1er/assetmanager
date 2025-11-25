import * as React from "react";
import { CheckCircle } from "lucide-react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  success?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({
  className,
  label,
  error,
  helperText,
  success,
  maxLength,
  showCharCount = false,
  id,
  value,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const charCount = typeof value === 'string' ? value.length : 0;
  const isNearLimit = maxLength && charCount > maxLength * 0.9;
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          id={textareaId}
          {...(hasError && { 'aria-invalid': true })}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          maxLength={maxLength}
          value={value}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors resize-vertical
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : success
              ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-command-blue-500 focus:ring-command-blue-500'
            }
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400
            ${className || ""}
          `}
          {...props}
        />
        {showCharCount && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
            {charCount}/{maxLength}
          </div>
        )}
      </div>
      {error && (
        <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1" role="alert">
          <span className="text-red-600 dark:text-red-400" aria-hidden="true">⚠</span>
          <span>{error}</span>
        </p>
      )}
      {success && !error && (
        <p className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center space-x-1">
          <CheckCircle className="w-4 h-4" aria-hidden="true" />
          <span>Looks good!</span>
        </p>
      )}
      {helperText && !error && !success && (
        <p id={`${textareaId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      {isNearLimit && !error && maxLength && (
        <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
          {maxLength - charCount} characters remaining
        </p>
      )}
    </div>
  );
};

Textarea.displayName = "Textarea";

export { Textarea };

