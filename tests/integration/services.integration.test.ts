/**
 * Service Integration Tests
 *
 * Tests services working together in realistic workflows:
 * 1. WikiLink workflow: Parse → Resolve → Create Placeholders → Create Relationships
 * 2. Node CRUD with relationships
 * 3. Error handling across services
 */

import { describe, it, expect, beforeAll, afterEach, afterAll, jest } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { wikiLinkService } from '@/services/api/wikilink.service';
import { ApiError } from '@/lib/errors';

// Mock server for integration testing
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  jest.restoreAllMocks();
});
afterAll(() => server.close());

describe('Service Integration Tests', () => {
  describe('WikiLink Processing Workflow', () => {
    it('should parse, resolve, create placeholders, and create relationships', async () => {
      const spaceSlug = 'ws-integration-123';
      const sourceNodeId = 'node-source-1';
      const markdown = '# Welcome\n\nCheck out [[Existing Page]] and [[New Page]].';

      server.use(
        // Existing nodes lookup
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes', ({ params }) => {
          expect(params.spaceSlug).toBe(spaceSlug);

          return HttpResponse.json([
            {
              id: 'node-existing-1',
              spaceId: spaceSlug,
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
        }),

        // Placeholder creation
        http.post('http://localhost:3000/api/spaces/:spaceSlug/nodes', async ({ params, request }) => {
          expect(params.spaceSlug).toBe(spaceSlug);

          const body = (await request.json()) as any;

          return HttpResponse.json(
            {
              id: 'node-placeholder-1',
              spaceId: spaceSlug,
              title: body.title,
              slug: body.title.toLowerCase().replace(/\s+/g, '-'),
              nodeType: body.nodeType,
              markdownContent: body.content ?? body.markdownContent ?? '',
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

      let attributeCallCount = 0;
      server.use(
        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', async ({ params, request }) => {
          expect(params.nodeId).toBe(sourceNodeId);

          const body = (await request.json()) as any;
          attributeCallCount++;

          return HttpResponse.json(
            {
              id: `attr-${attributeCallCount}`,
              sourceNodeId: body.sourceNodeId,
              targetNodeId: body.targetNodeId,
              attributeType: body.attributeType,
              attributeKey: body.attributeKey,
              attributeValue: body.attributeValue ?? null,
              metadata: body.metadata ?? {},
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
        spaceSlug
      );

      expect(result.resolutions).toHaveLength(2);

      expect(result.resolutions[0].targetTitle).toBe('Existing Page');
      expect(result.resolutions[0].targetNode).toBeTruthy();
      expect(result.resolutions[0].needsPlaceholder).toBe(false);

      expect(result.resolutions[1].targetTitle).toBe('New Page');
      expect(result.resolutions[1].needsPlaceholder).toBe(true);

      expect(result.createdPlaceholders).toHaveLength(1);
      expect(result.createdPlaceholders[0].title).toBe('New Page');
      expect(result.createdPlaceholders[0].nodeDetails?.isPlaceholder).toBe(true);

      expect(result.createdAttributes).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle wiki-links when all targets exist', async () => {
      const spaceSlug = 'ws-integration-456';
      const sourceNodeId = 'node-source-2';
      const markdown = '[[Page A]] references [[Page B]].';

      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes', ({ params }) => {
          expect(params.spaceSlug).toBe(spaceSlug);

          return HttpResponse.json([
            {
              id: 'node-a',
              spaceId: spaceSlug,
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
              spaceId: spaceSlug,
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
        }),

        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', async ({ params, request }) => {
          expect(params.nodeId).toBe(sourceNodeId);

          const body = (await request.json()) as any;
          return HttpResponse.json(
            {
              id: 'attr-resolved',
              sourceNodeId: body.sourceNodeId,
              targetNodeId: body.targetNodeId,
              attributeType: body.attributeType,
              attributeKey: body.attributeKey,
              attributeValue: null,
              metadata: body.metadata ?? {},
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
        spaceSlug
      );

      expect(result.createdPlaceholders).toHaveLength(0);
      expect(result.createdAttributes).toHaveLength(2);
      expect(result.resolutions.every((r) => !r.needsPlaceholder)).toBe(true);
    });

    it('should handle errors during placeholder creation', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const spaceSlug = 'ws-error-test';
      const sourceNodeId = 'node-source-err';
      const markdown = '[[Valid Page]] and [[Invalid Page]].';

      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes', ({ params }) => {
          expect(params.spaceSlug).toBe(spaceSlug);
          return HttpResponse.json([]);
        })
      );

      let createCallCount = 0;
      server.use(
        http.post('http://localhost:3000/api/spaces/:spaceSlug/nodes', async ({ params, request }) => {
          expect(params.spaceSlug).toBe(spaceSlug);
          createCallCount++;

          const body = (await request.json()) as any;

          if (createCallCount === 1) {
            return HttpResponse.json(
              {
                id: 'node-valid',
                spaceId: spaceSlug,
                title: body.title,
                slug: body.title.toLowerCase().replace(/\s+/g, '-'),
                nodeType: body.nodeType,
                markdownContent: body.content ?? '',
                nodeDetails: body.nodeDetails,
                createdBy: 'user-1',
                createdAt: '2025-10-08T12:00:00Z',
                updatedAt: '2025-10-08T12:00:00Z',
                version: 1,
              },
              { status: 201 }
            );
          }

          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/validation',
              title: 'Validation Failed',
              status: 400,
              detail: 'Invalid node title',
            },
            { status: 400 }
          );
        }),

        // Allow relationship creation for the successfully created placeholder
        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', async ({ request }) => {
          const body = (await request.json()) as any;
          return HttpResponse.json(
            {
              id: 'attr-valid',
              sourceNodeId: body.sourceNodeId,
              targetNodeId: body.targetNodeId,
              attributeType: body.attributeType,
              attributeKey: body.attributeKey,
              attributeValue: body.attributeValue ?? null,
              metadata: body.metadata ?? {},
              createdBy: 'user-1',
              createdAt: '2025-10-08T12:10:00Z',
              updatedAt: '2025-10-08T12:10:00Z',
            },
            { status: 201 }
          );
        })
      );

      const result = await wikiLinkService.processWikiLinks(
        markdown,
        sourceNodeId,
        spaceSlug
      );

      expect(result.createdPlaceholders).toHaveLength(1);
      expect(result.createdPlaceholders[0].title).toBe('Valid Page');
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes('Invalid Page'))).toBe(true);
    });
  });

  describe('Node CRUD with Relationships', () => {
    it('should create node, add attributes, and retrieve them', async () => {
      const spaceSlug = 'ws-crud-test';

      server.use(
        http.post('http://localhost:3000/api/spaces/:spaceSlug/nodes', async ({ params, request }) => {
          expect(params.spaceSlug).toBe(spaceSlug);

          const body = (await request.json()) as any;
          return HttpResponse.json(
            {
              id: 'node-new-123',
              spaceId: spaceSlug,
              title: body.title,
              slug: body.title.toLowerCase().replace(/\s+/g, '-'),
              nodeType: body.nodeType,
              markdownContent: body.content ?? body.markdownContent ?? '',
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

      const newNode = await nodeService.createNode(
        spaceSlug,
        {
          title: 'New Node',
          nodeType: 'REGULAR',
          markdownContent: '# Content',
        } as any
      );

      expect(newNode.id).toBe('node-new-123');
      expect(newNode.title).toBe('New Node');

      server.use(
        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', async ({ params, request }) => {
          expect(params.nodeId).toBe('node-new-123');

          const body = (await request.json()) as any;
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

      const newAttr = await attributeService.createAttribute('node-new-123', {
        sourceNodeId: 'node-new-123',
        targetNodeId: 'other-node-456',
        attributeType: 'references',
        attributeKey: 'related-to',
        attributeValue: null,
      });

      expect(newAttr.id).toBe('attr-new-1');
      expect(newAttr.attributeType).toBe('references');

      server.use(
        http.get('http://localhost:3000/api/nodes/:nodeId/attributes', ({ params }) => {
          expect(params.nodeId).toBe('node-new-123');

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

      const attributes = await attributeService.getNodeAttributes('node-new-123');

      expect(attributes).toHaveLength(1);
      expect(attributes[0].id).toBe('attr-new-1');
    });

    it('should update node and maintain version consistency', async () => {
      const spaceSlug = 'ws-version-test';
      const nodeId = 'node-version-test';

      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', ({ params }) => {
          expect(params.spaceSlug).toBe(spaceSlug);
          expect(params.nodeId).toBe(nodeId);

          return HttpResponse.json({
            id: nodeId,
            spaceId: spaceSlug,
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
        }),

        http.put('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', async ({ params, request }) => {
          expect(params.spaceSlug).toBe(spaceSlug);
          expect(params.nodeId).toBe(nodeId);

          const body = (await request.json()) as any;
          return HttpResponse.json({
            id: nodeId,
            spaceId: spaceSlug,
            title: body.title,
            slug: body.title.toLowerCase().replace(/\s+/g, '-'),
            nodeType: body.nodeType,
            markdownContent: body.markdownContent ?? body.content ?? '',
            nodeDetails: {},
            createdBy: 'user-1',
            createdAt: '2025-10-08T10:00:00Z',
            updatedAt: '2025-10-08T12:00:00Z',
            version: 2,
          });
        })
      );

      const originalNode = await nodeService.getNode(spaceSlug, nodeId);
      expect(originalNode.version).toBe(1);

      const updatedNode = await nodeService.updateNode(
        spaceSlug,
        nodeId,
        {
          title: 'Updated Title',
          nodeType: 'REGULAR',
          markdownContent: '# Updated',
          version: 1,
        } as any
      );

      expect(updatedNode.version).toBe(2);
      expect(updatedNode.title).toBe('Updated Title');
    });
  });

  describe('Error Handling Across Services', () => {
    it('should propagate 404 errors from NodeService', async () => {
      const spaceSlug = 'nonexistent-space';

      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', ({ params }) => {
          expect(params.spaceSlug).toBe(spaceSlug);

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

      await expect(nodeService.getNode(spaceSlug, 'nonexistent')).rejects.toBeInstanceOf(ApiError);
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
      const result = await wikiLinkService.processWikiLinks('', 'node-1', 'ws-1');

      expect(result.resolutions).toHaveLength(0);
      expect(result.createdPlaceholders).toHaveLength(0);
      expect(result.createdAttributes).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle duplicate wiki-links correctly', async () => {
      const spaceSlug = 'ws-dup-test';
      const markdown = '[[Page A]] and [[Page A]] again.';

      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes', ({ params }) => {
          expect(params.spaceSlug).toBe(spaceSlug);

          return HttpResponse.json([
            {
              id: 'node-page-a',
              spaceId: spaceSlug,
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

      let attrCreateCount = 0;
      server.use(
        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', async ({ request }) => {
          attrCreateCount++;
          const body = (await request.json()) as any;

          return HttpResponse.json(
            {
              id: `attr-dup-${attrCreateCount}`,
              sourceNodeId: body.sourceNodeId,
              targetNodeId: body.targetNodeId,
              attributeType: body.attributeType,
              attributeKey: body.attributeKey,
              attributeValue: null,
              metadata: body.metadata ?? {},
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
        spaceSlug
      );

      expect(result.resolutions).toHaveLength(2);
      expect(result.createdAttributes).toHaveLength(2);
      expect(attrCreateCount).toBe(2);
    });
  });
});