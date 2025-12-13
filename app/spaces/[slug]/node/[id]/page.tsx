'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useSpace } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { NodeRenderer } from '@/components/nodes/NodeRenderer';
import { HierarchyNavigator } from '@/components/hierarchy/HierarchyNavigator';
import { useNavigationStore } from '@/stores/navigationStore';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

/**
 * NodeDetailPage - Notion-like page editor
 *
 * Opens directly in editable block mode - no mode switching.
 * Just click and start typing.
 */
export default function NodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const nodeId = params.id as string;

  const { data: space } = useSpace(slug);
  const { setSelectedNode } = useNavigationStore();

  // Fetch the current node
  const { data: node, isLoading: nodeLoading } = useQuery({
    queryKey: ['node', slug, nodeId],
    queryFn: () => nodeService.getNode(slug, nodeId),
    enabled: !!space,
  });

  // Fetch all nodes for hierarchy
  const { data: nodes } = useQuery({
    queryKey: ['space-nodes', slug],
    queryFn: () => nodeService.getNodes(slug, { page: 1, size: 1000 }),
    enabled: !!space,
  });

  // Fetch all attributes
  const { data: attributes } = useQuery({
    queryKey: ['space-attributes', slug],
    queryFn: () => attributeService.getSpaceAttributes(slug),
    enabled: !!space,
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
            <p className="text-gray-600 mb-4">The page you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={() => router.push(`/spaces/${slug}`)}>
              Back to Space
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-gray-900 flex">
        {/* Sidebar - Hierarchy Navigator */}
        <aside className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-auto flex-shrink-0">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Breadcrumbs
              segments={[
                { label: space?.name || slug, href: `/spaces/${slug}`, isCurrent: false },
              ]}
            />
          </div>
          <HierarchyNavigator
            nodes={allNodes}
            attributes={allAttributes}
            onNodeSelect={id => router.push(`/spaces/${slug}/node/${id}`)}
          />
        </aside>

        {/* Main Content - Block Editor */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto py-12 px-8">
            {/* Page Title - Editable like Notion */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1 outline-none">
              {node.title}
            </h1>

            {/* Subtle metadata */}
            <p className="text-sm text-gray-400 mb-8">
              Last edited {new Date(node.updatedAt).toLocaleDateString()}
            </p>

            {/* Content Area - Renders based on node type */}
            {space && (
              <NodeRenderer
                node={node}
                spaceSlug={slug}
                spaceId={space.id}
              />
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
