// src/types/api.ts

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
 * Generic API error response
 */
export interface ApiError {
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
  query: string;
}
