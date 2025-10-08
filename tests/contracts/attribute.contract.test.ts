import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { attributeService } from '@/services/api/attribute.service';
import type { Attribute } from '@/types/entities';

// Mock server for contract testing
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Attribute API Contract Tests', () => {
  describe('T013: GET /api/nodes/:id/attributes returns Attribute[]', () => {
    it('should return an array of attributes with valid schema', async () => {
      server.use(
        http.get('http://localhost:3000/api/nodes/:nodeId/attributes', () => {
          return HttpResponse.json([
            {
              id: 'attr-1',
              sourceNodeId: 'node-123',
              targetNodeId: 'node-456',
              attributeType: 'references',
              attributeKey: 'wiki-link',
              attributeValue: null,
              metadata: {
                displayText: 'Another Page',
                targetTitle: 'Another Page',
                isPlaceholder: false,
              },
              createdBy: 'user-456',
              createdAt: '2025-10-07T15:00:00Z',
              updatedAt: '2025-10-07T15:00:00Z',
            },
            {
              id: 'attr-2',
              sourceNodeId: 'parent-ctx',
              targetNodeId: 'node-123',
              attributeType: 'contains',
              attributeKey: 'hierarchy',
              attributeValue: null,
              metadata: {},
              createdBy: 'user-456',
              createdAt: '2025-10-01T10:00:00Z',
              updatedAt: '2025-10-01T10:00:00Z',
            },
          ]);
        })
      );

      const attributes = await attributeService.getNodeAttributes('node-123');

      expect(Array.isArray(attributes)).toBe(true);
      expect(attributes).toHaveLength(2);

      // Verify first attribute (wiki-link reference)
      expect(attributes[0]).toMatchObject({
        id: expect.any(String),
        sourceNodeId: expect.any(String),
        targetNodeId: expect.any(String),
        attributeType: expect.stringMatching(/^(contains|references|depends_on|triggers|next|calls)$/),
        attributeKey: expect.any(String),
        createdBy: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      expect(attributes[0].attributeType).toBe('references');
      expect(attributes[0].attributeKey).toBe('wiki-link');
      expect(attributes[0].metadata?.displayText).toBe('Another Page');

      // Verify second attribute (hierarchy contains)
      expect(attributes[1].attributeType).toBe('contains');
      expect(attributes[1].attributeKey).toBe('hierarchy');
    });

    it('should return empty array for node with no attributes', async () => {
      server.use(
        http.get('http://localhost:3000/api/nodes/:nodeId/attributes', () => {
          return HttpResponse.json([]);
        })
      );

      const attributes = await attributeService.getNodeAttributes('isolated-node');

      expect(Array.isArray(attributes)).toBe(true);
      expect(attributes).toHaveLength(0);
    });

    it('should filter by attributeType query parameter', async () => {
      server.use(
        http.get('http://localhost:3000/api/nodes/:nodeId/attributes', ({ request }) => {
          const url = new URL(request.url);
          const type = url.searchParams.get('attributeType');

          if (type === 'references') {
            return HttpResponse.json([
              {
                id: 'attr-1',
                sourceNodeId: 'node-123',
                targetNodeId: 'node-456',
                attributeType: 'references',
                attributeKey: 'wiki-link',
                attributeValue: null,
                metadata: {
                  displayText: 'Link',
                  targetTitle: 'Target',
                  isPlaceholder: false,
                },
                createdBy: 'user-456',
                createdAt: '2025-10-07T15:00:00Z',
                updatedAt: '2025-10-07T15:00:00Z',
              },
            ]);
          }

          return HttpResponse.json([]);
        })
      );

      const attributes = await attributeService.getNodeAttributes('node-123', {
        attributeType: 'references',
      });

      expect(attributes).toHaveLength(1);
      expect(attributes[0].attributeType).toBe('references');
    });

    it('should handle wiki-link metadata correctly', async () => {
      server.use(
        http.get('http://localhost:3000/api/nodes/:nodeId/attributes', () => {
          return HttpResponse.json([
            {
              id: 'attr-wiki',
              sourceNodeId: 'node-123',
              targetNodeId: 'node-456',
              attributeType: 'references',
              attributeKey: 'wiki-link',
              attributeValue: null,
              metadata: {
                displayText: 'see this',
                targetTitle: 'Target Page',
                isPlaceholder: true,
              },
              createdBy: 'user-456',
              createdAt: '2025-10-07T15:00:00Z',
              updatedAt: '2025-10-07T15:00:00Z',
            },
          ]);
        })
      );

      const attributes = await attributeService.getNodeAttributes('node-123');

      expect(attributes[0].metadata).toHaveProperty('displayText', 'see this');
      expect(attributes[0].metadata).toHaveProperty('targetTitle', 'Target Page');
      expect(attributes[0].metadata).toHaveProperty('isPlaceholder', true);
    });
  });

  describe('T014: POST /api/nodes/:id/attributes creates relationship', () => {
    it('should create a wiki-link attribute and return 201 Created', async () => {
      server.use(
        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', async () => {
          return HttpResponse.json(
            {
              id: 'attr-new',
              sourceNodeId: 'node-123',
              targetNodeId: 'node-456',
              attributeType: 'references',
              attributeKey: 'wiki-link',
              attributeValue: null,
              metadata: {
                displayText: 'see this',
                targetTitle: 'Target Page',
                isPlaceholder: false,
              },
              createdBy: 'user-456',
              createdAt: '2025-10-07T16:10:00Z',
              updatedAt: '2025-10-07T16:10:00Z',
            },
            { status: 201 }
          );
        })
      );

      const attribute = await attributeService.createAttribute({
        sourceNodeId: 'node-123',
        targetNodeId: 'node-456',
        attributeType: 'references',
        attributeKey: 'wiki-link',
        metadata: {
          displayText: 'see this',
          targetTitle: 'Target Page',
          isPlaceholder: false,
        },
      });

      expect(attribute.id).toBe('attr-new');
      expect(attribute.attributeType).toBe('references');
      expect(attribute.attributeKey).toBe('wiki-link');
      expect(attribute.metadata?.displayText).toBe('see this');
    });

    it('should create a hierarchy contains attribute', async () => {
      server.use(
        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', async () => {
          return HttpResponse.json(
            {
              id: 'attr-hierarchy',
              sourceNodeId: 'parent-ctx',
              targetNodeId: 'child-node',
              attributeType: 'contains',
              attributeKey: 'hierarchy',
              attributeValue: null,
              metadata: {},
              createdBy: 'user-456',
              createdAt: '2025-10-07T16:15:00Z',
              updatedAt: '2025-10-07T16:15:00Z',
            },
            { status: 201 }
          );
        })
      );

      const attribute = await attributeService.createAttribute({
        sourceNodeId: 'parent-ctx',
        targetNodeId: 'child-node',
        attributeType: 'contains',
        attributeKey: 'hierarchy',
      });

      expect(attribute.attributeType).toBe('contains');
      expect(attribute.attributeKey).toBe('hierarchy');
    });

    it('should handle circular dependency error with 409 Conflict', async () => {
      server.use(
        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/conflict',
              title: 'Circular Dependency',
              status: 409,
              detail: 'Creating this relationship would form a cycle',
              cyclePath: ['parent-ctx', 'child-node', 'parent-ctx'],
            },
            { status: 409 }
          );
        })
      );

      await expect(
        attributeService.createAttribute({
          sourceNodeId: 'child-node',
          targetNodeId: 'parent-ctx',
          attributeType: 'contains',
          attributeKey: 'hierarchy',
        })
      ).rejects.toThrow();
    });

    it('should create placeholder page relationship', async () => {
      server.use(
        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', async () => {
          return HttpResponse.json(
            {
              id: 'attr-placeholder',
              sourceNodeId: 'node-123',
              targetNodeId: 'new-placeholder',
              attributeType: 'references',
              attributeKey: 'wiki-link',
              attributeValue: null,
              metadata: {
                displayText: 'Future Feature',
                targetTitle: 'Future Feature',
                isPlaceholder: true,
              },
              createdBy: 'user-456',
              createdAt: '2025-10-07T16:20:00Z',
              updatedAt: '2025-10-07T16:20:00Z',
            },
            { status: 201 }
          );
        })
      );

      const attribute = await attributeService.createAttribute({
        sourceNodeId: 'node-123',
        targetNodeId: 'new-placeholder',
        attributeType: 'references',
        attributeKey: 'wiki-link',
        metadata: {
          displayText: 'Future Feature',
          targetTitle: 'Future Feature',
          isPlaceholder: true,
        },
      });

      expect(attribute.metadata?.isPlaceholder).toBe(true);
    });
  });
});
