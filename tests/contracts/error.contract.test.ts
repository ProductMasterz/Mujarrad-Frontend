import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';

// Mock server for contract testing
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Error Response Contract Tests - RFC 7807', () => {
  describe('T015: Error responses follow RFC 7807 Problem Details', () => {
    it('should handle 404 Not Found with RFC 7807 format', async () => {
      server.use(
        http.get('http://localhost:3000/api/nodes/:id', () => {
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

      try {
        await nodeService.getNode('nonexistent-123');
        fail('Expected error to be thrown');
      } catch (error: any) {
        // Verify error response includes RFC 7807 fields
        expect(error.response?.data).toMatchObject({
          type: expect.stringMatching(/^https?:\/\//),
          title: expect.any(String),
          status: 404,
          detail: expect.any(String),
        });
      }
    });

    it('should handle 400 Bad Request with validation errors', async () => {
      server.use(
        http.post('http://localhost:3000/api/nodes', () => {
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

      try {
        await nodeService.createNode({
          title: '',
          spaceId: '',
          nodeType: 'REGULAR',
        });
        fail('Expected error to be thrown');
      } catch (error: any) {
        const errorData = error.response?.data;

        expect(errorData).toMatchObject({
          type: expect.stringMatching(/^https?:\/\//),
          title: expect.any(String),
          status: 400,
          detail: expect.any(String),
        });

        // Verify field-level errors are included
        expect(errorData.errors).toBeDefined();
        expect(errorData.errors).toHaveProperty('title');
        expect(errorData.errors).toHaveProperty('spaceId');
      }
    });

    it('should handle 409 Conflict (Version Conflict)', async () => {
      server.use(
        http.put('http://localhost:3000/api/nodes/:id', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/conflict',
              title: 'Version Conflict',
              status: 409,
              detail: 'Node has been modified by another user. Current version: 5, provided version: 3',
            },
            { status: 409 }
          );
        })
      );

      try {
        await nodeService.updateNode('node-123', {
          title: 'Updated',
          nodeType: 'REGULAR',
          version: 3,
        });
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.response?.data).toMatchObject({
          type: expect.stringContaining('conflict'),
          title: 'Version Conflict',
          status: 409,
          detail: expect.stringContaining('version'),
        });
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

      try {
        await attributeService.createAttribute({
          sourceNodeId: 'node-C',
          targetNodeId: 'node-A',
          attributeType: 'contains',
          attributeKey: 'hierarchy',
        });
        fail('Expected error to be thrown');
      } catch (error: any) {
        const errorData = error.response?.data;

        expect(errorData).toMatchObject({
          type: expect.stringContaining('conflict'),
          title: 'Circular Dependency',
          status: 409,
          detail: expect.stringContaining('cycle'),
        });

        // Verify cycle path is included
        expect(errorData.cyclePath).toBeDefined();
        expect(Array.isArray(errorData.cyclePath)).toBe(true);
        expect(errorData.cyclePath.length).toBeGreaterThan(2);
        // First and last elements should be the same (cycle)
        expect(errorData.cyclePath[0]).toBe(errorData.cyclePath[errorData.cyclePath.length - 1]);
      }
    });

    it('should handle 401 Unauthorized', async () => {
      server.use(
        http.get('http://localhost:3000/api/nodes/:id', () => {
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

      try {
        await nodeService.getNode('node-123');
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.response?.data).toMatchObject({
          type: expect.stringContaining('unauthorized'),
          title: 'Unauthorized',
          status: 401,
          detail: expect.any(String),
        });
      }
    });

    it('should handle 403 Forbidden', async () => {
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

      try {
        await attributeService.deleteAttribute('node-123', 'attr-456');
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.response?.data).toMatchObject({
          type: expect.stringContaining('forbidden'),
          title: 'Forbidden',
          status: 403,
          detail: expect.any(String),
        });
      }
    });

    it('should handle 500 Internal Server Error', async () => {
      server.use(
        http.post('http://localhost:3000/api/nodes', () => {
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

      try {
        await nodeService.createNode({
          title: 'Test',
          spaceId: 'ws-123',
          nodeType: 'REGULAR',
        });
        fail('Expected error to be thrown');
      } catch (error: any) {
        expect(error.response?.data).toMatchObject({
          type: expect.stringMatching(/^https?:\/\//),
          title: expect.any(String),
          status: 500,
          detail: expect.any(String),
        });
      }
    });

    it('should verify all RFC 7807 required fields are present', async () => {
      server.use(
        http.get('http://localhost:3000/api/nodes/:id', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/not-found',
              title: 'Node Not Found',
              status: 404,
              detail: 'The requested node does not exist',
              instance: '/api/nodes/missing-123',
            },
            { status: 404 }
          );
        })
      );

      try {
        await nodeService.getNode('missing-123');
        fail('Expected error to be thrown');
      } catch (error: any) {
        const errorData = error.response?.data;

        // Required RFC 7807 fields
        expect(errorData).toHaveProperty('type');
        expect(errorData).toHaveProperty('title');
        expect(errorData).toHaveProperty('status');

        // Optional but recommended fields
        expect(errorData).toHaveProperty('detail');

        // Verify types
        expect(typeof errorData.type).toBe('string');
        expect(typeof errorData.title).toBe('string');
        expect(typeof errorData.status).toBe('number');
        expect(typeof errorData.detail).toBe('string');
      }
    });
  });
});
