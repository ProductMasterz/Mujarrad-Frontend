/**
 * Wiki-link types for markdown parsing and resolution
 * Supports [[Target]] and [[Display|Target]] syntax
 */

/**
 * Parsed wiki-link from markdown content
 */
export interface WikiLink {
  raw: string;              // Original [[...]] string
  displayText: string;      // Text to show (before pipe or full)
  targetTitle: string;      // Page title to resolve
  startIndex: number;       // Position in markdown
  endIndex: number;         // Position in markdown
}

/**
 * Wiki-link resolution result
 * After attempting to match target title to existing node
 */
export interface WikiLinkResolution {
  link: WikiLink;
  targetNodeId: string | null; // null if not found
  needsPlaceholder: boolean;    // true if should create
}

/**
 * Result of parsing markdown content
 */
export interface ParsedMarkdown {
  content: string;
  wikiLinks: WikiLink[];
}

/**
 * Parameters for wiki-link parsing
 */
export interface ParseWikiLinksParams {
  markdown: string;
}

/**
 * Parameters for wiki-link resolution
 */
export interface ResolveWikiLinksParams {
  wikiLinks: WikiLink[];
  existingNodes: import('./backend-dtos').Node[];
  spaceId: string;
}
