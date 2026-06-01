import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { nodeService } from '@/services/api/node.service';
import type { Node } from '@/types/backend-dtos';

// Mock server for contract testing
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Node API Contract Tests (Space-Scoped)', () => {
  const testSpaceSlug = 'test-space';

  describe('T005: GET /api/spaces/{spaceSlug}/nodes returns Node[] schema', () => {
    it('should return an array of nodes with all required fields', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes', () => {
          return HttpResponse.json([
            {
              id: 'node-1',
              spaceId: 'space-uuid-123',
              title: 'Root Context',
              slug: 'root-context',
              nodeType: 'CONTEXT',
              content: '',
              nodeDetails: {},
              currentVersionId: 'version-1',
              createdBy: 'user-456',
              modifiedBy: 'user-456',
              createdAt: '2025-10-01T10:00:00Z',
              updatedAt: '2025-10-01T10:00:00Z',
            },
            {
              id: 'node-2',
              spaceId: 'space-uuid-123',
              title: 'Page 1',
              slug: 'page-1',
              nodeType: 'REGULAR',
              content: 'Content with [[Page 2]]',
              nodeDetails: {},
              currentVersionId: 'version-2',
              createdBy: 'user-456',
              modifiedBy: 'user-456',
              createdAt: '2025-10-02T11:00:00Z',
              updatedAt: '2025-10-07T14:00:00Z',
            },
          ]);
        })
      );

      const nodes = await nodeService.getNodes(testSpaceSlug);

      // Verify array response
      expect(Array.isArray(nodes)).toBe(true);
      expect(nodes).toHaveLength(2);

      // Verify first node schema
      expect(nodes[0]).toMatchObject({
        id: expect.any(String),
        spaceId: expect.any(String),
        title: expect.any(String),
        slug: expect.any(String),
        nodeType: expect.stringMatching(/^(REGULAR|CONTEXT|ATTRIBUTE|TEMPLATE)$/),
        content: expect.any(String),
        nodeDetails: expect.any(Object),
        currentVersionId: expect.any(String),
        createdBy: expect.any(String),
        modifiedBy: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      expect(nodes[0].nodeType).toBe('CONTEXT');
      expect(nodes[1].nodeType).toBe('REGULAR');
    });

    it('should return empty array for space with no nodes', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes', () => {
          return HttpResponse.json([]);
        })
      );

      const nodes = await nodeService.getNodes('empty-space');

      expect(Array.isArray(nodes)).toBe(true);
      expect(nodes).toHaveLength(0);
    });

    it('should require spaceSlug parameter in path', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes', ({ params }) => {
          const { spaceSlug } = params;
          expect(spaceSlug).toBeDefined();
          expect(typeof spaceSlug).toBe('string');
          return HttpResponse.json([]);
        })
      );

      await nodeService.getNodes(testSpaceSlug);
    });

    it('should handle 404 for non-existent space', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/not-found',
              title: 'Space Not Found',
              status: 404,
              detail: 'Space with slug nonexistent-space does not exist',
            },
            { status: 404 }
          );
        })
      );

      await expect(nodeService.getNodes('nonexistent-space')).rejects.toThrow();
    });
  });

  describe('T005: POST /api/spaces/{spaceSlug}/nodes creates node', () => {
    it('should create a new node with spaceSlug and return 201 Created', async () => {
      server.use(
        http.post('http://localhost:3000/api/spaces/:spaceSlug/nodes', async ({ params, request }) => {
          const { spaceSlug } = params;
          const body = await request.json() as any;

          expect(spaceSlug).toBeDefined();

          return HttpResponse.json(
            {
              id: 'new-node-456',
              spaceId: 'space-uuid-123',
              title: body.title,
              slug: body.title.toLowerCase().replace(/\s+/g, '-'),
              nodeType: body.nodeType,
              content: body.content || '',
              nodeDetails: body.nodeDetails || {},
              currentVersionId: 'version-new',
              createdBy: 'user-456',
              modifiedBy: 'user-456',
              createdAt: '2025-10-07T16:00:00Z',
              updatedAt: '2025-10-07T16:00:00Z',
            },
            { status: 201 }
          );
        })
      );

      const node = await nodeService.createNode(testSpaceSlug, {
        title: 'New Page',
        nodeType: 'REGULAR',
        content: '',
      });

      expect(node.id).toBe('new-node-456');
      expect(node.title).toBe('New Page');
      expect(node.spaceId).toBe('space-uuid-123');
    });

    it('should handle validation error with 400 Bad Request', async () => {
      server.use(
        http.post('http://localhost:3000/api/spaces/:spaceSlug/nodes', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/validation',
              title: 'Validation Failed',
              status: 400,
              detail: 'Title is required',
              errors: {
                title: 'must not be blank',
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(
        nodeService.createNode(testSpaceSlug, {
          title: '',
          nodeType: 'REGULAR',
        })
      ).rejects.toThrow();
    });
  });

  describe('T006: GET /api/spaces/{spaceSlug}/nodes/{nodeId} returns single node', () => {
    it('should return a valid Node object with both spaceSlug and nodeId', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', ({ params }) => {
          const { spaceSlug, nodeId } = params;

          expect(spaceSlug).toBeDefined();
          expect(nodeId).toBeDefined();

          return HttpResponse.json({
            id: nodeId,
            spaceId: 'space-uuid-123',
            title: 'Test Page',
            slug: 'test-page',
            nodeType: 'REGULAR',
            content: '# Test\n\nContent with [[Link]]',
            nodeDetails: {},
            currentVersionId: 'version-1',
            createdBy: 'user-456',
            modifiedBy: 'user-456',
            createdAt: '2025-10-07T10:00:00Z',
            updatedAt: '2025-10-07T15:30:00Z',
          });
        })
      );

      const node = await nodeService.getNode(testSpaceSlug, 'test-node-123');

      expect(node).toMatchObject({
        id: expect.any(String),
        spaceId: expect.any(String),
        title: expect.any(String),
        slug: expect.any(String),
        nodeType: expect.stringMatching(/^(REGULAR|CONTEXT|ATTRIBUTE|TEMPLATE)$/),
        createdBy: expect.any(String),
        modifiedBy: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      expect(node.id).toBe('test-node-123');
      expect(node.title).toBe('Test Page');
      expect(node.nodeType).toBe('REGULAR');
    });

    it('should handle CONTEXT node type', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', () => {
          return HttpResponse.json({
            id: 'folder-123',
            spaceId: 'space-uuid-123',
            title: 'My Folder',
            slug: 'my-folder',
            nodeType: 'CONTEXT',
            content: '',
            nodeDetails: {},
            currentVersionId: 'version-1',
            createdBy: 'user-456',
            modifiedBy: 'user-456',
            createdAt: '2025-10-07T10:00:00Z',
            updatedAt: '2025-10-07T10:00:00Z',
          });
        })
      );

      const node = await nodeService.getNode(testSpaceSlug, 'folder-123');

      expect(node.nodeType).toBe('CONTEXT');
      expect(node.content).toBe('');
    });

    it('should handle 404 Not Found error', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', () => {
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

      await expect(nodeService.getNode(testSpaceSlug, 'nonexistent')).rejects.toThrow();
    });
  });

  describe('T006: PUT /api/spaces/{spaceSlug}/nodes/{nodeId} updates node', () => {
    it('should update node and return updated version', async () => {
      server.use(
        http.put('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', async ({ params, request }) => {
          const { spaceSlug, nodeId } = params;
          const body = await request.json() as any;

          expect(spaceSlug).toBeDefined();
          expect(nodeId).toBeDefined();

          return HttpResponse.json({
            id: nodeId,
            spaceId: 'space-uuid-123',
            title: body.title,
            slug: body.title.toLowerCase().replace(/\s+/g, '-'),
            nodeType: body.nodeType || 'REGULAR',
            content: body.content,
            nodeDetails: body.nodeDetails || {},
            currentVersionId: 'version-updated',
            createdBy: 'user-456',
            modifiedBy: 'user-456',
            createdAt: '2025-10-01T10:00:00Z',
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const node = await nodeService.updateNode(testSpaceSlug, 'node-123', {
        title: 'Updated Page',
        content: 'Updated content with [[New Link]]',
      });

      expect(node.title).toBe('Updated Page');
      expect(node.updatedAt).not.toBe(node.createdAt);
    });

    it('should handle validation error with 400 Bad Request', async () => {
      server.use(
        http.put('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/validation',
              title: 'Validation Failed',
              status: 400,
              detail: 'Title cannot be empty',
            },
            { status: 400 }
          );
        })
      );

      await expect(
        nodeService.updateNode(testSpaceSlug, 'node-123', {
          title: '',
        })
      ).rejects.toThrow();
    });
  });

  describe('T006: DELETE /api/spaces/{spaceSlug}/nodes/{nodeId} with force parameter', () => {
    it('should delete node and return 200', async () => {
      server.use(
        http.delete('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', ({ params, request }) => {
          const { spaceSlug, nodeId } = params;
          const url = new URL(request.url);
          const force = url.searchParams.get('force');

          expect(spaceSlug).toBeDefined();
          expect(nodeId).toBeDefined();

          return new HttpResponse(null, { status: 200 });
        })
      );

      await expect(nodeService.deleteNode(testSpaceSlug, 'node-123')).resolves.toBeUndefined();
    });

    it('should handle force=true parameter', async () => {
      server.use(
        http.delete('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', ({ request }) => {
          const url = new URL(request.url);
          const force = url.searchParams.get('force');

          expect(force).toBe('true');

          return new HttpResponse(null, { status: 200 });
        })
      );

      await nodeService.deleteNode(testSpaceSlug, 'node-123', true);
    });

    it('should handle 404 when deleting non-existent node', async () => {
      server.use(
        http.delete('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/not-found',
              title: 'Node Not Found',
              status: 404,
              detail: 'Cannot delete node that does not exist',
            },
            { status: 404 }
          );
        })
      );

      await expect(nodeService.deleteNode(testSpaceSlug, 'nonexistent')).rejects.toThrow();
    });
  });
});
