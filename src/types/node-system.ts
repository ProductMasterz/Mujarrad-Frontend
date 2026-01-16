/**
 * Node System Types
 *
 * Defines the visibility, origin, and view preference system for nodes.
 * These are orthogonal concepts that can be combined freely:
 * - A node can be a whiteboard shape AND a block AND visible in space list
 * - Visibility controls WHERE the node appears
 * - Origin tracks HOW the node was created
 * - PreferredView determines the DEFAULT renderer
 */

/**
 * NodeVisibility - Controls where the node appears in the UI
 * This is mutually exclusive (a node can only have one visibility state)
 */
export enum NodeVisibility {
  /** Only visible within its container (block in page, shape on whiteboard only) */
  INTERNAL = 'INTERNAL',
  /** Appears in space hierarchy / node list */
  VISIBLE = 'VISIBLE',
  /** Soft-deleted or archived */
  HIDDEN = 'HIDDEN',
}

/**
 * NodeOrigin - Tracks how/where the node was originally created
 * Informational and immutable after creation
 */
export enum NodeOrigin {
  /** Created as a standalone page */
  PAGE = 'PAGE',
  /** Created as a block inside a page */
  BLOCK = 'BLOCK',
  /** Created from the whiteboard */
  WHITEBOARD = 'WHITEBOARD',
  /** Imported from external source */
  IMPORT = 'IMPORT',
}

/**
 * PreferredView - The default view to show when opening this node
 */
export enum PreferredView {
  /** Block-based page editor */
  PAGE_EDITOR = 'PAGE_EDITOR',
  /** Show on whiteboard, centered on this element */
  WHITEBOARD = 'WHITEBOARD',
  /** Raw markdown view */
  MARKDOWN = 'MARKDOWN',
  /** System decides based on node content/capabilities */
  AUTO = 'AUTO',
}

/**
 * NodeCapabilities - What views/representations are available for a node
 * Inferred from node properties, not stored
 */
export interface NodeCapabilities {
  /** Can be rendered as a whiteboard element (has element_subtype) */
  canRenderAsWhiteboardShape: boolean;
  /** Can be rendered as a block in a page (has blockType) */
  canRenderAsBlock: boolean;
  /** Can be rendered as a page with blocks (all REGULAR nodes) */
  canRenderAsPage: boolean;
  /** Can be rendered as markdown (has content) */
  canRenderAsMarkdown: boolean;
  /** Is a whiteboard context container (stores canvas data) */
  isWhiteboardContext: boolean;
}

/**
 * Extended NodeDetails interface with the new visibility system
 */
export interface ExtendedNodeDetails {
  // New visibility system
  visibility?: NodeVisibility;
  origin?: NodeOrigin;
  preferredView?: PreferredView;

  // Legacy visibility flag (deprecated, use visibility instead)
  showInSpaceList?: boolean;

  // Block-related
  blockType?: string;
  isPage?: boolean;
  checked?: boolean;
  language?: string;
  calloutType?: string;

  // Whiteboard shape related
  element_subtype?: string;

  // Whiteboard context related
  whiteboard_context?: {
    context_type: 'whiteboard';
    element_count?: number;
  };

  // Allow additional properties
  [key: string]: unknown;
}

/**
 * Infer node capabilities from its properties
 */
export function inferNodeCapabilities(
  nodeType: string,
  nodeDetails?: ExtendedNodeDetails | null,
  content?: string | null
): NodeCapabilities {
  const details = nodeDetails || {};

  return {
    canRenderAsWhiteboardShape: !!details.element_subtype,
    canRenderAsBlock: !!details.blockType,
    canRenderAsPage: nodeType === 'REGULAR' || nodeType === 'ASSUMPTION' || nodeType === 'TEMPLATE',
    canRenderAsMarkdown: !!content,
    isWhiteboardContext: !!details.whiteboard_context,
  };
}

/**
 * Determine the effective visibility of a node
 * Handles both new visibility enum and legacy showInSpaceList flag
 */
export function getEffectiveVisibility(
  nodeDetails?: ExtendedNodeDetails | null
): NodeVisibility {
  const details = nodeDetails || {};

  // New system takes precedence
  if (details.visibility) {
    return details.visibility;
  }

  // Legacy fallback
  if (details.showInSpaceList === false) {
    return NodeVisibility.INTERNAL;
  }

  // Legacy: blocks without isPage are internal
  if (details.blockType && !details.isPage) {
    return NodeVisibility.INTERNAL;
  }

  // Legacy: whiteboard shapes without explicit showInSpaceList are internal
  if (details.element_subtype && details.showInSpaceList !== true) {
    return NodeVisibility.INTERNAL;
  }

  // Default to visible
  return NodeVisibility.VISIBLE;
}

/**
 * Infer the origin of a node from its properties
 * Used for nodes created before the origin field was added
 */
export function inferNodeOrigin(
  nodeDetails?: ExtendedNodeDetails | null
): NodeOrigin {
  const details = nodeDetails || {};

  // Explicit origin takes precedence
  if (details.origin) {
    return details.origin as NodeOrigin;
  }

  // Infer from existing properties
  if (details.whiteboard_context || details.element_subtype) {
    return NodeOrigin.WHITEBOARD;
  }

  if (details.blockType && !details.isPage) {
    return NodeOrigin.BLOCK;
  }

  return NodeOrigin.PAGE;
}

/**
 * Determine the best view to render for a node
 */
export function determinePreferredView(
  nodeType: string,
  nodeDetails?: ExtendedNodeDetails | null,
  content?: string | null
): PreferredView {
  const details = nodeDetails || {};
  const capabilities = inferNodeCapabilities(nodeType, details, content);

  // Explicit preference takes precedence
  if (details.preferredView && details.preferredView !== PreferredView.AUTO) {
    return details.preferredView;
  }

  // Whiteboard context → show whiteboard embed
  if (capabilities.isWhiteboardContext) {
    return PreferredView.WHITEBOARD;
  }

  // Whiteboard shapes → show on whiteboard by default
  if (capabilities.canRenderAsWhiteboardShape) {
    return PreferredView.WHITEBOARD;
  }

  // Pages with blocks → page editor
  if (capabilities.canRenderAsPage) {
    return PreferredView.PAGE_EDITOR;
  }

  // Fallback to markdown if content exists
  if (capabilities.canRenderAsMarkdown) {
    return PreferredView.MARKDOWN;
  }

  return PreferredView.PAGE_EDITOR;
}
