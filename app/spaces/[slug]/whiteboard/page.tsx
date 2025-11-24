'use client';

/**
 * Whiteboard Page - Route for space whiteboard
 */

import React, { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { WhiteboardCanvas } from '@/components/whiteboard/WhiteboardCanvas';
import { useWhiteboardState, useWhiteboardContext } from '@/hooks/api/useWhiteboard';
import { useWhiteboardStore } from '@/stores/whiteboardStore';
import { useSpace } from '@/hooks/api/useSpaces';
import { WhiteboardNode } from '@/types/whiteboard';

export default function WhiteboardPage() {
  const params = useParams();
  const router = useRouter();
  const spaceSlug = params.slug as string;

  // Fetch space info
  const { data: space, isLoading: spaceLoading, error: spaceError } = useSpace(spaceSlug);

  // Fetch whiteboard state
  const {
    elements,
    nodes,
    isLoading: whiteboardLoading,
    isError: whiteboardError,
    error,
  } = useWhiteboardState(spaceSlug);

  // Fetch whiteboard context node
  const { data: contextNode, isLoading: contextLoading } = useWhiteboardContext(spaceSlug);

  // Store state
  const { isSaving, lastSaved, error: saveError, reset } = useWhiteboardStore();

  // Build mapping of excalidraw element ID -> node ID
  const elementToNodeMap = useMemo(() => {
    const map = new Map<string, string>();
    nodes.forEach((node: WhiteboardNode) => {
      const elementId = node.node_details?.excalidraw_element?.id;
      if (elementId) {
        map.set(elementId, node.id);
      }
    });
    return map;
  }, [nodes]);

  // Reset store on mount/unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Loading state
  if (spaceLoading || whiteboardLoading || contextLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading whiteboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (spaceError || whiteboardError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Failed to load whiteboard</h2>
          <p className="text-gray-600">
            {error?.message || 'An error occurred while loading the whiteboard.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Space not found
  if (!space) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">Space not found</h2>
          <p className="text-gray-600">
            The space &quot;{spaceSlug}&quot; does not exist or you don&apos;t have access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/spaces/${spaceSlug}`)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Back to space"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">{space.name} - Whiteboard</h1>
            <p className="text-sm text-gray-500">
              {elements.length} element{elements.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Save status indicator */}
          {isSaving && (
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
              Saving...
            </span>
          )}
          {!isSaving && lastSaved && (
            <span className="text-sm text-green-600">
              ✓ Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {saveError && (
            <span className="text-sm text-red-500">
              ⚠️ {saveError}
            </span>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <WhiteboardCanvas
          spaceSlug={spaceSlug}
          initialElements={elements}
          initialNodeMap={elementToNodeMap}
          initialContextNodeId={contextNode?.id || null}
          onError={(err) => console.error('Whiteboard error:', err)}
        />
      </div>
    </div>
  );
}
