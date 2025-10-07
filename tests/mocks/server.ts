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
  // GET /api/nodes/:id - Retrieve a single node
  http.get('http://localhost:3000/api/nodes/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      workspaceId: 'ws-test-123',
      title: 'Test Node',
      slug: 'test-node',
      nodeType: 'REGULAR',
      markdownContent: '# Test Content\n\nThis is a test with [[Another Page]] link.',
      nodeDetails: {},
      createdBy: 'user-test-456',
      createdAt: '2025-10-07T10:00:00Z',
      updatedAt: '2025-10-07T10:00:00Z',
      version: 1,
    });
  }),

  // GET /api/workspaces/:workspaceId/nodes - Get all nodes in workspace
  http.get('http://localhost:3000/api/workspaces/:workspaceId/nodes', () => {
    return HttpResponse.json([
      {
        id: 'node-1',
        workspaceId: 'ws-test-123',
        title: 'Root Context',
        slug: 'root-context',
        nodeType: 'CONTEXT',
        markdownContent: null,
        createdBy: 'user-test-456',
        createdAt: '2025-10-07T10:00:00Z',
        updatedAt: '2025-10-07T10:00:00Z',
        version: 1,
      },
      {
        id: 'node-2',
        workspaceId: 'ws-test-123',
        title: 'Test Page',
        slug: 'test-page',
        nodeType: 'REGULAR',
        markdownContent: 'Content with [[Wiki Link]]',
        createdBy: 'user-test-456',
        createdAt: '2025-10-07T10:00:00Z',
        updatedAt: '2025-10-07T10:00:00Z',
        version: 1,
      },
    ]);
  }),

  // POST /api/nodes - Create a new node
  http.post('http://localhost:3000/api/nodes', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json(
      {
        id: 'new-node-123',
        workspaceId: body.workspaceId,
        title: body.title,
        slug: body.title.toLowerCase().replace(/\s+/g, '-'),
        nodeType: body.nodeType,
        markdownContent: body.markdownContent || '',
        nodeDetails: {},
        createdBy: 'user-test-456',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      },
      { status: 201 }
    );
  }),

  // PUT /api/nodes/:id - Update a node
  http.put('http://localhost:3000/api/nodes/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    return HttpResponse.json({
      id,
      workspaceId: 'ws-test-123',
      title: body.title,
      slug: body.title.toLowerCase().replace(/\s+/g, '-'),
      nodeType: body.nodeType,
      markdownContent: body.markdownContent,
      nodeDetails: {},
      createdBy: 'user-test-456',
      createdAt: '2025-10-07T10:00:00Z',
      updatedAt: new Date().toISOString(),
      version: body.version + 1,
    });
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

  // GET /api/workspaces/:workspaceId/search - Search nodes
  http.get('http://localhost:3000/api/workspaces/:workspaceId/search', ({ request }) => {
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
