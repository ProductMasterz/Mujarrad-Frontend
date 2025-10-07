// src/lib/errors.ts

import { ProblemDetail } from '@/types/errors';

/**
 * Custom API Error class extending Error
 *
 * Provides structured error information from API responses
 * with support for RFC 7807 Problem Details
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly detail?: string;
  public readonly problemDetail?: ProblemDetail;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number,
    detail?: string,
    problemDetail?: ProblemDetail
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.detail = detail;
    this.problemDetail = problemDetail;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is a network error (no response)
   */
  isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  /**
   * Check if error is an auth error (401 or 403)
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  /**
   * Check if error is a validation error (400)
   */
  isValidationError(): boolean {
    return this.statusCode === 400;
  }

  /**
   * Check if error is a not found error (404)
   */
  isNotFoundError(): boolean {
    return this.statusCode === 404;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.isNetworkError()) {
      return 'Network error. Please check your connection.';
    }
    if (this.isServerError()) {
      return 'Server error. Please try again later.';
    }
    return this.detail || this.message;
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      detail: this.detail,
      problemDetail: this.problemDetail,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Type guard to check if error is ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.getUserMessage();
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}
