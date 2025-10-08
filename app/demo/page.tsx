'use client';

import React, { useState } from 'react';
import { HierarchyNavigator } from '@/components/hierarchy/HierarchyNavigator';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import type { Node, Attribute } from '@/types/backend-dtos';
import { AttributeKey } from '@/types/backend-dtos';

export default function DemoPage() {
  // State to track selected node
  const [selectedNodeId, setSelectedNodeId] = useState<string>('3'); // Default to Authorization (has tables)

  // Mock nodes for hierarchy
  const mockNodes: Node[] = [
    {
      id: 1,
      workspaceId: 1,
      title: 'Product Requirements',
      slug: 'product-requirements',
      nodeType: 'CONTEXT',
      content: null,
      nodeDetails: {},
      createdBy: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      version: 1,
    },
    {
      id: 2,
      workspaceId: 1,
      title: 'User Authentication',
      slug: 'user-authentication',
      nodeType: 'REGULAR',
      content: `# User Authentication

## Overview
Implement secure user login and registration system with **JWT tokens** and *OAuth2* support.

### Key Features
- Email/password authentication
- Social login (Google, GitHub)
- Two-factor authentication (2FA)
- Password reset functionality

### Implementation Steps

#### 1. Database Schema
Set up user table with following fields:
- \`id\` (UUID)
- \`email\` (unique)
- \`password_hash\`
- \`created_at\`

#### 2. API Endpoints
\`\`\`typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
\`\`\`

#### 3. Security Considerations
> **Important:** Always hash passwords with bcrypt (min 10 rounds)

Key requirements:
1. Use HTTPS for all auth endpoints
2. Implement rate limiting
3. Add CSRF protection
4. Enable secure cookie flags

### External Resources
- [OWASP Auth Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

### Related Topics
See also: [[Authorization]] and [[Security Best Practices]]

---

**Status:** 🟢 In Progress | **Priority:** High | **Assigned:** Security Team`,
      nodeDetails: {},
      createdBy: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      version: 1,
    },
    {
      id: 3,
      workspaceId: 1,
      title: 'Authorization',
      slug: 'authorization',
      nodeType: 'REGULAR',
      content: `# Authorization

## Role-Based Access Control (RBAC)

### System Roles

| Role | Permissions | Description |
|------|-------------|-------------|
| **Admin** | Full access | System administrators |
| **Editor** | Read, Write | Content creators |
| **Viewer** | Read only | Read-only access |
| **Guest** | Limited | Restricted access |

### Permission Matrix

#### Workspace Operations
- ✅ Admin: Create, Read, Update, Delete
- ✅ Editor: Create, Read, Update
- ✅ Viewer: Read
- ❌ Guest: None

#### Node Operations
- ✅ Admin: All operations
- ✅ Editor: Create, Read, Update own nodes
- ⚠️ Viewer: Read only
- ❌ Guest: Public nodes only

### Implementation

\`\`\`typescript
interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  granted: boolean;
}

function checkPermission(
  user: User,
  resource: string,
  action: string
): boolean {
  const role = user.role;
  return PERMISSION_MAP[role][resource]?.[action] ?? false;
}
\`\`\`

### Task List
- [x] Define role hierarchy
- [x] Implement permission checks
- [ ] Add resource-level permissions
- [ ] Implement permission inheritance
- [ ] Add audit logging

### Related Documentation
Connected to [[User Authentication]] for identity verification.

### Notes
> 💡 **Tip:** Use the principle of least privilege - grant minimum necessary permissions.

---
*Last updated: 2025-01-15*`,
      nodeDetails: {},
      createdBy: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      version: 1,
    },
    {
      id: 4,
      workspaceId: 1,
      title: 'Technical Specs',
      slug: 'technical-specs',
      nodeType: 'CONTEXT',
      content: null,
      nodeDetails: {},
      createdBy: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      version: 1,
    },
    {
      id: 5,
      workspaceId: 1,
      title: 'Database Schema',
      slug: 'database-schema',
      nodeType: 'REGULAR',
      content: `# Database Schema

## PostgreSQL Database Design

### Core Tables

| Table | Description | Records |
|-------|-------------|---------|
| **users** | User accounts | ~10K |
| **workspaces** | Workspace containers | ~2K |
| **nodes** | Content nodes | ~50K |
| **attributes** | Node relationships | ~100K |
| **node_versions** | Version history | ~200K |

### Users Table

\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
\`\`\`

### Nodes Table

\`\`\`sql
CREATE TABLE nodes (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES workspaces(id),
  title VARCHAR(255) NOT NULL,
  node_type VARCHAR(20) NOT NULL,
  content TEXT,
  node_details JSONB,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Relationships (Attributes Table)

The \`attributes\` table creates the graph structure:

#### Attribute Types
1. **CONTAINS** - Hierarchical parent-child
2. **REFERENCES** - Cross-references between nodes
3. **DEPENDS_ON** - Dependency relationships
4. **TRIGGERS** - Event-driven connections

### Indexing Strategy

Optimized for:
- ✅ Fast node lookups by workspace
- ✅ Quick relationship traversal
- ✅ Efficient full-text search
- ✅ Version history queries

#### Performance Benchmarks

| Operation | Time | Notes |
|-----------|------|-------|
| Get node | <10ms | With caching |
| List workspace | <50ms | 100 nodes |
| Search | <100ms | Full-text |
| Insert node | <20ms | With triggers |

### Migration Strategy

Steps for schema updates:
1. Create migration file
2. Run in transaction
3. Verify data integrity
4. Update application code
5. Monitor performance

### Related Documentation
- See [[API Design]] for endpoint mappings
- Check [[Performance Optimization]] for query tuning

### External Links
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Indexing Best Practices](https://use-the-index-luke.com/)

---
**Database:** PostgreSQL 14+ | **ORM:** Drizzle`,
      nodeDetails: {},
      createdBy: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      version: 1,
    },
    {
      id: 6,
      workspaceId: 1,
      title: 'API Design',
      slug: 'api-design',
      nodeType: 'REGULAR',
      content: `# API Design

## RESTful API Architecture

### Base URL
\`\`\`
https://api.mujarrad.com/v1
\`\`\`

### Authentication
All requests require JWT token in Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

---

## Node Endpoints

### List Nodes
\`\`\`http
GET /api/workspaces/{workspaceId}/nodes
\`\`\`

**Query Parameters:**
- \`type\` - Filter by node type (REGULAR, CONTEXT)
- \`limit\` - Page size (default: 50)
- \`offset\` - Pagination offset

**Response:**
\`\`\`json
{
  "nodes": [...],
  "total": 150,
  "hasMore": true
}
\`\`\`

### Get Single Node
\`\`\`http
GET /api/nodes/{id}
\`\`\`

### Create Node
\`\`\`http
POST /api/workspaces/{workspaceId}/nodes
Content-Type: application/json

{
  "title": "New Node",
  "nodeType": "REGULAR",
  "content": "# Hello World"
}
\`\`\`

### Update Node
\`\`\`http
PUT /api/nodes/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "version": 5
}
\`\`\`

> ⚠️ **Note:** Version number required for optimistic locking

### Delete Node
\`\`\`http
DELETE /api/nodes/{id}
\`\`\`

---

## Attribute Endpoints

### Get Node Relationships
\`\`\`http
GET /api/nodes/{id}/attributes?type=contains
\`\`\`

### Create Relationship
\`\`\`http
POST /api/nodes/{sourceId}/attributes

{
  "targetNodeId": 42,
  "attributeKey": "references"
}
\`\`\`

---

## Error Handling

### Error Response Format
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid node type",
    "field": "nodeType"
  }
}
\`\`\`

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (version mismatch) |
| 500 | Server Error |

---

## Rate Limiting

- **Authenticated:** 1000 requests/hour
- **Anonymous:** 100 requests/hour

Headers returned:
\`\`\`
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1640995200
\`\`\`

---

## Related Documentation
- Database mappings: [[Database Schema]]
- Future features: [[Future Enhancements]]

## External Resources
- [OpenAPI Spec](https://api.mujarrad.com/swagger.json)
- [Postman Collection](https://www.postman.com/mujarrad)

---
**Version:** v1.0 | **Format:** JSON | **Protocol:** HTTPS`,
      nodeDetails: {},
      createdBy: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      version: 1,
    },
  ];

  // Mock attributes (relationships)
  const mockAttributes: Attribute[] = [
    {
      id: 1,
      sourceNodeId: 1,
      targetNodeId: 2,
      attributeKey: AttributeKey.CONTAINS,
      createdBy: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      sourceNodeId: 1,
      targetNodeId: 3,
      attributeKey: AttributeKey.CONTAINS,
      createdBy: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 3,
      sourceNodeId: 4,
      targetNodeId: 5,
      attributeKey: AttributeKey.CONTAINS,
      createdBy: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 4,
      sourceNodeId: 4,
      targetNodeId: 6,
      attributeKey: AttributeKey.CONTAINS,
      createdBy: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 5,
      sourceNodeId: 2,
      targetNodeId: 3,
      attributeKey: AttributeKey.REFERENCES,
      createdBy: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  // Find the selected node
  const selectedNode = mockNodes.find(node => node.id.toString() === selectedNodeId);

  // Get content to display
  const displayContent = selectedNode?.content || `# Welcome to Demo

Please select a node from the hierarchy on the left to view its content.

## Available Nodes

### Product Requirements
- User Authentication
- Authorization

### Technical Specs
- Database Schema
- API Design

Click on any node to see rich markdown formatting including:
- Headers (H1, H2, H3)
- **Bold** and *italic* text
- Code blocks with syntax highlighting
- Tables
- Task lists
- Wiki-links
- External links
- And more!`;

  // Handle node selection
  const handleNodeSelect = (nodeId: string) => {
    console.log('Selected node:', nodeId);
    setSelectedNodeId(nodeId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          UI Components Demo
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Hierarchy Navigator & Markdown Renderer
        </p>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left: Hierarchy Navigator */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              📁 Hierarchy Navigator
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Click to expand/collapse, use keyboard arrows
            </p>
          </div>
          <HierarchyNavigator
            nodes={mockNodes}
            attributes={mockAttributes}
            onNodeSelect={handleNodeSelect}
          />
        </div>

        {/* Right: Markdown Renderer */}
        <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              📝 Markdown Renderer
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {selectedNode ? `Viewing: ${selectedNode.title}` : 'Select a node to view content'}
            </p>
          </div>
          <div className="p-8">
            <MarkdownRenderer
              content={displayContent}
              workspaceSlug="demo"
              availableNodes={mockNodes}
              onWikiLinkClick={(target) => console.log('Wiki-link clicked:', target)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
