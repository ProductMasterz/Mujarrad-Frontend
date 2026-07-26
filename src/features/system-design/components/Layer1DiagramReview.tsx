'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  FileCode2,
  Workflow,
} from 'lucide-react';

import {
  DrawioEmbed,
  type DrawioEmbedHandle,
} from '@/components/system-builder/DrawioEmbed';

import {
  Badge,
} from '@/components/ui/badge';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import { useLayer1Store } from '../stores/useLayer1Store';
import {
  registerFinalDiagramCapture,
} from '../utils/finalDiagramCaptureBridge';

import { MermaidDiagramPreview } from './MermaidDiagramPreview';
import {
  AnimatePresence,
  MotionInteractive,
  MotionScale,
  MotionStatus,
} from './SystemDesignMotion';

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
        renderer: 'drawio' as const,
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
        'drawio',
        captureFinalDiagram,
      ),
    [captureFinalDiagram],
  );

  const activeRenderer =
    useLayer1Store(
      (state) =>
        state.graphState
          .activeDiagramRenderer,
    );

  const selectedRenderer =
    useLayer1Store(
      (state) =>
        state.graphState
          .selectedDiagramRenderer,
    );

  const mermaidSource =
    useLayer1Store(
      (state) =>
        state.graphState
          .mermaidSource,
    );

  const setActiveDiagramRenderer =
    useLayer1Store(
      (state) =>
        state.setActiveDiagramRenderer,
    );

  return (
    <Tabs
      value={activeRenderer}
      onValueChange={(value) => {
        setActiveDiagramRenderer(
          value as 'drawio' | 'mermaid',
        );
      }}
      className="space-y-3"
    >
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-slate-100 p-1 sm:w-[360px]">
          <MotionInteractive
            selected={
              activeRenderer === 'drawio'
            }
            className="w-full"
          >
            <TabsTrigger
              value="drawio"
              className="w-full gap-2 rounded-lg px-4 py-2.5 font-semibold"
            >
              <Workflow className="h-4 w-4" />
              Draw.io
            </TabsTrigger>
          </MotionInteractive>

          <MotionInteractive
            selected={
              activeRenderer === 'mermaid'
            }
            disabled={!mermaidSource}
            className="w-full"
          >
            <TabsTrigger
              value="mermaid"
              disabled={!mermaidSource}
              className="w-full gap-2 rounded-lg px-4 py-2.5 font-semibold"
            >
              <FileCode2 className="h-4 w-4" />
              Mermaid
            </TabsTrigger>
          </MotionInteractive>
        </TabsList>

        <AnimatePresence mode="wait">
          <MotionStatus
            motionKey={`${activeRenderer}-${selectedRenderer ?? 'none'}`}
            className="flex items-center gap-2"
          >
            <Badge variant="secondary">
              Active:{' '}
              {activeRenderer === 'mermaid'
                ? 'Mermaid'
                : 'Draw.io'}
            </Badge>

            {selectedRenderer ? (
              <Badge>
                Official:{' '}
                {selectedRenderer === 'mermaid'
                  ? 'Mermaid'
                  : 'Draw.io'}
              </Badge>
            ) : (
              <Badge variant="outline">
                Not approved
              </Badge>
            )}
          </MotionStatus>
        </AnimatePresence>
      </div>

      <TabsContent
        value="drawio"
        className="mt-0 outline-none"
      >
        <AnimatePresence mode="wait">
          <MotionScale
            motionKey={`drawio-${generationKey}`}
            className="min-h-[820px] h-[88vh] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <DiagramEditorInstance
              key={generationKey}
              editorRef={editorRef}
              onXmlChange={handleXmlChange}
            />
          </MotionScale>
        </AnimatePresence>
      </TabsContent>

      <TabsContent
        value="mermaid"
        className="mt-0 outline-none"
      >
        {mermaidSource ? (
          <AnimatePresence mode="wait">
            <MotionScale
              motionKey={`mermaid-${generationKey}`}
            >
              <MermaidDiagramPreview
                source={mermaidSource}
              />
            </MotionScale>
          </AnimatePresence>
        ) : null}
      </TabsContent>
    </Tabs>
  );
}
