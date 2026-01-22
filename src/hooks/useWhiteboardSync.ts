/**
 * React hook for subscribing to whiteboard sync events
 */

import { useEffect, useCallback, useRef, MutableRefObject } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { whiteboardSyncService } from '@/services/whiteboardSyncService';
import { useWhiteboardStore } from '@/stores/whiteboardStore';
import { SyncOperation, SyncStatus, ExcalidrawElement } from '@/types/whiteboard';

interface UseWhiteboardSyncOptions {
  spaceSlug?: string;
  excalidrawAPIRef?: MutableRefObject<ExcalidrawImperativeAPI | null>;
  onSyncStart?: () => void;
  onSyncComplete?: () => void;
  onSyncError?: (error: string) => void;
  onNodeCreated?: (nodeId: string) => void;
  onNodeUpdated?: (nodeId: string) => void;
  onNodeDeleted?: (nodeId: string) => void;
  onFrameCreated?: (frameId: string, nodeId?: string) => void;
  onFrameUpdated?: (frameId: string) => void;
  onFrameDeleted?: (frameId: string) => void;
}

// Generate unique ID for elements
function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Find an available position for a new frame (avoid overlapping)
function findAvailablePosition(
  elements: readonly ExcalidrawElement[],
  width: number = 150,
  height: number = 60
): { x: number; y: number } {
  const padding = 20;
  const startX = 100;
  const startY = 100;
  const gridSize = width + padding;

  // Get all non-deleted element bounds
  const existingBounds = elements
    .filter((el) => !el.isDeleted && el.type !== 'text')
    .map((el) => ({
      left: el.x,
      right: el.x + el.width,
      top: el.y,
      bottom: el.y + el.height,
    }));

  // Try positions in a grid pattern
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      const x = startX + col * gridSize;
      const y = startY + row * (height + padding);

      // Check if this position overlaps with any existing element
      const overlaps = existingBounds.some(
        (bounds) =>
          x < bounds.right + padding &&
          x + width > bounds.left - padding &&
          y < bounds.bottom + padding &&
          y + height > bounds.top - padding
      );

      if (!overlaps) {
        return { x, y };
      }
    }
  }

  // Fallback: place at bottom of existing elements
  const maxY = existingBounds.reduce(
    (max, b) => Math.max(max, b.bottom),
    startY
  );
  return { x: startX, y: maxY + padding };
}

// Create a rectangle with bound text for a node
function createFrameForNode(
  nodeId: string,
  title: string,
  x: number,
  y: number
): ExcalidrawElement[] {
  const rectId = generateId();
  const textId = generateId();
  const now = Date.now();

  const rectangle: ExcalidrawElement = {
    id: rectId,
    type: 'rectangle',
    x: x,
    y: y,
    width: 150,
    height: 60,
    angle: 0,
    strokeColor: '#1e1e1e',
    backgroundColor: '#e7f5ff', // Light blue to indicate it's linked
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    version: 1,
    versionNonce: now,
    isDeleted: false,
    boundElements: [{ id: textId, type: 'text' }],
    customData: { nodeId }, // Link to the node
  };

  const text: ExcalidrawElement = {
    id: textId,
    type: 'text',
    x: x,
    y: y + 20,
    width: 150,
    height: 20,
    angle: 0,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    version: 1,
    versionNonce: now + 1,
    isDeleted: false,
    boundElements: null,
    containerId: rectId,
    text: title,
    fontSize: 16,
    fontFamily: 2,
    textAlign: 'center',
    verticalAlign: 'middle',
  };

  return [rectangle, text];
}

interface UseWhiteboardSyncReturn {
  syncStatus: SyncStatus;
  lastSyncError: string | null;
  lastSyncTime: Date | null;
  isFrameLinked: (frameId: string) => boolean;
  isNodeLinked: (nodeId: string) => boolean;
  getLinkedNodeId: (frameId: string) => string | null;
  getLinkedFrameId: (nodeId: string) => string | null;
  linkFrameToNode: (frameId: string, nodeId: string) => void;
  unlinkFrame: (frameId: string) => void;
}

export function useWhiteboardSync(
  options: UseWhiteboardSyncOptions = {}
): UseWhiteboardSyncReturn {
  const queryClient = useQueryClient();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Subscribe to store state
  const syncStatus = useWhiteboardStore((state) => state.syncStatus);
  const lastSyncError = useWhiteboardStore((state) => state.lastSyncError);
  const lastSyncTime = useWhiteboardStore((state) => state.lastSyncTime);

  // Handle sync events
  const handleSyncEvent = useCallback(
    (operation: SyncOperation) => {
      const opts = optionsRef.current;

      switch (operation.type) {
        case 'node_created':
          if (operation.nodeId && opts.onNodeCreated) {
            opts.onNodeCreated(operation.nodeId);
          }
          // Invalidate node queries
          if (opts.spaceSlug) {
            queryClient.invalidateQueries({
              queryKey: ['nodes', opts.spaceSlug],
            });
          }
          break;

        case 'node_updated':
          if (operation.nodeId && opts.onNodeUpdated) {
            opts.onNodeUpdated(operation.nodeId);
          }
          if (operation.nodeId) {
            queryClient.invalidateQueries({
              queryKey: ['node', operation.nodeId],
            });
          }
          break;

        case 'node_deleted':
          if (operation.nodeId && opts.onNodeDeleted) {
            opts.onNodeDeleted(operation.nodeId);
          }
          if (opts.spaceSlug) {
            queryClient.invalidateQueries({
              queryKey: ['nodes', opts.spaceSlug],
            });
          }
          break;

        case 'frame_created':
          if (operation.frameId && opts.onFrameCreated) {
            opts.onFrameCreated(operation.frameId, operation.nodeId);
          }
          break;

        case 'frame_updated':
          if (operation.frameId && opts.onFrameUpdated) {
            opts.onFrameUpdated(operation.frameId);
          }
          break;

        case 'frame_deleted':
          if (operation.frameId && opts.onFrameDeleted) {
            opts.onFrameDeleted(operation.frameId);
          }
          break;
      }
    },
    [queryClient]
  );

  // Frame creation handler
  const handleCreateFrame = useCallback(
    async (nodeId: string, title: string): Promise<string | null> => {
      const api = optionsRef.current.excalidrawAPIRef?.current;
      if (!api) {
        console.log('[useWhiteboardSync] No Excalidraw API, cannot create frame');
        return null;
      }

      const elements = api.getSceneElements() as unknown as readonly ExcalidrawElement[];
      const position = findAvailablePosition(elements);
      const newElements = createFrameForNode(nodeId, title, position.x, position.y);

      api.updateScene({
        elements: [...elements, ...newElements] as any,
      });

      return newElements[0].id; // Return the rectangle ID
    },
    []
  );

  // Frame update handler
  const handleUpdateFrame = useCallback(
    async (frameId: string, title: string): Promise<void> => {
      const api = optionsRef.current.excalidrawAPIRef?.current;
      if (!api) return;

      const elements = api.getSceneElements();
      const frame = elements.find((el: any) => el.id === frameId);
      if (!frame || frame.isDeleted) return;

      // Find the bound text element
      const textElement = elements.find(
        (el: any) => el.type === 'text' && el.containerId === frameId
      );
      if (!textElement) return;

      // Update the text
      const updatedElements = elements.map((el: any) => {
        if (el.id === textElement.id) {
          return {
            ...el,
            text: title,
            version: el.version + 1,
            versionNonce: Date.now(),
          };
        }
        return el;
      });

      api.updateScene({
        elements: updatedElements as any,
      });
    },
    []
  );

  // Frame deletion handler
  const handleDeleteFrame = useCallback(async (frameId: string): Promise<void> => {
    const api = optionsRef.current.excalidrawAPIRef?.current;
    if (!api) return;

    const elements = api.getSceneElements();

    // Mark the frame and its bound text as deleted
    const updatedElements = elements.map((el: any) => {
      if (el.id === frameId || el.containerId === frameId) {
        return {
          ...el,
          isDeleted: true,
          version: el.version + 1,
          versionNonce: Date.now(),
        };
      }
      return el;
    });

    api.updateScene({
      elements: updatedElements as any,
    });
  }, []);

  // Subscribe to sync service
  useEffect(() => {
    const unsubscribe = whiteboardSyncService.subscribe(handleSyncEvent);

    // Refresh maps when mounting
    whiteboardSyncService.refreshMapsFromStore();

    return () => {
      unsubscribe();
    };
  }, [handleSyncEvent]);

  // Register frame handlers when excalidraw API is available
  useEffect(() => {
    if (!options.excalidrawAPIRef) return;

    const unregister = whiteboardSyncService.registerFrameHandlers(
      handleCreateFrame,
      handleUpdateFrame,
      handleDeleteFrame
    );

    return () => {
      unregister();
    };
  }, [options.excalidrawAPIRef, handleCreateFrame, handleUpdateFrame, handleDeleteFrame]);

  // Watch sync status changes
  useEffect(() => {
    const opts = optionsRef.current;

    if (syncStatus === 'syncing' && opts.onSyncStart) {
      opts.onSyncStart();
    } else if (syncStatus === 'idle' && opts.onSyncComplete) {
      opts.onSyncComplete();
    } else if (syncStatus === 'error' && lastSyncError && opts.onSyncError) {
      opts.onSyncError(lastSyncError);
    }
  }, [syncStatus, lastSyncError]);

  // Return utility functions
  return {
    syncStatus,
    lastSyncError,
    lastSyncTime,
    isFrameLinked: useCallback(
      (frameId: string) => whiteboardSyncService.isFrameLinked(frameId),
      []
    ),
    isNodeLinked: useCallback(
      (nodeId: string) => whiteboardSyncService.isNodeLinked(nodeId),
      []
    ),
    getLinkedNodeId: useCallback(
      (frameId: string) => whiteboardSyncService.getLinkedNodeId(frameId),
      []
    ),
    getLinkedFrameId: useCallback(
      (nodeId: string) => whiteboardSyncService.getLinkedFrameId(nodeId),
      []
    ),
    linkFrameToNode: useCallback(
      (frameId: string, nodeId: string) =>
        whiteboardSyncService.linkFrameToNode(frameId, nodeId),
      []
    ),
    unlinkFrame: useCallback(
      (frameId: string) => whiteboardSyncService.unlinkFrame(frameId),
      []
    ),
  };
}

export default useWhiteboardSync;
