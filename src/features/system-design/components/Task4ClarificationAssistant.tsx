'use client';

import { useEffect, useRef, useState } from 'react';

import { useLayer1Store } from '../stores/useLayer1Store';

interface Layer1ApiResult {
  ok: boolean;
  state?: ReturnType<typeof useLayer1Store.getState>['graphState'];
  message?: string;
  error?: string;
}

export function Task4ClarificationAssistant() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLElement | null>(null);

  const graphState = useLayer1Store((state) => state.graphState);
  const syncFromGraphState = useLayer1Store(
    (state) => state.syncFromGraphState
  );
  const resetRun = useLayer1Store((state) => state.resetRun);

  const { conversation, currentQuestion } = graphState;

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [conversation.length, isLoading, uiError]);

  const runEvent = async (
    event: Record<string, unknown>
  ): Promise<Layer1ApiResult> => {
    const latestState = useLayer1Store.getState().graphState;

    const response = await fetch('/api/system-builder/layer1', {
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
    fallbackError: string
  ) => {
    if (result.state) {
      syncFromGraphState(result.state);
    }

    if (!result.ok) {
      throw new Error(
        result.error ?? result.message ?? fallbackError
      );
    }
  };

  const executeEvent = async (
    event: Record<string, unknown>,
    fallbackError: string
  ) => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setUiError(null);

    try {
      const result = await runEvent(event);

      applyResult(result, fallbackError);
    } catch (error) {
      setUiError(
        error instanceof Error ? error.message : fallbackError
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    setIsLoading(true);
    setUiError(null);

    try {
      const result = await runEvent({
        type: 'send_clarification_message',
        message: trimmedMessage,
      });

      applyResult(
        result,
        'Failed to send the clarification message.'
      );

      setMessage('');
    } catch (error) {
      setUiError(
        error instanceof Error
          ? error.message
          : 'Failed to continue the clarification conversation.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    resetRun();
    setMessage('');
    setUiError(null);
    setIsLoading(false);
  };

  const handleGenerateQuestion = async () => {
    await executeEvent(
      {
        type: 'generate_question',
      },
      'Failed to generate a clarification question.'
    );
  };

  const handleGenerateDiagram = async () => {
    await executeEvent(
      {
        type: 'skip_to_diagram',
      },
      'Failed to continue to diagram generation.'
    );
  };

  return (
    <>
      <header className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
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
                Architecture conversation
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset everything
          </button>
        </div>
      </header>

      <section
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-5"
      >
        <div className="space-y-5">
          {conversation.map((chatMessage) =>
            chatMessage.role === 'user' ? (
              <UserMessage
                key={chatMessage.id}
                timestamp={chatMessage.createdAt}
              >
                {chatMessage.content}
              </UserMessage>
            ) : (
              <AssistantMessage
                key={chatMessage.id}
                timestamp={chatMessage.createdAt}
              >
                <p>{chatMessage.content}</p>

                {chatMessage.metadata?.reasonForAsking ? (
                  <p className="mt-2 text-xs text-slate-500">
                    {String(
                      chatMessage.metadata.reasonForAsking
                    )}
                  </p>
                ) : null}
              </AssistantMessage>
            )
          )}

          {isLoading ? (
            <AssistantMessage
              timestamp={new Date().toISOString()}
            >
              <span className="inline-flex items-center gap-2">
                <LoadingIcon />
                Thinking...
              </span>
            </AssistantMessage>
          ) : null}

          {uiError ? (
            <AssistantMessage
              tone="error"
              timestamp={new Date().toISOString()}
            >
              {uiError}
            </AssistantMessage>
          ) : null}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white p-4">
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => void handleGenerateQuestion()}
            disabled={isLoading}
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Ask Question
          </button>

          <button
            type="button"
            onClick={() => void handleGenerateDiagram()}
            disabled={isLoading}
            className="rounded-xl border border-blue-300 px-4 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
          >
            Generate Diagram
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            rows={3}
            placeholder={
              currentQuestion
                ? 'Answer the question, ask the AI to assume, or add another requirement...'
                : 'Ask a question or add another system requirement...'
            }
            disabled={isLoading}
            className="min-h-[88px] w-full resize-none border-0 bg-transparent px-4 pt-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 disabled:opacity-50"
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey
              ) {
                event.preventDefault();

                if (message.trim() && !isLoading) {
                  void handleSendMessage();
                }
              }
            }}
          />

          <div className="flex items-center justify-between px-3 pb-3">
            <span className="text-xs font-semibold text-slate-400">
              Shift + Enter for a new line
            </span>

            <button
              type="button"
              onClick={() => void handleSendMessage()}
              disabled={isLoading || !message.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              title="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AssistantMessage({
  children,
  timestamp,
  tone = 'default',
}: {
  children: React.ReactNode;
  timestamp: string;
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

      <div className="max-w-[86%]">
        <div
          className={[
            'rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-6',
            tone === 'error'
              ? 'border border-red-200 bg-red-50 text-red-800'
              : 'bg-slate-100 text-slate-800',
          ].join(' ')}
        >
          {children}
        </div>

        <div className="mt-1 px-1 text-[10px] font-semibold text-slate-400">
          {formatTimestamp(timestamp)}
        </div>
      </div>
    </div>
  );
}

function UserMessage({
  children,
  timestamp,
}: {
  children: React.ReactNode;
  timestamp: string;
}) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[86%]">
        <div className="rounded-2xl rounded-tr-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white">
          {children}
        </div>

        <div className="mt-1 px-1 text-right text-[10px] font-semibold text-slate-400">
          {formatTimestamp(timestamp)}
        </div>
      </div>
    </div>
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
      className="h-4 w-4 animate-spin"
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
