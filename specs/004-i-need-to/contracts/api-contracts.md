# API Contracts: Obsidian-like Features

**Feature**: 004-i-need-to
**Date**: 2025-10-07
**Backend Base**: http://localhost:3000/api

## Overview

This document defines the API contracts for hierarchy navigation, markdown rendering, and wiki-link management. All endpoints are existing backend APIs - **no new backend endpoints required**. The frontend will use existing node and attribute endpoints.

---

## Authentication

All endpoints require JWT Bearer token authentication.

```
Authorization: Bearer {token}
```

Tokens stored in localStorage as `auth_token` and retrieved via `useAuthStore`.

---

## 1. Node Endpoints (Existing)

### GET /api/nodes/{id}

Retrieve a single node with its content.

**Request:**
```http
GET /api/nodes/abc-123 HTTP/1.1
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": "abc-123",
  "spaceId": "ws-789",
  "title": "My Page",
  "slug": "my-page",
  "nodeType": "REGULAR",
  "markdownContent": "# Hello World\n\nSee [[Another Page]] for more info.",
  "nodeDetails": {},
  "createdBy": "user-456",
  "createdAt": "2025-10-01T10:00:00Z",
  "updatedAt": "2025-10-07T15:30:00Z",
  "version": 3
}
```

**Response 404:**
```json
{
  "type": "https://api.mujarrad.com/errors/not-found",
  "title": "Node Not Found",
  "status": 404,
  "detail": "Node with ID abc-123 does not exist"
}
```

---

### GET /api/spaces/{spaceId}/nodes

Retrieve all nodes in a space (for hierarchy and graph).

**Request:**
```http
GET /api/spaces/ws-789/nodes HTTP/1.1
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: number (default: 0)
- `size`: number (default: 1000) - Use large size to get all nodes
- `nodeType`: "REGULAR" | "CONTEXT" (optional filter)

**Response 200:**
```json
[
  {
    "id": "node-1",
    "spaceId": "ws-789",
    "title": "Root Folder",
    "slug": "root",
    "nodeType": "CONTEXT",
    "markdownContent": null,
    "createdBy": "user-456",
    "createdAt": "2025-10-01T10:00:00Z",
    "updatedAt": "2025-10-01T10:00:00Z",
    "version": 1
  },
  {
    "id": "node-2",
    "spaceId": "ws-789",
    "title": "Page 1",
    "slug": "page-1",
    "nodeType": "REGULAR",
    "markdownContent": "Content here with [[Page 2]] link",
    "createdBy": "user-456",
    "createdAt": "2025-10-02T11:00:00Z",
    "updatedAt": "2025-10-07T14:00:00Z",
    "version": 2
  }
]
```

---

### POST /api/nodes

Create a new node (used for placeholder page creation).

**Request:**
```http
POST /api/nodes HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New Page",
  "spaceId": "ws-789",
  "nodeType": "REGULAR",
  "markdownContent": ""
}
```

**Response 201:**
```json
{
  "id": "node-new",
  "spaceId": "ws-789",
  "title": "New Page",
  "slug": "new-page",
  "nodeType": "REGULAR",
  "markdownContent": "",
  "createdBy": "user-456",
  "createdAt": "2025-10-07T16:00:00Z",
  "updatedAt": "2025-10-07T16:00:00Z",
  "version": 1
}
```

**Response 400 (Validation Error):**
```json
{
  "type": "https://api.mujarrad.com/errors/validation",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Title is required",
  "errors": {
    "title": "must not be blank"
  }
}
```

---

### PUT /api/nodes/{id}

Update an existing node (used when editing markdown content).

**Request:**
```http
PUT /api/nodes/abc-123 HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "My Page",
  "nodeType": "REGULAR",
  "markdownContent": "Updated content with [[New Link]]",
  "version": 3
}
```

**Response 200:**
```json
{
  "id": "abc-123",
  "spaceId": "ws-789",
  "title": "My Page",
  "slug": "my-page",
  "nodeType": "REGULAR",
  "markdownContent": "Updated content with [[New Link]]",
  "createdBy": "user-456",
  "createdAt": "2025-10-01T10:00:00Z",
  "updatedAt": "2025-10-07T16:05:00Z",
  "version": 4
}
```

**Response 409 (Optimistic Lock):**
```json
{
  "type": "https://api.mujarrad.com/errors/conflict",
  "title": "Version Conflict",
  "status": 409,
  "detail": "Node has been modified by another user"
}
```

---

## 2. Attribute Endpoints (Existing)

### GET /api/nodes/{id}/attributes

Retrieve all relationships for a node.

**Request:**
```http
GET /api/nodes/abc-123/attributes HTTP/1.1
Authorization: Bearer {token}
```

**Query Parameters:**
- `attributeType`: "contains" | "references" | "depends_on" | etc. (optional filter)

**Response 200:**
```json
[
  {
    "id": "attr-1",
    "sourceNodeId": "abc-123",
    "targetNodeId": "def-456",
    "attributeType": "references",
    "attributeKey": "wiki-link",
    "attributeValue": null,
    "metadata": {
      "displayText": "Another Page",
      "targetTitle": "Another Page",
      "isPlaceholder": false
    },
    "createdBy": "user-456",
    "createdAt": "2025-10-07T15:00:00Z",
    "updatedAt": "2025-10-07T15:00:00Z"
  },
  {
    "id": "attr-2",
    "sourceNodeId": "parent-ctx",
    "targetNodeId": "abc-123",
    "attributeType": "contains",
    "attributeKey": "hierarchy",
    "attributeValue": null,
    "metadata": {},
    "createdBy": "user-456",
    "createdAt": "2025-10-01T10:00:00Z",
    "updatedAt": "2025-10-01T10:00:00Z"
  }
]
```

---

### POST /api/nodes/{id}/attributes

Create a new relationship (used for wiki-links and hierarchy).

**Request (Wiki-link):**
```http
POST /api/nodes/abc-123/attributes HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json

{
  "targetNodeId": "def-456",
  "attributeType": "references",
  "attributeKey": "wiki-link",
  "metadata": {
    "displayText": "see this",
    "targetTitle": "Target Page",
    "isPlaceholder": false
  }
}
```

**Request (Hierarchy):**
```http
POST /api/nodes/parent-ctx/attributes HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json

{
  "targetNodeId": "child-node",
  "attributeType": "contains",
  "attributeKey": "hierarchy"
}
```

**Response 201:**
```json
{
  "id": "attr-new",
  "sourceNodeId": "abc-123",
  "targetNodeId": "def-456",
  "attributeType": "references",
  "attributeKey": "wiki-link",
  "attributeValue": null,
  "metadata": {
    "displayText": "see this",
    "targetTitle": "Target Page",
    "isPlaceholder": false
  },
  "createdBy": "user-456",
  "createdAt": "2025-10-07T16:10:00Z",
  "updatedAt": "2025-10-07T16:10:00Z"
}
```

**Response 409 (Circular Dependency):**
```json
{
  "type": "https://api.mujarrad.com/errors/conflict",
  "title": "Circular Dependency",
  "status": 409,
  "detail": "Creating this relationship would form a cycle",
  "cyclePath": ["parent-ctx", "child-node", "parent-ctx"]
}
```

---

### DELETE /api/nodes/{id}/attributes/{attrId}

Delete a relationship.

**Request:**
```http
DELETE /api/nodes/abc-123/attributes/attr-1 HTTP/1.1
Authorization: Bearer {token}
```

**Response 204:**
```
(No content)
```

**Note:** Per clarification #4, wiki-link relationships are NOT deleted when links are removed from markdown. This endpoint is for explicit user-initiated deletions only.

---

## 3. Search Endpoint (Existing)

### GET /api/spaces/{spaceId}/search

Search for nodes by title (case-insensitive) - used for wiki-link target resolution.

**Request:**
```http
GET /api/spaces/ws-789/search?q=target+page HTTP/1.1
Authorization: Bearer {token}
```

**Query Parameters:**
- `q`: string (search query)
- `nodeType`: "REGULAR" | "CONTEXT" (optional filter)

**Response 200:**
```json
[
  {
    "id": "def-456",
    "title": "Target Page",
    "slug": "target-page",
    "nodeType": "REGULAR",
    "excerpt": "...content preview...",
    "score": 0.95
  },
  {
    "id": "ghi-789",
    "title": "Target Page (Draft)",
    "slug": "target-page-draft",
    "nodeType": "REGULAR",
    "excerpt": "...another match...",
    "score": 0.78
  }
]
```

---

## Frontend Service Layer

### Node Service

```typescript
// src/services/api/node.service.ts
class NodeService {
  async getNode(id: string): Promise<Node> {
    const { data } = await apiClient.get<Node>(`/nodes/${id}`);
    return data;
  }

  async getSpaceNodes(spaceId: string): Promise<Node[]> {
    const { data } = await apiClient.get<Node[]>(
      `/spaces/${spaceId}/nodes`,
      { params: { size: 10000 } } // Get all nodes for hierarchy/graph
    );
    return data;
  }

  async createNode(payload: CreateNodePayload): Promise<Node> {
    const { data } = await apiClient.post<Node>('/nodes', payload);
    return data;
  }

  async updateNode(id: string, payload: UpdateNodePayload): Promise<Node> {
    const { data } = await apiClient.put<Node>(`/nodes/${id}`, payload);
    return data;
  }

  async searchNodes(spaceId: string, query: string): Promise<SearchResult[]> {
    const { data } = await apiClient.get<SearchResult[]>(
      `/spaces/${spaceId}/search`,
      { params: { q: query } }
    );
    return data;
  }
}

export const nodeService = new NodeService();
```

### Attribute Service

```typescript
// src/services/api/attribute.service.ts
class AttributeService {
  async getNodeAttributes(nodeId: string): Promise<Attribute[]> {
    const { data } = await apiClient.get<Attribute[]>(
      `/nodes/${nodeId}/attributes`
    );
    return data;
  }

  async createAttribute(payload: CreateAttributePayload): Promise<Attribute> {
    const { data } = await apiClient.post<Attribute>(
      `/nodes/${payload.sourceNodeId}/attributes`,
      payload
    );
    return data;
  }

  async deleteAttribute(nodeId: string, attrId: string): Promise<void> {
    await apiClient.delete(`/nodes/${nodeId}/attributes/${attrId}`);
  }
}

export const attributeService = new AttributeService();
```

---

## Contract Tests

Contract tests will be created to verify:

1. **Response schemas match TypeScript interfaces**
2. **Error responses follow RFC 7807 Problem Details**
3. **Authentication is enforced**
4. **Validation rules are applied**

Tests will use MSW (Mock Service Worker) for API mocking during development.

**Example Contract Test:**

```typescript
// tests/contracts/node.contract.test.ts
import { nodeService } from '@/services/api';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('http://localhost:3000/api/nodes/:id', () => {
    return HttpResponse.json({
      id: 'test-123',
      spaceId: 'ws-789',
      title: 'Test Node',
      slug: 'test-node',
      nodeType: 'REGULAR',
      markdownContent: 'Test content',
      createdBy: 'user-456',
      createdAt: '2025-10-07T10:00:00Z',
      updatedAt: '2025-10-07T10:00:00Z',
      version: 1,
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Node Service Contract', () => {
  it('GET /nodes/:id returns valid Node schema', async () => {
    const node = await nodeService.getNode('test-123');

    expect(node).toMatchObject({
      id: expect.any(String),
      spaceId: expect.any(String),
      title: expect.any(String),
      slug: expect.any(String),
      nodeType: expect.stringMatching(/^(REGULAR|CONTEXT)$/),
      version: expect.any(Number),
    });
  });
});
```

---

## Summary

- ✅ All required endpoints exist in backend (no API changes needed)
- ✅ Request/response schemas documented
- ✅ Error responses defined (RFC 7807)
- ✅ Service layer structure defined
- ✅ Contract test strategy outlined

**Ready for implementation**: Frontend can now build UI components using these service contracts.
