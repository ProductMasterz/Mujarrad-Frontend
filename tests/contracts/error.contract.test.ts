import { describe, it, expect, beforeAll, afterEach, afterAll, jest } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { ApiError } from '@/lib/errors';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  jest.restoreAllMocks();
  window.history.pushState({}, '', '/');
  localStorage.clear();
});
afterAll(() => server.close());

describe('Error Response Contract Tests - RFC 7807', () => {
  const spaceSlug = 'test-space';

  describe('T015: Error responses follow RFC 7807 Problem Details', () => {
    it('should handle 404 Not Found with RFC 7807 format', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/not-found',
              title: 'Node Not Found',
              status: 404,
              detail: 'Node with ID nonexistent-123 does not exist',
            },
            { status: 404 }
          );
        })
      );

      await expect(nodeService.getNode(spaceSlug, 'nonexistent-123')).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Node Not Found',
        detail: 'Node with ID nonexistent-123 does not exist',
        statusCode: 404,
      });
    });

    it('should handle 400 Bad Request with validation errors', async () => {
      server.use(
        http.post('http://localhost:3000/api/spaces/:spaceSlug/nodes', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/validation',
              title: 'Validation Failed',
              status: 400,
              detail: 'Request validation failed',
              errors: {
                title: 'must not be blank',
                spaceId: 'is required',
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(
        nodeService.createNode(
          spaceSlug,
          {
            title: '',
            nodeType: 'REGULAR',
            markdownContent: '',
          } as any
        )
      ).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Validation Failed',
        detail: 'Request validation failed',
        statusCode: 400,
      });
    });

    it('should handle 409 Conflict (Version Conflict)', async () => {
      server.use(
        http.put('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/conflict',
              title: 'Version Conflict',
              status: 409,
              detail:
                'Node has been modified by another user. Current version: 5, provided version: 3',
            },
            { status: 409 }
          );
        })
      );

      await expect(
        nodeService.updateNode(
          spaceSlug,
          'node-123',
          {
            title: 'Updated',
            nodeType: 'REGULAR',
            version: 3,
          } as any
        )
      ).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Version Conflict',
        statusCode: 409,
      });

      try {
        await nodeService.updateNode(
          spaceSlug,
          'node-123',
          {
            title: 'Updated',
            nodeType: 'REGULAR',
            version: 3,
          } as any
        );
      } catch (error: any) {
        expect(error.detail).toContain('version');
      }
    });

    it('should handle 409 Conflict (Circular Dependency) with cycle path', async () => {
      server.use(
        http.post('http://localhost:3000/api/nodes/:nodeId/attributes', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/conflict',
              title: 'Circular Dependency',
              status: 409,
              detail: 'Creating this relationship would form a cycle',
              cyclePath: ['node-A', 'node-B', 'node-C', 'node-A'],
            },
            { status: 409 }
          );
        })
      );

      await expect(
        attributeService.createAttribute(
          'node-C',
          {
            sourceNodeId: 'node-C',
            targetNodeId: 'node-A',
            attributeType: 'contains',
            attributeKey: 'hierarchy',
          } as any
        )
      ).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Circular Dependency',
        statusCode: 409,
      });

      try {
        await attributeService.createAttribute(
          'node-C',
          {
            sourceNodeId: 'node-C',
            targetNodeId: 'node-A',
            attributeType: 'contains',
            attributeKey: 'hierarchy',
          } as any
        );
      } catch (error: any) {
        expect(error.detail).toContain('cycle');
      }
    });

    it('should handle 401 Unauthorized', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      window.history.pushState({}, '', '/login');

      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/unauthorized',
              title: 'Unauthorized',
              status: 401,
              detail: 'Authentication credentials are missing or invalid',
            },
            { status: 401 }
          );
        })
      );

      await expect(nodeService.getNode(spaceSlug, 'node-123')).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Unauthorized',
        detail: 'Authentication credentials are missing or invalid',
        statusCode: 401,
      });
    });

    it('should handle 403 Forbidden', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});

      server.use(
        http.delete('http://localhost:3000/api/nodes/:nodeId/attributes/:attrId', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/forbidden',
              title: 'Forbidden',
              status: 403,
              detail: 'You do not have permission to delete this attribute',
            },
            { status: 403 }
          );
        })
      );

      await expect(attributeService.deleteAttribute('node-123', 'attr-456')).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Forbidden',
        detail: 'You do not have permission to delete this attribute',
        statusCode: 403,
      });
    });

    it(
      'should handle 500 Internal Server Error',
      async () => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        server.use(
          http.post('http://localhost:3000/api/spaces/:spaceSlug/nodes', () => {
            return HttpResponse.json(
              {
                type: 'https://api.mujarrad.com/errors/internal',
                title: 'Internal Server Error',
                status: 500,
                detail: 'An unexpected error occurred while processing your request',
              },
              { status: 500 }
            );
          })
        );

        await expect(
          nodeService.createNode(
            spaceSlug,
            {
              title: 'Test',
              nodeType: 'REGULAR',
              markdownContent: '',
            } as any
          )
        ).rejects.toMatchObject({
          name: 'ApiError',
          message: 'Internal Server Error',
          detail: 'An unexpected error occurred while processing your request',
          statusCode: 500,
        });
      },
      12000
    );

    it('should verify all RFC 7807 required fields are present via ApiError payload', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes/:nodeId', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/not-found',
              title: 'Node Not Found',
              status: 404,
              detail: 'The requested node does not exist',
              instance: '/api/spaces/test-space/nodes/missing-123',
            },
            { status: 404 }
          );
        })
      );

      try {
        await nodeService.getNode(spaceSlug, 'missing-123');
        throw new Error('Expected error to be thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.name).toBe('ApiError');
        expect(error.message).toBe('Node Not Found');
        expect(error.detail).toBe('The requested node does not exist');
        expect(error.statusCode).toBe(404);
      }
    });
  });
});