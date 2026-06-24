'use client';

import { useState } from 'react';
import { useLayer1Store } from '../stores/useLayer1Store';
import { QuestionCard } from './QuestionCard';
import { QuestionHistory } from './QuestionHistory';
import { Layer1UnderstandingPanel } from './Layer1UnderstandingPanel';
import { Layer1CompletenessPanel } from './Layer1CompletenessPanel';

export function Layer1QuestionLoop() {
  const [isLoading, setIsLoading] = useState(false);
  const graphState = useLayer1Store((state) => state.graphState);
  const syncFromGraphState = useLayer1Store((state) => state.syncFromGraphState);

  const { currentQuestion, questions, qaHistory, understanding, completeness, nextAction } = graphState;

  const handleSubmitAnswer = async (answer: string) => {
    setIsLoading(true);
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
      if (result.ok && result.state) {
        syncFromGraphState(result.state);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuestion = async () => {
    setIsLoading(true);
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
      if (result.ok && result.state) {
        syncFromGraphState(result.state);
      }
    } catch (err) {
      console.error('Failed to generate question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToSpec = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system-builder/layer1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            type: 'complete_step',
            stepId: 'clarification',
          },
          state: graphState,
        }),
      });
      const result = await response.json();
      if (result.ok && result.state) {
        syncFromGraphState(result.state);
      }
    } catch (err) {
      console.error('Failed to proceed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {nextAction === 'ask_question' && !currentQuestion && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to clarify requirements</h3>
            <p className="text-slate-500 mb-4">We will generate questions one by one based on your input.</p>
            <button
              onClick={handleGenerateQuestion}
              disabled={isLoading}
              className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Start Clarification'}
            </button>
          </div>
        )}

        {nextAction === 'wait_for_answer' && currentQuestion && !currentQuestion.answer && (
          <QuestionCard
            question={currentQuestion}
            onSubmit={handleSubmitAnswer}
            isLoading={isLoading}
          />
        )}

        {nextAction === 'ask_question' && currentQuestion && currentQuestion.answer && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Answer recorded!</h3>
            <p className="text-slate-500 mb-4">We still need more information to proceed to diagram generation.</p>
            <button
              onClick={handleGenerateQuestion}
              disabled={isLoading}
              className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Next Question'}
            </button>
          </div>
        )}

        {nextAction === 'generate_spec' && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm text-center">
            <h3 className="text-lg font-bold text-emerald-900 mb-2">Clarification Complete!</h3>
            <p className="text-emerald-700 mb-4">We have enough understanding to proceed to specification generation.</p>
            <button
              onClick={proceedToSpec}
              disabled={isLoading}
              className="rounded-xl bg-emerald-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Proceed to Specification'}
            </button>
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
