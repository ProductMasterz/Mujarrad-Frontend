import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { WhiteboardNode, CreateWhiteboardNodeDTO } from '@/types/whiteboard';

// Mock server for contract testing
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Contract: POST /api/spaces/{slug}/nodes (Whiteboard)', () => {
  const testSpaceSlug = 'test-whiteboard-space';
  const baseUrl = 'https://mujarrad.onrender.com';

  describe('T005: Create whiteboard elements as nodes', () => {
    it('should create a rectangle element and return WhiteboardNode', async () => {
      const createDTO: CreateWhiteboardNodeDTO = {
        title: 'Rectangle 1',
        node_type: 'REGULAR',
        node_details: {
          element_subtype: 'shape_rectangle',
          excalidraw_element: {
            id: 'exc-new-1',
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
      };

      const mockResponse: WhiteboardNode = {
        id: 'wb-node-created',
        title: 'Rectangle 1',
        node_type: 'REGULAR',
        node_details: createDTO.node_details,
        created_at: '2025-10-07T10:00:00Z',
        updated_at: '2025-10-07T10:00:00Z',
        version: 1,
      };

      server.use(
        http.post(`${baseUrl}/api/spaces/:slug/nodes`, async ({ params, request }) => {
          const body = await request.json() as CreateWhiteboardNodeDTO;

          expect(params.slug).toBe(testSpaceSlug);
          expect(body.title).toBe('Rectangle 1');
          expect(body.node_type).toBe('REGULAR');
          expect(body.node_details.element_subtype).toBe('shape_rectangle');
          expect(body.node_details.excalidraw_element.type).toBe('rectangle');

          return HttpResponse.json(mockResponse, { status: 201 });
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');
      const result = await whiteboardService.createWhiteboardNode(testSpaceSlug, createDTO);

      expect(result).toMatchObject({
        id: expect.any(String),
        title: 'Rectangle 1',
        node_type: 'REGULAR',
        node_details: expect.objectContaining({
          element_subtype: 'shape_rectangle',
          excalidraw_element: expect.objectContaining({
            type: 'rectangle',
            x: 100,
            y: 100,
            width: 200,
            height: 100,
          }),
        }),
        version: 1,
      });
    });

    it('should create a text element and return WhiteboardNode', async () => {
      const createDTO: CreateWhiteboardNodeDTO = {
        title: 'Hello World',
        node_type: 'REGULAR',
        content: 'Hello World',
        node_details: {
          element_subtype: 'text',
          excalidraw_element: {
            id: 'exc-text-new',
            type: 'text',
            x: 200,
            y: 200,
            width: 150,
            height: 50,
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
            version: 1,
            versionNonce: 54321,
            isDeleted: false,
            boundElements: null,
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
      };

      const mockResponse: WhiteboardNode = {
        id: 'wb-text-created',
        title: 'Hello World',
        content: 'Hello World',
        node_type: 'REGULAR',
        node_details: createDTO.node_details,
        created_at: '2025-10-07T10:00:00Z',
        updated_at: '2025-10-07T10:00:00Z',
        version: 1,
      };

      server.use(
        http.post(`${baseUrl}/api/spaces/:slug/nodes`, async ({ request }) => {
          const body = await request.json() as CreateWhiteboardNodeDTO;

          expect(body.node_details.element_subtype).toBe('text');
          expect(body.node_details.excalidraw_element.text).toBe('Hello World');

          return HttpResponse.json(mockResponse, { status: 201 });
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');
      const result = await whiteboardService.createWhiteboardNode(testSpaceSlug, createDTO);

      expect(result.node_details.element_subtype).toBe('text');
      expect(result.node_details.excalidraw_element.text).toBe('Hello World');
      expect(result.content).toBe('Hello World');
    });

    it('should return proper node_details structure', async () => {
      const createDTO: CreateWhiteboardNodeDTO = {
        title: 'Ellipse',
        node_type: 'REGULAR',
        node_details: {
          element_subtype: 'shape_ellipse',
          excalidraw_element: {
            id: 'exc-ellipse-1',
            type: 'ellipse',
            x: 300,
            y: 300,
            width: 100,
            height: 100,
            angle: 0,
            strokeColor: '#ff0000',
            backgroundColor: '#ffeeee',
            fillStyle: 'hachure',
            strokeWidth: 2,
            strokeStyle: 'dashed',
            roughness: 2,
            opacity: 80,
            groupIds: ['group-1'],
            frameId: null,
            version: 1,
            versionNonce: 11111,
            isDeleted: false,
            boundElements: null,
          },
          whiteboard_meta: {
            space_slug: testSpaceSlug,
            created_at: '2025-10-07T10:00:00Z',
            last_modified: '2025-10-07T10:00:00Z',
            z_index: 2,
          },
        },
      };

      server.use(
        http.post(`${baseUrl}/api/spaces/:slug/nodes`, async () => {
          return HttpResponse.json(
            {
              id: 'wb-ellipse-created',
              title: 'Ellipse',
              node_type: 'REGULAR',
              node_details: createDTO.node_details,
              created_at: '2025-10-07T10:00:00Z',
              updated_at: '2025-10-07T10:00:00Z',
              version: 1,
            },
            { status: 201 }
          );
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');
      const result = await whiteboardService.createWhiteboardNode(testSpaceSlug, createDTO);

      // Verify complete node_details structure
      expect(result.node_details).toMatchObject({
        element_subtype: 'shape_ellipse',
        excalidraw_element: {
          id: expect.any(String),
          type: 'ellipse',
          x: expect.any(Number),
          y: expect.any(Number),
          width: expect.any(Number),
          height: expect.any(Number),
          angle: expect.any(Number),
          strokeColor: expect.any(String),
          backgroundColor: expect.any(String),
          fillStyle: expect.stringMatching(/^(hachure|cross-hatch|solid)$/),
          strokeWidth: expect.any(Number),
          strokeStyle: expect.stringMatching(/^(solid|dashed|dotted)$/),
          roughness: expect.any(Number),
          opacity: expect.any(Number),
          groupIds: expect.any(Array),
          version: expect.any(Number),
          versionNonce: expect.any(Number),
          isDeleted: expect.any(Boolean),
        },
        whiteboard_meta: {
          space_slug: expect.any(String),
          created_at: expect.any(String),
          last_modified: expect.any(String),
          z_index: expect.any(Number),
        },
      });
    });

    it('should handle validation errors with 400 Bad Request', async () => {
      server.use(
        http.post(`${baseUrl}/api/spaces/:slug/nodes`, async () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/validation',
              title: 'Validation Failed',
              status: 400,
              detail: 'Invalid element_subtype',
              errors: {
                'node_details.element_subtype': 'must be a valid whiteboard element subtype',
              },
            },
            { status: 400 }
          );
        })
      );

      const invalidDTO = {
        title: 'Invalid',
        node_type: 'REGULAR' as const,
        node_details: {
          element_subtype: 'invalid_type' as any,
          excalidraw_element: {} as any,
          whiteboard_meta: {} as any,
        },
      };

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      await expect(
        whiteboardService.createWhiteboardNode(testSpaceSlug, invalidDTO)
      ).rejects.toThrow();
    });

    it('should handle missing required fields with 400 Bad Request', async () => {
      server.use(
        http.post(`${baseUrl}/api/spaces/:slug/nodes`, async () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/validation',
              title: 'Validation Failed',
              status: 400,
              detail: 'Missing required fields',
              errors: {
                'title': 'must not be blank',
                'node_details.excalidraw_element.x': 'must not be null',
                'node_details.excalidraw_element.y': 'must not be null',
              },
            },
            { status: 400 }
          );
        })
      );

      const incompleteDTO = {
        title: '',
        node_type: 'REGULAR' as const,
        node_details: {
          element_subtype: 'shape_rectangle' as const,
          excalidraw_element: {} as any,
          whiteboard_meta: {} as any,
        },
      };

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      await expect(
        whiteboardService.createWhiteboardNode(testSpaceSlug, incompleteDTO)
      ).rejects.toThrow();
    });
  });
});
