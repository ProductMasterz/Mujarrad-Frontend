/**
 * Wiki-link parser for markdown content
 * Extracts [[Target]] and [[Display|Target]] patterns
 */

import { WikiLink, ParsedMarkdown, WikiLinkResolution } from '@/types/wikilink';
import type { Node } from '@/types/backend-dtos';

/**
 * Regular expression to match wiki-links
 * Matches: [[Target]] or [[Display|Target]]
 */
const WIKILINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Parse wiki-links from markdown content
 * @param markdown - The markdown content to parse
 * @returns Array of parsed wiki-links
 */
export function parseWikiLinks(markdown: string): WikiLink[] {
  const wikiLinks: WikiLink[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  WIKILINK_REGEX.lastIndex = 0;

  while ((match = WIKILINK_REGEX.exec(markdown)) !== null) {
    const raw = match[0]; // Full [[...]] match
    const targetOrDisplay = match[1].trim(); // First part (before pipe or only content)
    const target = match[2]?.trim(); // Second part (after pipe, if exists)

    // If pipe exists: [[Display|Target]] - match[2] is target, match[1] is display
    // If no pipe: [[Target]] - match[1] is both display and target
    const displayText = target ? targetOrDisplay : targetOrDisplay;
    const targetTitle = target ? target : targetOrDisplay;

    wikiLinks.push({
      raw,
      displayText,
      targetTitle,
      startIndex: match.index,
      endIndex: match.index + raw.length,
    });
  }

  return wikiLinks;
}

/**
 * Resolve wiki-links to existing nodes
 * Case-insensitive matching by title
 * @param wikiLinks - Parsed wiki-links to resolve
 * @param existingNodes - Available nodes in workspace
 * @returns Resolution results with target node IDs or placeholder flags
 */
export function resolveWikiLinks(
  wikiLinks: WikiLink[],
  existingNodes: Node[]
): WikiLinkResolution[] {
  const resolutions: WikiLinkResolution[] = [];

  // Create case-insensitive title lookup map
  const nodeLookup = new Map<string, Node>();
  existingNodes.forEach(node => {
    nodeLookup.set(node.title.toLowerCase(), node);
  });

  for (const link of wikiLinks) {
    const targetNode = nodeLookup.get(link.targetTitle.toLowerCase());

    resolutions.push({
      link,
      targetNodeId: targetNode ? targetNode.id.toString() : null,
      needsPlaceholder: !targetNode,
    });
  }

  return resolutions;
}

/**
 * Resolve a single wiki-link target to a node
 * Case-insensitive title matching with whitespace trimming
 * @param targetTitle - The target title to resolve
 * @param existingNodes - Available nodes in workspace
 * @returns Matching Node if found, null otherwise
 */
export function resolveWikiLinkTarget(
  targetTitle: string,
  existingNodes: Node[]
): Node | null {
  const normalizedTarget = targetTitle.trim().toLowerCase();
  const node = existingNodes.find(
    n => n.title.toLowerCase() === normalizedTarget
  );
  return node || null;
}

/**
 * Parse markdown and return both content and wiki-links
 * @param markdown - The markdown content
 * @returns Parsed markdown with wiki-links
 */
export function parseMarkdown(markdown: string): ParsedMarkdown {
  return {
    content: markdown,
    wikiLinks: parseWikiLinks(markdown),
  };
}
