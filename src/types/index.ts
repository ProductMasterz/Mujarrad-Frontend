// src/types/index.ts

/**
 * Central export point for all type definitions
 */

// Backend DTOs
export type {
  User,
  Space,
  Node,
  Attribute,
  NodeVersion,
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  CreateSpaceRequest,
  UpdateSpaceRequest,
  CreateNodeRequest,
  UpdateNodeRequest,
  CreateAttributeRequest,
} from './backend-dtos';

export { NodeType, AttributeKey } from './backend-dtos';

// API types
export type {
  PaginatedResponse,
  ApiError,
  PaginationParams,
  SearchParams,
} from './api';

// Graph types
export type {
  GraphNode,
  GraphEdge,
  GraphEdgeData,
  GraphData,
  LayoutAlgorithm,
  GraphViewport,
} from './graph';

// Error types
export type {
  ProblemDetail,
  ValidationError,
  ValidationProblemDetail,
  CircularContainmentError,
} from './errors';
