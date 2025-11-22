import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock server for contract testing
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Contract: DELETE /api/spaces/{slug}/nodes/{id} (Whiteboard)', () => {
  const testSpaceSlug = 'test-whiteboard-space';
  const testNodeId = 'wb-node-to-delete';
  const baseUrl = 'https://mujarrad.onrender.com';

  describe('T007: Delete whiteboard elements', () => {
    it('should delete whiteboard node and return 204 No Content', async () => {
      server.use(
        http.delete(`${baseUrl}/api/spaces/:slug/nodes/:nodeId`, ({ params }) => {
          expect(params.slug).toBe(testSpaceSlug);
          expect(params.nodeId).toBe(testNodeId);

          return new HttpResponse(null, { status: 204 });
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      await expect(
        whiteboardService.deleteWhiteboardNode(testSpaceSlug, testNodeId)
      ).resolves.toBeUndefined();
    });

    it('should verify element not returned after delete', async () => {
      let isDeleted = false;

      server.use(
        http.delete(`${baseUrl}/api/spaces/:slug/nodes/:nodeId`, () => {
          isDeleted = true;
          return new HttpResponse(null, { status: 204 });
        }),
        http.get(`${baseUrl}/api/spaces/:slug/nodes/:nodeId`, ({ params }) => {
          if (isDeleted && params.nodeId === testNodeId) {
            return HttpResponse.json(
              {
                type: 'https://api.mujarrad.com/errors/not-found',
                title: 'Node Not Found',
                status: 404,
                detail: `Whiteboard node with ID ${testNodeId} does not exist`,
              },
              { status: 404 }
            );
          }

          return HttpResponse.json({
            id: testNodeId,
            title: 'Rectangle 1',
            node_type: 'REGULAR',
            node_details: {
              element_subtype: 'shape_rectangle',
              excalidraw_element: {
                id: 'exc-1',
                type: 'rectangle',
                x: 100, y: 100, width: 200, height: 100, angle: 0,
                strokeColor: '#000', backgroundColor: '#fff',
                fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid',
                roughness: 1, opacity: 100, groupIds: [], frameId: null,
                version: 1, versionNonce: 1, isDeleted: false, boundElements: null,
              },
              whiteboard_meta: {
                space_slug: testSpaceSlug,
                created_at: '2025-10-07T10:00:00Z',
                last_modified: '2025-10-07T10:00:00Z',
                z_index: 0,
              },
            },
            created_at: '2025-10-07T10:00:00Z',
            updated_at: '2025-10-07T10:00:00Z',
            version: 1,
          });
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      // Delete the node
      await whiteboardService.deleteWhiteboardNode(testSpaceSlug, testNodeId);

      // Verify it's no longer retrievable
      await expect(
        whiteboardService.getWhiteboardNode(testSpaceSlug, testNodeId)
      ).rejects.toThrow();
    });

    it('should handle 404 when deleting non-existent node', async () => {
      server.use(
        http.delete(`${baseUrl}/api/spaces/:slug/nodes/:nodeId`, () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/not-found',
              title: 'Node Not Found',
              status: 404,
              detail: 'Whiteboard node with ID nonexistent does not exist',
            },
            { status: 404 }
          );
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      await expect(
        whiteboardService.deleteWhiteboardNode(testSpaceSlug, 'nonexistent')
      ).rejects.toThrow();
    });

    it('should handle deletion of different element subtypes', async () => {
      const elementIds = [
        'wb-rectangle-1',
        'wb-ellipse-1',
        'wb-text-1',
        'wb-drawing-1',
      ];

      server.use(
        http.delete(`${baseUrl}/api/spaces/:slug/nodes/:nodeId`, ({ params }) => {
          expect(elementIds).toContain(params.nodeId);
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      for (const elementId of elementIds) {
        await expect(
          whiteboardService.deleteWhiteboardNode(testSpaceSlug, elementId)
        ).resolves.toBeUndefined();
      }
    });

    it('should handle deletion with force parameter for elements with connections', async () => {
      server.use(
        http.delete(`${baseUrl}/api/spaces/:slug/nodes/:nodeId`, ({ request, params }) => {
          const url = new URL(request.url);
          const force = url.searchParams.get('force');

          expect(params.nodeId).toBe('wb-connected-node');
          expect(force).toBe('true');

          return new HttpResponse(null, { status: 204 });
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      await expect(
        whiteboardService.deleteWhiteboardNode(testSpaceSlug, 'wb-connected-node', true)
      ).resolves.toBeUndefined();
    });

    it('should handle 409 conflict when element has connections and force=false', async () => {
      server.use(
        http.delete(`${baseUrl}/api/spaces/:slug/nodes/:nodeId`, ({ request }) => {
          const url = new URL(request.url);
          const force = url.searchParams.get('force');

          if (force !== 'true') {
            return HttpResponse.json(
              {
                type: 'https://api.mujarrad.com/errors/conflict',
                title: 'Cannot Delete',
                status: 409,
                detail: 'Element has connections. Use force=true to delete element and its connections.',
              },
              { status: 409 }
            );
          }

          return new HttpResponse(null, { status: 204 });
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      await expect(
        whiteboardService.deleteWhiteboardNode(testSpaceSlug, 'wb-connected-node', false)
      ).rejects.toThrow();
    });

    it('should handle server errors gracefully', async () => {
      server.use(
        http.delete(`${baseUrl}/api/spaces/:slug/nodes/:nodeId`, () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/internal',
              title: 'Internal Server Error',
              status: 500,
              detail: 'An unexpected error occurred',
            },
            { status: 500 }
          );
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      await expect(
        whiteboardService.deleteWhiteboardNode(testSpaceSlug, testNodeId)
      ).rejects.toThrow();
    });
  });
});
