'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLayer1Store } from '../../stores/useLayer1Store';
import type { Layer1GraphState } from '../../types/graph.types';
import { ChatHistoryMenu } from './ChatHistoryMenu';
import { ConversationPanel, type ChatMessage } from './ConversationPanel';
import { DiagramWorkspacePanel } from './DiagramWorkspacePanel';

interface Layer1Response {
  ok: boolean;
  state?: Layer1GraphState;
  message?: string;
  error?: string;
}

async function postJson(url: string, body: unknown): Promise<Layer1Response> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return (await response.json()) as Layer1Response;
}

export function AgenticWorkspace() {
  const graphState = useLayer1Store((state) => state.graphState);
  const syncFromGraphState = useLayer1Store((state) => state.syncFromGraphState);
  const startNewRun = useLayer1Store((state) => state.startNewRun);

  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [diagramError, setDiagramError] = useState<string | null>(null);
  const [displayConfidence, setDisplayConfidence] = useState(0);
  // The just-sent answer, shown immediately while the server records it.
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  // Refs keep the latest values available inside stable callbacks/effects
  // without re-creating them (which would re-trigger the auto-question effect).
  const graphStateRef = useRef(graphState);
  const isThinkingRef = useRef(false);
  graphStateRef.current = graphState;
  isThinkingRef.current = isThinking;

  const {
    currentQuestion,
    questions,
    qaHistory,
    completeness,
    understanding,
    nextAction,
    drawioXml,
    diagramSummary,
  } = graphState;

  const pendingQuestion =
    currentQuestion && !currentQuestion.answer ? currentQuestion : null;

  const messages = useMemo<ChatMessage[]>(() => {
    const out: ChatMessage[] = [];

    const initial =
      graphState.rawInputs[0]?.rawText?.trim() ||
      graphState.processedInput?.normalizedText?.trim();

    if (initial) {
      out.push({ id: 'initial-input', role: 'user', text: initial });
    }

    for (const question of questions) {
      // Synthetic free-form questions back a user message that was sent without
      // a posed question — render only the user's message, not an AI turn.
      if (question.category !== 'freeform') {
        out.push({
          id: question.id,
          role: 'assistant',
          text: question.question,
          category: question.category,
          reason: question.reasonForAsking,
        });
      }

      const answer = qaHistory.find((entry) => entry.questionId === question.id);

      if (answer) {
        out.push({ id: answer.id, role: 'user', text: answer.answer });
      } else if (question.answer) {
        out.push({ id: `${question.id}-answer`, role: 'user', text: question.answer });
      }
    }

    return out;
  }, [graphState.rawInputs, graphState.processedInput, questions, qaHistory]);

  // --- Chat actions -------------------------------------------------------

  const generateQuestion = useCallback(
    async (baseState?: Layer1GraphState) => {
      if (isThinkingRef.current) {
        return;
      }

      isThinkingRef.current = true;
      setIsThinking(true);
      setChatError(null);

      try {
        const result = await postJson('/api/system-builder/layer1', {
          event: { type: 'generate_question' },
          state: baseState ?? graphStateRef.current,
        });

        if (result.state) {
          syncFromGraphState(result.state);
        }

        if (!result.ok) {
          setChatError(
            result.error ?? result.message ?? 'Could not generate a question.',
          );
        }
      } catch {
        setChatError('Request failed. Please try again.');
      } finally {
        setIsThinking(false);
      }
    },
    [syncFromGraphState],
  );

  const submitAnswer = useCallback(
    async (text: string) => {
      if (isThinkingRef.current) {
        return;
      }

      isThinkingRef.current = true;
      // Show the user's message in the thread right away, before the round-trip.
      setPendingAnswer(text);
      setIsThinking(true);
      setChatError(null);

      try {
        const result = await postJson('/api/system-builder/layer1/answer', {
          event: { type: 'submit_answer', answer: text },
          state: graphStateRef.current,
        });

        if (result.state) {
          syncFromGraphState(result.state);
        }

        if (result.ok) {
          // The recorded answer is now in qaHistory, so drop the optimistic copy.
          setPendingAnswer(null);
        } else {
          setChatError(
            result.error ?? result.message ?? 'Could not submit your answer.',
          );
        }
      } catch {
        setChatError('Request failed. Please try again.');
      } finally {
        setIsThinking(false);
      }
      // The auto-question effect picks up from here when the pipeline reports
      // that more clarification is useful (nextAction === 'ask_question').
    },
    [syncFromGraphState],
  );

  // Process the raw input on entry when the user came straight from the landing
  // page (optimistic navigation leaves processedInput null). This runs on page
  // two with a thinking indicator instead of blocking the landing.
  const processInitialInput = useCallback(async () => {
    if (isThinkingRef.current) {
      return;
    }

    const rawInput = graphStateRef.current.rawInputs.at(-1);
    if (!rawInput) {
      return;
    }

    isThinkingRef.current = true;
    setIsThinking(true);
    setChatError(null);

    try {
      const result = await postJson('/api/system-builder/layer1', {
        // submit_input appends the raw input itself, so send a clean slate.
        event: { type: 'submit_input', rawInput },
        state: { ...graphStateRef.current, rawInputs: [] },
      });

      if (result.state) {
        syncFromGraphState(result.state);
      }

      if (!result.ok) {
        setChatError(
          result.error ?? result.message ?? 'Could not process your description.',
        );
      }
    } catch {
      setChatError('Request failed. Please try again.');
    } finally {
      setIsThinking(false);
    }
  }, [syncFromGraphState]);

  const needsProcessing =
    !graphState.processedInput && graphState.rawInputs.length > 0;

  useEffect(() => {
    if (needsProcessing && !isThinking && !isGenerating) {
      void processInitialInput();
    }
  }, [needsProcessing, isThinking, isGenerating, processInitialInput]);

  // Keep the conversation moving: ask the first question on entry, and ask the
  // next one automatically once an answer has been processed.
  useEffect(() => {
    if (isThinking || isGenerating) {
      return;
    }
    if (needsProcessing) {
      return;
    }
    if (pendingQuestion) {
      return;
    }
    if (nextAction !== 'ask_question') {
      return;
    }

    void generateQuestion();
  }, [
    isThinking,
    isGenerating,
    needsProcessing,
    pendingQuestion,
    nextAction,
    generateQuestion,
  ]);

  // --- Diagram actions ----------------------------------------------------

  const generateDiagram = useCallback(async () => {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    setDiagramError(null);

    try {
      // Rebuild the generation context from the latest Q&A so the diagram
      // reflects everything answered so far, then generate.
      const contextResult = await postJson('/api/system-builder/layer1', {
        event: { type: 'skip_to_diagram' },
        state: graphStateRef.current,
      });

      if (!contextResult.ok || !contextResult.state) {
        setDiagramError(
          contextResult.error ??
            contextResult.message ??
            'Could not prepare the diagram context.',
        );
        return;
      }

      syncFromGraphState(contextResult.state);

      const genResult = await postJson(
        '/api/system-builder/layer1/generate-diagram',
        {
          event: { type: 'generate_diagram' },
          state: contextResult.state,
        },
      );

      if (genResult.state) {
        syncFromGraphState(genResult.state);
      }

      if (!genResult.ok) {
        setDiagramError(
          genResult.error ?? genResult.message ?? 'Diagram generation failed.',
        );
      }
    } catch {
      setDiagramError('Request failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, syncFromGraphState]);

  // --- Derived UI state ---------------------------------------------------

  const rawConfidence =
    completeness?.overallScore ??
    Math.round((understanding.confidence ?? 0) * 100);

  // Confidence never visibly drops within a session (avoids a jumpy bar).
  useEffect(() => {
    setDisplayConfidence((prev) => Math.max(prev, rawConfidence));
  }, [rawConfidence]);

  const ready = Boolean(completeness?.readyForDiagram);
  const hasDiagram = Boolean(drawioXml);
  // The chat is always writable; sending is gated by the in-flight state inside
  // the composer. Free-form messages are accepted even with no pending question.
  const canAnswer = true;

  // Question generation failed (e.g. AI key/network) and there is nothing for
  // the user to answer — surface a clear error + retry so the chat is never a
  // dead end, including when the very first question fails.
  const generationFailed =
    !isThinking &&
    !isGenerating &&
    !pendingQuestion &&
    (nextAction === 'error' || (Boolean(chatError) && questions.length === 0));

  const showStatusNote =
    !pendingQuestion &&
    !isThinking &&
    (generationFailed ||
      (questions.length > 0 &&
        nextAction !== 'ask_question' &&
        nextAction !== 'error'));

  const statusNote = !showStatusNote
    ? null
    : generationFailed
      ? chatError ??
        'I could not reach the AI to generate a question. Check the API key, then retry.'
      : ready
        ? 'I have enough to draft a diagram — generate it on the right, or keep adding detail.'
        : 'Got it. Ask me another question, or generate the diagram whenever you are ready.';

  const noticeTone: 'success' | 'error' = generationFailed ? 'error' : 'success';

  // Only used when there IS a pending question but the answer submit failed.
  const errorNote = pendingQuestion && chatError ? chatError : null;

  // Append the optimistic (just-sent) answer so it appears instantly.
  const displayMessages = pendingAnswer
    ? [
        ...messages,
        { id: 'pending-answer', role: 'user' as const, text: pendingAnswer },
      ]
    : messages;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gradient-to-b from-background to-muted/20">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-card/70 px-6 py-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setIsChatCollapsed((value) => !value)}
            title={isChatCollapsed ? 'Show chat' : 'Hide chat'}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16" />
              {isChatCollapsed ? <path d="M14 10l2 2-2 2" /> : <path d="M6 10l-2 2 2 2" />}
            </svg>
          </button>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v3" />
              <circle cx="12" cy="13" r="4" />
              <path d="M9 20h6" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black tracking-tight text-foreground">
              System Builder
            </p>
            <p className="text-xs text-muted-foreground">Layer 1 · Design assistant</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ChatHistoryMenu />
          <button
            type="button"
            onClick={() => startNewRun()}
            className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-primary/30 transition hover:from-blue-500 hover:to-indigo-500"
          >
            New design
          </button>
        </div>
      </div>

      <div
        className={`grid min-h-0 flex-1 grid-cols-1 ${
          isChatCollapsed ? '' : 'lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]'
        }`}
      >
        {!isChatCollapsed ? (
          <div className="min-h-0 border-b border-border bg-card/60 backdrop-blur lg:border-b-0 lg:border-r">
            <ConversationPanel
              messages={displayMessages}
              isThinking={isThinking}
              canAnswer={canAnswer}
              onSendAnswer={submitAnswer}
              statusNote={statusNote}
              noticeTone={noticeTone}
              errorNote={errorNote}
              onRetry={showStatusNote ? () => void generateQuestion() : undefined}
              retryLabel={generationFailed ? 'Retry' : 'Ask another question'}
            />
          </div>
        ) : null}

        <div className="min-h-0 bg-transparent">
          <DiagramWorkspacePanel
            confidence={displayConfidence}
            ready={ready}
            isGenerating={isGenerating}
            isBusy={isThinking || isGenerating}
            hasDiagram={hasDiagram}
            summary={diagramSummary}
            error={diagramError}
            onGenerate={() => void generateDiagram()}
          />
        </div>
      </div>
    </div>
  );
}
