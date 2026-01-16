// src/services/api/wikilink.service.ts

import { parseWikiLinks, resolveWikiLinkTarget } from '@/lib/wikilink-parser';
import { nodeService } from './node.service';
import { attributeService } from './attribute.service';
import { NodeType, AttributeKey, AttributeTypeMode } from '@/types/backend-dtos';
import type { Node, CreateNodeRequest, CreateAttributeRequest } from '@/types/backend-dtos';

/**
 * WikiLink resolution result
 */
export interface WikiLinkResolution {
  targetTitle: string;
  displayText: string;
  targetNode: Node | null;
  needsPlaceholder: boolean;
}

/**
 * Result of parsing and resolving wiki-links
 */
export interface ParseAndResolveResult {
  resolutions: WikiLinkResolution[];
  unresolvedCount: number;
  resolvedCount: number;
}

/**
 * Result of creating placeholders
 */
export interface CreatePlaceholdersResult {
  createdNodes: Node[];
  errors: Array<{ title: string; error: string }>;
}

/**
 * Result of creating relationships
 */
export interface CreateRelationshipsResult {
  createdAttributes: any[];
  errors: Array<{ targetTitle: string; error: string }>;
}

/**
 * WikiLink Service
 *
 * Orchestrates wiki-link processing:
 * 1. Parse wiki-links from markdown
 * 2. Resolve links to existing nodes
 * 3. Create placeholder nodes for unresolved links
 * 4. Create attribute relationships for all links
 */
export const wikiLinkService = {
  /**
   * Parse wiki-links from markdown and resolve them to existing nodes
   * API Calls: GET /api/spaces/{id}/nodes (to get all nodes for resolution)
   *
   * @param markdown - The markdown content to parse
   * @param spaceId - Space ID for resolving nodes
   * @returns Resolution results with target nodes or placeholder flags
   */
  async parseAndResolve(
    markdown: string,
    spaceId: string
  ): Promise<ParseAndResolveResult> {
    // Parse wiki-links from markdown
    const wikiLinks = parseWikiLinks(markdown);

    if (wikiLinks.length === 0) {
      return {
        resolutions: [],
        unresolvedCount: 0,
        resolvedCount: 0,
      };
    }

    // Fetch all nodes in space for resolution
    const existingNodes = await nodeService.getNodes(spaceId);

    // Resolve each wiki-link
    const resolutions: WikiLinkResolution[] = wikiLinks.map(link => {
      const targetNode = resolveWikiLinkTarget(link.targetTitle, existingNodes);

      return {
        targetTitle: link.targetTitle,
        displayText: link.displayText,
        targetNode,
        needsPlaceholder: !targetNode,
      };
    });

    // Count resolved vs unresolved
    const unresolvedCount = resolutions.filter(r => r.needsPlaceholder).length;
    const resolvedCount = resolutions.length - unresolvedCount;

    return {
      resolutions,
      unresolvedCount,
      resolvedCount,
    };
  },

  /**
   * Create placeholder nodes for unresolved wiki-links
   * API Calls: POST /api/nodes (for each placeholder)
   *
   * @param resolutions - Wiki-link resolution results
   * @param spaceId - Space ID for creating nodes
   * @returns Created placeholder nodes and any errors
   */
  async createPlaceholders(
    resolutions: WikiLinkResolution[],
    spaceId: string
  ): Promise<CreatePlaceholdersResult> {
    const unresolvedLinks = resolutions.filter(r => r.needsPlaceholder);

    if (unresolvedLinks.length === 0) {
      return {
        createdNodes: [],
        errors: [],
      };
    }

    // Create placeholder nodes for unresolved links
    const createdNodes: Node[] = [];
    const errors: Array<{ title: string; error: string }> = [];

    for (const link of unresolvedLinks) {
      try {
        const createRequest: CreateNodeRequest = {
          title: link.targetTitle,
          nodeType: NodeType.REGULAR,
          content: `# ${link.targetTitle}\n\n*This page was automatically created from a wiki-link.*`,
          nodeDetails: {
            isPlaceholder: true,
            createdFrom: 'wiki-link',
          },
        };

        const createdNode = await nodeService.createNode(spaceId, createRequest);
        createdNodes.push(createdNode);
      } catch (error: any) {
        errors.push({
          title: link.targetTitle,
          error: error.message || 'Failed to create placeholder',
        });
      }
    }

    return {
      createdNodes,
      errors,
    };
  },

  /**
   * Create attribute relationships for wiki-links
   * API Calls: POST /api/nodes/{id}/attributes (for each relationship)
   *
   * @param sourceNodeId - The node containing the wiki-links
   * @param resolutions - Wiki-link resolution results (with resolved/created nodes)
   * @param createdPlaceholders - Newly created placeholder nodes
   * @returns Created attributes and any errors
   */
  async createRelationships(
    sourceNodeId: string,
    resolutions: WikiLinkResolution[],
    createdPlaceholders: Node[] = []
  ): Promise<CreateRelationshipsResult> {
    const createdAttributes: any[] = [];
    const errors: Array<{ targetTitle: string; error: string }> = [];

    // Build lookup map for created placeholders
    const placeholderMap = new Map<string, Node>();
    createdPlaceholders.forEach(node => {
      placeholderMap.set(node.title.toLowerCase(), node);
    });

    for (const resolution of resolutions) {
      try {
        // Find target node (either resolved or newly created placeholder)
        let targetNode = resolution.targetNode;
        if (!targetNode && resolution.needsPlaceholder) {
          targetNode = placeholderMap.get(resolution.targetTitle.toLowerCase()) || null;
        }

        if (!targetNode) {
          errors.push({
            targetTitle: resolution.targetTitle,
            error: 'Target node not found and placeholder was not created',
          });
          continue;
        }

        // Create attribute relationship
        const createRequest: CreateAttributeRequest = {
          sourceNodeId,
          targetNodeId: targetNode.id,
          attributeType: AttributeKey.REFERENCES,
          attributeTypeMode: AttributeTypeMode.SCHEMALESS,
          attributeName: AttributeKey.REFERENCES,
          attributeValue: {
            displayText: resolution.displayText,
            targetTitle: resolution.targetTitle,
            isPlaceholder: resolution.needsPlaceholder,
          },
        };

        const createdAttr = await attributeService.createAttribute(
          sourceNodeId,
          createRequest
        );
        createdAttributes.push(createdAttr);
      } catch (error: any) {
        errors.push({
          targetTitle: resolution.targetTitle,
          error: error.message || 'Failed to create relationship',
        });
      }
    }

    return {
      createdAttributes,
      errors,
    };
  },

  /**
   * Complete wiki-link processing workflow
   * Orchestrates: parse → resolve → create placeholders → create relationships
   *
   * @param markdown - The markdown content with wiki-links
   * @param sourceNodeId - The node containing the wiki-links
   * @param spaceId - Space ID
   * @returns Complete result with all created entities and errors
   */
  async processWikiLinks(
    markdown: string,
    sourceNodeId: string,
    spaceId: string
  ): Promise<{
    resolutions: WikiLinkResolution[];
    createdPlaceholders: Node[];
    createdAttributes: any[];
    errors: string[];
  }> {
    // Step 1: Parse and resolve
    const parseResult = await this.parseAndResolve(markdown, spaceId);

    // Step 2: Create placeholders for unresolved links
    const placeholderResult = await this.createPlaceholders(
      parseResult.resolutions,
      spaceId
    );

    // Step 3: Create relationships
    const relationshipResult = await this.createRelationships(
      sourceNodeId,
      parseResult.resolutions,
      placeholderResult.createdNodes
    );

    // Collect all errors
    const allErrors = [
      ...placeholderResult.errors.map(e => `Placeholder creation failed for "${e.title}": ${e.error}`),
      ...relationshipResult.errors.map(e => `Relationship creation failed for "${e.targetTitle}": ${e.error}`),
    ];

    return {
      resolutions: parseResult.resolutions,
      createdPlaceholders: placeholderResult.createdNodes,
      createdAttributes: relationshipResult.createdAttributes,
      errors: allErrors,
    };
  },
};
