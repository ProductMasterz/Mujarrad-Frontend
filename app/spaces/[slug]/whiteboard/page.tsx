'use client';

/**
 * Whiteboard Page - Route for space whiteboard
 */

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { WhiteboardCanvas, WhiteboardCanvasRef } from '@/components/whiteboard/WhiteboardCanvas';
import { useWhiteboardState } from '@/hooks/api/useWhiteboard';
import { useWhiteboardStore } from '@/stores/whiteboardStore';
import { useSpace } from '@/hooks/api/useSpaces';
import { useNavigationStore } from '@/stores/navigationStore';
import { nodeKeys } from '@/hooks/api/useNodes';
import { nodeService } from '@/services/api/node.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { spaceService } from '@/services/api';

export default function WhiteboardPage() {
  const params = useParams();
  const router = useRouter();
  const spaceSlug = params.slug as string;
  const queryClient = useQueryClient();
  const navigateToWhiteboard = useNavigationStore((state) => state.navigateToWhiteboard);
  const [isResetting, setIsResetting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const canvasRef = useRef<WhiteboardCanvasRef>(null);

  const { data: space, isLoading: spaceLoading, error: spaceError } = useSpace(spaceSlug);

  const { data: allSpaces = [] } = useQuery({queryKey: ['spaces'], queryFn: () => spaceService.getSpaces(),});

  useEffect(() => {
    if (space) {
      navigateToWhiteboard(spaceSlug, space.id);
    }
  }, [space, spaceSlug, navigateToWhiteboard]);

  const handleSave = useCallback(async () => {
    if (canvasRef.current) {
      await canvasRef.current.saveNow();
    }
  }, []);

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

  const handleReset = async () => {
    if (!confirm('Are you sure you want to delete ALL nodes in this space? This cannot be undone.')) {
      return;
    }

    setIsResetting(true);
    try {
      const nodes = await nodeService.getNodes(spaceSlug, { size: 1000 });

      await Promise.all(
        nodes.map((node) => nodeService.deleteNode(spaceSlug, node.id, true))
      );

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

  const {
    elements,
    contextNodeId,
    appState,
    files,
    isLoading: whiteboardLoading,
    isError: whiteboardError,
    error,
  } = useWhiteboardState(spaceSlug);

  const chatAvailableSpaces = useMemo(
    () =>
      (Array.isArray(allSpaces) ? allSpaces : []).map((space) => ({
        id: space.id,
        name: space.name,
        slug: space.slug,
      })),
    [allSpaces]
  );

  const { isSaving, lastSaved, error: saveError, reset } = useWhiteboardStore();

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  if (spaceLoading || whiteboardLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading whiteboard...</p>
        </div>
      </div>
    );
  }

  if (spaceError || whiteboardError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mb-4 text-6xl text-destructive">⚠️</div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Failed to load whiteboard</h2>
          <p className="text-muted-foreground">
            {error?.message || 'An error occurred while loading the whiteboard.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-primary-foreground transition hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mb-4 text-6xl text-muted-foreground">🔍</div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">Space not found</h2>
          <p className="text-muted-foreground">
            The space &quot;{spaceSlug}&quot; does not exist or you don&apos;t have access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/spaces/${spaceSlug}`)}
            className="rounded-md p-2 transition-colors hover:bg-muted"
            title="Back to space"
          >
            <ArrowLeftIcon className="h-5 w-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{space.name} - Whiteboard</h1>
            <p className="text-sm text-muted-foreground">
              {elements.length} element{elements.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isSaving && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
              Saving...
            </span>
          )}

          {!isSaving && lastSaved && (
            <span className="text-sm text-green-600 dark:text-green-400">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}

          {saveError && (
            <span className="text-sm text-destructive">
              {saveError}
            </span>
          )}

          <button
            onClick={() => setChatOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition hover:bg-muted"
            type="button"
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            title="Save (Cmd+S / Ctrl+S)"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="rounded-md p-2 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
            title="Reset workspace (delete all nodes)"
          >
            {isResetting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-red-500" />
            ) : (
              <TrashIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="flex-1 overflow-hidden transition-all duration-300"
        style={{ marginRight: chatOpen ? '620px' : '0' }}
      >
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

      {chatOpen && (
        <div className="fixed right-0 top-16 z-[80] h-[calc(100vh-64px)] w-[620px] overflow-hidden rounded-l-[24px] border-l border-border bg-background shadow-2xl">
          <ChatPanel
            spaceSlug={spaceSlug}
            title="Chat"
            embedded={true}
            onClose={() => setChatOpen(false)}
            availableSpaces={chatAvailableSpaces}
            onChangeSpace={(nextSpaceSlug) => {
              setChatOpen(false);
              router.push(`/spaces/${nextSpaceSlug}/whiteboard`);
            }}
          />
        </div>
      )}
    </div>
  );
}