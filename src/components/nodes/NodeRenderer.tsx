'use client';

/**
 * NodeRenderer - Dispatches to the correct view based on node capabilities
 *
 * This component solves the "Node Identity Problem" by rendering nodes
 * appropriately based on their properties, not a fixed type.
 *
 * A node can be:
 * - A whiteboard shape (has element_subtype)
 * - A block in a page (has blockType)
 * - A page with blocks (REGULAR node)
 * - A whiteboard context (CONTEXT with whiteboard_context)
 * - A folder (CONTEXT without whiteboard_context)
 *
 * These are NOT mutually exclusive - the same node can be all of these.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BlockEditor } from '@/components/blocks';
import {
  inferNodeCapabilities,
  determinePreferredView,
  PreferredView,
  ExtendedNodeDetails,
} from '@/types/node-system';
import type { Node, NodeType } from '@/types/backend-dtos';

// Icons
import {
  LayoutDashboard,
  FileText,
  Shapes,
  ExternalLink,
} from 'lucide-react';

interface NodeRendererProps {
  node: Node;
  spaceSlug: string;
  spaceId: string;
}

/**
 * Main dispatcher component
 */
export function NodeRenderer({ node, spaceSlug, spaceId }: NodeRendererProps) {
  const nodeDetails = node.nodeDetails as ExtendedNodeDetails | undefined;
  const capabilities = inferNodeCapabilities(
    node.nodeType,
    nodeDetails,
    node.content
  );
  const preferredView = determinePreferredView(
    node.nodeType,
    nodeDetails,
    node.content
  );

  // Render based on preferred view
  switch (preferredView) {
    case PreferredView.WHITEBOARD:
      if (capabilities.isWhiteboardContext) {
        return (
          <WhiteboardContextView
            node={node}
            spaceSlug={spaceSlug}
          />
        );
      }
      if (capabilities.canRenderAsWhiteboardShape) {
        return (
          <WhiteboardShapeView
            node={node}
            spaceSlug={spaceSlug}
            spaceId={spaceId}
          />
        );
      }
      // Fallback to page editor
      return <BlockEditor pageId={node.id} spaceSlug={spaceSlug} spaceId={spaceId} />;

    case PreferredView.MARKDOWN:
      return (
        <MarkdownView
          node={node}
          spaceSlug={spaceSlug}
          spaceId={spaceId}
        />
      );

    case PreferredView.PAGE_EDITOR:
    case PreferredView.AUTO:
    default:
      return <BlockEditor pageId={node.id} spaceSlug={spaceSlug} spaceId={spaceId} />;
  }
}

/**
 * View for CONTEXT nodes that store whiteboard data
 */
interface WhiteboardContextViewProps {
  node: Node;
  spaceSlug: string;
}

function WhiteboardContextView({ node, spaceSlug }: WhiteboardContextViewProps) {
  const router = useRouter();
  const nodeDetails = node.nodeDetails as ExtendedNodeDetails | undefined;
  const elementCount = nodeDetails?.whiteboard_context?.element_count || 0;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      {/* Whiteboard Icon */}
      <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6">
        <LayoutDashboard className="w-12 h-12 text-blue-500" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Whiteboard Canvas
      </h2>

      {/* Description */}
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-2">
        This is a whiteboard context node that stores canvas data.
        {elementCount > 0 && (
          <span className="block mt-1">
            Contains {elementCount} element{elementCount !== 1 ? 's' : ''}.
          </span>
        )}
      </p>

      {/* Content Preview (if any) */}
      {node.content && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-lg w-full">
          <p className="text-xs text-gray-400 mb-2">Raw content (JSON):</p>
          <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-auto max-h-32">
            {node.content.substring(0, 500)}
            {node.content.length > 500 && '...'}
          </pre>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <Button
          onClick={() => router.push(`/spaces/${spaceSlug}/whiteboard`)}
          className="gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Whiteboard
        </Button>
      </div>
    </div>
  );
}

/**
 * View for nodes that are whiteboard shapes
 */
interface WhiteboardShapeViewProps {
  node: Node;
  spaceSlug: string;
  spaceId: string;
}

function WhiteboardShapeView({ node, spaceSlug, spaceId }: WhiteboardShapeViewProps) {
  const router = useRouter();
  const nodeDetails = node.nodeDetails as ExtendedNodeDetails | undefined;
  const shapeType = nodeDetails?.element_subtype || 'shape';
  const hasBlockContent = !!nodeDetails?.blockType;

  return (
    <div className="space-y-6">
      {/* Shape Info Banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Shapes className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              This is a whiteboard {shapeType}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              You can view this element on the whiteboard or edit its content below.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/spaces/${spaceSlug}/whiteboard?element=${node.id}`)}
            className="gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            View on Whiteboard
          </Button>
        </div>
      </div>

      {/* Page Content - Can still have blocks */}
      {hasBlockContent ? (
        <BlockEditor pageId={node.id} spaceSlug={spaceSlug} spaceId={spaceId} />
      ) : (
        <div className="py-8">
          <BlockEditor pageId={node.id} spaceSlug={spaceSlug} spaceId={spaceId} />
        </div>
      )}
    </div>
  );
}

/**
 * Simple markdown view for nodes with just markdown content
 */
interface MarkdownViewProps {
  node: Node;
  spaceSlug: string;
  spaceId: string;
}

function MarkdownView({ node, spaceSlug, spaceId }: MarkdownViewProps) {
  const hasContent = !!node.content;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This node has markdown content. You can edit it using the block editor below.
            </p>
          </div>
        </div>
      </div>

      {/* Show raw content if exists */}
      {hasContent && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-400 mb-2">Markdown content:</p>
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {node.content}
          </pre>
        </div>
      )}

      {/* Block Editor for adding structured content */}
      <BlockEditor pageId={node.id} spaceSlug={spaceSlug} spaceId={spaceId} />
    </div>
  );
}

export default NodeRenderer;
