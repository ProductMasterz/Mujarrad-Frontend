'use client';

import { useState } from 'react';

import { useLayer1Store } from '../stores/useLayer1Store';
import {
  deriveAdditionalRequirementsFromConversation,
  deriveClarificationMessagesFromConversation,
  deriveQuestionAnswersFromConversation,
} from '../utils/conversationDerivations';

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
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editingAnswer, setEditingAnswer] = useState('');

  const graphState = useLayer1Store((state) => state.graphState);

  const syncFromGraphState = useLayer1Store((state) => state.syncFromGraphState);

  const { currentQuestion, questions, completeness } = graphState;

  const qaHistory = deriveQuestionAnswersFromConversation(graphState.conversation);
  const clarificationMessages = deriveClarificationMessagesFromConversation(
    graphState.conversation
  );
  const additionalRequirements = deriveAdditionalRequirementsFromConversation(
    graphState.conversation
  );

  const latestRawInput = graphState.rawInputs.at(-1);

  const runEvent = async (event: Record<string, unknown>): Promise<Layer1ApiResult> => {
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

  const applyResult = (result: Layer1ApiResult, fallbackError: string) => {
    if (result.state) {
      syncFromGraphState(result.state);
    }

    if (!result.ok) {
      throw new Error(result.error ?? result.message ?? fallbackError);
    }
  };

  const executeEvent = async (event: Record<string, unknown>, fallbackError: string) => {
    setIsLoading(true);
    setUiError(null);

    try {
      const result = await runEvent(event);

      applyResult(result, fallbackError);

      return true;
    } catch (error) {
      setUiError(error instanceof Error ? error.message : fallbackError);

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const trimmed = message.trim();

    if (!trimmed || isLoading) {
      return;
    }

    setIsLoading(true);
    setUiError(null);

    try {
      const messageResult = await runEvent({
        type: 'send_clarification_message',
        message: trimmed,
      });

      applyResult(messageResult, 'Failed to send the clarification message.');
      setMessage('');

      if (messageResult.state?.nextAction === 'ask_question') {
        const questionResult = await runEvent({
          type: 'generate_question',
        });

        applyResult(questionResult, 'Failed to generate the next question.');
      }
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

  const handleGenerateQuestion = async () => {
    await executeEvent(
      {
        type: 'generate_question',
      },
      'Failed to generate the next question.'
    );
  };

  const handleSkipToDiagram = async () => {
    await executeEvent(
      {
        type: 'skip_to_diagram',
      },
      'Failed to continue to the diagram.'
    );
  };

  const handleSaveAnswer = async () => {
    if (!editingAnswerId || !editingAnswer.trim()) {
      return;
    }

    const succeeded = await executeEvent(
      {
        type: 'edit_question_answer',
        answerId: editingAnswerId,
        answer: editingAnswer.trim(),
      },
      'Failed to update the answer.'
    );

    if (succeeded) {
      setEditingAnswerId(null);
      setEditingAnswer('');
    }
  };

  return (
    <>
      <header className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
            <AssistantIcon />
          </div>

          <div>
            <h2 className="text-base font-black text-slate-950">System Builder Assistant</h2>

            <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Guided architecture chat
            </div>
          </div>
        </div>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-5">
          {latestRawInput?.rawText ? <UserMessage>{latestRawInput.rawText}</UserMessage> : null}

          <AssistantMessage>
            <p>I have processed your system description.</p>

            <p className="mt-2 text-slate-600">
              You can answer questions, add requirements, correct information, ask what I
              understand, or ask me to make a suitable assumption.
            </p>
          </AssistantMessage>

          {questions.map((question) => {
            const answerEntry = qaHistory.find((entry) => entry.questionId === question.id);

            const isEditing = editingAnswerId === answerEntry?.id;

            return (
              <div key={question.id} className="space-y-3">
                <AssistantMessage>
                  <div>
                    <p>{question.question}</p>

                    <p className="mt-2 text-xs text-slate-500">{question.reasonForAsking}</p>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        void executeEvent(
                          {
                            type: 'delete_question',
                            questionId: question.id,
                          },
                          'Failed to delete the question.'
                        )
                      }
                      className="mt-3 text-xs font-bold text-rose-600 hover:text-rose-700 disabled:opacity-50"
                    >
                      Delete question
                    </button>
                  </div>
                </AssistantMessage>

                {answerEntry ? (
                  <UserMessage>
                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          value={editingAnswer}
                          onChange={(event) => setEditingAnswer(event.target.value)}
                          rows={3}
                          disabled={isLoading}
                          className="w-full rounded-xl border border-blue-200 bg-white p-3 text-slate-900 outline-none focus:border-blue-400"
                        />

                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isLoading || !editingAnswer.trim()}
                            onClick={() => void handleSaveAnswer()}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white disabled:opacity-50"
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => {
                              setEditingAnswerId(null);
                              setEditingAnswer('');
                            }}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p>{answerEntry.answer}</p>

                        {answerEntry.assumedByAi ? (
                          <p className="mt-2 text-xs font-bold opacity-70">AI assumption</p>
                        ) : null}

                        <div className="mt-3 flex gap-3">
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => {
                              setEditingAnswerId(answerEntry.id);
                              setEditingAnswer(answerEntry.answer);
                            }}
                            className="text-xs font-black underline"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              void executeEvent(
                                {
                                  type: 'delete_question_answer',
                                  answerId: answerEntry.id,
                                },
                                'Failed to delete the answer.'
                              )
                            }
                            className="text-xs font-black text-rose-100 underline"
                          >
                            Delete answer
                          </button>
                        </div>
                      </div>
                    )}
                  </UserMessage>
                ) : null}
              </div>
            );
          })}

          {clarificationMessages.map((chatMessage) =>
            chatMessage.role === 'user' ? (
              <UserMessage key={chatMessage.id}>{chatMessage.content}</UserMessage>
            ) : (
              <AssistantMessage key={chatMessage.id}>{chatMessage.content}</AssistantMessage>
            )
          )}

          {additionalRequirements.length > 0 ? (
            <AssistantMessage>
              <div>
                <p className="font-black">Additional requirements</p>

                <div className="mt-3 space-y-2">
                  {additionalRequirements.map((requirement) => (
                    <div
                      key={requirement.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-sm text-slate-700">{requirement.text}</p>

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          void executeEvent(
                            {
                              type: 'delete_additional_requirement',
                              requirementId: requirement.id,
                            },
                            'Failed to delete the requirement.'
                          )
                        }
                        className="mt-2 text-xs font-bold text-rose-600"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </AssistantMessage>
          ) : null}

          {completeness?.readyForDiagram ? (
            <AssistantMessage>
              The current understanding is ready for diagram generation. You may still continue
              chatting and refining it.
            </AssistantMessage>
          ) : null}

          {uiError ? <AssistantMessage tone="error">{uiError}</AssistantMessage> : null}
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
            {isLoading ? 'Working...' : 'Ask Next Question'}
          </button>

          <button
            type="button"
            onClick={() => void handleSkipToDiagram()}
            disabled={isLoading}
            className="rounded-xl border border-blue-300 px-4 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
          >
            Skip and Generate Diagram
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            placeholder={
              currentQuestion
                ? 'Answer, ask a question, add a requirement, or ask me to assume...'
                : 'Ask about the design, add a requirement, or refine the understanding...'
            }
            disabled={isLoading}
            className="min-h-[88px] w-full resize-none border-0 bg-transparent px-4 pt-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 disabled:opacity-50"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();

                if (message.trim() && !isLoading) {
                  void handleSendMessage();
                }
              }
            }}
          />

          <div className="flex items-center justify-between px-3 pb-3">
            <span className="text-xs font-semibold text-slate-400">Shift + Enter for new line</span>

            <button
              type="button"
              onClick={() => void handleSendMessage()}
              disabled={isLoading || !message.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              title="Send message"
            >
              {isLoading ? <LoadingIcon /> : <SendIcon />}
            </button>
          </div>
        </div>
      </footer>
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
          tone === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700',
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

function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[86%] rounded-2xl rounded-tr-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white">
        {children}
      </div>
    </div>
  );
}

function MessageActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 flex flex-wrap gap-2">{children}</div>;
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
      <circle cx="12" cy="12" r="9" opacity="0.25" />

      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}
