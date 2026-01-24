'use client';

/**
 * WhiteboardCanvas - Excalidraw wrapper with simplified single-PUT persistence
 */

import React, { useCallback, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
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
import { whiteboardService } from '@/services/api/whiteboard.service';
import { diffArrows } from '@/lib/whiteboard/arrowDiff';
import { syncArrowAttributes, SyncedArrowsMap } from '@/lib/whiteboard/arrowSync';
import { SyncStatusIndicator } from './SyncStatusIndicator';

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
      initialContextNodeId,
      onError,
      readOnly = false,
    },
    ref
  ) {
    const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
    const contextNodeIdRef = useRef<string | null>(initialContextNodeId || null);
    const isSavingRef = useRef<boolean>(false);
    const isMountedRef = useRef<boolean>(true);
    const lastStateRef = useRef<{
      elements: ExcalidrawElement[];
      appState: any;
      files: Record<string, BinaryFileData>;
    }>({ elements: initialElements, appState: initialAppState, files: initialFiles || {} });
    const pendingSaveRef = useRef<boolean>(false);
    const previousElementsRef = useRef<ExcalidrawElement[]>(initialElements);
    const syncedArrowsRef = useRef<SyncedArrowsMap>(new Map());

    // Sync contextNodeId ref when prop changes
    useEffect(() => {
      if (initialContextNodeId) {
        contextNodeIdRef.current = initialContextNodeId;
      }
    }, [initialContextNodeId]);

    // Cleanup on unmount
    useEffect(() => {
      isMountedRef.current = true;
      return () => { isMountedRef.current = false; };
    }, []);

    // Hydrate syncedArrowsRef on load — match existing attributes to arrows
    useEffect(() => {
      if (!initialElements.length || !initialContextNodeId) return;

      const hydrateArrows = async () => {
        try {
          const { attributeService } = await import('@/services/api/attribute.service');
          // Fetch all connects_to attributes in the space
          const spaceAttrs = await attributeService.getSpaceAttributes(spaceSlug);
          const connectsToAttrs = spaceAttrs.filter(a => a.attributeType === 'connects_to');

          for (const attr of connectsToAttrs) {
            const elementId = (attr.attributeValue as any)?.excalidraw_element_id;
            if (elementId) {
              syncedArrowsRef.current.set(elementId, attr.id);
            }
          }
        } catch {
          // Non-critical — worst case we re-create attributes on next save
        }
      };

      hydrateArrows();
    }, [spaceSlug, initialContextNodeId, initialElements.length]);

    // Zustand store
    const { setSaving, setError, markSaved } = useWhiteboardStore();

    // Save mutation
    const saveWhiteboard = useSaveWhiteboard(spaceSlug);
    const saveWhiteboardRef = useRef(saveWhiteboard);
    saveWhiteboardRef.current = saveWhiteboard;

    // Internal save function — single atomic PUT
    const performSave = useCallback(async () => {
      if (readOnly || !isMountedRef.current) return;

      // Prevent concurrent saves
      if (isSavingRef.current) {
        pendingSaveRef.current = true;
        return;
      }

      const { elements, appState, files } = lastStateRef.current;

      try {
        isSavingRef.current = true;
        setSaving(true);
        setError(null);

        const result = await saveWhiteboardRef.current.mutateAsync({
          elements,
          contextNodeId: contextNodeIdRef.current,
          appState: appState ? {
            viewBackgroundColor: appState.viewBackgroundColor,
            zoom: appState.zoom,
            scrollX: appState.scrollX,
            scrollY: appState.scrollY,
          } : undefined,
          files,
        });

        // Cache context node ID for subsequent saves
        if (result.contextNodeId) {
          contextNodeIdRef.current = result.contextNodeId;
        }

        markSaved();

        // Arrow-to-attribute sync (post-save, best-effort)
        try {
          const arrowDiff = diffArrows(previousElementsRef.current, elements);
          const hasChanges = arrowDiff.added.length > 0 || arrowDiff.removed.length > 0 || arrowDiff.changed.length > 0 || arrowDiff.labelChanged.length > 0;

          if (hasChanges) {
            const syncResult = await syncArrowAttributes(
              spaceSlug,
              arrowDiff,
              elements,
              syncedArrowsRef.current
            );

            // Update elements with newly promoted node IDs
            if (syncResult.promoted.size > 0) {
              const updatedElements = lastStateRef.current.elements.map(el => {
                const nodeId = syncResult.promoted.get(el.id);
                if (nodeId) {
                  return { ...el, customData: { ...el.customData, nodeId } };
                }
                return el;
              });
              lastStateRef.current.elements = updatedElements;
            }
          }

          previousElementsRef.current = [...elements];
        } catch {
          // Arrow sync failures are non-blocking — retry on next save
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save';
        setError(message);
        onError?.(error instanceof Error ? error : new Error(message));
      } finally {
        isSavingRef.current = false;
        setSaving(false);

        // If a save was deferred, retry with latest state
        if (pendingSaveRef.current && isMountedRef.current) {
          pendingSaveRef.current = false;
          setTimeout(() => { if (isMountedRef.current) performSave(); }, 100);
        }
      }
    }, [readOnly, setSaving, setError, markSaved, onError]);

    // Debounced save — 3 seconds
    const debouncedSave = useRef(
      debounce(() => { performSave(); }, 3000)
    ).current;

    // Cancel on unmount
    useEffect(() => {
      return () => { debouncedSave.cancel(); };
    }, [debouncedSave]);

    // Expose saveNow method via ref
    useImperativeHandle(ref, () => ({
      saveNow: async () => {
        debouncedSave.cancel();
        await performSave();
      },
    }), [debouncedSave, performSave]);

    // Handle changes from Excalidraw
    const handleChange = useCallback(
      (elements: readonly ExcalidrawElement[], appState: any, files: Record<string, BinaryFileData>) => {
        lastStateRef.current = {
          elements: [...elements] as ExcalidrawElement[],
          appState,
          files,
        };

        if (elements.length > 0) {
          debouncedSave();
        }
      },
      [debouncedSave]
    );

    // Handle API mount
    const handleMount = useCallback((api: ExcalidrawImperativeAPI) => {
      excalidrawAPIRef.current = api;
    }, []);

    // Handle "Show in Space List" — lazy node creation
    const handleShowInSpaceList = useCallback(async (elementId: string) => {
      const { elements } = lastStateRef.current;
      const element = elements.find(el => el.id === elementId);
      if (!element) return;

      // If already linked, just update showInSpaceList
      const existingNodeId = element.customData?.nodeId;
      if (existingNodeId) {
        try {
          // Update the existing node to show in space list
          const { apiClient } = await import('@/services/api/client');
          await apiClient.put(`/spaces/${spaceSlug}/nodes/${existingNodeId}`, {
            nodeDetails: { showInSpaceList: true },
          });
        } catch (error) {
          onError?.(error instanceof Error ? error : new Error('Failed to promote element'));
        }
        return;
      }

      // Create a new node for this shape
      const title = element.text || element.type.charAt(0).toUpperCase() + element.type.slice(1);
      try {
        const node = await whiteboardService.createShapeNode(spaceSlug, title);

        // Store nodeId in element's customData
        const updatedElements = lastStateRef.current.elements.map(el =>
          el.id === elementId
            ? { ...el, customData: { ...el.customData, nodeId: node.id } }
            : el
        );
        lastStateRef.current.elements = updatedElements;

        // Trigger a save to persist the updated customData
        debouncedSave.cancel();
        await performSave();
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Failed to promote element'));
      }
    }, [spaceSlug, debouncedSave, performSave, onError]);

    // Handle retry on sync error
    const handleRetry = useCallback(() => {
      debouncedSave.cancel();
      performSave();
    }, [debouncedSave, performSave]);

    return (
      <div className="w-full h-full relative" style={{ minHeight: '600px' }}>
        <ExcalidrawWrapper
          initialElements={initialElements}
          initialAppState={initialAppState}
          initialFiles={initialFiles}
          onChange={handleChange}
          onMount={handleMount}
          readOnly={readOnly}
        />
        {/* Sync status indicator */}
        <div className="absolute top-4 right-4 z-10">
          <SyncStatusIndicator onRetry={handleRetry} />
        </div>
      </div>
    );
  }
);

export default WhiteboardCanvas;
