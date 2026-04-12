import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { WhiteboardNodesResponse } from '@/types/whiteboard';
const server = setupServer();

const baseUrl = 'http://localhost:3000';

const registerCommonHandlers = () => {
  server.use(
    http.options(`${baseUrl}/api/spaces/:slug/nodes`, () => {
      return new HttpResponse(null, { status: 200 });
    }),
    http.options(`${baseUrl}/api/spaces/:slug/nodes*`, () => {
      return new HttpResponse(null, { status: 200 });
    })
  );
};

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  registerCommonHandlers();
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Contract: GET /api/spaces/{slug}/nodes (Whiteboard)', () => {
  const testSpaceSlug = 'test-whiteboard-space';
  //const baseUrl = 'https://mujarrad.onrender.com';
  describe('T004: Filter whiteboard nodes by element_subtype', () => {
    it('should return whiteboard nodes filtered by element_subtype', async () => {
      const mockResponse: WhiteboardNodesResponse = {
        content: [
          {
            id: 'wb-node-1',
            title: 'Rectangle 1',
            node_type: 'REGULAR',
            node_details: {
              element_subtype: 'shape_rectangle',
              excalidraw_element: {
                id: 'exc-1',
                type: 'rectangle',
                x: 100,
                y: 100,
                width: 200,
                height: 100,
                angle: 0,
                strokeColor: '#000000',
                backgroundColor: '#ffffff',
                fillStyle: 'solid',
                strokeWidth: 1,
                strokeStyle: 'solid',
                roughness: 1,
                opacity: 100,
                groupIds: [],
                frameId: null,
                version: 1,
                versionNonce: 12345,
                isDeleted: false,
                boundElements: null,
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
          },
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 20,
      };

      server.use(
        http.get(`${baseUrl}/api/spaces/:slug/nodes*`, async ({ request, params }) => {
          const url = new URL(request.url);
          const elementSubtype = url.searchParams.get('element_subtype');

          expect(params.slug).toBe(testSpaceSlug);
          expect(elementSubtype).toBeDefined();

          return HttpResponse.json(mockResponse);
        })
      );

      // This will fail until whiteboardService is implemented
      const { whiteboardService } = await import('@/services/api/whiteboard.service');
      const response = await whiteboardService.getWhiteboardNodes(testSpaceSlug, {
        element_subtype: 'shape_rectangle',
      });

      expect(response.content).toHaveLength(1);
      expect(response.content[0]).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        node_type: expect.stringMatching(/^(REGULAR|CONTEXT|TEMPLATE|ASSUMPTION)$/),
        node_details: expect.objectContaining({
          element_subtype: 'shape_rectangle',
          excalidraw_element: expect.objectContaining({
            id: expect.any(String),
            type: 'rectangle',
            x: expect.any(Number),
            y: expect.any(Number),
            width: expect.any(Number),
            height: expect.any(Number),
          }),
          whiteboard_meta: expect.objectContaining({
            space_slug: testSpaceSlug,
            z_index: expect.any(Number),
          }),
        }),
        version: expect.any(Number),
      });
    });

    it('should return empty array for new space with no whiteboard elements', async () => {
      const mockResponse: WhiteboardNodesResponse = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 20,
      };

      server.use(
        http.get(`${baseUrl}/api/spaces/:slug/nodes*`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');
      const response = await whiteboardService.getWhiteboardNodes('empty-space');

      expect(response.content).toHaveLength(0);
      expect(response.totalElements).toBe(0);
    });

    it('should return multiple element subtypes when filtering', async () => {
      const mockResponse: WhiteboardNodesResponse = {
        content: [
          {
            id: 'wb-rect-1',
            title: 'Rectangle',
            node_type: 'REGULAR',
            node_details: {
              element_subtype: 'shape_rectangle',
              excalidraw_element: {
                id: 'exc-rect-1',
                type: 'rectangle',
                x: 0, y: 0, width: 100, height: 100, angle: 0,
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
          },
          {
            id: 'wb-text-1',
            title: 'Text Element',
            node_type: 'REGULAR',
            node_details: {
              element_subtype: 'text',
              excalidraw_element: {
                id: 'exc-text-1',
                type: 'text',
                x: 200, y: 200, width: 150, height: 50, angle: 0,
                strokeColor: '#000', backgroundColor: 'transparent',
                fillStyle: 'solid', strokeWidth: 1, strokeStyle: 'solid',
                roughness: 0, opacity: 100, groupIds: [], frameId: null,
                version: 1, versionNonce: 2, isDeleted: false, boundElements: null,
                text: 'Hello World',
                fontSize: 20,
                fontFamily: 1,
                textAlign: 'left',
                verticalAlign: 'top',
              },
              whiteboard_meta: {
                space_slug: testSpaceSlug,
                created_at: '2025-10-07T10:00:00Z',
                last_modified: '2025-10-07T10:00:00Z',
                z_index: 1,
              },
            },
            created_at: '2025-10-07T10:00:00Z',
            updated_at: '2025-10-07T10:00:00Z',
            version: 1,
          },
        ],
        totalElements: 2,
        totalPages: 1,
        number: 0,
        size: 20,
      };

      server.use(
        http.get(`${baseUrl}/api/spaces/:slug/nodes*`,() => {
          return HttpResponse.json(mockResponse);
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');
      const response = await whiteboardService.getWhiteboardNodes(testSpaceSlug);

      expect(response.content).toHaveLength(2);
      expect(response.content[0].node_details.element_subtype).toBe('shape_rectangle');
      expect(response.content[1].node_details.element_subtype).toBe('text');
    });

    it('should handle 404 for non-existent space', async () => {
      server.use(
        http.get(`${baseUrl}/api/spaces/:slug/nodes*`, () => {
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

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      await expect(
        whiteboardService.getWhiteboardNodes('nonexistent-space')
      ).rejects.toThrow();
    });
  });
});
