# Data Model: Backend API Endpoint Synchronization

**Feature**: 005-did-changes-to
**Date**: 2025-10-13

## Overview

This document defines the TypeScript interfaces and data structures required for synchronizing the frontend with the backend's workspace-to-space migration. All types match the backend OpenAPI specification.

## Core Entities

### Space (formerly Workspace)

```typescript
/**
 * Space - Container for organizing nodes
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

/** @deprecated Use Space. Workspace renamed to Space in backend v2. */
export type Workspace = Space;
```

### Space Request/Response Types

```typescript
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
```

---

### Node (updated for space scoping)

```typescript
/**
 * Node - Represents a concept/entity in the knowledge graph
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
 * Node type enum
 * Backend: NodeType enum
 */
export enum NodeType {
  REGULAR = 'REGULAR',
  CONTEXT = 'CONTEXT',
  ASSUMPTION = 'ASSUMPTION',
  TEMPLATE = 'TEMPLATE',
}
```

### Node Request Types

```typescript
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
```

---

### Attribute (no changes - included for completeness)

```typescript
/**
 * Attribute - Represents a relationship between nodes
 * Backend: AttributeResponse from /api/nodes/{nodeId}/attributes
 * NO CHANGES from previous version
 */
export interface Attribute {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Parent space ID (UUID v4) */
  spaceId: string;

  /** Source node ID (UUID v4) */
  sourceNodeId: string;

  /** Target node ID (UUID v4) */
  targetNodeId: string;

  /** Attribute name (e.g., "contains", "references") */
  attributeName: string;

  /** Attribute classification */
  attributeType: AttributeType;

  /** Type mode (typed vs schemaless) */
  attributeTypeMode: AttributeTypeMode;

  /** Optional data type (if typed) */
  attributeDataType?: AttributeDataType;

  /** Attribute value (JSON object) */
  attributeValue: Record<string, unknown>;

  /** Additional properties (JSON object) */
  properties: Record<string, unknown>;

  /** Creator user ID (UUID v4) */
  createdBy: string;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;
}

export enum AttributeType {
  CUSTOM = 'CUSTOM',
  SYSTEM = 'SYSTEM',
}

export enum AttributeTypeMode {
  TYPED = 'TYPED',
  SCHEMALESS = 'SCHEMALESS',
}

export enum AttributeDataType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  NODE_REF = 'NODE_REF',
  ENUM = 'ENUM',
  JSON = 'JSON',
}
```

### Attribute Request Types

```typescript
/**
 * Request body for creating an attribute
 * Backend: AttributeCreateRequest for POST /api/nodes/{nodeId}/attributes
 */
export interface CreateAttributeRequest {
  /** Source node ID (UUID v4) */
  sourceNodeId: string;

  /** Target node ID (UUID v4) */
  targetNodeId: string;

  /** Attribute name */
  attributeName: string;

  /** Attribute type */
  attributeType: AttributeType;

  /** Type mode */
  attributeTypeMode: AttributeTypeMode;

  /** Optional data type */
  attributeDataType?: AttributeDataType;

  /** Attribute value (JSON) */
  attributeValue: Record<string, unknown>;

  /** Optional properties (JSON) */
  properties?: Record<string, unknown>;
}

/**
 * Request body for updating an attribute
 * Backend: AttributeUpdateRequest for PUT /api/attributes/{attributeId}
 */
export interface UpdateAttributeRequest {
  /** New attribute name (optional) */
  attributeName?: string;

  /** New type mode (optional) */
  attributeTypeMode?: AttributeTypeMode;

  /** New data type (optional) */
  attributeDataType?: AttributeDataType;

  /** New value (optional) */
  attributeValue?: Record<string, unknown>;

  /** New properties (optional) */
  properties?: Record<string, unknown>;
}
```

---

## Service Method Signatures

### SpaceService (renamed from WorkspaceService)

```typescript
export interface SpaceService {
  /** Get all spaces for current user */
  getSpaces(params?: PaginationParams): Promise<Space[]>;

  /** Get space by ID */
  getSpace(id: string): Promise<Space>;

  /** Get space by slug */
  getSpaceBySlug(slug: string): Promise<Space>;

  /** Create new space */
  createSpace(data: CreateSpaceRequest): Promise<Space>;

  /** Update space */
  updateSpace(id: string, data: UpdateSpaceRequest): Promise<Space>;

  /** Delete space */
  deleteSpace(id: string): Promise<void>;
}
```

### NodeService (updated for space scoping)

```typescript
export interface NodeService {
  /** Get all nodes in a space (UPDATED: uses spaceSlug) */
  getNodes(spaceSlug: string, params?: PaginationParams): Promise<PaginatedResponse<Node>>;

  /** Get single node (UPDATED: requires spaceSlug) */
  getNode(spaceSlug: string, nodeId: string): Promise<Node>;

  /** Create node (UPDATED: requires spaceSlug) */
  createNode(spaceSlug: string, data: CreateNodeRequest): Promise<Node>;

  /** Update node (UPDATED: requires spaceSlug) */
  updateNode(spaceSlug: string, nodeId: string, data: UpdateNodeRequest): Promise<Node>;

  /** Delete node (UPDATED: requires spaceSlug, optional force param) */
  deleteNode(spaceSlug: string, nodeId: string, force?: boolean): Promise<void>;

  /** Search nodes in space */
  searchNodes(spaceSlug: string, params: SearchParams): Promise<PaginatedResponse<Node>>;
}
```

### AttributeService (no changes)

```typescript
export interface AttributeService {
  /** Get all attributes for a node */
  getNodeAttributes(nodeId: string, params?: { attributeType?: string }): Promise<Attribute[]>;

  /** Create new attribute/relationship */
  createAttribute(nodeId: string, data: CreateAttributeRequest): Promise<Attribute>;

  /** Delete attribute */
  deleteAttribute(nodeId: string, attributeId: string): Promise<void>;

  /** Get all attributes in a workspace (DEPRECATED: may be removed) */
  getWorkspaceAttributes(workspaceId: string): Promise<Attribute[]>;
}
```

---

## Type Transitions

### Migration Path

| Old Type | New Type | Notes |
|----------|----------|-------|
| `Workspace` | `Space` | Alias provided for backward compatibility |
| `WorkspaceService` | `SpaceService` | Service renamed |
| `useWorkspaces()` | `useSpaces()` | Hook renamed |
| `useWorkspace(id)` | `useSpace(slug)` | Changed parameter from ID to slug |
| `workspaceId: number` | `spaceSlug: string` | Type change for node operations |

### Deprecated Types (Temporary Compatibility)

```typescript
// Provide aliases during migration period
export type Workspace = Space;
export type CreateWorkspaceRequest = CreateSpaceRequest;
export type UpdateWorkspaceRequest = UpdateSpaceRequest;
```

---

## Validation Rules

### Space Validation

```typescript
import { z } from 'zod';

export const spaceNameSchema = z.string().min(1).max(255);
export const spaceSlugSchema = z.string().regex(/^[a-z0-9-]+$/);

export const createSpaceSchema = z.object({
  name: spaceNameSchema,
  slug: spaceSlugSchema.optional(),
});

export const updateSpaceSchema = z.object({
  name: spaceNameSchema.optional(),
  slug: spaceSlugSchema.optional(),
});
```

### Node Validation

```typescript
export const nodeTitleSchema = z.string().min(1).max(255);
export const nodeContentSchema = z.string();
export const nodeTypeSchema = z.nativeEnum(NodeType);

export const createNodeSchema = z.object({
  title: nodeTitleSchema,
  nodeType: nodeTypeSchema,
  content: nodeContentSchema.optional(),
  nodeDetails: z.record(z.unknown()).optional(),
});

export const updateNodeSchema = z.object({
  title: nodeTitleSchema.optional(),
  content: nodeContentSchema.optional(),
  nodeDetails: z.record(z.unknown()).optional(),
});
```

---

## React Query Keys

### Space Query Keys

```typescript
export const spaceKeys = {
  all: ['spaces'] as const,
  lists: () => [...spaceKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...spaceKeys.lists(), filters] as const,
  details: () => [...spaceKeys.all, 'detail'] as const,
  detail: (slug: string) => [...spaceKeys.details(), slug] as const,
};
```

### Node Query Keys (Updated)

```typescript
export const nodeKeys = {
  all: ['nodes'] as const,

  // Lists scoped by space slug (UPDATED)
  listsInSpace: (spaceSlug: string) => [...nodeKeys.all, 'list', spaceSlug] as const,

  // Details scoped by space slug (UPDATED)
  details: () => [...nodeKeys.all, 'detail'] as const,
  detail: (spaceSlug: string, nodeId: string) => [...nodeKeys.details(), spaceSlug, nodeId] as const,
};
```

---

## Summary

### Key Changes
1. ✅ **Space replaces Workspace**: New primary entity
2. ✅ **Slug-based operations**: Node operations require space slug, not ID
3. ⚠️ **No attribute changes**: Attribute endpoints and types unchanged
4. ⚠️ **Auth unchanged**: User/authentication types unchanged

### Files to Update
- `src/types/backend-dtos.ts` - Add Space types, deprecate Workspace
- `src/services/api/workspace.service.ts` → `space.service.ts` - Rename and update endpoints
- `src/services/api/node.service.ts` - Update all methods to require `spaceSlug`
- `src/hooks/useWorkspaces.ts` → `useSpaces.ts` - Rename hook
- `src/hooks/useNodes.ts` - Update to accept `spaceSlug` parameter

**Status**: ✅ Data Model Complete
**Next**: Create API contracts (contracts/*.yml)
