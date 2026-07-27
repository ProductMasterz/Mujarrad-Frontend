'use client';

import { useMemo, useState } from 'react';

import { useLayer1Store } from '../stores/useLayer1Store';
import { deriveQuestionAnswersFromConversation } from '../utils/conversationDerivations';
import type { Layer1GraphEvent, Layer1GraphState, Layer1GraphResult } from '../types/graph.types';
import type { MujarradSaveDestinationMode } from '../types/layer1.types';

import { AnimatePresence, MotionInteractive, MotionPanel } from './SystemDesignMotion';

async function postLayer1Event(args: {
  event: Layer1GraphEvent;
  graphState: Layer1GraphState;
}): Promise<Layer1GraphResult & { error?: string }> {
  const response = await fetch('/api/system-builder/layer1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event: args.event,
      state: args.graphState,
    }),
  });

  const result = (await response.json()) as Layer1GraphResult & {
    error?: string;
  };

  if (!response.ok) {
    return {
      ...result,
      ok: false,
      error: result.error ?? result.message ?? 'Layer 1 request failed.',
    };
  }

  return result;
}

export function SaveLayer1ToMujarradStep() {
  const graphState = useLayer1Store((state) => state.graphState);
  const syncFromGraphState = useLayer1Store((state) => state.syncFromGraphState);

  const [mode, setMode] = useState<MujarradSaveDestinationMode>('existing');
  const [spaceSlug, setSpaceSlug] = useState('');
  const [contextId, setContextId] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newContextName, setNewContextName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  const payloadSummary = useMemo(() => {
    const answers = deriveQuestionAnswersFromConversation(graphState.conversation);

    return {
      rawInputs: graphState.rawInputs.length,
      questions: graphState.questions.length,
      answers: answers.length,
      hasUnderstanding: Boolean(graphState.understanding.goal || graphState.understanding.summary),
      hasDiagram: graphState.diagramApproved && Boolean(graphState.selectedDiagramRenderer),
      diagramRenderer: graphState.selectedDiagramRenderer,
    };
  }, [graphState]);

  const handleSave = async () => {
    setIsLoading(true);
    setUiError(null);

    const destination =
      mode === 'existing'
        ? {
            mode,
            spaceSlug: spaceSlug.trim(),
            contextId: contextId.trim() || undefined,
          }
        : {
            mode,
            newSpaceName: newSpaceName.trim(),
            newContextName: newContextName.trim() || undefined,
          };

    try {
      const result = await postLayer1Event({
        event: {
          type: 'save_layer1_to_mujarrad',
          mujarradDestination: destination,
        },
        graphState,
      });

      if (result.state) {
        syncFromGraphState(result.state);
      }

      if (!result.ok) {
        setUiError(result.error ?? result.message ?? 'Mujarrad save failed.');
      }
    } catch (error) {
      setUiError(error instanceof Error ? error.message : 'Mujarrad save failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    setUiError(null);

    try {
      const result = await postLayer1Event({
        event: {
          type: 'skip_mujarrad_save',
        },
        graphState,
      });

      if (result.state) {
        syncFromGraphState(result.state);
      }

      if (!result.ok) {
        setUiError(result.error ?? result.message ?? 'Failed to continue to final artifacts.');
      }
    } catch (error) {
      setUiError(error instanceof Error ? error.message : 'Failed to continue to final artifacts.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          Save to Mujarrad
        </p>

        <h1 className="mt-2 text-2xl font-black text-slate-950">Save Layer 1 knowledge package</h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          This step will save a text-only Layer 1 knowledge node: original input text, clarification
          questions, answers, final understanding, readiness report, and approved diagram summary.
          It will not save files, images, ZIPs, PNG/SVG exports or Mermaid source. Those remain
          handled by Final Artifacts.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-black text-slate-950">Package contents</h2>

          <dl className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt>Raw inputs</dt>
              <dd className="font-bold text-slate-900">{payloadSummary.rawInputs}</dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt>Questions</dt>
              <dd className="font-bold text-slate-900">{payloadSummary.questions}</dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt>Answers</dt>
              <dd className="font-bold text-slate-900">{payloadSummary.answers}</dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt>Understanding</dt>
              <dd className="font-bold text-slate-900">
                {payloadSummary.hasUnderstanding ? 'Ready' : 'Empty'}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt>Diagram</dt>
              <dd className="font-bold text-slate-900">
                {payloadSummary.hasDiagram ? 'Approved' : 'Missing'}
              </dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt>Selected renderer</dt>
              <dd className="font-bold capitalize text-slate-900">
                {payloadSummary.diagramRenderer ?? 'Not selected'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <h2 className="text-sm font-black text-slate-950">Destination</h2>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <MotionInteractive selected={mode === 'existing'} className="w-full">
              <button
                type="button"
                onClick={() => setMode('existing')}
                className={`w-full rounded-xl px-4 py-3 text-sm font-bold transition ${
                  mode === 'existing' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Existing
              </button>
            </MotionInteractive>

            <MotionInteractive selected={mode === 'new'} className="w-full">
              <button
                type="button"
                onClick={() => setMode('new')}
                className={`w-full rounded-xl px-4 py-3 text-sm font-bold transition ${
                  mode === 'new' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Create new
              </button>
            </MotionInteractive>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'existing' ? (
              <MotionPanel motionKey="existing-destination" className="mt-4 space-y-3">
                <input
                  value={spaceSlug}
                  onChange={(event) => setSpaceSlug(event.target.value)}
                  placeholder="Existing space slug"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <input
                  value={contextId}
                  onChange={(event) => setContextId(event.target.value)}
                  placeholder="Existing context ID or name optional"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </MotionPanel>
            ) : (
              <MotionPanel motionKey="new-destination" className="mt-4 space-y-3">
                <input
                  value={newSpaceName}
                  onChange={(event) => setNewSpaceName(event.target.value)}
                  placeholder="New space name"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <input
                  value={newContextName}
                  onChange={(event) => setNewContextName(event.target.value)}
                  placeholder="New context name optional"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </MotionPanel>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {uiError ? (
          <MotionPanel motionKey={uiError} className="mt-5">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-800">
              {uiError}
            </div>
          </MotionPanel>
        ) : null}
      </AnimatePresence>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <MotionInteractive disabled={isLoading}>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isLoading}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save to Mujarrad'}
          </button>
        </MotionInteractive>

        <MotionInteractive disabled={isLoading}>
          <button
            type="button"
            onClick={() => void handleSkip()}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Skip for now and generate files
          </button>
        </MotionInteractive>
      </div>
    </section>
  );
}
