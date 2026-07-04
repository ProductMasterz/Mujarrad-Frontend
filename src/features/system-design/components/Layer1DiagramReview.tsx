'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  DrawioEmbed,
  type DrawioEmbedHandle,
} from '@/components/system-builder/DrawioEmbed';

import { useLayer1Store } from '../stores/useLayer1Store';
import {
  registerFinalDiagramCapture,
} from '../utils/finalDiagramCaptureBridge';

function DiagramEditorInstance({
  editorRef,
  onXmlChange,
}: {
  editorRef: React.RefObject<DrawioEmbedHandle>;
  onXmlChange: (xml: string) => void;
}) {
  const [initialXml] = useState(
    () =>
      useLayer1Store.getState().graphState
        .drawioXml,
  );

  return (
    <DrawioEmbed
      ref={editorRef}
      xml={initialXml}
      onXmlChange={onXmlChange}
    />
  );
}

export function Layer1DiagramReview() {
  const editorRef =
    useRef<DrawioEmbedHandle>(null);

  const syncFromGraphState = useLayer1Store(
    (state) => state.syncFromGraphState,
  );

  const generationKey = useLayer1Store(
    (state) => {
      const revisions =
        state.graphState.diagramRevisions;

      return (
        revisions[revisions.length - 1]?.id ??
        'initial'
      );
    },
  );

  const handleXmlChange = useCallback(
    async (xml: string) => {
      try {
        const latestState =
          useLayer1Store.getState().graphState;

        const response = await fetch(
          '/api/system-builder/layer1',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              event: {
                type: 'sync_diagram_xml',
                xml,
              },
              state: latestState,
            }),
          },
        );

        const result = await response.json();

        if (result.state) {
          syncFromGraphState(result.state);
        }

        if (!result.ok) {
          console.error(
            'Failed to sync Draw.io XML:',
            result.error ?? result.message,
          );
        }
      } catch (error) {
        console.error(
          'Failed to sync Draw.io XML:',
          error,
        );
      }
    },
    [syncFromGraphState],
  );

  const captureFinalDiagram =
    useCallback(async () => {
      const editor = editorRef.current;

      if (!editor) {
        throw new Error(
          'Draw.io editor is not available.',
        );
      }

      const finalXml =
        await editor.exportDiagram('xml');

      const svgDataUrl =
        await editor.exportDiagram('svg');

      const pngDataUrl =
        await editor.exportDiagram('png');

      return {
        xml: finalXml,
        diagramImages: {
          svg: {
            dataUrl: svgDataUrl,
            fileName:
              'final-system-diagram.svg',
          },
          png: {
            dataUrl: pngDataUrl,
            fileName:
              'final-system-diagram.png',
          },
        },
      };
    }, []);

  useEffect(
    () =>
      registerFinalDiagramCapture(
        captureFinalDiagram,
      ),
    [captureFinalDiagram],
  );

  return (
    <div className="min-h-[560px] h-[74vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <DiagramEditorInstance
        key={generationKey}
        editorRef={editorRef}
        onXmlChange={handleXmlChange}
      />
    </div>
  );
}
