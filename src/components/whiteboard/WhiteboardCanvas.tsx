'use client';

/**
 * WhiteboardCanvas - Excalidraw wrapper component with save functionality
 */

import React, { useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import debounce from 'lodash/debounce';

import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import {
  ExcalidrawElement,
  BinaryFileData,
  WhiteboardCanvasProps,
} from '@/types/whiteboard';
import { useWhiteboardStore } from '@/stores/whiteboardStore';
import { useSaveWhiteboard } from '@/hooks/api/useWhiteboardMutations';

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

export function WhiteboardCanvas({
  spaceSlug,
  initialElements = [],
  initialAppState = {},
  initialFiles = {},
  initialNodeMap,
  initialContextNodeId,
  onError,
  readOnly = false,
}: WhiteboardCanvasProps) {
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const existingNodesRef = useRef<Map<string, string>>(initialNodeMap || new Map());
  const contextNodeIdRef = useRef<string | null>(initialContextNodeId || null);

  // Zustand store
  const { setSaving, setError, markSaved } = useWhiteboardStore();

  // Save mutation
  const saveWhiteboard = useSaveWhiteboard(spaceSlug);
  const saveWhiteboardRef = useRef(saveWhiteboard);
  saveWhiteboardRef.current = saveWhiteboard;

  // Debounced save function
  const debouncedSave = useRef(
    debounce(async (elements: ExcalidrawElement[]) => {
      if (readOnly) return;

      try {
        setSaving(true);
        setError(null);

        const result = await saveWhiteboardRef.current.mutateAsync({
          elements,
          existingNodes: existingNodesRef.current,
          contextNodeId: contextNodeIdRef.current,
        });

        // Update refs with new IDs
        existingNodesRef.current = result.nodeMap;
        if (result.contextNodeId) {
          contextNodeIdRef.current = result.contextNodeId;
        }

        markSaved();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save';
        setError(message);
        onError?.(error instanceof Error ? error : new Error(message));
      } finally {
        setSaving(false);
      }
    }, 2000)
  ).current;

  // Handle changes from Excalidraw
  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: any, files: BinaryFileData) => {
      // Only save if there are actual elements (avoid saving on initial load)
      if (elements.length > 0) {
        debouncedSave([...elements] as ExcalidrawElement[]);
      }
    },
    [debouncedSave]
  );

  // Handle API mount
  const handleMount = useCallback((api: ExcalidrawImperativeAPI) => {
    excalidrawAPIRef.current = api;
  }, []);

  return (
    <div className="w-full h-full" style={{ minHeight: '600px' }}>
      <ExcalidrawWrapper
        initialElements={initialElements}
        initialAppState={initialAppState}
        initialFiles={initialFiles}
        onChange={handleChange}
        onMount={handleMount}
        readOnly={readOnly}
      />
    </div>
  );
}

export default WhiteboardCanvas;
