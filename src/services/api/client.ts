// src/services/api/client.ts

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ProblemDetail } from '@/types/errors';
import { ApiError } from '@/lib/errors';

/**
 * Retry configuration for network requests
 * T072: Implements 3-attempt retry logic for transient failures
 */
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second

/**
 * Determine if an error should be retried
 * Retry on network errors and 5xx server errors, but not 4xx client errors
 */
function shouldRetry(error: AxiosError): boolean {
  // Network errors (no response)
  if (!error.response) {
    return true;
  }

  // Server errors (5xx)
  const status = error.response.status;
  if (status >= 500 && status < 600) {
    return true;
  }

  // Don't retry client errors (4xx) or authentication errors
  // Specifically don't retry 429 (Too Many Requests) - it makes it worse
  return false;
}


/**
 * Base API URL - using relative URLs to leverage Next.js rewrites
 * Next.js will proxy /api/* requests to the backend
 * In test environment, use localhost for MSW interception
 */
const API_BASE_URL = process.env.NODE_ENV === 'test'
  ? 'http://localhost:3000/api'
  : '/api';

/**
 * Axios instance with base configuration
 * Configured for Spring Boot API communication with JWT authentication
 * Uses relative URLs that are proxied by Next.js rewrites
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for CSRF if needed
});

/**
 * Request interceptor: Inject JWT Bearer token
 * Retrieves token from localStorage and adds to Authorization header
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (only in browser context)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Parse RFC 7807 errors, handle 401 unauthorized, and retry logic
 * Converts Axios errors to ApiError instances with proper error details
 * T072: Implements automatic retry for network and server errors
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Success response - return as is
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

    // Check if we should retry
    if (config && shouldRetry(error)) {
      config._retryCount = config._retryCount || 0;

      if (config._retryCount < MAX_RETRIES) {
        config._retryCount++;
        console.log(`[Retry] Attempt ${config._retryCount}/${MAX_RETRIES} for ${config.url}`);

        // Wait before retrying (exponential backoff)
        const delay = RETRY_DELAY_MS * Math.pow(2, config._retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry the request
        return apiClient(config);
      } else {
        console.error(`[Retry] Max retries (${MAX_RETRIES}) reached for ${config.url}`);
      }
    }

    // Handle errors (no more retries or non-retryable error)
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Handle 401 Unauthorized - redirect to login (but not if already on login page)
      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');

          const currentPath = window.location.pathname;
          if (currentPath !== '/login') {
            localStorage.setItem('redirect_after_login', currentPath);
            window.location.href = '/login';
          }
        }
      }

      // Handle 400 Bad Request - invalid input (ATTRIBUTE in void, CONTAINS cross-space, invalid nodeType)
      if (status === 400) {
        const errorData = data as { detail?: string; title?: string };
        console.warn('400 Bad Request:', {
          url: error.config?.url,
          detail: errorData?.detail || errorData?.title,
        });
      }

      // Handle 403 Forbidden - log details (includes cross-org operations)
      if (status === 403) {
        console.error('403 Forbidden - Access denied:', {
          url: error.config?.url,
          method: error.config?.method,
          hasAuthHeader: !!error.config?.headers?.Authorization,
          data
        });
      }

      // Handle 409 Conflict - locking conflicts, VC active connections, duplicate slugs
      if (status === 409) {
        const errorData = data as { message?: string; detail?: string };
        const msg = errorData?.message || errorData?.detail || '';
        const isLocking = /lock/i.test(msg);
        console.warn(`409 Conflict${isLocking ? ' (Locking)' : ''}:`, {
          url: error.config?.url,
          method: error.config?.method,
          message: msg,
        });
      }

      // Handle 410 Gone - deprecated endpoint removed
      if (status === 410) {
        console.error('410 Gone - Endpoint removed:', {
          url: error.config?.url,
          detail: (data as { detail?: string })?.detail,
        });
      }

      // Handle 422 Unprocessable Entity - context action required on move
      if (status === 422) {
        console.warn('422 Unprocessable Entity:', {
          url: error.config?.url,
          data,
        });
      }

      // Handle 429 Too Many Requests - wait and retry once
      if (status === 429 && config) {
        const retryAfter = error.response.headers['retry-after'];
        const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;

        // Only retry 429 once
        if (!config._retryCount || config._retryCount === 0) {
          config._retryCount = 1;
          console.log(`[Rate Limited] Waiting ${waitTime}ms before retry for ${config.url}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return apiClient(config);
        }
      }

      // Check if response is RFC 7807 Problem Detail
      if (data && typeof data === 'object' && 'type' in data && 'title' in data) {
        const problemDetail = data as ProblemDetail;
        throw new ApiError(
          problemDetail.title,
          status,
          problemDetail.detail,
          problemDetail
        );
      }

      // Fallback for non-RFC 7807 errors
      const errorData = data as { message?: string; detail?: string };
      throw new ApiError(
        errorData?.message || error.message || 'An error occurred',
        status,
        errorData?.detail
      );
    } else if (error.request) {
      // Request made but no response received (network error)
      throw new ApiError(
        'No response from server',
        0,
        'Please check your network connection'
      );
    } else {
      // Error setting up the request
      throw new ApiError(
        'Request failed',
        0,
        error.message
      );
    }
  }
);

/**
 * Helper function to set authentication token
 * Stores token in localStorage for subsequent requests
 *
 * @param token - JWT token from authentication
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

/**
 * Helper function to get authentication token
 * Retrieves token from localStorage
 *
 * @returns JWT token or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Helper function to remove authentication token
 * Clears token from localStorage (used during logout)
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('redirect_after_login');
  }
}

/**
 * Helper function to check if user is authenticated
 *
 * @returns true if auth token exists
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Helper function to get redirect path after login
 * Retrieves the path user was trying to access before being redirected to login
 *
 * @returns Redirect path or null
 */
export function getRedirectAfterLogin(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('redirect_after_login');
  }
  return null;
}

/**
 * Helper function to clear redirect path
 * Should be called after successful redirect
 */
export function clearRedirectAfterLogin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('redirect_after_login');
  }
}

/**
 * Extract array from API response that may be raw T[] or PageResponse<T>.
 * All list endpoints now return PageResponse, but this handles both for safety.
 */
export function extractPage<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'content' in data) {
    return (data as { content: T[] }).content ?? [];
  }
  return [];
}

export default apiClient;
