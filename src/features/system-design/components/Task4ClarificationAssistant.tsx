'use client';

import { useState } from 'react';

import { useLayer1Store } from '../stores/useLayer1Store';

interface Layer1ApiResult {
  ok: boolean;
  state?: ReturnType<
    typeof useLayer1Store.getState
  >['graphState'];
  message?: string;
  error?: string;
}

export function Task4ClarificationAssistant() {
  const [answer, setAnswer] = useState('');
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

  const {
    currentQuestion,
    questions,
    qaHistory,
    completeness,
    nextAction,
  } = graphState;

  const latestRawInput =
    graphState.rawInputs.at(-1);

  const runEvent = async (
    event: Record<string, unknown>,
    endpoint = '/api/system-builder/layer1',
  ): Promise<Layer1ApiResult> => {
    const latestState =
      useLayer1Store.getState().graphState;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        state: latestState,
      }),
    });

    return (await response.json()) as Layer1ApiResult;
  };

  const applyResult = (
    result: Layer1ApiResult,
    fallbackError: string,
  ) => {
    if (result.state) {
      syncFromGraphState(result.state);
    }

    if (!result.ok) {
      throw new Error(
        result.error ??
          result.message ??
          fallbackError,
      );
    }
  };

  const handleSubmitAnswer = async () => {
    const trimmed = answer.trim();

    if (!trimmed || !currentQuestion) {
      return;
    }

    setIsLoading(true);
    setUiError(null);

    try {
      const result = await runEvent(
        {
          type: 'submit_answer',
          answer: trimmed,
        },
        '/api/system-builder/layer1/answer',
      );

      applyResult(
        result,
        'Failed to submit the answer.',
      );

      setAnswer('');
    } catch (error) {
      setUiError(
        error instanceof Error
          ? error.message
          : 'Failed to submit the answer.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuestion = async () => {
    setIsLoading(true);
    setUiError(null);

    try {
      const result = await runEvent({
        type: 'generate_question',
      });

      applyResult(
        result,
        'Failed to generate the next question.',
      );
    } catch (error) {
      setUiError(
        error instanceof Error
          ? error.message
          : 'Failed to generate the next question.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipToDiagram = async () => {
    setIsLoading(true);
    setUiError(null);

    try {
      const result = await runEvent({
        type: 'skip_to_diagram',
      });

      applyResult(
        result,
        'Failed to continue to the diagram.',
      );
    } catch (error) {
      setUiError(
        error instanceof Error
          ? error.message
          : 'Failed to continue to the diagram.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestionAnswer =
    currentQuestion
      ? qaHistory.find(
          (entry) =>
            entry.questionId ===
            currentQuestion.id,
        )
      : undefined;

  const hasUnansweredQuestion =
    Boolean(currentQuestion) &&
    !currentQuestionAnswer;

  const canRequestNextQuestion =
    !hasUnansweredQuestion;

  const readyForDiagram =
    Boolean(completeness?.readyForDiagram) ||
    nextAction === 'generate_diagram';

  return (
    <>
      <header className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
            <AssistantIcon />
          </div>

          <div>
            <h2 className="text-base font-black text-slate-950">
              System Builder Assistant
            </h2>

            <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Clarifying your system
            </div>
          </div>
        </div>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-5">
          {latestRawInput?.rawText ? (
            <UserMessage>
              {latestRawInput.rawText}
            </UserMessage>
          ) : null}

          {questions.length === 0 ? (
            <AssistantMessage>
              <p>
                I’ve processed your system description.
              </p>

              <p className="mt-2 text-slate-600">
                I can ask a focused question to improve the
                architecture, or we can continue directly to
                diagram generation.
              </p>

              <MessageActions>
                <ActionButton
                  onClick={() =>
                    void handleGenerateQuestion()
                  }
                  disabled={
                    isLoading ||
                    !canRequestNextQuestion
                  }
                  primary
                >
                  {isLoading
                    ? 'Thinking...'
                    : 'Ask me a question'}
                </ActionButton>

                <ActionButton
                  onClick={() =>
                    void handleSkipToDiagram()
                  }
                  disabled={isLoading}
                >
                  Go to Diagram
                </ActionButton>
              </MessageActions>
            </AssistantMessage>
          ) : null}

          {questions.map((question) => {
            const answerEntry =
              qaHistory.find(
                (entry) =>
                  entry.questionId ===
                  question.id,
              );

            return (
              <div
                key={question.id}
                className="space-y-4"
              >
                <AssistantMessage>
                  {question.question}
                </AssistantMessage>

                {answerEntry ? (
                  <UserMessage>
                    {answerEntry.answer}
                  </UserMessage>
                ) : null}
              </div>
            );
          })}

          {questions.length > 0 ? (
            <AssistantMessage>
              <p>
                {hasUnansweredQuestion
                  ? 'You can answer the current question, or continue to the diagram with the understanding collected so far.'
                  : readyForDiagram
                    ? 'Got it. We now have enough information to generate a useful system diagram.'
                    : 'Got it. I updated the system understanding with your answer.'}
              </p>

              <p className="mt-2 text-slate-600">
                {hasUnansweredQuestion
                  ? 'Skipping does not delete the pending question. You can return to clarification later if needed.'
                  : readyForDiagram
                    ? 'You can keep refining the design or continue to the diagram.'
                    : 'Would you like me to ask another focused question, or continue to the diagram?'}
              </p>

              <MessageActions>
                {!hasUnansweredQuestion && (
                  <ActionButton
                    onClick={() =>
                      void handleGenerateQuestion()
                    }
                    disabled={isLoading}
                    primary={!readyForDiagram}
                  >
                    {isLoading
                      ? 'Thinking...'
                      : 'Ask another question'}
                  </ActionButton>
                )}

                <ActionButton
                  onClick={() =>
                    void handleSkipToDiagram()
                  }
                  disabled={isLoading}
                  primary={readyForDiagram || hasUnansweredQuestion}
                >
                  {readyForDiagram
                    ? 'Generate Diagram'
                    : 'Go to Diagram'}
                </ActionButton>
              </MessageActions>
            </AssistantMessage>
          ) : null}

          {uiError ? (
            <AssistantMessage tone="error">
              {uiError}
            </AssistantMessage>
          ) : null}
        </div>
      </section>

      {hasUnansweredQuestion ? (
        <footer className="border-t border-slate-200 bg-white p-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
            <textarea
              value={answer}
              onChange={(event) =>
                setAnswer(event.target.value)
              }
              rows={3}
              placeholder="Type your answer..."
              disabled={isLoading}
              className="min-h-[88px] w-full resize-none border-0 bg-transparent px-4 pt-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 disabled:opacity-50"
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey
                ) {
                  event.preventDefault();

                  if (
                    answer.trim() &&
                    !isLoading
                  ) {
                    void handleSubmitAnswer();
                  }
                }
              }}
            />

            <div className="flex items-center justify-between px-3 pb-3">
              <span className="text-xs font-semibold text-slate-400">
                Shift + Enter for new line
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void handleSkipToDiagram()
                  }
                  disabled={isLoading}
                  className="rounded-full border border-blue-200 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
                  title="Continue to diagram without answering this question"
                >
                  Go to Diagram
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleSubmitAnswer()
                  }
                  disabled={
                    isLoading ||
                    !answer.trim()
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  title="Send answer"
                >
                  {isLoading ? (
                    <LoadingIcon />
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </div>
            </div>
          </div>
        </footer>
      ) : null}
    </>
  );
}

function AssistantMessage({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'error';
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={[
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          tone === 'error'
            ? 'bg-red-100 text-red-700'
            : 'bg-blue-100 text-blue-700',
        ].join(' ')}
      >
        <AssistantIcon />
      </div>

      <div
        className={[
          'max-w-[86%] rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-6',
          tone === 'error'
            ? 'border border-red-200 bg-red-50 text-red-800'
            : 'bg-slate-100 text-slate-800',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  );
}

function UserMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[86%] rounded-2xl rounded-tr-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white">
        {children}
      </div>
    </div>
  );
}

function MessageActions({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {children}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  primary = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'rounded-xl px-3.5 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
        primary
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function AssistantIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 10h8" />
      <path d="M8 14h5" />
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.5-4A8 8 0 1 1 21 12Z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
    >
      <path d="m5 12 14-7-4 14-3-6-7-1Z" />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 animate-spin"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        opacity="0.25"
      />

      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}
