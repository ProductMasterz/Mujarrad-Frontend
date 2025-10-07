// src/types/backend-dtos.ts

/**
 * User entity from backend
 */
export interface User {
  id: string; // UUID
  username: string;
  email: string;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Workspace entity from backend
 */
export interface Workspace {
  id: number;
  name: string;
  slug: string;
  description?: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Node type enum - must match backend exactly
 */
export enum NodeType {
  REGULAR = 'REGULAR',
  CONTEXT = 'CONTEXT',
  ASSUMPTION = 'ASSUMPTION',
}

/**
 * Node entity from backend
 */
export interface Node {
  id: number;
  workspaceId: number;
  title: string;
  nodeType: NodeType;
  markdownContent: string;
  nodeDetails?: Record<string, unknown>; // JSON field
  version: number; // For optimistic locking
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

/**
 * Attribute key enum - relationship types
 * Must match backend exactly
 */
export enum AttributeKey {
  CONTAINS = 'contains',
  DEPENDS_ON = 'depends_on',
  REFERENCES = 'references',
  TRIGGERS = 'triggers',
  NEXT = 'next',
  CALLS = 'calls',
}

/**
 * Attribute entity from backend (represents edges/relationships)
 */
export interface Attribute {
  id: number;
  sourceNodeId: number;
  targetNodeId: number;
  attributeKey: AttributeKey;
  attributeValue?: string;
  metadata?: Record<string, unknown>; // JSON field
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
}

/**
 * Node version entity from backend
 */
export interface NodeVersion {
  id: number;
  nodeId: number;
  version: number;
  title: string;
  nodeType: NodeType;
  markdownContent: string;
  nodeDetails?: Record<string, unknown>;
  createdAt: string;
  createdBy?: number;
}

/**
 * Request DTOs for creating/updating entities
 */

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateWorkspaceRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
}

export interface CreateNodeRequest {
  title: string;
  nodeType: NodeType;
  markdownContent: string;
  nodeDetails?: Record<string, unknown>;
}

export interface UpdateNodeRequest {
  title?: string;
  nodeType?: NodeType;
  markdownContent?: string;
  nodeDetails?: Record<string, unknown>;
  version: number; // Required for optimistic locking
}

export interface CreateAttributeRequest {
  targetNodeId: number;
  attributeKey: AttributeKey;
  attributeValue?: string;
  metadata?: Record<string, unknown>;
}
