// src/services/api/client.ts

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ProblemDetail } from '@/types/errors';
import { ApiError } from '@/lib/errors';

/**
 * Base API URL from environment variables
 * Defaults to localhost:8080 for development
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * Axios instance with base configuration
 * Configured for Spring Boot API communication with JWT authentication
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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
 * Response interceptor: Parse RFC 7807 errors and handle 401 unauthorized
 * Converts Axios errors to ApiError instances with proper error details
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Success response - return as is
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        // Clear auth token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');

          // Save current location for redirect after login
          const currentPath = window.location.pathname;
          if (currentPath !== '/login') {
            localStorage.setItem('redirect_after_login', currentPath);
          }

          // Redirect to login page
          window.location.href = '/login';
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

export default apiClient;
