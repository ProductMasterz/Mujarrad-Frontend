/**
 * Service Integration Tests
 *
 * Tests services working together in realistic workflows:
 * 1. WikiLink workflow: Parse → Resolve → Create Placeholders → Create Relationships
 * 2. Node CRUD with relationships
 * 3. Error handling across services
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { wikiLinkService } from '@/services/api/wikilink.service';
import type { Node, Attribute } from '@/types/backend-dtos';

// Mock server for integration testing
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Service Integration Tests', () => {
  describe('WikiLink Processing Workflow', () => {
    it('should parse, resolve, create placeholders, and create relationships', async () => {
      const spaceId = 'ws-integration-123';
      const sourceNodeId = 'node-source-1';
      const markdown = '# Welcome\n\nCheck out [[Existing Page]] and [[New Page]].';

      // Setup: Mock space nodes (only "Existing Page" exists)
      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceId/nodes', () => {
          return HttpResponse.json([
            {
              id: 'node-existing-1',
              spaceId,
              title: 'Existing Page',
              slug: 'existing-page',
              nodeType: 'REGULAR',
              markdownContent: '# Existing Page content',
              nodeDetails: {},
              createdBy: 'user-1',
              createdAt: '2025-10-08T10:00:00Z',
              updatedAt: '2025-10-08T10:00:00Z',
              version: 1,
            },
          ]);
        })
      );

      // Mock: Create placeholder for "New Page"
      server.use(
        http.post('http://localhost:3000/api/nodes', async ({ request }) => {
          const body = await request.json() as any;
          return HttpResponse.json(
            {
              id: 'node-placeholder-1',
              spaceId: body.spaceId,
              title: body.title,
              slug: body.title.toLowerCase().replace(/\s+/g, '-'),
              nodeType: body.nodeType,
              markdownContent: body.markdownContent,
              nodeDetails: body.nodeDetails,
              createdBy: 'user-1',
              createdAt: '2025-10-08T12:00:00Z',
              updatedAt: '2025-10-08T12:00:00Z',
              version: 1,
            },
            { status: 201 }
          );
        })
      );

      // Mock: Create attributes for both links
      let attributeCallCount = 0;
      server.use(
        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', async ({ request }) => {
          const body = await request.json() as any;
          attributeCallCount++;
          return HttpResponse.json(
            {
              id: `attr-${attributeCallCount}`,
              sourceNodeId: body.sourceNodeId,
              targetNodeId: body.targetNodeId,
              attributeType: body.attributeType,
              attributeKey: body.attributeKey,
              attributeValue: body.attributeValue,
              metadata: body.metadata,
              createdBy: 'user-1',
              createdAt: '2025-10-08T12:00:00Z',
              updatedAt: '2025-10-08T12:00:00Z',
            },
            { status: 201 }
          );
        })
      );

      // Execute: Complete wiki-link processing workflow
      const result = await wikiLinkService.processWikiLinks(
        markdown,
        sourceNodeId,
        spaceId
      );

      // Verify: Parse and resolve results
      expect(result.resolutions).toHaveLength(2);
      expect(result.resolutions[0].targetTitle).toBe('Existing Page');
      expect(result.resolutions[0].targetNode).toBeTruthy();
      expect(result.resolutions[0].needsPlaceholder).toBe(false);
      expect(result.resolutions[1].targetTitle).toBe('New Page');
      expect(result.resolutions[1].needsPlaceholder).toBe(true);

      // Verify: Placeholder created for "New Page"
      expect(result.createdPlaceholders).toHaveLength(1);
      expect(result.createdPlaceholders[0].title).toBe('New Page');
      expect(result.createdPlaceholders[0].nodeDetails?.isPlaceholder).toBe(true);

      // Verify: Attributes created for both links
      expect(result.createdAttributes).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle wiki-links when all targets exist', async () => {
      const spaceId = 'ws-integration-456';
      const sourceNodeId = 'node-source-2';
      const markdown = '[[Page A]] references [[Page B]].';

      // Mock: Both pages exist
      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceId/nodes', () => {
          return HttpResponse.json([
            {
              id: 'node-a',
              spaceId,
              title: 'Page A',
              slug: 'page-a',
              nodeType: 'REGULAR',
              markdownContent: '',
              nodeDetails: {},
              createdBy: 'user-1',
              createdAt: '2025-10-08T10:00:00Z',
              updatedAt: '2025-10-08T10:00:00Z',
              version: 1,
            },
            {
              id: 'node-b',
              spaceId,
              title: 'Page B',
              slug: 'page-b',
              nodeType: 'REGULAR',
              markdownContent: '',
              nodeDetails: {},
              createdBy: 'user-1',
              createdAt: '2025-10-08T10:00:00Z',
              updatedAt: '2025-10-08T10:00:00Z',
              version: 1,
            },
          ]);
        })
      );

      // Mock: Create attributes
      server.use(
        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', async ({ request }) => {
          const body = await request.json() as any;
          return HttpResponse.json(
            {
              id: 'attr-resolved',
              sourceNodeId: body.sourceNodeId,
              targetNodeId: body.targetNodeId,
              attributeType: body.attributeType,
              attributeKey: body.attributeKey,
              attributeValue: null,
              metadata: body.metadata,
              createdBy: 'user-1',
              createdAt: '2025-10-08T12:00:00Z',
              updatedAt: '2025-10-08T12:00:00Z',
            },
            { status: 201 }
          );
        })
      );

      const result = await wikiLinkService.processWikiLinks(
        markdown,
        sourceNodeId,
        spaceId
      );

      // Verify: No placeholders needed
      expect(result.createdPlaceholders).toHaveLength(0);
      expect(result.createdAttributes).toHaveLength(2);
      expect(result.resolutions.every(r => !r.needsPlaceholder)).toBe(true);
    });

    it('should handle errors during placeholder creation', async () => {
      const spaceId = 'ws-error-test';
      const sourceNodeId = 'node-source-err';
      const markdown = '[[Valid Page]] and [[Invalid Page]].';

      // Mock: No existing pages
      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceId/nodes', () => {
          return HttpResponse.json([]);
        })
      );

      // Mock: First placeholder succeeds, second fails
      let createCallCount = 0;
      server.use(
        http.post('http://localhost:3000/api/nodes', async ({ request }) => {
          createCallCount++;
          const body = await request.json() as any;

          if (createCallCount === 1) {
            // First call succeeds
            return HttpResponse.json(
              {
                id: 'node-valid',
                spaceId: body.spaceId,
                title: body.title,
                slug: body.title.toLowerCase().replace(/\s+/g, '-'),
                nodeType: body.nodeType,
                markdownContent: body.markdownContent,
                nodeDetails: body.nodeDetails,
                createdBy: 'user-1',
                createdAt: '2025-10-08T12:00:00Z',
                updatedAt: '2025-10-08T12:00:00Z',
                version: 1,
              },
              { status: 201 }
            );
          } else {
            // Second call fails with validation error
            return HttpResponse.json(
              {
                type: 'https://api.mujarrad.com/errors/validation',
                title: 'Validation Failed',
                status: 400,
                detail: 'Invalid node title',
              },
              { status: 400 }
            );
          }
        })
      );

      const result = await wikiLinkService.processWikiLinks(
        markdown,
        sourceNodeId,
        spaceId
      );

      // Verify: One placeholder created, one error
      expect(result.createdPlaceholders).toHaveLength(1);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('Invalid Page'))).toBe(true);
    });
  });

  describe('Node CRUD with Relationships', () => {
    it('should create node, add attributes, and retrieve them', async () => {
      const spaceId = 'ws-crud-test';

      // Mock: Create node
      server.use(
        http.post('http://localhost:3000/api/nodes', async ({ request }) => {
          const body = await request.json() as any;
          return HttpResponse.json(
            {
              id: 'node-new-123',
              spaceId: body.spaceId,
              title: body.title,
              slug: body.title.toLowerCase().replace(/\s+/g, '-'),
              nodeType: body.nodeType,
              markdownContent: body.markdownContent,
              nodeDetails: {},
              createdBy: 'user-1',
              createdAt: '2025-10-08T12:00:00Z',
              updatedAt: '2025-10-08T12:00:00Z',
              version: 1,
            },
            { status: 201 }
          );
        })
      );

      // Step 1: Create node
      const newNode = await nodeService.createNode({
        spaceId,
        title: 'New Node',
        nodeType: 'REGULAR',
        markdownContent: '# Content',
      });

      expect(newNode.id).toBe('node-new-123');
      expect(newNode.title).toBe('New Node');

      // Mock: Create attribute
      server.use(
        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', async ({ request }) => {
          const body = await request.json() as any;
          return HttpResponse.json(
            {
              id: 'attr-new-1',
              sourceNodeId: body.sourceNodeId,
              targetNodeId: body.targetNodeId,
              attributeType: body.attributeType,
              attributeKey: body.attributeKey,
              attributeValue: null,
              metadata: {},
              createdBy: 'user-1',
              createdAt: '2025-10-08T12:05:00Z',
              updatedAt: '2025-10-08T12:05:00Z',
            },
            { status: 201 }
          );
        })
      );

      // Step 2: Add attribute
      const newAttr = await attributeService.createAttribute(
        newNode.id.toString(),
        {
          sourceNodeId: newNode.id.toString(),
          targetNodeId: 'other-node-456',
          attributeType: 'references',
          attributeKey: 'related-to',
          attributeValue: null,
        }
      );

      expect(newAttr.id).toBe('attr-new-1');
      expect(newAttr.attributeType).toBe('references');

      // Mock: Get attributes
      server.use(
        http.get('http://localhost:3000/api/nodes/:nodeId/attributes', () => {
          return HttpResponse.json([
            {
              id: 'attr-new-1',
              sourceNodeId: 'node-new-123',
              targetNodeId: 'other-node-456',
              attributeType: 'references',
              attributeKey: 'related-to',
              attributeValue: null,
              metadata: {},
              createdBy: 'user-1',
              createdAt: '2025-10-08T12:05:00Z',
              updatedAt: '2025-10-08T12:05:00Z',
            },
          ]);
        })
      );

      // Step 3: Retrieve attributes
      const attributes = await attributeService.getNodeAttributes(newNode.id.toString());

      expect(attributes).toHaveLength(1);
      expect(attributes[0].id).toBe('attr-new-1');
    });

    it('should update node and maintain version consistency', async () => {
      const nodeId = 'node-version-test';

      // Mock: Get node (version 1)
      server.use(
        http.get('http://localhost:3000/api/nodes/:id', () => {
          return HttpResponse.json({
            id: nodeId,
            spaceId: 'ws-1',
            title: 'Original Title',
            slug: 'original-title',
            nodeType: 'REGULAR',
            markdownContent: '# Original',
            nodeDetails: {},
            createdBy: 'user-1',
            createdAt: '2025-10-08T10:00:00Z',
            updatedAt: '2025-10-08T10:00:00Z',
            version: 1,
          });
        })
      );

      const originalNode = await nodeService.getNode(nodeId);
      expect(originalNode.version).toBe(1);

      // Mock: Update node (version 2)
      server.use(
        http.put('http://localhost:3000/api/nodes/:id', async ({ request }) => {
          const body = await request.json() as any;
          return HttpResponse.json({
            id: nodeId,
            spaceId: 'ws-1',
            title: body.title,
            slug: body.title.toLowerCase().replace(/\s+/g, '-'),
            nodeType: body.nodeType,
            markdownContent: body.markdownContent,
            nodeDetails: {},
            createdBy: 'user-1',
            createdAt: '2025-10-08T10:00:00Z',
            updatedAt: '2025-10-08T12:00:00Z',
            version: 2,
          });
        })
      );

      const updatedNode = await nodeService.updateNode(nodeId, {
        title: 'Updated Title',
        nodeType: 'REGULAR',
        markdownContent: '# Updated',
        version: 1,
      });

      expect(updatedNode.version).toBe(2);
      expect(updatedNode.title).toBe('Updated Title');
    });
  });

  describe('Error Handling Across Services', () => {
    it('should propagate 404 errors from NodeService', async () => {
      server.use(
        http.get('http://localhost:3000/api/nodes/:id', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/not-found',
              title: 'Node Not Found',
              status: 404,
              detail: 'Node with ID nonexistent does not exist',
            },
            { status: 404 }
          );
        })
      );

      await expect(nodeService.getNode('nonexistent')).rejects.toThrow();
    });

    it('should handle circular dependency errors from AttributeService', async () => {
      server.use(
        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/circular-dependency',
              title: 'Circular Dependency Detected',
              status: 409,
              detail: 'Creating this relationship would create a circular dependency',
              cyclePath: ['node-a', 'node-b', 'node-c', 'node-a'],
            },
            { status: 409 }
          );
        })
      );

      await expect(
        attributeService.createAttribute('node-a', {
          sourceNodeId: 'node-a',
          targetNodeId: 'node-b',
          attributeType: 'contains',
          attributeKey: 'hierarchy',
          attributeValue: null,
        })
      ).rejects.toThrow();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle empty markdown gracefully', async () => {
      const result = await wikiLinkService.processWikiLinks(
        '',
        'node-1',
        'ws-1'
      );

      expect(result.resolutions).toHaveLength(0);
      expect(result.createdPlaceholders).toHaveLength(0);
      expect(result.createdAttributes).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle duplicate wiki-links correctly', async () => {
      const spaceId = 'ws-dup-test';
      const markdown = '[[Page A]] and [[Page A]] again.';

      // Mock: Page A exists
      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceId/nodes', () => {
          return HttpResponse.json([
            {
              id: 'node-page-a',
              spaceId,
              title: 'Page A',
              slug: 'page-a',
              nodeType: 'REGULAR',
              markdownContent: '',
              nodeDetails: {},
              createdBy: 'user-1',
              createdAt: '2025-10-08T10:00:00Z',
              updatedAt: '2025-10-08T10:00:00Z',
              version: 1,
            },
          ]);
        })
      );

      // Mock: Create attributes (should be called twice)
      let attrCreateCount = 0;
      server.use(
        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', async ({ request }) => {
          attrCreateCount++;
          const body = await request.json() as any;
          return HttpResponse.json(
            {
              id: `attr-dup-${attrCreateCount}`,
              sourceNodeId: body.sourceNodeId,
              targetNodeId: body.targetNodeId,
              attributeType: body.attributeType,
              attributeKey: body.attributeKey,
              attributeValue: null,
              metadata: body.metadata,
              createdBy: 'user-1',
              createdAt: '2025-10-08T12:00:00Z',
              updatedAt: '2025-10-08T12:00:00Z',
            },
            { status: 201 }
          );
        })
      );

      const result = await wikiLinkService.processWikiLinks(
        markdown,
        'node-source',
        spaceId
      );

      // Should create 2 separate attributes for duplicate links
      expect(result.resolutions).toHaveLength(2);
      expect(result.createdAttributes).toHaveLength(2);
      expect(attrCreateCount).toBe(2);
    });
  });
});
