'use client';

/**
 * Whiteboard Page - Route for space whiteboard
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { WhiteboardCanvas, WhiteboardCanvasRef } from '@/components/whiteboard/WhiteboardCanvas';
import { useWhiteboardState } from '@/hooks/api/useWhiteboard';
import { useWhiteboardStore } from '@/stores/whiteboardStore';
import { useSpace } from '@/hooks/api/useSpaces';
import { useNavigationStore } from '@/stores/navigationStore';
import { nodeKeys } from '@/hooks/api/useNodes';
import { nodeService } from '@/services/api/node.service';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function WhiteboardPage() {
  const params = useParams();
  const router = useRouter();
  const spaceSlug = params.slug as string;
  const queryClient = useQueryClient();
  const navigateToWhiteboard = useNavigationStore((state) => state.navigateToWhiteboard);
  const [isResetting, setIsResetting] = useState(false);
  const canvasRef = useRef<WhiteboardCanvasRef>(null);

  // Fetch space info
  const { data: space, isLoading: spaceLoading, error: spaceError } = useSpace(spaceSlug);

  // Set navigation scope when space loads
  useEffect(() => {
    if (space) {
      navigateToWhiteboard(spaceSlug, space.id);
    }
  }, [space, spaceSlug, navigateToWhiteboard]);

  // Handle manual save
  const handleSave = useCallback(async () => {
    if (canvasRef.current) {
      await canvasRef.current.saveNow();
    }
  }, []);

  // Keyboard shortcut for save (Cmd+S / Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Reset workspace - delete all nodes
  const handleReset = async () => {
    if (!confirm('Are you sure you want to delete ALL nodes in this space? This cannot be undone.')) {
      return;
    }

    setIsResetting(true);
    try {
      // Get all nodes
      const nodes = await nodeService.getNodes(spaceSlug, { size: 1000 });

      // Delete all nodes
      await Promise.all(nodes.map(node =>
        nodeService.deleteNode(spaceSlug, node.id, true)
      ));

      // Invalidate queries and reload
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug] });
      queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset workspace:', error);
      alert('Failed to reset workspace');
    } finally {
      setIsResetting(false);
    }
  };

  // Fetch whiteboard state from context node
  const {
    elements,
    contextNodeId,
    appState,
    files,
    isLoading: whiteboardLoading,
    isError: whiteboardError,
    error,
  } = useWhiteboardState(spaceSlug);

  // Store state
  const { isSaving, lastSaved, error: saveError, reset } = useWhiteboardStore();

  // Reset store on mount/unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Loading state
  if (spaceLoading || whiteboardLoading) {
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
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {saveError && (
            <span className="text-sm text-red-500">
              {saveError}
            </span>
          )}
          {/* Manual Save button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            title="Save (Cmd+S / Ctrl+S)"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          {/* Reset button */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="p-2 hover:bg-red-100 rounded-md transition-colors text-red-600 disabled:opacity-50"
            title="Reset workspace (delete all nodes)"
          >
            {isResetting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500" />
            ) : (
              <TrashIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <WhiteboardCanvas
          ref={canvasRef}
          spaceSlug={spaceSlug}
          initialElements={elements}
          initialAppState={appState}
          initialFiles={files}
          initialContextNodeId={contextNodeId}
          onError={(err) => console.error('Whiteboard error:', err)}
        />
      </div>
    </div>
  );
}
