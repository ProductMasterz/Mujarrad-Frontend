'use client';

/**
 * ExcalidrawWrapper - Direct Excalidraw import with custom double-click behavior
 * This wrapper is dynamically imported to avoid SSR issues
 */

import { useRef, useCallback, useEffect } from 'react';
import { Excalidraw, MainMenu, Sidebar } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import type { ExcalidrawElement, WhiteboardAppState, BinaryFileData } from '@/types/whiteboard';

interface ExcalidrawWrapperProps {
  initialElements?: ExcalidrawElement[];
  initialAppState?: Partial<WhiteboardAppState>;
  initialFiles?: BinaryFileData;
  onChange?: (elements: readonly ExcalidrawElement[], appState: any, files: BinaryFileData) => void;
  onMount?: (api: ExcalidrawImperativeAPI) => void;
  readOnly?: boolean;
}

// Generate unique ID for elements
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Create a rectangle with bound text
function createBoundRectangleWithText(x: number, y: number): ExcalidrawElement[] {
  const rectId = generateId();
  const textId = generateId();
  const now = Date.now();

  const rectangle: ExcalidrawElement = {
    id: rectId,
    type: 'rectangle',
    x: x - 75,
    y: y - 30,
    width: 150,
    height: 60,
    angle: 0,
    strokeColor: '#1e1e1e',
    backgroundColor: '#f8f9fa',
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
  };

  const text: ExcalidrawElement = {
    id: textId,
    type: 'text',
    x: x - 75,
    y: y - 10,
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
    text: '',
    fontSize: 16,
    fontFamily: 2,
    textAlign: 'center',
    verticalAlign: 'middle',
  };

  return [rectangle, text];
}

export default function ExcalidrawWrapper({
  initialElements = [],
  initialAppState = {},
  initialFiles = {},
  onChange,
  onMount,
  readOnly = false,
}: ExcalidrawWrapperProps) {
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAPIMount = useCallback((api: ExcalidrawImperativeAPI) => {
    excalidrawAPIRef.current = api;
    onMount?.(api);
  }, [onMount]);

  // Custom double-click handler
  useEffect(() => {
    if (readOnly || !containerRef.current) return;

    const container = containerRef.current;

    const handleDoubleClick = (e: MouseEvent) => {
      const api = excalidrawAPIRef.current;
      if (!api) return;

      const appState = api.getAppState();
      const elements = api.getSceneElements();

      // Convert screen coordinates to canvas coordinates
      const { scrollX, scrollY, zoom } = appState;
      const rect = container.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - scrollX) / zoom.value;
      const canvasY = (e.clientY - rect.top - scrollY) / zoom.value;

      // Check if there's a selected element
      const selectedIds = Object.keys(appState.selectedElementIds || {});
      if (selectedIds.length > 0) {
        return;
      }

      // Check if clicking on an existing element
      const padding = 10;
      const clickedElement = elements.find((el: any) => {
        if (el.isDeleted) return false;
        if (el.type === 'text' && el.containerId) return false;

        return (
          canvasX >= el.x - padding &&
          canvasX <= el.x + el.width + padding &&
          canvasY >= el.y - padding &&
          canvasY <= el.y + el.height + padding
        );
      });

      if (!clickedElement) {
        e.preventDefault();
        e.stopPropagation();

        const newElements = createBoundRectangleWithText(canvasX, canvasY);
        const allElements = [...elements, ...newElements];

        api.updateScene({
          elements: allElements as any,
          appState: {
            ...appState,
            selectedElementIds: { [newElements[0].id]: true },
          },
        });

        setTimeout(() => {
          api.updateScene({
            appState: {
              ...api.getAppState(),
              editingElement: newElements[1] as any,
            },
          });
        }, 50);
      }
    };

    container.addEventListener('dblclick', handleDoubleClick, { capture: true });

    return () => {
      container.removeEventListener('dblclick', handleDoubleClick, { capture: true });
    };
  }, [readOnly]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {/* Hide library button via CSS */}
      <style>{`
        .library-button,
        [data-testid="library-button"],
        .App-menu_top__left button[title*="Library"],
        .library-menu-items-container,
        .sidebar-trigger {
          display: none !important;
        }
      `}</style>
      <Excalidraw
        excalidrawAPI={handleAPIMount}
        initialData={{
          elements: initialElements,
          appState: {
            viewBackgroundColor: '#ffffff',
            currentItemBackgroundColor: '#f8f9fa',
            currentItemFillStyle: 'solid',
            currentItemStrokeColor: '#1e1e1e',
            currentItemStrokeWidth: 2,
            currentItemRoughness: 0,
            currentItemFontFamily: 2,
            currentItemRoundness: 'sharp',
            ...initialAppState,
          },
          files: initialFiles,
        }}
        onChange={onChange}
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
            toggleTheme: false,
            saveAsImage: true,
          },
          tools: {
            image: true,
          },
          welcomeScreen: false,
        }}
        langCode="en"
        renderTopRightUI={() => null}
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
        {/* Hide the library sidebar */}
        <Sidebar name="library" onDock={() => {}} docked={false}>
          <Sidebar.Header />
        </Sidebar>
      </Excalidraw>
    </div>
  );
}
