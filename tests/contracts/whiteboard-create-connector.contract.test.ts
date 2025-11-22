import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { WhiteboardConnector, CreateConnectorDTO } from '@/types/whiteboard';

// Mock server for contract testing
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Contract: POST /api/nodes/{id}/attributes (Whiteboard Connector)', () => {
  const sourceNodeId = 'wb-source-node';
  const targetNodeId = 'wb-target-node';
  const baseUrl = 'https://mujarrad.onrender.com';

  describe('T008: Create connectors between whiteboard elements', () => {
    it('should create connector with connects_to attribute', async () => {
      const createDTO: CreateConnectorDTO = {
        target_node_id: targetNodeId,
        attribute_key: 'connects_to',
        attribute_value: {
          excalidraw_element: {
            id: 'exc-arrow-1',
            type: 'arrow',
            x: 300,
            y: 150,
            width: 200,
            height: 50,
            angle: 0,
            strokeColor: '#000000',
            backgroundColor: 'transparent',
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
            points: [[0, 0], [200, 50]],
            startBinding: {
              elementId: 'exc-source',
              focus: 0,
              gap: 8,
            },
            endBinding: {
              elementId: 'exc-target',
              focus: 0,
              gap: 8,
            },
            startArrowhead: null,
            endArrowhead: 'arrow',
          },
          connector_meta: {
            source_element_id: 'exc-source',
            target_element_id: 'exc-target',
            bidirectional: false,
          },
        },
      };

      const mockResponse: WhiteboardConnector = {
        id: 'attr-connector-1',
        source_node_id: sourceNodeId,
        attribute_key: 'connects_to',
        attribute_value: createDTO.attribute_value,
      };

      server.use(
        http.post(`${baseUrl}/api/nodes/:nodeId/attributes`, async ({ params, request }) => {
          const body = await request.json() as CreateConnectorDTO;

          expect(params.nodeId).toBe(sourceNodeId);
          expect(body.attribute_key).toBe('connects_to');
          expect(body.target_node_id).toBe(targetNodeId);
          expect(body.attribute_value.excalidraw_element.type).toBe('arrow');

          return HttpResponse.json(mockResponse, { status: 201 });
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');
      const result = await whiteboardService.createConnector(sourceNodeId, createDTO);

      expect(result).toMatchObject({
        id: expect.any(String),
        source_node_id: sourceNodeId,
        attribute_key: 'connects_to',
        attribute_value: expect.objectContaining({
          excalidraw_element: expect.objectContaining({
            type: 'arrow',
            startBinding: expect.any(Object),
            endBinding: expect.any(Object),
          }),
          connector_meta: expect.objectContaining({
            source_element_id: expect.any(String),
            target_element_id: expect.any(String),
            bidirectional: expect.any(Boolean),
          }),
        }),
      });
    });

    it('should verify connector_meta structure', async () => {
      const createDTO: CreateConnectorDTO = {
        target_node_id: targetNodeId,
        attribute_key: 'connects_to',
        attribute_value: {
          excalidraw_element: {
            id: 'exc-arrow-2',
            type: 'arrow',
            x: 400,
            y: 200,
            width: 150,
            height: 100,
            angle: 0,
            strokeColor: '#0000ff',
            backgroundColor: 'transparent',
            fillStyle: 'solid',
            strokeWidth: 2,
            strokeStyle: 'dashed',
            roughness: 1,
            opacity: 100,
            groupIds: [],
            frameId: null,
            version: 1,
            versionNonce: 23456,
            isDeleted: false,
            boundElements: null,
            points: [[0, 0], [150, 100]],
            startBinding: {
              elementId: 'exc-source-2',
              focus: 0.5,
              gap: 10,
            },
            endBinding: {
              elementId: 'exc-target-2',
              focus: -0.5,
              gap: 10,
            },
            startArrowhead: 'arrow',
            endArrowhead: 'arrow',
          },
          connector_meta: {
            source_element_id: 'exc-source-2',
            target_element_id: 'exc-target-2',
            bidirectional: true,
            label: 'Related to',
          },
        },
      };

      const mockResponse: WhiteboardConnector = {
        id: 'attr-connector-2',
        source_node_id: sourceNodeId,
        attribute_key: 'connects_to',
        attribute_value: createDTO.attribute_value,
      };

      server.use(
        http.post(`${baseUrl}/api/nodes/:nodeId/attributes`, async ({ request }) => {
          const body = await request.json() as CreateConnectorDTO;

          // Verify connector_meta fields
          expect(body.attribute_value.connector_meta).toMatchObject({
            source_element_id: expect.any(String),
            target_element_id: expect.any(String),
            bidirectional: true,
            label: 'Related to',
          });

          return HttpResponse.json(mockResponse, { status: 201 });
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');
      const result = await whiteboardService.createConnector(sourceNodeId, createDTO);

      expect(result.attribute_value.connector_meta).toMatchObject({
        source_element_id: 'exc-source-2',
        target_element_id: 'exc-target-2',
        bidirectional: true,
        label: 'Related to',
      });
    });

    it('should create line connector (non-arrow)', async () => {
      const createDTO: CreateConnectorDTO = {
        target_node_id: targetNodeId,
        attribute_key: 'connects_to',
        attribute_value: {
          excalidraw_element: {
            id: 'exc-line-1',
            type: 'line',
            x: 200,
            y: 300,
            width: 300,
            height: 0,
            angle: 0,
            strokeColor: '#666666',
            backgroundColor: 'transparent',
            fillStyle: 'solid',
            strokeWidth: 1,
            strokeStyle: 'dotted',
            roughness: 1,
            opacity: 100,
            groupIds: [],
            frameId: null,
            version: 1,
            versionNonce: 34567,
            isDeleted: false,
            boundElements: null,
            points: [[0, 0], [300, 0]],
            startBinding: null,
            endBinding: null,
            startArrowhead: null,
            endArrowhead: null,
          },
          connector_meta: {
            source_element_id: 'exc-source-3',
            target_element_id: 'exc-target-3',
            bidirectional: false,
          },
        },
      };

      server.use(
        http.post(`${baseUrl}/api/nodes/:nodeId/attributes`, async () => {
          return HttpResponse.json(
            {
              id: 'attr-connector-3',
              source_node_id: sourceNodeId,
              attribute_key: 'connects_to',
              attribute_value: createDTO.attribute_value,
            },
            { status: 201 }
          );
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');
      const result = await whiteboardService.createConnector(sourceNodeId, createDTO);

      expect(result.attribute_value.excalidraw_element.type).toBe('line');
    });

    it('should handle invalid source node ID with 404', async () => {
      server.use(
        http.post(`${baseUrl}/api/nodes/:nodeId/attributes`, () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/not-found',
              title: 'Node Not Found',
              status: 404,
              detail: 'Source node with ID invalid-source does not exist',
            },
            { status: 404 }
          );
        })
      );

      const createDTO: CreateConnectorDTO = {
        target_node_id: targetNodeId,
        attribute_key: 'connects_to',
        attribute_value: {
          excalidraw_element: {} as any,
          connector_meta: {
            source_element_id: 'exc-invalid',
            target_element_id: 'exc-target',
            bidirectional: false,
          },
        },
      };

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      await expect(
        whiteboardService.createConnector('invalid-source', createDTO)
      ).rejects.toThrow();
    });

    it('should handle invalid target node ID with 400', async () => {
      server.use(
        http.post(`${baseUrl}/api/nodes/:nodeId/attributes`, () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/validation',
              title: 'Validation Failed',
              status: 400,
              detail: 'Target node does not exist',
              errors: {
                target_node_id: 'Target node with specified ID not found',
              },
            },
            { status: 400 }
          );
        })
      );

      const createDTO: CreateConnectorDTO = {
        target_node_id: 'invalid-target',
        attribute_key: 'connects_to',
        attribute_value: {
          excalidraw_element: {} as any,
          connector_meta: {
            source_element_id: 'exc-source',
            target_element_id: 'exc-invalid-target',
            bidirectional: false,
          },
        },
      };

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      await expect(
        whiteboardService.createConnector(sourceNodeId, createDTO)
      ).rejects.toThrow();
    });

    it('should handle missing connector_meta with 400', async () => {
      server.use(
        http.post(`${baseUrl}/api/nodes/:nodeId/attributes`, () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/validation',
              title: 'Validation Failed',
              status: 400,
              detail: 'Invalid connector structure',
              errors: {
                'attribute_value.connector_meta': 'must not be null',
              },
            },
            { status: 400 }
          );
        })
      );

      const invalidDTO = {
        target_node_id: targetNodeId,
        attribute_key: 'connects_to' as const,
        attribute_value: {
          excalidraw_element: {} as any,
          // Missing connector_meta
        } as any,
      };

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      await expect(
        whiteboardService.createConnector(sourceNodeId, invalidDTO)
      ).rejects.toThrow();
    });

    it('should handle self-referencing connector (same source and target)', async () => {
      const createDTO: CreateConnectorDTO = {
        target_node_id: sourceNodeId, // Same as source
        attribute_key: 'connects_to',
        attribute_value: {
          excalidraw_element: {
            id: 'exc-self-arrow',
            type: 'arrow',
            x: 100,
            y: 100,
            width: 50,
            height: 100,
            angle: 0,
            strokeColor: '#000000',
            backgroundColor: 'transparent',
            fillStyle: 'solid',
            strokeWidth: 1,
            strokeStyle: 'solid',
            roughness: 1,
            opacity: 100,
            groupIds: [],
            frameId: null,
            version: 1,
            versionNonce: 45678,
            isDeleted: false,
            boundElements: null,
            points: [[0, 0], [50, 50], [0, 100]],
            startBinding: {
              elementId: 'exc-self',
              focus: 0,
              gap: 8,
            },
            endBinding: {
              elementId: 'exc-self',
              focus: 0,
              gap: 8,
            },
            startArrowhead: null,
            endArrowhead: 'arrow',
          },
          connector_meta: {
            source_element_id: 'exc-self',
            target_element_id: 'exc-self',
            bidirectional: false,
          },
        },
      };

      server.use(
        http.post(`${baseUrl}/api/nodes/:nodeId/attributes`, async () => {
          return HttpResponse.json(
            {
              id: 'attr-self-connector',
              source_node_id: sourceNodeId,
              attribute_key: 'connects_to',
              attribute_value: createDTO.attribute_value,
            },
            { status: 201 }
          );
        })
      );

      const { whiteboardService } = await import('@/services/api/whiteboard.service');
      const result = await whiteboardService.createConnector(sourceNodeId, createDTO);

      expect(result.source_node_id).toBe(sourceNodeId);
      expect(result.attribute_value.connector_meta.source_element_id)
        .toBe(result.attribute_value.connector_meta.target_element_id);
    });

    it('should handle duplicate connector with 409 conflict', async () => {
      server.use(
        http.post(`${baseUrl}/api/nodes/:nodeId/attributes`, () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/conflict',
              title: 'Duplicate Connector',
              status: 409,
              detail: 'A connector between these elements already exists',
            },
            { status: 409 }
          );
        })
      );

      const createDTO: CreateConnectorDTO = {
        target_node_id: targetNodeId,
        attribute_key: 'connects_to',
        attribute_value: {
          excalidraw_element: {} as any,
          connector_meta: {
            source_element_id: 'exc-source',
            target_element_id: 'exc-target',
            bidirectional: false,
          },
        },
      };

      const { whiteboardService } = await import('@/services/api/whiteboard.service');

      await expect(
        whiteboardService.createConnector(sourceNodeId, createDTO)
      ).rejects.toThrow();
    });
  });
});
