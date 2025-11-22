'use client';

/**
 * WhiteboardCanvas - Excalidraw wrapper component
 * Core component for the whiteboard feature
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import debounce from 'lodash/debounce';

import {
  ExcalidrawElement,
  WhiteboardAppState,
  BinaryFileData,
  WhiteboardCanvasProps,
  WhiteboardNode,
} from '@/types/whiteboard';
import { useWhiteboardStore } from '@/stores/whiteboardStore';
import { useSaveWhiteboard } from '@/hooks/api/useWhiteboardMutations';

// Import Excalidraw styles
import '@excalidraw/excalidraw/index.css';

export function WhiteboardCanvas({
  spaceSlug,
  initialElements = [],
  initialAppState = {},
  initialFiles = {},
  onSave,
  onError,
  readOnly = false,
}: WhiteboardCanvasProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const existingNodesRef = useRef<Map<string, string>>(new Map());

  // Zustand store
  const { setElements, setSaving, setError, markSaved } = useWhiteboardStore();

  // Save mutation
  const saveWhiteboard = useSaveWhiteboard(spaceSlug);

  // Debounced save function
  const debouncedSave = useMemo(
    () =>
      debounce(async (elements: ExcalidrawElement[]) => {
        if (readOnly) return;

        try {
          setSaving(true);
          setError(null);

          await saveWhiteboard.mutateAsync({
            elements,
            existingNodes: existingNodesRef.current,
          });

          markSaved();

          if (onSave && excalidrawAPI) {
            const appState = excalidrawAPI.getAppState();
            onSave(elements, appState as WhiteboardAppState);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to save';
          setError(message);
          onError?.(error instanceof Error ? error : new Error(message));
        } finally {
          setSaving(false);
        }
      }, 2000),
    [spaceSlug, readOnly, saveWhiteboard, setSaving, setError, markSaved, onSave, onError, excalidrawAPI]
  );

  // Handle changes from Excalidraw
  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: any, files: BinaryFileData) => {
      // Update local store
      setElements([...elements] as ExcalidrawElement[]);

      // Trigger debounced save
      debouncedSave([...elements] as ExcalidrawElement[]);
    },
    [setElements, debouncedSave]
  );

  // Update existing nodes map when initial data changes
  const updateExistingNodes = useCallback((nodes: WhiteboardNode[]) => {
    existingNodesRef.current = new Map(
      nodes.map((node) => [
        node.node_details.excalidraw_element.id,
        node.id,
      ])
    );
  }, []);

  // Memoize Excalidraw component to prevent infinite loops
  const ExcalidrawComponent = useMemo(
    () => (
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={{
          elements: initialElements,
          appState: {
            viewBackgroundColor: '#ffffff',
            ...initialAppState,
          },
          files: initialFiles,
        }}
        onChange={handleChange}
        viewModeEnabled={readOnly}
        zenModeEnabled={false}
        gridModeEnabled={false}
        theme="light"
        name="Mujarrad Whiteboard"
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: true,
            clearCanvas: !readOnly,
            export: { saveFileToDisk: true },
            loadScene: !readOnly,
            saveToActiveFile: false,
            toggleTheme: true,
            saveAsImage: true,
          },
        }}
      />
    ),
    [initialElements, initialAppState, initialFiles, handleChange, readOnly]
  );

  return (
    <div className="w-full h-full" style={{ minHeight: '600px' }}>
      {ExcalidrawComponent}
    </div>
  );
}

export default WhiteboardCanvas;
