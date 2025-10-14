'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useSpace } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { HierarchyNavigator } from '@/components/hierarchy/HierarchyNavigator';
import { GraphVisualization } from '@/components/graph/GraphVisualization';
import { useNavigationStore } from '@/stores/navigationStore';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default function NodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const nodeId = params.id as string;
  const [activeView, setActiveView] = useState<'content' | 'graph'>('content');

  const { data: workspace } = useSpace(slug);
  const { setSelectedNode } = useNavigationStore();

  // Fetch the current node
  const { data: node, isLoading: nodeLoading } = useQuery({
    queryKey: ['node', slug, nodeId],
    queryFn: () => nodeService.getNode(slug, nodeId),
    enabled: !!workspace,
  });

  // Fetch all nodes for hierarchy and wiki-link resolution
  const { data: nodes } = useQuery({
    queryKey: ['workspace-nodes', slug],
    queryFn: () => nodeService.getNodes(slug, { page: 1, size: 1000 }),
    enabled: !!workspace,
  });

  // Fetch all attributes
  const { data: attributes } = useQuery({
    queryKey: ['workspace-attributes', slug],
    queryFn: () => attributeService.getWorkspaceAttributes(slug),
    enabled: !!workspace,
  });

  const allNodes = nodes || [];
  const allAttributes = attributes || [];

  // Set selected node in store
  useEffect(() => {
    if (node) {
      setSelectedNode(node.id.toString());
    }
  }, [node, setSelectedNode]);

  if (nodeLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!node) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Node not found</h1>
            <p className="text-gray-600 mb-4">The node you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={() => router.push(`/workspaces/${slug}`)}>
              Back to Workspace
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumbs
              segments={[
                { label: workspace?.name || slug, href: `/workspaces/${slug}`, isCurrent: false },
                { label: node.title, href: `/workspaces/${slug}/node/${nodeId}`, isCurrent: true }
              ]}
              className="mb-4"
            />
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{node.title}</h1>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      node.nodeType === 'CONTEXT'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {node.nodeType}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Last updated: {new Date(node.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => alert('Edit functionality coming soon')}>
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
          {/* Sidebar - Hierarchy Navigator */}
          <aside className="w-80 bg-white border-r border-gray-200 overflow-auto flex-shrink-0">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Hierarchy</h2>
            </div>
            <HierarchyNavigator
              nodes={allNodes}
              attributes={allAttributes}
              onNodeSelect={id => router.push(`/workspaces/${slug}/node/${id}`)}
            />
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* View Toggle */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-200">
              <button
                onClick={() => setActiveView('content')}
                className={`px-4 py-2 text-sm font-medium rounded ${
                  activeView === 'content'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setActiveView('graph')}
                className={`px-4 py-2 text-sm font-medium rounded ${
                  activeView === 'graph'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Graph
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {activeView === 'content' && (
                <div className="max-w-4xl mx-auto p-8">
                  <div className="bg-white rounded-lg shadow-sm p-8">
                    {node.content ? (
                      <MarkdownRenderer
                        content={node.content}
                        workspaceSlug={slug}
                        availableNodes={allNodes}
                        onWikiLinkClick={targetTitle => {
                          console.log('Wiki-link clicked:', targetTitle);
                          // TODO: Navigate to target or create placeholder
                        }}
                      />
                    ) : (
                      <div className="text-gray-500 text-center py-8">
                        <p>No content yet. Click Edit to add content.</p>
                      </div>
                    )}
                  </div>

                  {/* Node Metadata */}
                  <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Node Info</h3>
                    <dl className="space-y-3 text-sm">
                      <div>
                        <dt className="text-gray-500">ID</dt>
                        <dd className="font-mono text-gray-900">{node.id}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Type</dt>
                        <dd className="text-gray-900">{node.nodeType.toString()}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Space ID</dt>
                        <dd className="text-gray-900">{node.spaceId}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Created</dt>
                        <dd className="text-gray-900">
                          {new Date(node.createdAt).toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Version</dt>
                        <dd className="text-gray-900">{node.currentVersionId}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {activeView === 'graph' && (
                <div className="h-full">
                  <GraphVisualization
                    nodes={allNodes}
                    attributes={allAttributes}
                    onNodeClick={id => router.push(`/workspaces/${slug}/node/${id}`)}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
