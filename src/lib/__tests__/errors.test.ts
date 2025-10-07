import { describe, it, expect } from '@jest/globals';
import { ApiError, isApiError, getErrorMessage } from '../errors';
import { ProblemDetail } from '@/types/errors';

describe('ApiError', () => {
  it('should create error with message and status code', () => {
    const error = new ApiError('Test error', 400);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('ApiError');
  });

  it('should include timestamp', () => {
    const error = new ApiError('Test error', 400);
    expect(error.timestamp).toBeDefined();
    expect(new Date(error.timestamp)).toBeInstanceOf(Date);
  });

  it('should store detail and problemDetail', () => {
    const problemDetail: ProblemDetail = {
      type: 'validation-error',
      title: 'Validation Failed',
      status: 400,
      detail: 'Invalid input',
    };
    const error = new ApiError('Test error', 400, 'Detailed message', problemDetail);
    expect(error.detail).toBe('Detailed message');
    expect(error.problemDetail).toEqual(problemDetail);
  });

  it('should maintain stack trace', () => {
    const error = new ApiError('Test error', 400);
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('ApiError');
  });

  describe('isNetworkError', () => {
    it('should identify network errors', () => {
      const error = new ApiError('Network error', 0);
      expect(error.isNetworkError()).toBe(true);
    });

    it('should not identify non-network errors', () => {
      const error = new ApiError('Server error', 500);
      expect(error.isNetworkError()).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('should identify 401 errors', () => {
      const error = new ApiError('Unauthorized', 401);
      expect(error.isAuthError()).toBe(true);
    });

    it('should identify 403 errors', () => {
      const error = new ApiError('Forbidden', 403);
      expect(error.isAuthError()).toBe(true);
    });

    it('should not identify other status codes', () => {
      const error400 = new ApiError('Bad Request', 400);
      const error500 = new ApiError('Server Error', 500);
      expect(error400.isAuthError()).toBe(false);
      expect(error500.isAuthError()).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('should identify validation errors', () => {
      const error = new ApiError('Validation failed', 400);
      expect(error.isValidationError()).toBe(true);
    });

    it('should not identify non-validation errors', () => {
      const error = new ApiError('Not found', 404);
      expect(error.isValidationError()).toBe(false);
    });
  });

  describe('isNotFoundError', () => {
    it('should identify not found errors', () => {
      const error = new ApiError('Not found', 404);
      expect(error.isNotFoundError()).toBe(true);
    });

    it('should not identify other status codes', () => {
      const error = new ApiError('Bad request', 400);
      expect(error.isNotFoundError()).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('should identify 500 errors', () => {
      const error = new ApiError('Internal error', 500);
      expect(error.isServerError()).toBe(true);
    });

    it('should identify 502 errors', () => {
      const error = new ApiError('Bad gateway', 502);
      expect(error.isServerError()).toBe(true);
    });

    it('should identify 503 errors', () => {
      const error = new ApiError('Service unavailable', 503);
      expect(error.isServerError()).toBe(true);
    });

    it('should not identify 4xx errors', () => {
      const error = new ApiError('Bad request', 400);
      expect(error.isServerError()).toBe(false);
    });
  });

  describe('getUserMessage', () => {
    it('should provide network error message', () => {
      const error = new ApiError('Failed', 0);
      expect(error.getUserMessage()).toContain('Network');
    });

    it('should provide server error message', () => {
      const error = new ApiError('Failed', 500);
      expect(error.getUserMessage()).toContain('Server');
    });

    it('should return detail when available', () => {
      const error = new ApiError('Error', 400, 'Detailed error message');
      expect(error.getUserMessage()).toBe('Detailed error message');
    });

    it('should fall back to message when no detail', () => {
      const error = new ApiError('Error message', 400);
      expect(error.getUserMessage()).toBe('Error message');
    });
  });

  describe('toJSON', () => {
    it('should serialize error to JSON', () => {
      const error = new ApiError('Test error', 400, 'Detail');
      const json = error.toJSON();

      expect(json.name).toBe('ApiError');
      expect(json.message).toBe('Test error');
      expect(json.statusCode).toBe(400);
      expect(json.detail).toBe('Detail');
      expect(json.timestamp).toBeDefined();
      expect(json.stack).toBeDefined();
    });

    it('should include problemDetail when present', () => {
      const problemDetail: ProblemDetail = {
        type: 'validation-error',
        title: 'Validation Failed',
        status: 400,
        detail: 'Invalid input',
      };
      const error = new ApiError('Test error', 400, undefined, problemDetail);
      const json = error.toJSON();

      expect(json.problemDetail).toEqual(problemDetail);
    });
  });
});

describe('isApiError', () => {
  it('should identify ApiError instances', () => {
    const apiError = new ApiError('Test', 400);
    expect(isApiError(apiError)).toBe(true);
  });

  it('should not identify regular Error instances', () => {
    const regularError = new Error('Test');
    expect(isApiError(regularError)).toBe(false);
  });

  it('should not identify non-error objects', () => {
    expect(isApiError({ message: 'Test', statusCode: 400 })).toBe(false);
  });

  it('should not identify null or undefined', () => {
    expect(isApiError(null)).toBe(false);
    expect(isApiError(undefined)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('should extract user message from ApiError', () => {
    const error = new ApiError('Test error', 400, 'User-friendly message');
    expect(getErrorMessage(error)).toBe('User-friendly message');
  });

  it('should extract message from regular Error', () => {
    const error = new Error('Test error');
    expect(getErrorMessage(error)).toBe('Test error');
  });

  it('should handle string errors', () => {
    expect(getErrorMessage('string error')).toBe('string error');
  });

  it('should handle null', () => {
    expect(getErrorMessage(null)).toBe('An unknown error occurred');
  });

  it('should handle undefined', () => {
    expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
  });

  it('should handle unknown object types', () => {
    expect(getErrorMessage({ foo: 'bar' })).toBe('An unknown error occurred');
  });

  it('should handle network errors', () => {
    const error = new ApiError('Network failed', 0);
    expect(getErrorMessage(error)).toContain('Network');
  });

  it('should handle server errors', () => {
    const error = new ApiError('Server failed', 500);
    expect(getErrorMessage(error)).toContain('Server');
  });
});
