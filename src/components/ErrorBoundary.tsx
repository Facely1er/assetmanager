import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logError } from '../utils/errorHandling';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Enhanced error logging with context
    logError(error, 'ErrorBoundary', {
      errorId,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name
    });
    
    this.setState({
      error,
      errorInfo,
      errorId
    });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  private handleGoHome = () => {
    // Clear any corrupted state before navigation
    try {
      localStorage.removeItem('ermits-app-state');
      sessionStorage.clear();
    } catch {
      // Ignore storage errors
    }
    window.location.href = '/';
  };

  private handleReportError = () => {
    const subject = encodeURIComponent('Error Report - ERMITS CyberSoluce®');
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error Message: ${this.state.error?.message}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Additional Details:
${this.state.error?.stack}
    `);
    window.open(`mailto:support@ermits-cybersoluce.com?subject=${subject}&body=${body}`);
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" role="alert">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-outfit font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              We encountered an unexpected error while loading the application.
            </p>
            
            {this.state.errorId && (
              <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
                Error ID: <code className="font-mono">{this.state.errorId}</code>
              </p>
            )}
            
            <div className="grid grid-cols-1 gap-3 mb-6">
              <button
                onClick={this.handleRetry}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-command-blue-600 text-white rounded-lg hover:bg-command-blue-700 focus:outline-none focus:ring-2 focus:ring-command-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
              >
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </button>
              <button
                onClick={this.handleReportError}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Report this issue to support
              </button>
            </div>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40 border font-mono">
                  <strong>Error:</strong> {this.state.error.toString()}
                  {this.state.error.stack && (
                    <>
                      <br /><br />
                      <strong>Stack trace:</strong><br />
                      {this.state.error.stack}
                    </>
                  )}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}