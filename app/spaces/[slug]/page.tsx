'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useSpace } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { CreateNodeDialog } from '@/components/nodes/CreateNodeDialog';
import { NodeList } from '@/components/nodes/NodeList';
import { HierarchyNavigator } from '@/components/hierarchy/HierarchyNavigator';
import { useQuery } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { useNavigationStore } from '@/stores/navigationStore';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState<'list' | 'hierarchy'>('list');

  const { data: space, isLoading, error } = useSpace(slug);
  const { setSpace, selectedNodeId } = useNavigationStore();

  // Fetch all nodes for hierarchy and graph
  const { data: nodes } = useQuery({
    queryKey: ['space-nodes', slug],
    queryFn: () => nodeService.getNodes(slug, { page: 1, size: 1000 }),
    enabled: !!space,
  });

  // Fetch all attributes for hierarchy and graph
  const { data: attributes } = useQuery({
    queryKey: ['space-attributes', slug],
    queryFn: () => attributeService.getSpaceAttributes(slug),
    enabled: !!space,
  });

  const allNodes = nodes || [];
  const allAttributes = attributes || [];

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !space) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Space not found</h1>
            <p className="text-gray-600 mb-4">The space you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={() => router.push('/spaces')}>Back to Spaces</Button>
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
                { label: space.name, href: `/spaces/${slug}`, isCurrent: true }
              ]}
              className="mb-4"
            />
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{space.name}</h1>
              </div>
              <div className="flex items-center gap-2">
                <CreateNodeDialog spaceSlug={slug} />
                <Button
                  variant="outline"
                  onClick={() => router.push(`/spaces/${slug}/settings`)}
                >
                  Settings
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
              onNodeSelect={nodeId => router.push(`/spaces/${slug}/node/${nodeId}`)}
            />
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-200">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 text-sm font-medium rounded ${
                  activeTab === 'list'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Node List
              </button>
              <button
                onClick={() => setActiveTab('hierarchy')}
                className={`px-4 py-2 text-sm font-medium rounded ${
                  activeTab === 'hierarchy'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Hierarchy View
              </button>
              <button
                onClick={() => router.push(`/spaces/${slug}/whiteboard`)}
                className="px-4 py-2 text-sm font-medium rounded text-gray-600 hover:bg-gray-100"
              >
                Whiteboard
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto bg-gray-50">
              {activeTab === 'list' && (
                <div className="p-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Nodes</h2>
                      <CreateNodeDialog spaceSlug={slug} />
                    </div>
                    <NodeList spaceSlug={slug} />
                  </div>
                </div>
              )}

              {activeTab === 'hierarchy' && (
                <div className="h-full p-6">
                  <div className="bg-white rounded-lg shadow-sm h-full p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Hierarchy Tree View
                    </h2>
                    <HierarchyNavigator
                      nodes={allNodes}
                      attributes={allAttributes}
                      onNodeSelect={nodeId => router.push(`/spaces/${slug}/node/${nodeId}`)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
