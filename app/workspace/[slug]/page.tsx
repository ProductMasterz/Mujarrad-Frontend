'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceNodes, useWorkspaceAttributes } from '@/hooks/api';
import { HierarchyNavigator } from '@/components/hierarchy/HierarchyNavigator';
import { GraphVisualization } from '@/components/graph/GraphVisualization';
import { CreateNodeDialog } from '@/components/nodes/CreateNodeDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface WorkspacePageProps {
  params: {
    slug: string;
  };
}

/**
 * Workspace page
 * Main view with hierarchy sidebar and graph/list tabs
 */
export default function WorkspacePage({ params }: WorkspacePageProps) {
  const { slug } = params;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('hierarchy');

  // Fetch workspace data
  const { data: nodes = [], isLoading: nodesLoading } = useWorkspaceNodes(slug);
  const { data: attributes = [], isLoading: attributesLoading } = useWorkspaceAttributes(slug);

  const isLoading = nodesLoading || attributesLoading;

  // Handle node selection - navigate to detail page
  const handleNodeSelect = (nodeId: string) => {
    router.push(`/workspace/${slug}/node/${nodeId}`);
  };

  // Handle wiki-link click - navigate to target node
  const handleWikiLinkClick = (targetTitle: string) => {
    // Find node by title (case-insensitive)
    const targetNode = nodes.find(
      (node) => node.title.toLowerCase() === targetTitle.toLowerCase()
    );

    if (targetNode) {
      router.push(`/workspace/${slug}/node/${targetNode.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar: Hierarchy */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </h2>
          <CreateNodeDialog workspaceSlug={slug} />
        </div>

        {/* Hierarchy Navigator */}
        <div className="flex-1 overflow-auto">
          <HierarchyNavigator
            nodes={nodes}
            attributes={attributes}
            onNodeSelect={handleNodeSelect}
          />
        </div>
      </div>

      {/* Main Content: Tabs */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6">
            <TabsList className="h-12">
              <TabsTrigger value="hierarchy">Hierarchy View</TabsTrigger>
              <TabsTrigger value="graph">Graph View</TabsTrigger>
              <TabsTrigger value="list">Node List</TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {/* Hierarchy Tab - Shows message to use sidebar */}
            <TabsContent value="hierarchy" className="h-full m-0 p-6">
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Use the Sidebar
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Navigate your hierarchy using the tree view on the left sidebar.
                    Click any node to view its details.
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p className="mb-2">💡 <strong>Tips:</strong></p>
                    <ul className="text-left space-y-1 inline-block">
                      <li>• Click the arrow to expand/collapse folders</li>
                      <li>• Click the node title to view details</li>
                      <li>• Use keyboard arrows for navigation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Graph Tab */}
            <TabsContent value="graph" className="h-full m-0">
              <GraphVisualization
                nodes={nodes}
                attributes={attributes}
                onNodeDoubleClick={handleNodeSelect}
              />
            </TabsContent>

            {/* List Tab */}
            <TabsContent value="list" className="h-full m-0 p-6 overflow-auto">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  All Nodes ({nodes.length})
                </h3>
                <div className="space-y-4">
                  {nodes.map((node) => (
                    <div
                      key={node.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleNodeSelect(node.id.toString())}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {node.title}
                            </h4>
                            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                              {node.nodeType}
                            </span>
                          </div>
                          {node.content && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {node.content.substring(0, 150)}
                              {node.content.length > 150 ? '...' : ''}
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          View →
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
