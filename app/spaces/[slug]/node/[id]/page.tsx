'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateNodeSchema, type UpdateNodeFormData } from '@/schemas';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useSpace, useUpdateNode } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import { wikiLinkService } from '@/services/api/wikilink.service';
import { MarkdownPreview } from '@/components/nodes/MarkdownPreview';
// import { MarkdownEditor } from '@/components/markdown/MarkdownEditor'; // Temporarily disabled
import { HierarchyNavigator } from '@/components/hierarchy/HierarchyNavigator';
import { GraphVisualization } from '@/components/graph/GraphVisualization';
import { useNavigationStore } from '@/stores/navigationStore';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { isApiError } from '@/lib/errors';

type ViewMode = 'preview' | 'edit' | 'draft' | 'publish';

export default function NodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const nodeId = params.id as string;
  const [activeView, setActiveView] = useState<'content' | 'graph'>('content');
  const [mode, setMode] = useState<ViewMode>('preview');

  const queryClient = useQueryClient();
  const { data: space } = useSpace(slug);
  const { setSelectedNode } = useNavigationStore();
  const { mutate: updateNode, isPending: isSaving } = useUpdateNode();
  const [isProcessingWikiLinks, setIsProcessingWikiLinks] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch the current node
  const { data: node, isLoading: nodeLoading } = useQuery({
    queryKey: ['node', slug, nodeId],
    queryFn: () => nodeService.getNode(slug, nodeId),
    enabled: !!space,
  });

  // Fetch all nodes for hierarchy and wiki-link resolution
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

  // React Hook Form setup
  const {
    setValue,
    control,
    getValues,
    reset,
  } = useForm<UpdateNodeFormData>({
    resolver: zodResolver(updateNodeSchema),
  });

  // Watch markdown content for live editor
  const content = useWatch({
    control,
    name: 'content',
    defaultValue: '',
  });

  // Initialize form when node loads
  useEffect(() => {
    if (node) {
      setValue('title', node.title);
      setValue('nodeType', node.nodeType);
      setValue('content', node.content);
      // Handle null or missing currentVersionId
      const versionNum = node.currentVersionId
        ? parseInt(node.currentVersionId.replace(/^v/, ''), 10)
        : 1;
      setValue('version', isNaN(versionNum) ? 1 : versionNum);
    }
  }, [node, setValue]);

  // Set selected node in store
  useEffect(() => {
    if (node) {
      setSelectedNode(node.id.toString());
    }
  }, [node, setSelectedNode]);

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!node) return;

    setSaveError(null);
    const data = getValues();

    updateNode({ spaceSlug: slug, nodeId: nodeId, data }, {
      onSuccess: async (updatedNode) => {
        // Process wiki-links after successful update
        if (data.content) {
          setIsProcessingWikiLinks(true);
          try {
            await wikiLinkService.processWikiLinks(
              data.content,
              updatedNode.id.toString(),
              slug
            );

            // Invalidate cache to refresh UI
            queryClient.invalidateQueries({ queryKey: ['node', slug, nodeId] });
            queryClient.invalidateQueries({ queryKey: ['space-nodes', slug] });
            queryClient.invalidateQueries({ queryKey: ['nodes', updatedNode.id, 'attributes'] });

            setMode('preview');
          } catch (error) {
            if (isApiError(error)) {
              setSaveError(`Node saved but wiki-link processing failed: ${error.getUserMessage()}`);
            }
          } finally {
            setIsProcessingWikiLinks(false);
          }
        } else {
          queryClient.invalidateQueries({ queryKey: ['node', slug, nodeId] });
          queryClient.invalidateQueries({ queryKey: ['space-nodes', slug] });
          setMode('preview');
        }
      },
      onError: (error) => {
        if (isApiError(error)) {
          if (error.statusCode === 409) {
            setSaveError('Version conflict. The node was modified by someone else. Please refresh and try again.');
          } else {
            setSaveError(error.getUserMessage());
          }
        }
      },
    });
  };

  // Handle mode changes
  const handleModeChange = (newMode: ViewMode) => {
    if (newMode === 'edit' && mode === 'preview') {
      // Reset form to current node data when entering edit mode
      if (node) {
        setValue('title', node.title);
        setValue('nodeType', node.nodeType);
        setValue('content', node.content);
        // Handle null or missing currentVersionId
        const versionNum = node.currentVersionId
          ? parseInt(node.currentVersionId.replace(/^v/, ''), 10)
          : 1;
        setValue('version', isNaN(versionNum) ? 1 : versionNum);
      }
      setSaveError(null);
    }
    setMode(newMode);
  };

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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumbs
              segments={[
                { label: space?.name || slug, href: `/spaces/${slug}`, isCurrent: false },
                { label: node.title, href: `/spaces/${slug}/node/${nodeId}`, isCurrent: true }
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
                {/* Mode Toggle Buttons */}
                <Button
                  variant={mode === 'preview' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('preview')}
                  disabled={isSaving || isProcessingWikiLinks}
                >
                  Preview
                </Button>
                <Button
                  variant={mode === 'edit' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('edit')}
                  disabled={isSaving || isProcessingWikiLinks}
                >
                  Edit
                </Button>
                <Button
                  variant={mode === 'draft' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('draft')}
                  disabled={isSaving || isProcessingWikiLinks}
                >
                  Draft
                </Button>
                <Button
                  variant={mode === 'publish' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('publish')}
                  disabled={isSaving || isProcessingWikiLinks}
                >
                  Publish
                </Button>

                {/* Save button (visible only in edit mode) */}
                {mode === 'edit' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleModeChange('preview')}
                      disabled={isSaving || isProcessingWikiLinks}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveChanges}
                      disabled={isSaving || isProcessingWikiLinks}
                    >
                      {isSaving ? 'Saving...' : isProcessingWikiLinks ? 'Processing...' : 'Save Changes'}
                    </Button>
                  </>
                )}
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
              onNodeSelect={id => router.push(`/spaces/${slug}/node/${id}`)}
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
                  {/* Error message display */}
                  {saveError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {saveError}
                    </div>
                  )}

                  {/* Preview Mode */}
                  {mode === 'preview' && (
                    <div className="bg-white rounded-lg shadow-sm p-8">
                      {node.content ? (
                        <MarkdownPreview
                          content={node.content}
                        />
                      ) : (
                        <div className="text-gray-500 text-center py-8">
                          <p>No content yet. Click Edit to add content.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Edit Mode */}
                  {mode === 'edit' && (
                    <div className="bg-white rounded-lg shadow-sm p-8">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content (Markdown)
                        </label>
                        <textarea
                          value={content || ''}
                          onChange={(e) => setValue('content', e.target.value)}
                          placeholder="# Edit your content here...

Supports **bold**, *italic*, code blocks, tables, and more!"
                          maxLength={50000}
                          className="w-full p-3 border border-gray-200 rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ height: '600px' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Draft Mode */}
                  {mode === 'draft' && (
                    <div className="bg-white rounded-lg shadow-sm p-8">
                      <div className="text-center py-12">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Draft Mode</h3>
                        <p className="text-gray-600 mb-4">
                          View and manage draft versions of this node.
                        </p>
                        <p className="text-sm text-gray-500">
                          Draft functionality coming soon...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Publish Mode */}
                  {mode === 'publish' && (
                    <div className="bg-white rounded-lg shadow-sm p-8">
                      <div className="text-center py-12">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Publish Mode</h3>
                        <p className="text-gray-600 mb-4">
                          Publish this node and make it available to collaborators.
                        </p>
                        <p className="text-sm text-gray-500">
                          Publish functionality coming soon...
                        </p>
                      </div>
                    </div>
                  )}

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
                    onNodeClick={id => router.push(`/spaces/${slug}/node/${id}`)}
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
