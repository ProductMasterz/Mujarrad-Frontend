import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { nodeService } from '@/services/api/node.service';
import type { Node } from '@/types/entities';

// Mock server for contract testing
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Node API Contract Tests', () => {
  describe('T009: GET /api/nodes/:id returns valid Node schema', () => {
    it('should return a valid Node object with all required fields', async () => {
      server.use(
        http.get('http://localhost:3000/api/nodes/:id', () => {
          return HttpResponse.json({
            id: 'test-node-123',
            workspaceId: 'ws-789',
            title: 'Test Page',
            slug: 'test-page',
            nodeType: 'REGULAR',
            markdownContent: '# Test\n\nContent with [[Link]]',
            nodeDetails: {},
            createdBy: 'user-456',
            createdAt: '2025-10-07T10:00:00Z',
            updatedAt: '2025-10-07T15:30:00Z',
            version: 1,
          });
        })
      );

      const node = await nodeService.getNode('test-node-123');

      // Verify schema matches Node interface
      expect(node).toMatchObject({
        id: expect.any(String),
        workspaceId: expect.any(String),
        title: expect.any(String),
        slug: expect.any(String),
        nodeType: expect.stringMatching(/^(REGULAR|CONTEXT)$/),
        createdBy: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        version: expect.any(Number),
      });

      expect(node.id).toBe('test-node-123');
      expect(node.title).toBe('Test Page');
      expect(node.nodeType).toBe('REGULAR');
    });

    it('should handle CONTEXT node type', async () => {
      server.use(
        http.get('http://localhost:3000/api/nodes/:id', () => {
          return HttpResponse.json({
            id: 'folder-123',
            workspaceId: 'ws-789',
            title: 'My Folder',
            slug: 'my-folder',
            nodeType: 'CONTEXT',
            markdownContent: null,
            nodeDetails: {},
            createdBy: 'user-456',
            createdAt: '2025-10-07T10:00:00Z',
            updatedAt: '2025-10-07T10:00:00Z',
            version: 1,
          });
        })
      );

      const node = await nodeService.getNode('folder-123');

      expect(node.nodeType).toBe('CONTEXT');
      expect(node.markdownContent).toBeNull();
    });

    it('should handle 404 Not Found error', async () => {
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
  });

  describe('T010: GET /api/workspaces/:id/nodes returns Node[]', () => {
    it('should return an array of nodes', async () => {
      server.use(
        http.get('http://localhost:3000/api/workspaces/:workspaceId/nodes', () => {
          return HttpResponse.json([
            {
              id: 'node-1',
              workspaceId: 'ws-789',
              title: 'Root Folder',
              slug: 'root',
              nodeType: 'CONTEXT',
              markdownContent: null,
              nodeDetails: {},
              createdBy: 'user-456',
              createdAt: '2025-10-01T10:00:00Z',
              updatedAt: '2025-10-01T10:00:00Z',
              version: 1,
            },
            {
              id: 'node-2',
              workspaceId: 'ws-789',
              title: 'Page 1',
              slug: 'page-1',
              nodeType: 'REGULAR',
              markdownContent: 'Content with [[Page 2]]',
              nodeDetails: {},
              createdBy: 'user-456',
              createdAt: '2025-10-02T11:00:00Z',
              updatedAt: '2025-10-07T14:00:00Z',
              version: 2,
            },
          ]);
        })
      );

      const nodes = await nodeService.getWorkspaceNodes('ws-789');

      expect(Array.isArray(nodes)).toBe(true);
      expect(nodes).toHaveLength(2);
      expect(nodes[0].nodeType).toBe('CONTEXT');
      expect(nodes[1].nodeType).toBe('REGULAR');
    });

    it('should return empty array for workspace with no nodes', async () => {
      server.use(
        http.get('http://localhost:3000/api/workspaces/:workspaceId/nodes', () => {
          return HttpResponse.json([]);
        })
      );

      const nodes = await nodeService.getWorkspaceNodes('empty-ws');

      expect(Array.isArray(nodes)).toBe(true);
      expect(nodes).toHaveLength(0);
    });
  });

  describe('T011: POST /api/nodes creates node and returns 201', () => {
    it('should create a new node and return 201 Created', async () => {
      server.use(
        http.post('http://localhost:3000/api/nodes', async () => {
          return HttpResponse.json(
            {
              id: 'new-node-456',
              workspaceId: 'ws-789',
              title: 'New Page',
              slug: 'new-page',
              nodeType: 'REGULAR',
              markdownContent: '',
              nodeDetails: {},
              createdBy: 'user-456',
              createdAt: '2025-10-07T16:00:00Z',
              updatedAt: '2025-10-07T16:00:00Z',
              version: 1,
            },
            { status: 201 }
          );
        })
      );

      const node = await nodeService.createNode({
        title: 'New Page',
        workspaceId: 'ws-789',
        nodeType: 'REGULAR',
        markdownContent: '',
      });

      expect(node.id).toBe('new-node-456');
      expect(node.title).toBe('New Page');
      expect(node.version).toBe(1);
    });

    it('should handle validation error with 400 Bad Request', async () => {
      server.use(
        http.post('http://localhost:3000/api/nodes', () => {
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
        nodeService.createNode({
          title: '',
          workspaceId: 'ws-789',
          nodeType: 'REGULAR',
        })
      ).rejects.toThrow();
    });
  });

  describe('T012: PUT /api/nodes/:id updates node with version check', () => {
    it('should update node and return updated version', async () => {
      server.use(
        http.put('http://localhost:3000/api/nodes/:id', async () => {
          return HttpResponse.json({
            id: 'node-123',
            workspaceId: 'ws-789',
            title: 'Updated Page',
            slug: 'updated-page',
            nodeType: 'REGULAR',
            markdownContent: 'Updated content with [[New Link]]',
            nodeDetails: {},
            createdBy: 'user-456',
            createdAt: '2025-10-01T10:00:00Z',
            updatedAt: '2025-10-07T16:05:00Z',
            version: 4,
          });
        })
      );

      const node = await nodeService.updateNode('node-123', {
        title: 'Updated Page',
        nodeType: 'REGULAR',
        markdownContent: 'Updated content with [[New Link]]',
        version: 3,
      });

      expect(node.version).toBe(4);
      expect(node.title).toBe('Updated Page');
      expect(node.updatedAt).not.toBe(node.createdAt);
    });

    it('should handle version conflict with 409 Conflict', async () => {
      server.use(
        http.put('http://localhost:3000/api/nodes/:id', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/conflict',
              title: 'Version Conflict',
              status: 409,
              detail: 'Node has been modified by another user',
            },
            { status: 409 }
          );
        })
      );

      await expect(
        nodeService.updateNode('node-123', {
          title: 'Updated Page',
          nodeType: 'REGULAR',
          version: 2, // Stale version
        })
      ).rejects.toThrow();
    });
  });
});
