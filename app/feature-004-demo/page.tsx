'use client';

import { useState } from 'react';
import { NodeType, AttributeKey, type Node, type Attribute } from '@/types/backend-dtos';
import { HierarchyNavigator } from '@/components/hierarchy/HierarchyNavigator';
import { GraphVisualization } from '@/components/graph/GraphVisualization';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

/**
 * Feature 004 Demo Page
 * Showcases all implemented components with mock data
 * - Hierarchy Navigation
 * - Graph Visualization
 * - Markdown Rendering with Wiki-links
 * - Error Handling
 * - Accessibility Features
 */

// Mock data for demonstration
const mockNodes: Node[] = [
  {
    id: '1',
    spaceId: 'demo-space',
    title: 'Product Documentation',
    slug: 'product-documentation',
    nodeType: NodeType.CONTEXT,
    content: '',
    nodeDetails: {},
    currentVersionId: 'v1',
    createdBy: 'demo-user',
    modifiedBy: 'demo-user',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    spaceId: 'demo-space',
    title: 'Getting Started',
    slug: 'getting-started',
    nodeType: NodeType.REGULAR,
    content: '# Getting Started\n\nWelcome to our product! Check out [[Installation Guide]] and [[Configuration]].\n\n## Prerequisites\n- Node.js 18+\n- npm or yarn',
    nodeDetails: {},
    currentVersionId: 'v1',
    createdBy: 'demo-user',
    modifiedBy: 'demo-user',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    spaceId: 'demo-space',
    title: 'Installation Guide',
    slug: 'installation-guide',
    nodeType: NodeType.REGULAR,
    content: '# Installation Guide\n\n```bash\nnpm install my-product\n```\n\nSee [[Configuration]] for next steps.',
    nodeDetails: {},
    currentVersionId: 'v1',
    createdBy: 'demo-user',
    modifiedBy: 'demo-user',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '4',
    spaceId: 'demo-space',
    title: 'Configuration',
    slug: 'configuration',
    nodeType: NodeType.REGULAR,
    content: '# Configuration\n\nCreate a `.env` file with:\n```\nAPI_KEY=your_key\nDATABASE_URL=postgres://...\n```',
    nodeDetails: {},
    currentVersionId: 'v1',
    createdBy: 'demo-user',
    modifiedBy: 'demo-user',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '5',
    spaceId: 'demo-space',
    title: 'API Reference',
    slug: 'api-reference',
    nodeType: NodeType.CONTEXT,
    content: '',
    nodeDetails: {},
    currentVersionId: 'v1',
    createdBy: 'demo-user',
    modifiedBy: 'demo-user',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '6',
    spaceId: 'demo-space',
    title: 'Authentication',
    slug: 'authentication',
    nodeType: NodeType.REGULAR,
    content: '# Authentication\n\nUse JWT tokens for authentication. See [[Getting Started]] for setup.',
    nodeDetails: {},
    currentVersionId: 'v1',
    createdBy: 'demo-user',
    modifiedBy: 'demo-user',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '7',
    spaceId: 'demo-space',
    title: 'Security Assumptions',
    slug: 'security-assumptions',
    nodeType: NodeType.ASSUMPTION,
    content: '# Security Assumptions\n\n- Users are authenticated via OAuth2\n- All data is encrypted at rest\n- Rate limiting is enforced',
    nodeDetails: {},
    currentVersionId: 'v1',
    createdBy: 'demo-user',
    modifiedBy: 'demo-user',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const mockAttributes: Attribute[] = [
  {
    id: 1,
    sourceNodeId: 1,
    targetNodeId: 2,
    attributeKey: AttributeKey.CONTAINS,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    sourceNodeId: 1,
    targetNodeId: 3,
    attributeKey: AttributeKey.CONTAINS,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 3,
    sourceNodeId: 1,
    targetNodeId: 4,
    attributeKey: AttributeKey.CONTAINS,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 4,
    sourceNodeId: 5,
    targetNodeId: 6,
    attributeKey: AttributeKey.CONTAINS,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 5,
    sourceNodeId: 2,
    targetNodeId: 3,
    attributeKey: AttributeKey.REFERENCES,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 6,
    sourceNodeId: 2,
    targetNodeId: 4,
    attributeKey: AttributeKey.REFERENCES,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 7,
    sourceNodeId: 3,
    targetNodeId: 4,
    attributeKey: AttributeKey.REFERENCES,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 8,
    sourceNodeId: 6,
    targetNodeId: 2,
    attributeKey: AttributeKey.REFERENCES,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

export default function Feature004DemoPage() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(mockNodes[1]);

  const handleNodeSelect = (nodeId: string) => {
    const node = mockNodes.find(n => n.id.toString() === nodeId);
    if (node) {
      setSelectedNode(node);
    }
  };

  const handleWikiLinkClick = (targetTitle: string) => {
    const node = mockNodes.find(n => n.title.toLowerCase() === targetTitle.toLowerCase());
    if (node) {
      setSelectedNode(node);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Feature 004 Demo</h1>
        <p className="text-sm text-gray-600 mt-1">
          Obsidian-like Page Hierarchy & Graph Navigation - Waves 1-8 Complete ✅
        </p>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar: Hierarchy */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Hierarchy</h2>
            <p className="text-xs text-gray-500 mt-1">
              Tree navigation with keyboard support
            </p>
          </div>
          <div className="flex-1 overflow-auto">
            <HierarchyNavigator
              nodes={mockNodes}
              attributes={mockAttributes}
              onNodeSelect={handleNodeSelect}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Tabs defaultValue="markdown" className="flex-1 flex flex-col">
            <div className="border-b border-gray-200 bg-white px-6">
              <TabsList className="h-12">
                <TabsTrigger value="markdown">Markdown Preview</TabsTrigger>
                <TabsTrigger value="graph">Graph View</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
              </TabsList>
            </div>

            {/* Markdown Tab */}
            <TabsContent value="markdown" className="flex-1 overflow-auto m-0 p-6">
              {selectedNode ? (
                <Card className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedNode.title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedNode.nodeType === NodeType.CONTEXT
                          ? 'bg-purple-100 text-purple-800'
                          : selectedNode.nodeType === NodeType.ASSUMPTION
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedNode.nodeType}
                      </span>
                      <span>•</span>
                      <span>v{selectedNode.currentVersionId}</span>
                    </div>
                  </div>

                  {selectedNode.content ? (
                    <MarkdownRenderer
                      content={selectedNode.content}
                      spaceSlug="demo"
                      availableNodes={mockNodes}
                      onWikiLinkClick={handleWikiLinkClick}
                    />
                  ) : (
                    <p className="text-gray-500 italic">
                      This is a container node (no content)
                    </p>
                  )}
                </Card>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Select a node from the hierarchy</p>
                </div>
              )}
            </TabsContent>

            {/* Graph Tab */}
            <TabsContent value="graph" className="flex-1 m-0">
              <div className="h-full">
                <GraphVisualization
                  nodes={mockNodes}
                  attributes={mockAttributes}
                  onNodeClick={handleNodeSelect}
                />
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="flex-1 overflow-auto m-0 p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">✅ Implemented Features</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Wave 1-2: Foundation & State</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                        <li>Wiki-link parser with [[Page]] and [[Display|Target]] syntax</li>
                        <li>Hierarchy tree builder with parent-child relationships</li>
                        <li>Graph data builder with bidirectional edge detection</li>
                        <li>Zustand stores for hierarchy and graph state</li>
                        <li>React Query hooks for optimistic updates</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900">Wave 3: Hierarchy UI</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                        <li>Recursive TreeNode component with expand/collapse</li>
                        <li>Keyboard navigation (Arrow keys, Enter, Space)</li>
                        <li>NodeIcon with folder/document icons</li>
                        <li>HierarchyNavigator container</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900">Wave 4: Markdown UI</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                        <li>WikiLink component with click navigation</li>
                        <li>MarkdownRenderer with GFM support (tables, strikethrough, task lists)</li>
                        <li>Wiki-link resolution and placeholder styling</li>
                        <li>Custom text node processing for [[wiki-links]]</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900">Wave 5: Graph UI</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                        <li>CustomNode with type-based styling (CONTEXT, REGULAR, ASSUMPTION)</li>
                        <li>Bidirectional edge detection with ↔ markers</li>
                        <li>GraphVisualization with React Flow</li>
                        <li>GraphControls with node/edge type filters</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900">Wave 6-7: Integration & Pages</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                        <li>CreateNodeDialog with hierarchy parent selection</li>
                        <li>EditNodeDialog with wiki-link processing on save</li>
                        <li>NodeDetailView with markdown rendering</li>
                        <li>Space page with sidebar + 3 tabs</li>
                        <li>Node detail page with navigation handlers</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900">Wave 8: Error Handling & A11y</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                        <li>Network retry logic with exponential backoff (3 attempts)</li>
                        <li>ErrorBoundary component for React error catching</li>
                        <li>Circular dependency error detection</li>
                        <li>ARIA labels on all interactive elements</li>
                        <li>WCAG AA compliant focus indicators</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900">Wave 10: Performance</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                        <li>React.memo on TreeNode, WikiLink, NodeIcon</li>
                        <li>useMemo for buildHierarchyTree and buildGraphData</li>
                        <li>Debug console.logs removed</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-yellow-50 border-yellow-200">
                  <h3 className="text-xl font-semibold mb-4">⚠️ Requires Backend</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Wave 9: E2E tests (32 test cases written, ready to execute)</li>
                    <li>Full CRUD operations (Create, Edit, Delete nodes)</li>
                    <li>User authentication and authorization</li>
                    <li>Real-time collaboration features</li>
                  </ul>
                </Card>

                <Card className="p-6 bg-green-50 border-green-200">
                  <h3 className="text-xl font-semibold mb-4">🎯 Try It Out</h3>
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                    <li>Click nodes in the hierarchy tree on the left</li>
                    <li>Use keyboard arrows to navigate the tree</li>
                    <li>Click wiki-links in the markdown (blue underlined text)</li>
                    <li>Switch to Graph View to see node relationships</li>
                    <li>Test keyboard focus indicators (Tab through elements)</li>
                  </ol>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
