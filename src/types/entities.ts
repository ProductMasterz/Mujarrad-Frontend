/**
 * Core entity types matching API contracts
 * These types align with the backend DTOs from contracts/api-contracts.md
 */

/**
 * Node (Page) entity
 * Represents both CONTEXT (folders) and REGULAR (content pages) nodes
 */
export interface Node {
  id: string;
  spaceId: string;
  title: string;
  slug: string;
  nodeType: 'REGULAR' | 'CONTEXT';
  markdownContent?: string;
  nodeDetails?: Record<string, any>;
  createdBy: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  version: number;
}

/**
 * Attribute (Relationship/Edge) entity
 * Represents all relationships between nodes
 */
export interface Attribute {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  attributeType: AttributeType;
  attributeKey: string;
  attributeValue?: string;
  metadata?: AttributeMetadata;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Attribute type enum
 */
export type AttributeType =
  | 'contains'      // Hierarchy (CONTEXT → child nodes)
  | 'references'    // Wiki-links and citations
  | 'depends_on'    // Dependencies
  | 'triggers'      // Workflow connections
  | 'next'          // Sequential flow
  | 'calls';        // Function invocations

/**
 * Attribute metadata structure
 */
export interface AttributeMetadata {
  // For wiki-links
  displayText?: string;      // Alias from [[Display|Target]]
  targetTitle?: string;      // Original target title
  isPlaceholder?: boolean;   // True if target was auto-created

  // For bidirectional edges (graph rendering)
  isBidirectional?: boolean; // A→B and B→A both exist

  // For all relationships
  description?: string;
  weight?: number;
  [key: string]: any;
}

/**
 * Space entity
 */
export interface Space {
  id: string;
  slug: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Search result entity
 */
export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  nodeType: 'REGULAR' | 'CONTEXT';
  excerpt: string;
  score: number;
}

/**
 * User entity
 */
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create node payload
 */
export interface CreateNodePayload {
  title: string;
  spaceId: string;
  nodeType: 'REGULAR' | 'CONTEXT';
  markdownContent?: string;
  nodeDetails?: Record<string, any>;
}

/**
 * Update node payload
 */
export interface UpdateNodePayload {
  title: string;
  nodeType: 'REGULAR' | 'CONTEXT';
  markdownContent?: string;
  nodeDetails?: Record<string, any>;
  version: number; // Required for optimistic locking
}

/**
 * Create attribute payload
 */
export interface CreateAttributePayload {
  sourceNodeId: string;
  targetNodeId: string;
  attributeType: AttributeType;
  attributeKey: string;
  attributeValue?: string;
  metadata?: AttributeMetadata;
}
