import * as React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  success?: boolean;
  showSuccessIcon?: boolean;
}

const Input: React.FC<InputProps> = ({
  className,
  label,
  error,
  helperText,
  success,
  showSuccessIcon = false,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          {...(hasError && { 'aria-invalid': true })}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`
            block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors
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
        {showSuccessIcon && success && !error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
          </div>
        )}
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1" role="alert">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
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
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

Input.displayName = "Input";

export { Input };

