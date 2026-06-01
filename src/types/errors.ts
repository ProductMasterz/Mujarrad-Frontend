// src/types/errors.ts

/**
 * RFC 7807 Problem Details for HTTP APIs
 * https://datatracker.ietf.org/doc/html/rfc7807
 */
export interface ProblemDetail {
  type: string; // URI reference identifying the problem type
  title: string; // Short, human-readable summary
  status: number; // HTTP status code
  detail?: string; // Human-readable explanation
  instance?: string; // URI reference identifying the specific occurrence
  [key: string]: unknown; // Additional members for problem-specific details
}

/**
 * Validation error detail (for 400 Bad Request)
 */
export interface ValidationError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

/**
 * Extended problem detail with validation errors
 */
export interface ValidationProblemDetail extends ProblemDetail {
  errors: ValidationError[];
}

/**
 * Circular containment error detail
 */
export interface CircularContainmentError extends ProblemDetail {
  cyclePath: number[]; // Array of node IDs forming the cycle
}

/**
 * Locking conflict error detail (409)
 * Returned when attempting to modify a locked node, attribute, or space
 */
export interface LockingConflictError extends ProblemDetail {
  lockLevel?: 'CONTENT_LOCKED' | 'FULLY_LOCKED';
  lockedEntity?: 'node' | 'attribute' | 'space';
}

/**
 * Context action required error detail (422)
 * Returned when a node move requires context resolution
 */
export interface ContextActionRequiredError extends ProblemDetail {
  requiredAction?: string;
}
