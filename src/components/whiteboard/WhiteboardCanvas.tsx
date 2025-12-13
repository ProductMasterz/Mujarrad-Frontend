'use client';

/**
 * WhiteboardCanvas - Excalidraw wrapper component with save functionality
 */

import React, { useCallback, useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import debounce from 'lodash/debounce';

import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import {
  ExcalidrawElement,
  BinaryFileData,
  WhiteboardCanvasProps,
} from '@/types/whiteboard';
import { useWhiteboardStore } from '@/stores/whiteboardStore';
import { useSaveWhiteboard } from '@/hooks/api/useWhiteboardMutations';
import { useUpdateNode } from '@/hooks/api/useUpdateNode';
import { WhiteboardContextMenu } from './WhiteboardContextMenu';

/**
 * Ref handle for WhiteboardCanvas - exposed methods
 */
export interface WhiteboardCanvasRef {
  saveNow: () => Promise<void>;
}

// Dynamic import of the wrapper to avoid SSR issues
const ExcalidrawWrapper = dynamic(
  () => import('./ExcalidrawWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }
);

export const WhiteboardCanvas = forwardRef<WhiteboardCanvasRef, WhiteboardCanvasProps>(
  function WhiteboardCanvas(
    {
      spaceSlug,
      initialElements = [],
      initialAppState = {},
      initialFiles = {},
      initialNodeMap,
      initialContextNodeId,
      onError,
      readOnly = false,
    },
    ref
  ) {
    const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
    const existingNodesRef = useRef<Map<string, string>>(initialNodeMap || new Map());
    const contextNodeIdRef = useRef<string | null>(initialContextNodeId || null);
    const isSavingRef = useRef<boolean>(false);
    const isMountedRef = useRef<boolean>(true);
    const lastElementsRef = useRef<ExcalidrawElement[]>(initialElements);
    const lastAppStateRef = useRef<any>(initialAppState);
    const lastFilesRef = useRef<Record<string, BinaryFileData>>(initialFiles || {});

    // Sync refs when props change to prevent stale data
    useEffect(() => {
      if (initialNodeMap) {
        existingNodesRef.current = initialNodeMap;
      }
    }, [initialNodeMap]);

    useEffect(() => {
      if (initialContextNodeId) {
        contextNodeIdRef.current = initialContextNodeId;
      }
    }, [initialContextNodeId]);

    // Cleanup on unmount - cancel pending saves to prevent stale data saves
    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
        // Note: debouncedSave.cancel() is called in the debounced save's cleanup
      };
    }, []);

    // Context menu state
    const [contextMenu, setContextMenu] = useState<{
      elementId: string;
      x: number;
      y: number;
    } | null>(null);

    // Zustand store
    const { setSaving, setError, markSaved } = useWhiteboardStore();

    // Update node mutation (for promoting to space list)
    const updateNode = useUpdateNode();

    // Save mutation
    const saveWhiteboard = useSaveWhiteboard(spaceSlug);
    const saveWhiteboardRef = useRef(saveWhiteboard);
    saveWhiteboardRef.current = saveWhiteboard;

    // Internal save function (used by both debounced and immediate save)
    const performSave = useCallback(async (
      elements: ExcalidrawElement[],
      appState: any,
      files: Record<string, BinaryFileData>
    ) => {
      if (readOnly) return;

      // Don't save if component has unmounted (prevents stale saves after navigation)
      if (!isMountedRef.current) {
        console.log('[WhiteboardCanvas] Component unmounted, skipping save');
        return;
      }

      // Prevent concurrent saves
      if (isSavingRef.current) {
        console.log('[WhiteboardCanvas] Save already in progress, skipping');
        return;
      }

      console.log('[WhiteboardCanvas] Saving whiteboard...', {
        elementCount: elements.length,
        contextNodeId: contextNodeIdRef.current,
        existingNodesCount: existingNodesRef.current.size,
      });

      try {
        isSavingRef.current = true;
        setSaving(true);
        setError(null);

        const result = await saveWhiteboardRef.current.mutateAsync({
          elements,
          existingNodes: existingNodesRef.current,
          contextNodeId: contextNodeIdRef.current,
          appState: appState ? {
            viewBackgroundColor: appState.viewBackgroundColor,
            zoom: appState.zoom,
            scrollX: appState.scrollX,
            scrollY: appState.scrollY,
          } : undefined,
          files,
        });

        // Update refs with new IDs
        existingNodesRef.current = result.nodeMap;
        if (result.contextNodeId) {
          contextNodeIdRef.current = result.contextNodeId;
        }

        console.log('[WhiteboardCanvas] Save successful!', {
          nodeMapSize: result.nodeMap.size,
          contextNodeId: result.contextNodeId,
        });

        markSaved();
      } catch (error) {
        console.error('[WhiteboardCanvas] Save failed:', error);
        const message = error instanceof Error ? error.message : 'Failed to save';
        setError(message);
        onError?.(error instanceof Error ? error : new Error(message));
      } finally {
        isSavingRef.current = false;
        setSaving(false);
      }
    }, [readOnly, setSaving, setError, markSaved, onError]);

    // Debounced save function
    const debouncedSave = useRef(
      debounce((elements: ExcalidrawElement[], appState: any, files: Record<string, BinaryFileData>) => {
        performSave(elements, appState, files);
      }, 2000)
    ).current;

    // Cleanup debounced save on unmount to prevent stale saves after navigation
    useEffect(() => {
      return () => {
        debouncedSave.cancel();
        console.log('[WhiteboardCanvas] Cancelled pending saves on unmount');
      };
    }, [debouncedSave]);

    // Expose saveNow method via ref
    useImperativeHandle(ref, () => ({
      saveNow: async () => {
        // Cancel any pending debounced save
        debouncedSave.cancel();
        // Perform immediate save with current state
        await performSave(lastElementsRef.current, lastAppStateRef.current, lastFilesRef.current);
      },
    }), [debouncedSave, performSave]);

    // Handle changes from Excalidraw
    const handleChange = useCallback(
      (elements: readonly ExcalidrawElement[], appState: any, files: Record<string, BinaryFileData>) => {
        // Store current state for immediate save
        lastElementsRef.current = [...elements] as ExcalidrawElement[];
        lastAppStateRef.current = appState;
        lastFilesRef.current = files;

        // Only save if there are actual elements (avoid saving on initial load)
        if (elements.length > 0) {
          debouncedSave([...elements] as ExcalidrawElement[], appState, files);
        }
      },
      [debouncedSave]
    );

    // Handle API mount
    const handleMount = useCallback((api: ExcalidrawImperativeAPI) => {
      excalidrawAPIRef.current = api;
    }, []);

    // Handle context menu open
    const handleContextMenu = useCallback((elementId: string, x: number, y: number) => {
      setContextMenu({ elementId, x, y });
    }, []);

    // Handle "Show in Space List" action
    const handleShowInSpaceList = useCallback(async () => {
      if (!contextMenu) return;

      // Find the node ID for this element
      const nodeId = existingNodesRef.current.get(contextMenu.elementId);
      if (!nodeId) {
        console.warn('[WhiteboardCanvas] No node found for element:', contextMenu.elementId);
        return;
      }

      try {
        await updateNode.mutateAsync({
          spaceSlug,
          nodeId,
          data: {
            nodeDetails: {
              showInSpaceList: true,
            },
          },
        });
        console.log('[WhiteboardCanvas] Promoted element to space list:', nodeId);
      } catch (error) {
        console.error('[WhiteboardCanvas] Failed to promote element:', error);
        onError?.(error instanceof Error ? error : new Error('Failed to promote element'));
      }
    }, [contextMenu, spaceSlug, updateNode, onError]);

    return (
      <div className="w-full h-full" style={{ minHeight: '600px' }}>
        <ExcalidrawWrapper
          initialElements={initialElements}
          initialAppState={initialAppState}
          initialFiles={initialFiles}
          onChange={handleChange}
          onMount={handleMount}
          onContextMenu={handleContextMenu}
          readOnly={readOnly}
        />
        {/* Custom context menu */}
        {contextMenu && (
          <WhiteboardContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onShowInSpaceList={handleShowInSpaceList}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>
    );
  }
);

export default WhiteboardCanvas;
