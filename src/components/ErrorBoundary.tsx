'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component
 * T073: Catches React component errors and displays graceful fallback UI
 * Prevents app crashes from propagating to users
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so next render shows fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // TODO: Send to error reporting service (e.g., Sentry)
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo!,
          this.resetError
        );
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Something went wrong
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We&apos;re sorry, but something unexpected happened. The error has been logged and we&apos;ll
                  look into it.
                </p>

                {/* Error details (only in development) */}
                {process.env.NODE_ENV === 'development' && (
                  <details className="mb-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Error Details (Development Only)
                    </summary>
                    <div className="bg-gray-100 dark:bg-gray-900 rounded p-4 text-xs font-mono overflow-auto">
                      <p className="text-red-600 dark:text-red-400 font-bold mb-2">
                        {this.state.error.name}: {this.state.error.message}
                      </p>
                      <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                      {this.state.errorInfo && (
                        <>
                          <p className="text-blue-600 dark:text-blue-400 font-bold mt-4 mb-2">
                            Component Stack:
                          </p>
                          <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </div>
                  </details>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button onClick={this.resetError}>
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                  >
                    Go to Home
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => window.location.reload()}
                  >
                    Reload Page
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}
