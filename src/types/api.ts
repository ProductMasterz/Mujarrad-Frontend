// src/types/api.ts

/**
 * API request and response types
 */

import {
  CreateNodePayload,
  UpdateNodePayload,
  CreateAttributePayload,
} from './entities';

// Re-export payload types for convenience
export type { CreateNodePayload, UpdateNodePayload, CreateAttributePayload };

/**
 * Paginated response wrapper from Spring Boot
 */
export interface PaginatedResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
}

/**
 * RFC 7807 Problem Details for HTTP APIs
 * Error response format from backend
 */
export interface ApiError {
  type: string; // URI reference identifying the problem type
  title: string; // Short, human-readable summary
  status: number; // HTTP status code
  detail: string; // Human-readable explanation
  instance?: string; // URI reference identifying the specific occurrence
  errors?: Record<string, string>; // Field-level validation errors
  cyclePath?: string[]; // For circular dependency errors
}

/**
 * Generic API error response (legacy format)
 */
export interface LegacyApiError {
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: Record<string, unknown>;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string; // e.g., "createdAt,desc"
}

/**
 * Search parameters
 */
export interface SearchParams extends PaginationParams {
  q: string; // Query string
  nodeType?: 'REGULAR' | 'CONTEXT'; // Optional filter
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}
