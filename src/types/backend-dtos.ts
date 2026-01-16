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
 * Node type enum - must match backend exactly
 */
export enum NodeType {
  REGULAR = 'REGULAR',
  CONTEXT = 'CONTEXT',
  ASSUMPTION = 'ASSUMPTION',
  TEMPLATE = 'TEMPLATE',
}

/**
 * Node details metadata structure
 * Controls visibility and context for nodes
 */
export interface NodeDetails {
  /**
   * Whether this node appears in the space's node list.
   * - true (default): Shows in the main node list
   * - false: Hidden from list (blocks, whiteboard elements)
   */
  showInSpaceList?: boolean;

  /**
   * Block type - if set, this node is a block within a page
   * Values: 'text', 'heading1', 'heading2', 'heading3', 'bulletList', 'numberedList', 'todo', 'quote', 'code', 'divider'
   */
  blockType?: string;

  /**
   * If true, this node is a page (can contain blocks)
   */
  isPage?: boolean;

  /**
   * Whiteboard element subtype - if set, this node is a whiteboard element
   * Values: 'shape_rectangle', 'shape_ellipse', 'shape_diamond', 'text', 'drawing', 'image', 'frame'
   */
  element_subtype?: string;

  /**
   * Whiteboard context metadata - for CONTEXT nodes that store whiteboard data
   */
  whiteboard_context?: {
    context_type: 'whiteboard';
    app_state?: Record<string, unknown>;
    created_at?: string;
    last_modified?: string;
  };

  /**
   * Additional metadata fields (extensible)
   */
  [key: string]: unknown;
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
  nodeDetails: NodeDetails;
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
  id: string;
  spaceId: string;
  sourceNodeId: string;
  targetNodeId: string;
  attributeName: string;
  attributeType: string;
  attributeTypeMode: AttributeTypeMode;
  attributeDataType?: string | null;
  attributeValue: Record<string, unknown>;
  properties?: Record<string, unknown> | null;
  createdBy: string;
  createdAt: string;
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
 * Google OAuth login request
 */
export interface GoogleOAuthRequest {
  idToken: string;
}

/**
 * Google OAuth login response
 */
export interface GoogleOAuthResponse {
  token: string;
  user: User;
  isNewUser: boolean;
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

/**
 * Attribute type mode - how the attribute type is defined
 */
export enum AttributeTypeMode {
  SCHEMALESS = 'SCHEMALESS',
  TYPED = 'TYPED',
}

/**
 * Request body for creating an attribute (relationship between nodes)
 * Backend: POST /api/nodes/{nodeId}/attributes
 */
export interface CreateAttributeRequest {
  sourceNodeId: string;  // UUID of the source node
  targetNodeId: string;  // UUID of the target node
  attributeType: string; // Type of relationship (e.g., "contains", "references")
  attributeTypeMode: AttributeTypeMode;
  attributeName: string; // Name of the attribute
  attributeValue: Record<string, unknown>; // Value object (e.g., {order: 1000})
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
