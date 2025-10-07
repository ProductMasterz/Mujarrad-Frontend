# Mujarrad API Documentation v1.0

REST API for the Mujarrad/ISAAT knowledge graph platform.

**Base URL**: `http://localhost:8080/api`
**Production URL**: `https://api.mujarrad.io` (TBD)

## Table of Contents

1. [Authentication](#authentication)
2. [Workspaces](#workspaces)
3. [Nodes](#nodes)
4. [Attributes (Relationships)](#attributes-relationships)
5. [Versions](#versions)
6. [Error Handling](#error-handling)

---

## Authentication

All endpoints except `/users/register` and `/users/login` require JWT authentication.

### Register User

Create a new user account.

**Endpoint**: `POST /users/register`
**Authentication**: None (public)

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response** `201 Created`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MDUzMTY0MDAsImV4cCI6MTcwNTQwMjgwMH0.abc123",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Error** `409 Conflict`:
```json
{
  "status": 409,
  "type": "about:blank",
  "title": "Duplicate Resource",
  "detail": "User with email 'john@example.com' already exists",
  "timestamp": "2025-01-15T10:30:00Z",
  "instance": "/api/users/register"
}
```

---

### Login

Authenticate and receive JWT token.

**Endpoint**: `POST /users/login`
**Authentication**: None (public)

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response** `200 OK`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Error** `401 Unauthorized`:
```json
{
  "status": 401,
  "type": "about:blank",
  "title": "Authentication Failed",
  "detail": "Invalid email or password",
  "timestamp": "2025-01-15T10:30:00Z",
  "instance": "/api/users/login"
}
```

---

## Workspaces

Multi-tenant workspace management.

### Create Workspace

**Endpoint**: `POST /workspaces`
**Authentication**: Required (Bearer token)

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "My Project",
  "slug": "my-project"  // Optional, auto-generated from name if omitted
}
```

**Response** `201 Created`:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "My Project",
  "slug": "my-project",
  "ownerId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-01-15T10:35:00Z",
  "updatedAt": "2025-01-15T10:35:00Z"
}
```

---

### List Workspaces

Get all workspaces owned by the authenticated user.

**Endpoint**: `GET /workspaces`
**Authentication**: Required

**Response** `200 OK`:
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "My Project",
    "slug": "my-project",
    "ownerId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-01-15T10:35:00Z",
    "updatedAt": "2025-01-15T10:35:00Z"
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "name": "Personal Notes",
    "slug": "personal-notes",
    "ownerId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-01-14T09:00:00Z",
    "updatedAt": "2025-01-14T09:00:00Z"
  }
]
```

---

### Get Workspace

Retrieve workspace by ID or slug.

**Endpoint**: `GET /workspaces/{id}` or `GET /workspaces/slug/{slug}`
**Authentication**: Required

**Response** `200 OK`:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "My Project",
  "slug": "my-project",
  "ownerId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-01-15T10:35:00Z",
  "updatedAt": "2025-01-15T10:35:00Z"
}
```

---

## Nodes

Node CRUD operations with versioning and graph support.

### Create Node

**Endpoint**: `POST /workspaces/{workspaceSlug}/nodes`
**Authentication**: Required

**Request Body**:
```json
{
  "title": "Project Requirements",
  "nodeType": "CONTEXT",  // REGULAR, CONTEXT, or ASSUMPTION
  "content": "## Requirements\n\n- Feature A: User authentication\n- Feature B: Data visualization",
  "nodeDetails": {
    "category": "planning",
    "priority": "high",
    "tags": ["requirements", "planning"]
  }
}
```

**Response** `201 Created`:
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "workspaceId": "660e8400-e29b-41d4-a716-446655440000",
  "nodeType": "CONTEXT",
  "title": "Project Requirements",
  "slug": "project-requirements",
  "content": "## Requirements\n\n- Feature A: User authentication\n- Feature B: Data visualization",
  "nodeDetails": {
    "category": "planning",
    "priority": "high",
    "tags": ["requirements", "planning"]
  },
  "currentVersionId": "990e8400-e29b-41d4-a716-446655440000",
  "createdById": "550e8400-e29b-41d4-a716-446655440000",
  "modifiedById": null,
  "createdAt": "2025-01-15T10:40:00Z",
  "updatedAt": "2025-01-15T10:40:00Z"
}
```

**Validation Error** `400 Bad Request`:
```json
{
  "status": 400,
  "type": "about:blank",
  "title": "Validation Failed",
  "detail": "Request validation failed with 2 error(s)",
  "timestamp": "2025-01-15T10:40:00Z",
  "instance": "/api/workspaces/my-project/nodes",
  "extensions": {
    "validationErrors": {
      "title": "Title is required",
      "nodeType": "Node type is required"
    }
  }
}
```

---

### List Nodes

Get all nodes in a workspace.

**Endpoint**: `GET /workspaces/{workspaceSlug}/nodes`
**Authentication**: Required

**Response** `200 OK`:
```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "workspaceId": "660e8400-e29b-41d4-a716-446655440000",
    "nodeType": "CONTEXT",
    "title": "Project Requirements",
    "slug": "project-requirements",
    "content": "...",
    "nodeDetails": { ... },
    "createdAt": "2025-01-15T10:40:00Z"
  },
  { ... }
]
```

---

### Get Node

Retrieve a specific node.

**Endpoint**: `GET /workspaces/{workspaceSlug}/nodes/{nodeId}`
**Authentication**: Required

**Response** `200 OK`: (Same structure as Create Node response)

**Error** `404 Not Found`:
```json
{
  "status": 404,
  "type": "about:blank",
  "title": "Resource Not Found",
  "detail": "Node with ID 880e8400-e29b-41d4-a716-446655440000 not found",
  "timestamp": "2025-01-15T10:45:00Z",
  "instance": "/api/workspaces/my-project/nodes/880e8400-e29b-41d4-a716-446655440000"
}
```

---

### Update Node

**Endpoint**: `PUT /workspaces/{workspaceSlug}/nodes/{nodeId}`
**Authentication**: Required

**Request Body**: (All fields optional)
```json
{
  "title": "Updated Requirements",
  "content": "## Updated Content\n\n- New requirement",
  "nodeDetails": {
    "priority": "critical"
  }
}
```

**Response** `200 OK`:
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "title": "Updated Requirements",
  "slug": "updated-requirements",  // Auto-updated from title
  "content": "## Updated Content\n\n- New requirement",
  "currentVersionId": "aa0e8400-e29b-41d4-a716-446655440000",  // New version created
  "modifiedById": "550e8400-e29b-41d4-a716-446655440000",
  "updatedAt": "2025-01-15T11:00:00Z",
  ...
}
```

---

### Delete Node

Delete a node with optional smart cascade.

**Endpoint**: `DELETE /workspaces/{workspaceSlug}/nodes/{nodeId}?force={true|false}`
**Authentication**: Required

**Query Parameters**:
- `force` (boolean, default: `false`)
  - `false`: Prevent deletion of CONTEXT nodes with children
  - `true`: Smart cascade deletion

**Response** `204 No Content`

**Error** `400 Bad Request` (CONTEXT node with children, force=false):
```json
{
  "status": 400,
  "type": "about:blank",
  "title": "Invalid Operation",
  "detail": "Cannot delete context node 880e8400-e29b-41d4-a716-446655440000: has 5 children. Use force=true for cascade deletion.",
  "timestamp": "2025-01-15T11:05:00Z",
  "instance": "/api/workspaces/my-project/nodes/880e8400-e29b-41d4-a716-446655440000"
}
```

**Smart Cascade Logic** (force=true):
- For each child via 'contains' relationship:
  - **1 parent**: CASCADE delete child recursively
  - **2+ parents**: ORPHAN child (remove only this relationship)

---

## Attributes (Relationships)

Create and manage relationships between nodes.

### Create Relationship

**Endpoint**: `POST /nodes/{nodeId}/attributes`
**Authentication**: Required

**Request Body**:
```json
{
  "sourceNodeId": "880e8400-e29b-41d4-a716-446655440000",
  "targetNodeId": "bb0e8400-e29b-41d4-a716-446655440000",
  "attributeName": "contains",  // contains, depends_on, triggers, references, next, calls
  "attributeTypeMode": "TYPED",  // TYPED or SCHEMALESS
  "attributeDataType": "JSON",   // Required for TYPED mode
  "attributeValue": {
    "order": 1,
    "weight": 0.95
  },
  "properties": {
    "description": "Parent-child containment"
  }
}
```

**Response** `201 Created`:
```json
{
  "id": "cc0e8400-e29b-41d4-a716-446655440000",
  "workspaceId": "660e8400-e29b-41d4-a716-446655440000",
  "sourceNodeId": "880e8400-e29b-41d4-a716-446655440000",
  "targetNodeId": "bb0e8400-e29b-41d4-a716-446655440000",
  "attributeName": "contains",
  "attributeTypeMode": "TYPED",
  "attributeDataType": "JSON",
  "attributeValue": {
    "order": 1,
    "weight": 0.95
  },
  "properties": {
    "description": "Parent-child containment"
  },
  "createdById": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-01-15T11:10:00Z"
}
```

**Circular Containment Error** `400 Bad Request`:
```json
{
  "status": 400,
  "type": "https://mujarrad.io/errors/circular-containment",
  "title": "Circular Containment Not Allowed",
  "detail": "Cannot create containment relationship from 880e8400... to bb0e8400...: would create cycle in containment hierarchy. Containment relationships must form an acyclic tree for UI navigation.",
  "timestamp": "2025-01-15T11:10:00Z",
  "instance": "/api/nodes/880e8400-e29b-41d4-a716-446655440000/attributes",
  "extensions": {
    "sourceNodeId": "880e8400-e29b-41d4-a716-446655440000",
    "targetNodeId": "bb0e8400-e29b-41d4-a716-446655440000",
    "note": "Cycles are ONLY prevented in Context→Node CONTAINS relationships for UI navigation. Node→Node and Context→Context CONTAINS allow cycles. All non-CONTAINS relationships allow cycles for Abstract Logic."
  }
}
```

**Cycle Detection Rules**:
- ❌ **Context→Node CONTAINS**: Cycles FORBIDDEN
- ✅ **Node→Node CONTAINS**: Cycles ALLOWED
- ✅ **Context→Context CONTAINS**: Cycles ALLOWED
- ✅ **All non-CONTAINS**: Cycles ALLOWED

---

### List Node Attributes

Get all outgoing relationships from a node.

**Endpoint**: `GET /nodes/{nodeId}/attributes`
**Authentication**: Required

**Response** `200 OK`:
```json
[
  {
    "id": "cc0e8400-e29b-41d4-a716-446655440000",
    "sourceNodeId": "880e8400-e29b-41d4-a716-446655440000",
    "targetNodeId": "bb0e8400-e29b-41d4-a716-446655440000",
    "attributeName": "contains",
    ...
  },
  { ... }
]
```

---

### Delete Relationship

**Endpoint**: `DELETE /attributes/{attributeId}`
**Authentication**: Required

**Response** `204 No Content`

---

## Versions

Node version history (immutable).

### Get Version History

**Endpoint**: `GET /nodes/{nodeId}/versions`
**Authentication**: Required

**Response** `200 OK`:
```json
[
  {
    "id": "aa0e8400-e29b-41d4-a716-446655440000",
    "nodeId": "880e8400-e29b-41d4-a716-446655440000",
    "versionNumber": 2,
    "title": "Updated Requirements",
    "content": "## Updated Content",
    "nodeDetailsSnapshot": {
      "priority": "critical"
    },
    "attributesSnapshot": null,
    "createdById": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-01-15T11:00:00Z"
  },
  {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "versionNumber": 1,
    "title": "Project Requirements",
    "content": "## Requirements",
    "nodeDetailsSnapshot": {
      "priority": "high"
    },
    "createdAt": "2025-01-15T10:40:00Z"
  }
]
```

---

### Get Specific Version

**Endpoint**: `GET /nodes/{nodeId}/versions/{versionNumber}`
**Authentication**: Required

**Response** `200 OK`: (Single version object)

---

### Restore Version

**Endpoint**: `POST /nodes/{nodeId}/versions/{versionNumber}/restore`
**Authentication**: Required
**Status**: Not Implemented (Phase 3.5)

**Response** `501 Not Implemented`:
```json
{
  "status": 501,
  "type": "about:blank",
  "title": "Not Implemented",
  "detail": "Version restore not yet implemented (Phase 3.5)",
  "timestamp": "2025-01-15T11:15:00Z"
}
```

---

## Error Handling

All errors follow **RFC 7807 Problem Details** format.

### Standard Error Response

```json
{
  "status": 400,
  "type": "about:blank",
  "title": "Error Title",
  "detail": "Detailed error message",
  "timestamp": "2025-01-15T10:30:00Z",
  "instance": "/api/path/to/resource",
  "extensions": {
    "additionalField": "value"
  }
}
```

### HTTP Status Codes

| Code | Title | Description |
|------|-------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Delete successful (no response body) |
| 400 | Bad Request | Validation error, invalid operation, circular containment |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions (workspace access denied) |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (email, username, slug) |
| 500 | Internal Server Error | Unexpected server error |
| 501 | Not Implemented | Feature not yet implemented |

---

## Rate Limiting

**Status**: Not implemented
**Planned**: 1000 requests/hour per user

---

## Versioning

**Current Version**: v1.0
**Base Path**: `/api`
**Future Versioning**: `/api/v2` (when breaking changes introduced)

---

## SDK & Client Libraries

**Status**: Not available
**Planned**: JavaScript/TypeScript, Python, Java clients

---

## Webhooks

**Status**: Not implemented
**Planned**: Workspace events, node creation/updates

---

## Support

- **Documentation**: [https://docs.mujarrad.io](https://docs.mujarrad.io) (TBD)
- **Issues**: [GitHub Issues](https://github.com/mujarrad/mujarrad/issues) (TBD)
- **Email**: support@mujarrad.io (TBD)

---

**Last Updated**: 2025-01-15
**API Version**: 1.0.0
