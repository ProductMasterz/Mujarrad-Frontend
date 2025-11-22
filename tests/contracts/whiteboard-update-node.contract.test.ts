import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { WhiteboardNode, UpdateWhiteboardNodeDTO } from '@/types/whiteboard';

// Mock server for contract testing
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Contract: PUT /api/spaces/{slug}/nodes/{id} (Whiteboard)', () => {
  const testSpaceSlug = 'test-whiteboard-space';
  const testNodeId = 'wb-node-123';
  const baseUrl = 'https://mujarrad.onrender.com';

  describe('T006: Update whiteboard node position and properties', () => {
    it('should update node position and return updated WhiteboardNode', async () => {
      const updateDTO: UpdateWhiteboardNodeDTO = {
        id: testNodeId,
        node_details: {
          element_subtype: 'shape_rectangle',
          excalidraw_element: {
            id: 'exc-1',
            type: 'rectangle',
            x: 500, // Updated position
            y: 400, // Updated position
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
            version: 2,
            versionNonce: 23456,
            isDeleted: false,
            boundElements: null,
          },
          whiteboard_meta: {
            space_slug: testSpaceSlug,
            created_at: '2025-10-07T10:00:00Z',
            last_modified: '2025-10-07T12:00:00Z',
            z_index: 0,
          },
        },
      };

      const mockResponse: WhiteboardNode = {
        id: testNodeId,
        title: 'Rectangle 1',
        node_type: 'REGULAR',
        node_details: updateDTO.node_details,
        created_at: '2025-10-07T10:00:00Z',
        updated_at: '2025-10-07T12:00:00Z',
        version: 2, // Incremented version
      };

      server.use(
        http.put(`${baseUrl}/api/spaces/:slug/nodes/:nodeId`, async ({ params, request }) => {
          const body = await request.json() as UpdateWhiteboardNodeDTO;

          expect(params.slug).toBe(testSpaceSlug);
          expect(params.nodeId).toBe(testNodeId);
          expect(body.node_details.excalidraw_element.x).toBe(500);
          expect(body.node_details.excalidraw_element.y).toBe(400);

          return HttpResponse.json(mockResponse);
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');
      const result = await whiteboardService.updateWhiteboardNode(testSpaceSlug, testNodeId, updateDTO);

      expect(result.node_details.excalidraw_element.x).toBe(500);
      expect(result.node_details.excalidraw_element.y).toBe(400);
      expect(result.version).toBe(2);
    });

    it('should update node style/color properties', async () => {
      const updateDTO: UpdateWhiteboardNodeDTO = {
        id: testNodeId,
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
            strokeColor: '#ff0000', // Updated color
            backgroundColor: '#ffeeee', // Updated background
            fillStyle: 'hachure', // Updated fill style
            strokeWidth: 2, // Updated stroke width
            strokeStyle: 'dashed', // Updated stroke style
            roughness: 2,
            opacity: 90,
            groupIds: [],
            frameId: null,
            version: 2,
            versionNonce: 34567,
            isDeleted: false,
            boundElements: null,
          },
          whiteboard_meta: {
            space_slug: testSpaceSlug,
            created_at: '2025-10-07T10:00:00Z',
            last_modified: '2025-10-07T13:00:00Z',
            z_index: 0,
          },
        },
      };

      const mockResponse: WhiteboardNode = {
        id: testNodeId,
        title: 'Rectangle 1',
        node_type: 'REGULAR',
        node_details: updateDTO.node_details,
        created_at: '2025-10-07T10:00:00Z',
        updated_at: '2025-10-07T13:00:00Z',
        version: 2,
      };

      server.use(
        http.put(`${baseUrl}/api/spaces/:slug/nodes/:nodeId`, async ({ request }) => {
          const body = await request.json() as UpdateWhiteboardNodeDTO;

          expect(body.node_details.excalidraw_element.strokeColor).toBe('#ff0000');
          expect(body.node_details.excalidraw_element.backgroundColor).toBe('#ffeeee');
          expect(body.node_details.excalidraw_element.fillStyle).toBe('hachure');

          return HttpResponse.json(mockResponse);
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');
      const result = await whiteboardService.updateWhiteboardNode(testSpaceSlug, testNodeId, updateDTO);

      expect(result.node_details.excalidraw_element.strokeColor).toBe('#ff0000');
      expect(result.node_details.excalidraw_element.backgroundColor).toBe('#ffeeee');
      expect(result.node_details.excalidraw_element.fillStyle).toBe('hachure');
      expect(result.node_details.excalidraw_element.strokeStyle).toBe('dashed');
    });

    it('should verify version increment on update', async () => {
      const updateDTO: UpdateWhiteboardNodeDTO = {
        id: testNodeId,
        title: 'Updated Title',
        node_details: {
          element_subtype: 'shape_rectangle',
          excalidraw_element: {
            id: 'exc-1',
            type: 'rectangle',
            x: 100,
            y: 100,
            width: 250, // Updated dimension
            height: 150, // Updated dimension
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
            version: 3, // Element version incremented
            versionNonce: 45678,
            isDeleted: false,
            boundElements: null,
          },
          whiteboard_meta: {
            space_slug: testSpaceSlug,
            created_at: '2025-10-07T10:00:00Z',
            last_modified: '2025-10-07T14:00:00Z',
            z_index: 0,
          },
        },
      };

      server.use(
        http.put(`${baseUrl}/api/spaces/:slug/nodes/:nodeId`, async () => {
          return HttpResponse.json({
            id: testNodeId,
            title: 'Updated Title',
            node_type: 'REGULAR',
            node_details: updateDTO.node_details,
            created_at: '2025-10-07T10:00:00Z',
            updated_at: '2025-10-07T14:00:00Z',
            version: 3, // Node version incremented
          });
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');
      const result = await whiteboardService.updateWhiteboardNode(testSpaceSlug, testNodeId, updateDTO);

      expect(result.version).toBe(3);
      expect(result.node_details.excalidraw_element.version).toBe(3);
      expect(result.updated_at).not.toBe(result.created_at);
    });

    it('should update text element content', async () => {
      const updateDTO: UpdateWhiteboardNodeDTO = {
        id: 'wb-text-123',
        title: 'Updated Text',
        content: 'Updated Text Content',
        node_details: {
          element_subtype: 'text',
          excalidraw_element: {
            id: 'exc-text-1',
            type: 'text',
            x: 200,
            y: 200,
            width: 200,
            height: 60,
            angle: 0,
            strokeColor: '#000000',
            backgroundColor: 'transparent',
            fillStyle: 'solid',
            strokeWidth: 1,
            strokeStyle: 'solid',
            roughness: 0,
            opacity: 100,
            groupIds: [],
            frameId: null,
            version: 2,
            versionNonce: 56789,
            isDeleted: false,
            boundElements: null,
            text: 'Updated Text Content',
            fontSize: 24,
            fontFamily: 1,
            textAlign: 'center',
            verticalAlign: 'middle',
          },
          whiteboard_meta: {
            space_slug: testSpaceSlug,
            created_at: '2025-10-07T10:00:00Z',
            last_modified: '2025-10-07T15:00:00Z',
            z_index: 1,
          },
        },
      };

      server.use(
        http.put(`${baseUrl}/api/spaces/:slug/nodes/:nodeId`, async ({ request }) => {
          const body = await request.json() as UpdateWhiteboardNodeDTO;

          expect(body.node_details.excalidraw_element.text).toBe('Updated Text Content');

          return HttpResponse.json({
            id: 'wb-text-123',
            title: 'Updated Text',
            content: 'Updated Text Content',
            node_type: 'REGULAR',
            node_details: updateDTO.node_details,
            created_at: '2025-10-07T10:00:00Z',
            updated_at: '2025-10-07T15:00:00Z',
            version: 2,
          });
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');
      const result = await whiteboardService.updateWhiteboardNode(testSpaceSlug, 'wb-text-123', updateDTO);

      expect(result.node_details.excalidraw_element.text).toBe('Updated Text Content');
      expect(result.content).toBe('Updated Text Content');
    });

    it('should handle 404 for non-existent node', async () => {
      server.use(
        http.put(`${baseUrl}/api/spaces/:slug/nodes/:nodeId`, async () => {
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

      const updateDTO: UpdateWhiteboardNodeDTO = {
        id: 'nonexistent',
        node_details: {
          element_subtype: 'shape_rectangle',
          excalidraw_element: {} as any,
          whiteboard_meta: {} as any,
        },
      };

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      await expect(
        whiteboardService.updateWhiteboardNode(testSpaceSlug, 'nonexistent', updateDTO)
      ).rejects.toThrow();
    });

    it('should handle optimistic locking conflict with 409', async () => {
      server.use(
        http.put(`${baseUrl}/api/spaces/:slug/nodes/:nodeId`, async () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/conflict',
              title: 'Version Conflict',
              status: 409,
              detail: 'Node has been modified by another user. Please refresh and try again.',
            },
            { status: 409 }
          );
        })
      );

      const updateDTO: UpdateWhiteboardNodeDTO = {
        id: testNodeId,
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
      };

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      await expect(
        whiteboardService.updateWhiteboardNode(testSpaceSlug, testNodeId, updateDTO)
      ).rejects.toThrow();
    });
  });
});
