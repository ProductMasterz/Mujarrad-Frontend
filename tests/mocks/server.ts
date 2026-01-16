/**
 * MSW (Mock Service Worker) Server Configuration
 *
 * This file sets up the mock API server for testing purposes.
 * It intercepts HTTP requests and returns mock responses.
 */

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

/**
 * Mock API handlers
 * These handlers intercept API calls and return mock data
 */
export const handlers = [
  // ==================== SPACE ENDPOINTS ====================

  // GET /api/spaces - Get all spaces
  http.get('http://localhost:3000/api/spaces', () => {
    return HttpResponse.json([
      {
        id: 'space-uuid-123',
        name: 'Test Space',
        slug: 'test-space',
        ownerId: 'user-test-456',
        createdAt: '2025-10-07T10:00:00Z',
        updatedAt: '2025-10-07T10:00:00Z',
      },
      {
        id: 'space-uuid-456',
        name: 'Another Space',
        slug: 'another-space',
        ownerId: 'user-test-456',
        createdAt: '2025-10-07T11:00:00Z',
        updatedAt: '2025-10-07T11:00:00Z',
      },
    ]);
  }),

  // POST /api/spaces - Create a new space
  http.post('http://localhost:3000/api/spaces', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json(
      {
        id: 'new-space-uuid-789',
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        ownerId: 'user-test-456',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // GET /api/spaces/:id - Get space by ID
  http.get('http://localhost:3000/api/spaces/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      name: 'Test Space',
      slug: 'test-space',
      ownerId: 'user-test-456',
      createdAt: '2025-10-07T10:00:00Z',
      updatedAt: '2025-10-07T10:00:00Z',
    });
  }),

  // GET /api/spaces/slug/:slug - Get space by slug
  http.get('http://localhost:3000/api/spaces/slug/:slug', ({ params }) => {
    const { slug } = params;
    return HttpResponse.json({
      id: 'space-uuid-123',
      name: 'Test Space',
      slug,
      ownerId: 'user-test-456',
      createdAt: '2025-10-07T10:00:00Z',
      updatedAt: '2025-10-07T10:00:00Z',
    });
  }),

  // PUT /api/spaces/:id - Update a space
  http.put('http://localhost:3000/api/spaces/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    return HttpResponse.json({
      id,
      name: body.name || 'Updated Space',
      slug: body.slug || 'updated-space',
      ownerId: 'user-test-456',
      createdAt: '2025-10-07T10:00:00Z',
      updatedAt: new Date().toISOString(),
    });
  }),

  // DELETE /api/spaces/:id - Delete a space
  http.delete('http://localhost:3000/api/spaces/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ==================== NODE ENDPOINTS (SPACE-SCOPED) ====================

  // GET /api/spaces/:spaceSlug/nodes - Get all nodes in space
  http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes', ({ params }) => {
    const { spaceSlug } = params;
    return HttpResponse.json([
      {
        id: 'node-1',
        spaceId: 'space-uuid-123',
        title: 'Root Context',
        slug: 'root-context',
        nodeType: 'CONTEXT',
        content: '',
        nodeDetails: {},
        currentVersionId: 'version-1',
        createdBy: 'user-test-456',
        modifiedBy: 'user-test-456',
        createdAt: '2025-10-07T10:00:00Z',
        updatedAt: '2025-10-07T10:00:00Z',
      },
      {
        id: 'node-2',
        spaceId: 'space-uuid-123',
        title: 'Test Page',
        slug: 'test-page',
        nodeType: 'REGULAR',
        content: 'Content with [[Wiki Link]]',
        nodeDetails: {},
        currentVersionId: 'version-2',
        createdBy: 'user-test-456',
        modifiedBy: 'user-test-456',
        createdAt: '2025-10-07T10:00:00Z',
        updatedAt: '2025-10-07T10:00:00Z',
      },
    ]);
  }),

  // POST /api/spaces/:spaceSlug/nodes - Create a new node in space
  http.post('http://localhost:3000/api/spaces/:spaceSlug/nodes', async ({ params, request }) => {
    const { spaceSlug } = params;
    const body = await request.json() as any;
    return HttpResponse.json(
      {
        id: 'new-node-123',
        spaceId: 'space-uuid-123',
        title: body.title,
        slug: body.title.toLowerCase().replace(/\s+/g, '-'),
        nodeType: body.nodeType,
        content: body.content || '',
        nodeDetails: body.nodeDetails || {},
        currentVersionId: 'version-new',
        createdBy: 'user-test-456',
        modifiedBy: 'user-test-456',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // GET /api/spaces/:spaceSlug/nodes/:id - Get single node
  http.get('http://localhost:3000/api/spaces/:spaceSlug/nodes/:id', ({ params }) => {
    const { spaceSlug, id } = params;
    return HttpResponse.json({
      id,
      spaceId: 'space-uuid-123',
      title: 'Test Node',
      slug: 'test-node',
      nodeType: 'REGULAR',
      content: '# Test Content\n\nThis is a test with [[Another Page]] link.',
      nodeDetails: {},
      currentVersionId: 'version-1',
      createdBy: 'user-test-456',
      modifiedBy: 'user-test-456',
      createdAt: '2025-10-07T10:00:00Z',
      updatedAt: '2025-10-07T10:00:00Z',
    });
  }),

  // PUT /api/spaces/:spaceSlug/nodes/:id - Update a node
  http.put('http://localhost:3000/api/spaces/:spaceSlug/nodes/:id', async ({ params, request }) => {
    const { spaceSlug, id } = params;
    const body = await request.json() as any;
    return HttpResponse.json({
      id,
      spaceId: 'space-uuid-123',
      title: body.title,
      slug: body.title?.toLowerCase().replace(/\s+/g, '-') || 'updated-node',
      nodeType: body.nodeType || 'REGULAR',
      content: body.content || '',
      nodeDetails: body.nodeDetails || {},
      currentVersionId: 'version-updated',
      createdBy: 'user-test-456',
      modifiedBy: 'user-test-456',
      createdAt: '2025-10-07T10:00:00Z',
      updatedAt: new Date().toISOString(),
    });
  }),

  // DELETE /api/spaces/:spaceSlug/nodes/:id - Delete a node
  http.delete('http://localhost:3000/api/spaces/:spaceSlug/nodes/:id', ({ request }) => {
    const url = new URL(request.url);
    const force = url.searchParams.get('force');
    return new HttpResponse(null, { status: 200 });
  }),

  // GET /api/nodes/:id/attributes - Get node attributes
  http.get('http://localhost:3000/api/nodes/:id/attributes', () => {
    return HttpResponse.json([
      {
        id: 'attr-1',
        sourceNodeId: 'node-2',
        targetNodeId: 'node-3',
        attributeType: 'references',
        attributeKey: 'wiki-link',
        attributeValue: null,
        metadata: {
          displayText: 'Wiki Link',
          targetTitle: 'Wiki Link',
          isPlaceholder: false,
        },
        createdBy: 'user-test-456',
        createdAt: '2025-10-07T10:00:00Z',
        updatedAt: '2025-10-07T10:00:00Z',
      },
      {
        id: 'attr-2',
        sourceNodeId: 'node-1',
        targetNodeId: 'node-2',
        attributeType: 'contains',
        attributeKey: 'hierarchy',
        attributeValue: null,
        metadata: {},
        createdBy: 'user-test-456',
        createdAt: '2025-10-07T10:00:00Z',
        updatedAt: '2025-10-07T10:00:00Z',
      },
    ]);
  }),

  // POST /api/nodes/:id/attributes - Create attribute
  http.post('http://localhost:3000/api/nodes/:id/attributes', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    return HttpResponse.json(
      {
        id: 'new-attr-123',
        sourceNodeId: id,
        targetNodeId: body.targetNodeId,
        attributeType: body.attributeType,
        attributeKey: body.attributeKey,
        attributeValue: body.attributeValue || null,
        metadata: body.metadata || {},
        createdBy: 'user-test-456',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // DELETE /api/nodes/:id/attributes/:attrId - Delete attribute
  http.delete('http://localhost:3000/api/nodes/:id/attributes/:attrId', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ==================== SEARCH ENDPOINTS (SPACE-SCOPED) ====================

  // GET /api/spaces/:spaceSlug/search - Search nodes in space
  http.get('http://localhost:3000/api/spaces/:spaceSlug/search', ({ params, request }) => {
    const { spaceSlug } = params;
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    return HttpResponse.json([
      {
        id: 'search-result-1',
        title: `Result for ${query}`,
        slug: 'search-result-1',
        nodeType: 'REGULAR',
        excerpt: 'This is a search result excerpt...',
        score: 0.95,
      },
    ]);
  }),
];

// Setup the mock server
export const server = setupServer(...handlers);
