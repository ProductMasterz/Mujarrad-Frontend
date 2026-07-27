'use client';

import {
  FileCode2,
} from 'lucide-react';

import {
  Badge,
} from '@/components/ui/badge';

import { useLayer1Store } from '../stores/useLayer1Store';

import { MermaidDiagramPreview } from './MermaidDiagramPreview';
import {
  AnimatePresence,
  MotionScale,
  MotionStatus,
} from './SystemDesignMotion';

export function Layer1DiagramReview() {
  const generationKey =
    useLayer1Store(
      (state) => {
        const revisions =
          state.graphState
            .diagramRevisions;

        return (
          revisions[
            revisions.length - 1
          ]?.id ??
          'initial'
        );
      },
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

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-slate-600" />

          <span className="text-sm font-semibold text-slate-900">
            Mermaid Diagram
          </span>
        </div>

        <AnimatePresence mode="wait">
          <MotionStatus
            motionKey={`mermaid-${selectedRenderer ?? 'none'}`}
            className="flex items-center gap-2"
          >
            <Badge variant="secondary">
              Mermaid
            </Badge>

            {selectedRenderer ===
            'mermaid' ? (
              <Badge>
                Official
              </Badge>
            ) : (
              <Badge variant="outline">
                Not approved
              </Badge>
            )}
          </MotionStatus>
        </AnimatePresence>
      </div>

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
      ) : (
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-center text-sm text-slate-500">
          Generate the Mermaid diagram to preview it.
        </div>
      )}
    </div>
  );
}
