import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { spaceService } from '@/services/api/space.service';
import type { Space } from '@/types/backend-dtos';

// Mock server for contract testing
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Space API Contract Tests', () => {
  describe('T002: GET /api/spaces returns valid Space[] schema', () => {
    it('should return an array of Space objects with all required fields', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces', () => {
          return HttpResponse.json([
            {
              id: 'space-uuid-123',
              name: 'Test Space',
              slug: 'test-space',
              ownerId: 'user-uuid-456',
              createdAt: '2025-10-07T10:00:00Z',
              updatedAt: '2025-10-07T10:00:00Z',
            },
            {
              id: 'space-uuid-789',
              name: 'Another Space',
              slug: 'another-space',
              ownerId: 'user-uuid-456',
              createdAt: '2025-10-08T11:00:00Z',
              updatedAt: '2025-10-08T11:00:00Z',
            },
          ]);
        })
      );

      const spaces = await spaceService.getSpaces();

      // Verify array response
      expect(Array.isArray(spaces)).toBe(true);
      expect(spaces).toHaveLength(2);

      // Verify first space matches schema
      expect(spaces[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        slug: expect.any(String),
        ownerId: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      expect(spaces[0].id).toBe('space-uuid-123');
      expect(spaces[0].name).toBe('Test Space');
      expect(spaces[0].slug).toBe('test-space');
    });

    it('should return empty array when user has no spaces', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces', () => {
          return HttpResponse.json([]);
        })
      );

      const spaces = await spaceService.getSpaces();

      expect(Array.isArray(spaces)).toBe(true);
      expect(spaces).toHaveLength(0);
    });

    it('should handle 401 Unauthorized error', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/unauthorized',
              title: 'Unauthorized',
              status: 401,
              detail: 'Authentication required',
            },
            { status: 401 }
          );
        })
      );

      await expect(spaceService.getSpaces()).rejects.toThrow();
    });
  });

  describe('T003: POST /api/spaces creates space and returns 201', () => {
    it('should create a space with name only and auto-generate slug', async () => {
      server.use(
        http.post('http://localhost:3000/api/spaces', async ({ request }) => {
          const body = await request.json() as any;
          return HttpResponse.json(
            {
              id: 'new-space-uuid-999',
              name: body.name,
              slug: body.name.toLowerCase().replace(/\s+/g, '-'),
              ownerId: 'user-uuid-456',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { status: 201 }
          );
        })
      );

      const space = await spaceService.createSpace({ name: 'My New Space' });

      expect(space.id).toBe('new-space-uuid-999');
      expect(space.name).toBe('My New Space');
      expect(space.slug).toBe('my-new-space');
    });

    it('should create a space with explicit slug', async () => {
      server.use(
        http.post('http://localhost:3000/api/spaces', async ({ request }) => {
          const body = await request.json() as any;
          return HttpResponse.json(
            {
              id: 'new-space-uuid-888',
              name: body.name,
              slug: body.slug,
              ownerId: 'user-uuid-456',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { status: 201 }
          );
        })
      );

      const space = await spaceService.createSpace({
        name: 'Custom Space',
        slug: 'custom-slug',
      });

      expect(space.slug).toBe('custom-slug');
      expect(space.name).toBe('Custom Space');
    });

    it('should handle validation error with 400 Bad Request', async () => {
      server.use(
        http.post('http://localhost:3000/api/spaces', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/validation',
              title: 'Validation Failed',
              status: 400,
              detail: 'Space name is required',
              errors: {
                name: 'must not be blank',
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(spaceService.createSpace({ name: '' })).rejects.toThrow();
    });

    it('should handle duplicate slug with 409 Conflict', async () => {
      server.use(
        http.post('http://localhost:3000/api/spaces', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/conflict',
              title: 'Slug Already Exists',
              status: 409,
              detail: 'A space with slug "existing-space" already exists',
            },
            { status: 409 }
          );
        })
      );

      await expect(
        spaceService.createSpace({ name: 'Test', slug: 'existing-space' })
      ).rejects.toThrow();
    });
  });

  describe('T004: GET /api/spaces/{id} and GET /api/spaces/slug/{slug}', () => {
    it('should get space by ID and return valid Space object', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces/:id', ({ params }) => {
          const { id } = params;
          return HttpResponse.json({
            id,
            name: 'Test Space',
            slug: 'test-space',
            ownerId: 'user-uuid-456',
            createdAt: '2025-10-07T10:00:00Z',
            updatedAt: '2025-10-07T15:30:00Z',
          });
        })
      );

      const space = await spaceService.getSpace('space-uuid-123');

      expect(space).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        slug: expect.any(String),
        ownerId: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      expect(space.id).toBe('space-uuid-123');
      expect(space.name).toBe('Test Space');
    });

    it('should get space by slug and return valid Space object', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces/slug/:slug', ({ params }) => {
          const { slug } = params;
          return HttpResponse.json({
            id: 'space-uuid-found',
            name: 'Test Space',
            slug,
            ownerId: 'user-uuid-456',
            createdAt: '2025-10-07T10:00:00Z',
            updatedAt: '2025-10-07T15:30:00Z',
          });
        })
      );

      const space = await spaceService.getSpaceBySlug('test-space');

      expect(space.slug).toBe('test-space');
      expect(space.name).toBe('Test Space');
      expect(space.id).toBe('space-uuid-found');
    });

    it('should return same data for ID and slug lookups', async () => {
      const mockSpace = {
        id: 'space-uuid-123',
        name: 'Consistent Space',
        slug: 'consistent-space',
        ownerId: 'user-uuid-456',
        createdAt: '2025-10-07T10:00:00Z',
        updatedAt: '2025-10-07T10:00:00Z',
      };

      server.use(
        http.get('http://localhost:3000/api/spaces/:id', () => {
          return HttpResponse.json(mockSpace);
        }),
        http.get('http://localhost:3000/api/spaces/slug/:slug', () => {
          return HttpResponse.json(mockSpace);
        })
      );

      const spaceById = await spaceService.getSpace('space-uuid-123');
      const spaceBySlug = await spaceService.getSpaceBySlug('consistent-space');

      expect(spaceById).toEqual(spaceBySlug);
    });

    it('should handle 404 Not Found for non-existent space ID', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces/:id', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/not-found',
              title: 'Space Not Found',
              status: 404,
              detail: 'Space with ID nonexistent does not exist',
            },
            { status: 404 }
          );
        })
      );

      await expect(spaceService.getSpace('nonexistent')).rejects.toThrow();
    });

    it('should handle 404 Not Found for non-existent slug', async () => {
      server.use(
        http.get('http://localhost:3000/api/spaces/slug/:slug', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/not-found',
              title: 'Space Not Found',
              status: 404,
              detail: 'Space with slug nonexistent-slug does not exist',
            },
            { status: 404 }
          );
        })
      );

      await expect(spaceService.getSpaceBySlug('nonexistent-slug')).rejects.toThrow();
    });
  });

  describe('T004 Extended: PUT /api/spaces/{id} and DELETE /api/spaces/{id}', () => {
    it('should update space name and return updated space', async () => {
      server.use(
        http.put('http://localhost:3000/api/spaces/:id', async ({ params, request }) => {
          const { id } = params;
          const body = await request.json() as any;
          return HttpResponse.json({
            id,
            name: body.name,
            slug: 'test-space',
            ownerId: 'user-uuid-456',
            createdAt: '2025-10-07T10:00:00Z',
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const space = await spaceService.updateSpace('space-uuid-123', {
        name: 'Updated Space Name',
      });

      expect(space.name).toBe('Updated Space Name');
      expect(space.updatedAt).not.toBe(space.createdAt);
    });

    it('should update space slug and return updated space', async () => {
      server.use(
        http.put('http://localhost:3000/api/spaces/:id', async ({ params, request }) => {
          const { id } = params;
          const body = await request.json() as any;
          return HttpResponse.json({
            id,
            name: 'Test Space',
            slug: body.slug,
            ownerId: 'user-uuid-456',
            createdAt: '2025-10-07T10:00:00Z',
            updatedAt: new Date().toISOString(),
          });
        })
      );

      const space = await spaceService.updateSpace('space-uuid-123', {
        slug: 'new-slug',
      });

      expect(space.slug).toBe('new-slug');
    });

    it('should delete space and return 204 No Content', async () => {
      server.use(
        http.delete('http://localhost:3000/api/spaces/:id', () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(spaceService.deleteSpace('space-uuid-123')).resolves.toBeUndefined();
    });

    it('should handle 404 when deleting non-existent space', async () => {
      server.use(
        http.delete('http://localhost:3000/api/spaces/:id', () => {
          return HttpResponse.json(
            {
              type: 'https://api.mujarrad.com/errors/not-found',
              title: 'Space Not Found',
              status: 404,
              detail: 'Cannot delete space that does not exist',
            },
            { status: 404 }
          );
        })
      );

      await expect(spaceService.deleteSpace('nonexistent')).rejects.toThrow();
    });
  });
});
