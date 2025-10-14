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
 * Space entity from backend (formerly Space)
 * Backend: SpaceResponse from /api/spaces endpoints
 */
export interface Space {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Human-readable space name (1-255 characters) */
  name: string;
  /** URL-friendly slug (unique, lowercase, alphanumeric + hyphens) */
  slug: string;
  /** Owner user ID (UUID v4) */
  ownerId: string;
  /** Creation timestamp (ISO 8601) */
  createdAt: string;
  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
}

/**
 * @deprecated Use Space instead. Space has been renamed to Space in backend API v2.
 * This alias is provided for backward compatibility during migration.
 */
export type Space = Space;

/**
 * Node type enum - must match backend exactly
 */
export enum NodeType {
  REGULAR = 'REGULAR',
  CONTEXT = 'CONTEXT',
  ASSUMPTION = 'ASSUMPTION',
  TEMPLATE = 'TEMPLATE',
}

/**
 * Node entity from backend
 * Backend: NodeResponse from /api/spaces/{spaceSlug}/nodes endpoints
 */
export interface Node {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Parent space ID (UUID v4) - scopes this node to a space */
  spaceId: string;
  /** Node type classification */
  nodeType: NodeType;
  /** Human-readable title (1-255 characters) */
  title: string;
  /** URL-friendly slug (unique within space) */
  slug: string;
  /** Markdown content */
  content: string;
  /** Additional metadata (JSON object) */
  nodeDetails: Record<string, unknown>;
  /** Current version ID (UUID v4) */
  currentVersionId: string;
  /** Creator user ID (UUID v4) */
  createdBy: string;
  /** Last modifier user ID (UUID v4) */
  modifiedBy: string;
  /** Creation timestamp (ISO 8601) */
  createdAt: string;
  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
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
  content: string;
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

/**
 * Request body for creating a new space
 * Backend: SpaceCreateRequest for POST /api/spaces
 */
export interface CreateSpaceRequest {
  /** Space name (required, 1-255 chars) */
  name: string;
  /** Optional slug (auto-generated from name if omitted) */
  slug?: string;
}

/**
 * Request body for updating a space
 * Backend: SpaceUpdateRequest for PUT /api/spaces/{id}
 */
export interface UpdateSpaceRequest {
  /** New space name (optional) */
  name?: string;
  /** New slug (optional, must be unique) */
  slug?: string;
}

/**
 * @deprecated Use CreateSpaceRequest instead
 */
export type CreateSpaceRequest = CreateSpaceRequest;

/**
 * @deprecated Use UpdateSpaceRequest instead
 */
export type UpdateSpaceRequest = UpdateSpaceRequest;

/**
 * Request body for creating a node
 * Backend: NodeCreateRequest for POST /api/spaces/{spaceSlug}/nodes
 */
export interface CreateNodeRequest {
  /** Node title (required, 1-255 chars) */
  title: string;
  /** Node type (required) */
  nodeType: NodeType;
  /** Markdown content (optional) */
  content?: string;
  /** Additional metadata (optional) */
  nodeDetails?: Record<string, unknown>;
}

/**
 * Request body for updating a node
 * Backend: NodeUpdateRequest for PUT /api/spaces/{spaceSlug}/nodes/{nodeId}
 */
export interface UpdateNodeRequest {
  /** New title (optional, 1-255 chars) */
  title?: string;
  /** New content (optional) */
  content?: string;
  /** Updated metadata (optional) */
  nodeDetails?: Record<string, unknown>;
}

export interface CreateAttributeRequest {
  targetNodeId: number;
  attributeKey: AttributeKey;
  attributeValue?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Space collaborator entity from backend
 */
export interface SpaceCollaborator {
  id: string; // UUID
  spaceId: number;
  userId: string; // UUID
  role: 'owner' | 'editor';
  invitedBy: string; // UUID
  createdAt: string;
}

/**
 * Request DTO for inviting a collaborator
 */
export interface InviteCollaboratorRequest {
  email?: string;
  username?: string;
}
