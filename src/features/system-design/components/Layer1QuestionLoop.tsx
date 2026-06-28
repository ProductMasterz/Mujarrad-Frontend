'use client';

import { useState } from 'react';
import { useLayer1Store } from '../stores/useLayer1Store';
import { QuestionCard } from './QuestionCard';
import { QuestionHistory } from './QuestionHistory';
import { Layer1ReadinessHeader } from './Layer1ReadinessHeader';
import { Layer1UnderstandingPanel } from './Layer1UnderstandingPanel';
import { Layer1CompletenessPanel } from './Layer1CompletenessPanel';

export function Layer1QuestionLoop() {
  const [isLoading, setIsLoading] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const graphState = useLayer1Store((state) => state.graphState);
  const syncFromGraphState = useLayer1Store((state) => state.syncFromGraphState);

  const {
    currentQuestion,
    questions,
    qaHistory,
    understanding,
    completeness,
    nextAction,
  } = graphState;

  const handleSubmitAnswer = async (answer: string) => {
    setIsLoading(true);
    setUiError(null);

    try {
      const response = await fetch('/api/system-builder/layer1/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            type: 'submit_answer',
            answer,
          },
          state: graphState,
        }),
      });

      const result = await response.json();

      if (result.state) {
        syncFromGraphState(result.state);
      }

      if (!result.ok) {
        const message = result.error ?? result.message ?? 'Failed to submit answer.';
        setUiError(message);
        console.error('Failed to submit answer:', message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit answer.';
      setUiError(message);
      console.error('Failed to submit answer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuestion = async () => {
    setIsLoading(true);
    setUiError(null);

    try {
      const response = await fetch('/api/system-builder/layer1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            type: 'generate_question',
          },
          state: graphState,
        }),
      });

      const result = await response.json();

      if (result.state) {
        syncFromGraphState(result.state);
      }

      if (!result.ok) {
        const message = result.error ?? result.message ?? 'Failed to generate question.';
        setUiError(message);
        console.error('Failed to generate question:', message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate question.';
      setUiError(message);
      console.error('Failed to generate question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const skipToDiagram = async () => {
    setIsLoading(true);
    setUiError(null);

    try {
      const response = await fetch('/api/system-builder/layer1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            type: 'skip_to_diagram',
          },
          state: graphState,
        }),
      });

      const result = await response.json();

      if (result.state) {
        syncFromGraphState(result.state);
      }

      if (!result.ok) {
        const message = result.error ?? result.message ?? 'Failed to skip to diagram.';
        setUiError(message);
        console.error('Failed to skip to diagram:', message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to skip to diagram.';
      setUiError(message);
      console.error('Failed to skip to diagram:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const continueClarification = () => {
    syncFromGraphState({
      ...graphState,
      activeStep: 'clarification',
      stage: 'clarification',
      nextAction: 'ask_question',
      currentQuestion:
        graphState.currentQuestion?.answer ? null : graphState.currentQuestion,
      diagramGenerationContext: null,
      updatedAt: new Date().toISOString(),
    });
  };

  const proceedToDiagram = async () => {
    syncFromGraphState({
      ...graphState,
      activeStep: 'diagram',
      stage: 'diagram',
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Layer1ReadinessHeader report={completeness} />

        {uiError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
            <div className="font-bold">Clarification action failed</div>
            <div className="mt-1">{uiError}</div>
            <button
              type="button"
              onClick={skipToDiagram}
              disabled={isLoading}
              className="mt-3 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-700 disabled:opacity-50"
            >
              {isLoading ? 'Skipping...' : 'Skip clarification and proceed to Diagram'}
            </button>
          </div>
        )}

        {nextAction === 'ask_question' && !currentQuestion && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h3 className="mb-2 text-lg font-bold text-slate-900">
              Ready to clarify requirements
            </h3>
            <p className="mb-4 text-slate-500">
              The system can generate one constructive question at a time based on your processed input.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleGenerateQuestion}
                disabled={isLoading}
                className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Start Clarification'}
              </button>
              <button
                type="button"
                onClick={skipToDiagram}
                disabled={isLoading}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Skip to Diagram
              </button>
            </div>
          </div>
        )}

        {nextAction === 'wait_for_answer' && currentQuestion && !currentQuestion.answer && (
          <div className="space-y-4">
            <QuestionCard
              question={currentQuestion}
              onSubmit={handleSubmitAnswer}
              isLoading={isLoading}
            />
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
              API limits or missing answers should not block the workflow.
              <button
                type="button"
                onClick={skipToDiagram}
                disabled={isLoading}
                className="ml-0 mt-3 rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 sm:ml-3 sm:mt-0"
              >
                Skip clarification and proceed to Diagram
              </button>
            </div>
          </div>
        )}

        {nextAction === 'ask_question' && currentQuestion && currentQuestion.answer && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h3 className="mb-2 text-lg font-bold text-slate-900">
              Answer recorded
            </h3>
            <p className="mb-4 text-slate-500">
              More clarification is recommended before diagram generation, but you can skip if enough is known.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleGenerateQuestion}
                disabled={isLoading}
                className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Next Question'}
              </button>
              <button
                type="button"
                onClick={skipToDiagram}
                disabled={isLoading}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Skip to Diagram
              </button>
            </div>
          </div>
        )}

        {nextAction === 'generate_diagram' && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm">
            <h3 className="mb-2 text-lg font-bold text-emerald-900">
              Ready for diagram generation
            </h3>
            <p className="mb-4 text-emerald-700">
              The system will use the current processed input, Q&A history, and understanding to move into the Draw.io diagram step. Missing details can be refined later.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={continueClarification}
                disabled={isLoading}
                className="rounded-xl border border-emerald-300 bg-white px-6 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
              >
                Continue Clarification
              </button>

              <button
                type="button"
                onClick={proceedToDiagram}
                disabled={isLoading}
                className="rounded-xl bg-emerald-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                Proceed to Diagram
              </button>
            </div>
          </div>
        )}

        <QuestionHistory questions={questions} qaHistory={qaHistory} />
      </div>

      <div className="space-y-6">
        <Layer1CompletenessPanel report={completeness} />
        <Layer1UnderstandingPanel understanding={understanding} />
      </div>
    </div>
  );
}
