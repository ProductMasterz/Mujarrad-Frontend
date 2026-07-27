'use client';

import { useState } from 'react';

import {
  AlertCircle,
  Check,
  LoaderCircle,
  RotateCcw,
  Undo2,
} from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

import {
  Badge,
} from '@/components/ui/badge';

import {
  Button,
} from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Separator,
} from '@/components/ui/separator';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useLayer1Store } from '../stores/useLayer1Store';
import {
  captureRegisteredFinalDiagram,
} from '../utils/finalDiagramCaptureBridge';

import {
  AnimatePresence,
  MotionInteractive,
  MotionPanel,
} from './SystemDesignMotion';

type Task6EventType =
  | 'undo_diagram_revision'
  | 'reset_diagram_revision';

async function postLayer1Event(args: {
  event: Record<string, unknown>;
  graphState: unknown;
}) {
  const response = await fetch(
    '/api/system-builder/layer1',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: args.event,
        state: args.graphState,
      }),
    },
  );

  return response.json();
}

export function Layer1DiagramRefinement() {
  const [isLoading, setIsLoading] =
    useState(false);

  const [uiError, setUiError] =
    useState<string | null>(null);

  const graphState = useLayer1Store(
    (state) => state.graphState,
  );

  const syncFromGraphState = useLayer1Store(
    (state) => state.syncFromGraphState,
  );

  const revisionCount =
    graphState.diagramRevisions.length;

  const canUndo = revisionCount >= 2;
  const canReset = revisionCount >= 1;

  const activeRenderer =
    'mermaid' as const;

  const activeRendererLabel =
    'Mermaid';

  const canApprove =
    Boolean(graphState.mermaidSource);

  const isActiveRendererApproved =
    graphState.diagramApproved &&
    graphState.selectedDiagramRenderer ===
      'mermaid';

  const handleSimpleEvent = async (
    type: Task6EventType,
  ) => {
    setIsLoading(true);
    setUiError(null);

    try {
      const latestState =
        useLayer1Store.getState().graphState;

      const result = await postLayer1Event({
        event: {
          type,
        },
        graphState: latestState,
      });

      if (result.state) {
        syncFromGraphState(result.state);
      }

      if (!result.ok) {
        setUiError(
          result.error ??
            result.message ??
            'Action failed.',
        );
      }
    } catch (error) {
      setUiError(
        error instanceof Error
          ? error.message
          : 'Action failed.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDiagram = async () => {
    setIsLoading(true);
    setUiError(null);

    try {
      const latestState =
        useLayer1Store.getState().graphState;

      const captured =
        await captureRegisteredFinalDiagram(
          'mermaid',
        );

      const result = await postLayer1Event({
        event: {
          type: 'approve_diagram',
          diagramRenderer:
            captured.renderer,
          xml:
            captured.xml,
          mermaidSource:
            captured.mermaidSource,
          diagramImages:
            captured.diagramImages,
        },
        graphState: latestState,
      });

      if (result.state) {
        syncFromGraphState(result.state);
      }

      if (!result.ok) {
        setUiError(
          result.error ??
            result.message ??
            'Diagram approval failed.',
        );
      }
    } catch (error) {
      setUiError(
        error instanceof Error
          ? error.message
          : 'Failed to capture and approve the final diagram.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-slate-200 bg-white/95 shadow-sm">
      <CardHeader className="space-y-3 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base text-slate-950">
              Diagram Controls
            </CardTitle>

            <CardDescription className="leading-relaxed">
              AI refinement updates the Mermaid
              system diagram.
            </CardDescription>
          </div>

          <Badge variant="secondary">
            {activeRendererLabel}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Revision history
          </span>

          <Badge variant="outline">
            {revisionCount}{' '}
            revision
            {revisionCount === 1 ? '' : 's'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <AnimatePresence>
          {uiError ? (
            <MotionPanel
              motionKey={uiError}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />

                <AlertTitle>
                  Diagram action failed
                </AlertTitle>

                <AlertDescription>
                  {uiError}
                </AlertDescription>
              </Alert>
            </MotionPanel>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {isActiveRendererApproved ? (
            <MotionPanel
              motionKey={`approved-${activeRenderer}`}
            >
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950">
                <Check className="h-4 w-4 text-emerald-600" />

                <AlertTitle>
                  Official diagram selected
                </AlertTitle>

                <AlertDescription className="text-emerald-800">
                  The Mermaid diagram is currently
                  approved.
                </AlertDescription>
              </Alert>
            </MotionPanel>
          ) : null}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-2">
          <MotionInteractive
            disabled={
              isLoading ||
              !canUndo
            }
            className="w-full"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    void handleSimpleEvent(
                      'undo_diagram_revision',
                    )
                  }
                  disabled={
                    isLoading ||
                    !canUndo
                  }
                  className="w-full gap-2"
                >
                  <Undo2 className="h-4 w-4" />
                  Undo
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                Restore the previous diagram revision
              </TooltipContent>
            </Tooltip>
          </MotionInteractive>

          <MotionInteractive
            disabled={
              isLoading ||
              !canReset
            }
            className="w-full"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    void handleSimpleEvent(
                      'reset_diagram_revision',
                    )
                  }
                  disabled={
                    isLoading ||
                    !canReset
                  }
                  className="w-full gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                Restore the initially generated diagram
              </TooltipContent>
            </Tooltip>
          </MotionInteractive>
        </div>

        <Separator />

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Approval target
          </p>

          <p className="mt-1 text-sm font-medium text-slate-800">
            Mermaid diagram
          </p>
        </div>
      </CardContent>

      <div className="border-t border-slate-100 bg-slate-50/50 p-4">
        <MotionInteractive
          className="w-full"
          disabled={
            isLoading ||
            !canApprove
          }
          selected={
            isActiveRendererApproved
          }
        >
          <Button
            type="button"
            onClick={() =>
              void handleApproveDiagram()
            }
            disabled={
              isLoading ||
              !canApprove
            }
            className="h-11 w-full gap-2"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />

                {graphState.diagramApproved
                  ? 'Approve Updated Diagram'
                  : 'Accept Diagram'}
              </>
            )}
          </Button>
        </MotionInteractive>
      </div>
    </Card>
  );
}
