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
  /** Organization ID (UUID v4) — always populated */
  organizationId: string;
  /** Project type classification */
  projectType?: 'CONSUMER' | 'BACKEND';
  /** Operational mode (BACKEND spaces only) */
  mode?: 'CONFIGURATION' | 'PRODUCTION';
  /** Whether the space is locked — defaults false */
  isLocked: boolean;
  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
}

/**
 * Node type enum - must match backend exactly
 */
export enum NodeType {
  REGULAR = 'REGULAR',
  CONTEXT = 'CONTEXT',
  ATTRIBUTE = 'ATTRIBUTE',
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
   * User/agent configurable semantic/entity type.
   * Examples: Person, Place, Topic, Event, Risk, Requirement, Device.
   * This is NOT the same as nodeType.
   */
  semanticType?: string;
 
  /**
   * Source of the semantic type.
   */
  semanticTypeSource?: 'agent' | 'manual' | 'system';

  /**
   * Legacy/agent aliases.
   */
  entityType?: string;
  entity_type?: string;


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
  /** Lock level for this node */
  lockLevel: 'UNLOCKED' | 'CONTENT_LOCKED' | 'FULLY_LOCKED';
  /** Whether this is a builtin node (e.g. The Blank) */
  isBuiltin: boolean;
  /** Computed lock level considering parent, space, and schema locks */
  effectiveLockLevel?: 'UNLOCKED' | 'CONTENT_LOCKED' | 'FULLY_LOCKED';
  /** Whether the lock is inherited from a parent/space rather than self */
  lockInherited?: boolean;
  /** Source of the lock */
  lockSource?: 'space' | 'schema' | 'parent' | 'self' | null;
  /** Parent node ID (for block nodes) */
  parentNodeId?: string | null;
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
  attributeTypeMode: string;
  attributeDataType?: string | null;
  attributeValue: Record<string, unknown>;
  properties: Record<string, unknown>;
  representativeNodeId?: string;
  isLocked: boolean;
  virtualContextId?: string;
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
  /** Optional project type */
  projectType?: 'CONSUMER' | 'BACKEND';
  /** Organization ID (optional — defaults to user's individual org) */
  organizationId?: string;
}

/**
 * Request body for updating a space
 * Backend: SpaceUpdateRequest for PATCH /api/spaces/{id}
 */
export interface UpdateSpaceRequest {
  /** New space name */
  name?: string;
  slug?: string;
  /** Optional backend project type */
  projectType?: 'BACKEND' | 'CONSUMER';

  /** Optional backend mode */
  mode?: 'CONFIGURATION' | 'PRODUCTION';
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
  /** Slug  (optional) */
  slug?: string;
  /** Context type (optional) */
  contextTypeId?: string;
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

// ============================================================
// API Key Management DTOs
// ============================================================

/**
 * Response when creating or rotating an API key (includes secret, shown once)
 * Backend: ApiKeyResponse from POST /api/api-keys and POST /api/api-keys/{keyId}/rotate
 */
export interface ApiKeyResponse {
  id: string;
  publicKey: string;
  secretKey: string;
  name: string;
  description: string;
  spaceId: string | null;
  isActive: boolean;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response when listing API keys (secret NOT included)
 * Backend: ApiKeyListResponse from GET /api/api-keys
 */
export interface ApiKeyListResponse {
  id: string;
  publicKey: string;
  name: string;
  spaceId: string | null;
  isActive: boolean;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

/**
 * Request body for creating a new API key
 * Backend: ApiKeyCreateRequest for POST /api/api-keys
 */
export interface ApiKeyCreateRequest {
  name: string;
  description?: string;
  spaceId?: string;
  expiresAt?: string;
}

/**
 * Request body for rotating an API key's secret
 * Backend: ApiKeyRotateRequest for POST /api/api-keys/{keyId}/rotate
 */
export interface ApiKeyRotateRequest {
  currentSecretKey: string;
}

// ============================================================
// Lock Level Enum
// ============================================================

/**
 * Lock level enum - must match backend exactly
 */
export enum LockLevel {
  UNLOCKED = 'UNLOCKED',
  CONTENT_LOCKED = 'CONTENT_LOCKED',
  FULLY_LOCKED = 'FULLY_LOCKED',
}

// ============================================================
// Organization DTOs
// ============================================================

/**
 * Organization entity from backend
 * Backend: OrganizationResponse from /api/organizations endpoints
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'INDIVIDUAL' | 'TEAM';
  createdAt: string;
  updatedAt: string;
}

/**
 * Organization member entity from backend
 */
export interface OrganizationMember {
  userId: string;
  username: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

/**
 * Request body for creating an organization
 */
export interface OrganizationCreateRequest {
  name: string;
}

/**
 * Request body for adding an organization member
 */
export interface OrganizationMemberRequest {
  userId: string;
  role?: 'OWNER' | 'ADMIN' | 'MEMBER';
}

// ============================================================
// Virtual Context DTOs
// ============================================================

/**
 * Virtual context entity from backend
 * Backend: VirtualContextResponse from /api/virtual-contexts endpoints
 */
export interface VirtualContext {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ownerSpaceId: string;
  visibility?: string;
  createdAt: string;
}

/**
 * Virtual context member entity from backend
 */
export interface VirtualContextMember {
  spaceId: string;
  spaceName: string;
  role: 'OWNER' | 'CONTRIBUTOR' | 'READONLY';
  joinedAt: string;
}

/**
 * Request body for creating a virtual context
 */
export interface VirtualContextCreateRequest {
  name: string;
  description?: string;
  ownerSpaceId: string;
  visibility?: string;
}

/**
 * Request body for adding a virtual context member
 */
export interface VirtualContextAddMemberRequest {
  spaceId: string;
  role?: 'OWNER' | 'CONTRIBUTOR' | 'READONLY';
}

// ============================================================
// Cross-Space Attribute DTOs
// ============================================================

/**
 * Cross-space attribute entity from backend
 */
export interface CrossSpaceAttributeResponse {
  id: string;
  virtualContextId: string;
  sourceSpaceId: string;
  sourceNodeId: string;
  targetSpaceId: string;
  targetNodeId: string;
  attributeName: string;
  attributeType: string;
  attributeValue: Record<string, unknown>;
  crossSpace: boolean;
  createdAt: string;
}

/**
 * Request body for creating a cross-space attribute
 */
export interface CrossSpaceAttributeCreateRequest {
  sourceNodeId: string;
  targetNodeId: string;
  attributeName: string;
  attributeType: string;
  attributeValue?: Record<string, unknown>;
  properties?: Record<string, unknown>;
}

// ============================================================
// Node Move DTOs
// ============================================================

/**
 * Request body for moving a node between spaces
 */
export interface MoveNodeRequest {
  targetSpaceId: string;
  targetContextId?: string;
  contextAction?: string;
  confirm?: boolean;
}

/**
 * Response from moving a node between spaces
 */
export interface MoveNodeResponse {
  node: Node;
  convertedRelationships: number;
  severedRelationships: number;
  contextAction?: string;
  preview?: MovePreview;
}

/**
 * Preview information for a node move
 */
export interface MovePreview {
  totalRelationships: number;
  relationships: RelationshipInfo[];
}

/**
 * Relationship info used in move preview
 */
export interface RelationshipInfo {
  attributeId: string;
  attributeName: string;
  connectedNodeId: string;
  connectedNodeTitle: string;
}

// ============================================================
// Void Node DTOs
// ============================================================

/**
 * Request body for creating a void node
 */
export interface VoidNodeCreateRequest {
  title: string;
  content?: string;
  nodeType?: 'REGULAR' | 'CONTEXT' | 'ATTRIBUTE';
  nodeDetails?: Record<string, unknown>;
}

/**
 * Request body for updating a void node
 */
export interface VoidNodeUpdateRequest {
  title?: string;
  content?: string;
  nodeDetails?: Record<string, unknown>;
}

/**
 * Request body for assigning a void node to a space
 */
export interface AssignToSpaceRequest {
  spaceId: string;
  contextId?: string;
}

// ============================================================
// Lock DTOs
// ============================================================

/**
 * Response from lock/unlock operations
 */
export interface LockResponse {
  success: boolean;
  message?: string;
}

/**
 * Request body for locking a node
 */
export interface LockNodeRequest {
  lockLevel: LockLevel;
}

// ============================================================
// Pagination
// ============================================================

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  cursor: string | null;
}

// ============================================================
// Node Migration DTOs
// ============================================================

export interface MigrateNodeRequest {
  targetSpaceId: string;
  targetContextId?: string;
  includeReference?: boolean;
}

export interface MigrateNodeResponse {
  original: Node;
  copy: Node;
  referenceAttributeId: string | null;
}

// ============================================================
// The Blank DTOs
// ============================================================

export interface BlankCount {
  count: number;
}

export interface AssignFromBlankRequest {
  contextSlug: string;
}

export interface BulkAssignFromBlankRequest {
  nodeIds: string[];
  contextSlug: string;
}

// ============================================================
// Context Type / Schema DTOs
// ============================================================

export interface FieldSchema {
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'NODE_REF' | 'LIST';
  required?: boolean;
  description?: string;
  default?: unknown;
}

export interface SchemaRelationshipDefinition {
  type: string;
  targetContextType: string;
  cardinality: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY';
}

export interface ContextType {
  id: string;
  spaceId: string;
  name: string;
  slug: string;
  attributeSchema: Record<string, FieldSchema>;
  schemaRelationships: SchemaRelationshipDefinition[];
  isBuiltin: boolean;
  createdAt: string;
  createdBy: string;
}

export interface ContextTypeCreateRequest {
  name: string;
  slug?: string;
  attributeSchema?: Record<string, FieldSchema>;
  schemaRelationships?: SchemaRelationshipDefinition[];
}

export interface ContextTypeUpdateRequest {
  name?: string;
  attributeSchema?: Record<string, FieldSchema>;
  schemaRelationships?: SchemaRelationshipDefinition[];
}
