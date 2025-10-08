'use client';

import React from 'react';
import { HierarchyNavigator } from '@/components/hierarchy/HierarchyNavigator';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import type { Node, Attribute } from '@/types/backend-dtos';
import { AttributeKey } from '@/types/backend-dtos';

export default function DemoPage() {
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
      content: '# User Authentication\n\nImplement user login and registration.\n\nSee also: [[Authorization]] and [[Security Best Practices]]',
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
      content: '# Authorization\n\nRole-based access control implementation.\n\nRelated: [[User Authentication]]',
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
      content: '# Database Schema\n\n## Tables\n\n| Table | Description |\n|-------|-------------|\n| users | User accounts |\n| nodes | Content nodes |\n\nSee [[API Design]] for related endpoints.',
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
      content: '# API Design\n\nRESTful API endpoints:\n\n- `GET /api/nodes` - List nodes\n- `POST /api/nodes` - Create node\n\nReferences: [[Database Schema]] and [[Future Enhancements]]',
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

  const sampleMarkdown = `# Markdown Renderer Demo

This demonstrates the **MarkdownRenderer** component with wiki-link support.

## Features

### Basic Markdown
- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- \`inline code\`

### Wiki-Links
Here are some wiki-links:
- [[User Authentication]] - This link resolves to an existing node (blue)
- [[Security Best Practices]] - This is a placeholder (red, doesn't exist yet)
- [[Custom Display|Authorization]] - Custom display text with link

### Tables (GFM)
| Feature | Status |
|---------|--------|
| Hierarchy UI | ✅ Complete |
| Markdown UI | ✅ Complete |
| Graph UI | ✅ Complete |

### Code Block
\`\`\`typescript
const example = {
  component: 'MarkdownRenderer',
  features: ['GFM', 'wiki-links', 'syntax-highlighting']
};
\`\`\`

### Task Lists
- [x] Implement wiki-link parsing
- [x] Add placeholder detection
- [ ] Add image support
`;

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
            onNodeSelect={(nodeId) => console.log('Selected node:', nodeId)}
          />
        </div>

        {/* Right: Markdown Renderer */}
        <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              📝 Markdown Renderer
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              GFM support with wiki-link resolution
            </p>
          </div>
          <div className="p-8">
            <MarkdownRenderer
              content={sampleMarkdown}
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
