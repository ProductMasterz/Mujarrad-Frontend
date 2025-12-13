'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EllipsisVerticalIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useSpace } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateNodeDialog } from '@/components/nodes/CreateNodeDialog';
import { NodeList } from '@/components/nodes/NodeList';
import { HierarchyNavigator } from '@/components/hierarchy/HierarchyNavigator';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { useNavigationStore } from '@/stores/navigationStore';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState<'list' | 'hierarchy'>('list');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

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

  // Clear all nodes in the space
  const handleClearAllNodes = async () => {
    if (clearConfirmText !== space?.name) return;

    setIsClearing(true);
    setClearError(null);

    try {
      // Get all nodes
      const allNodesToDelete = await nodeService.getNodes(slug, { size: 10000 });

      // Delete all nodes (with force to skip cascade checks)
      await Promise.all(
        allNodesToDelete.map((node) =>
          nodeService.deleteNode(slug, node.id, true).catch((err) => {
            console.warn(`Failed to delete node ${node.id}:`, err);
          })
        )
      );

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['space-nodes', slug] });
      queryClient.invalidateQueries({ queryKey: ['space-attributes', slug] });
      queryClient.invalidateQueries({ queryKey: ['spaces', slug, 'whiteboard'] });

      setClearDialogOpen(false);
      setClearConfirmText('');
    } catch (err) {
      setClearError(err instanceof Error ? err.message : 'Failed to clear space');
    } finally {
      setIsClearing(false);
    }
  };

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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setClearDialogOpen(true)}
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Clear All Nodes
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

        {/* Clear All Nodes Dialog */}
        <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear All Nodes</DialogTitle>
              <DialogDescription>
                This will permanently delete <strong>ALL nodes</strong> in this space, including all pages, blocks, and whiteboard elements. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-2">
                Type <strong>{space?.name}</strong> to confirm:
              </p>
              <Input
                value={clearConfirmText}
                onChange={(e) => setClearConfirmText(e.target.value)}
                placeholder={space?.name}
              />
            </div>
            {clearError && <p className="text-sm text-destructive">{clearError}</p>}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setClearDialogOpen(false);
                  setClearConfirmText('');
                  setClearError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAllNodes}
                disabled={isClearing || clearConfirmText !== space?.name}
              >
                {isClearing ? 'Clearing...' : 'Clear All Nodes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
