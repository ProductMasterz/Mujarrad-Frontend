'use client';

import { useState } from 'react';
import type { Node } from '@/types/backend-dtos';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { EditNodeDialog } from './EditNodeDialog';
import { Badge } from '@/components/ui/badge';

interface NodeDetailViewProps {
  node: Node;
  spaceSlug: string;
  availableNodes: Node[];
  onWikiLinkClick?: (target: string) => void;
}

/**
 * NodeDetailView component
 * Displays node details with markdown content and metadata
 */
export function NodeDetailView({
  node,
  spaceSlug,
  availableNodes,
  onWikiLinkClick,
}: NodeDetailViewProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Format dates
  const createdAt = new Date(node.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const updatedAt = new Date(node.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get node type color
  const getNodeTypeColor = (nodeType: string) => {
    switch (nodeType.toUpperCase()) {
      case 'CONTEXT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'ASSUMPTION':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header with title and metadata */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {node.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Badge className={getNodeTypeColor(node.nodeType)}>
                  {node.nodeType}
                </Badge>
                <span>•</span>
                <span>Created {createdAt}</span>
                <span>•</span>
                <span>Updated {updatedAt}</span>
                <span>•</span>
                <span className="text-xs">v{node.version}</span>
              </div>
            </div>
            <Button onClick={() => setIsEditDialogOpen(true)}>
              Edit Node
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            {node.content ? (
              <MarkdownRenderer
                content={node.content}
                spaceSlug={spaceSlug}
                availableNodes={availableNodes}
                onWikiLinkClick={onWikiLinkClick}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  This node has no content yet.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  Add Content
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditNodeDialog
        spaceSlug={spaceSlug}
        nodeId={node.id}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
