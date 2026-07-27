'use client';

import { useMemo, useState } from 'react';

import type { Layer1GraphState } from '../types/graph.types';
import { deriveQuestionAnswersFromConversation } from '../utils/conversationDerivations';

type NodeStatus = 'done' | 'active' | 'waiting' | 'pending' | 'error';

function getAnswerCount(state: Layer1GraphState): number {
  return deriveQuestionAnswersFromConversation(state.conversation).length;
}

interface GraphNode {
  id: string;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  kind: 'normal' | 'loop' | 'skip' | 'handoff';
}

const graphNodes: GraphNode[] = [
  {
    id: 'task3',
    title: 'Task 3 Output',
    subtitle: 'Processed input',
    x: 60,
    y: 170,
    w: 190,
    h: 86,
  },
  {
    id: 'understand',
    title: 'Understand Need',
    subtitle: 'Analyze processed input',
    x: 330,
    y: 170,
    w: 210,
    h: 86,
  },
  {
    id: 'question',
    title: 'Constructive Question',
    subtitle: 'Ask next best question',
    x: 620,
    y: 170,
    w: 230,
    h: 86,
  },
  {
    id: 'answer',
    title: 'User Answer',
    subtitle: 'Human-in-the-loop',
    x: 930,
    y: 170,
    w: 190,
    h: 86,
  },
  {
    id: 'save',
    title: 'Save Q&A',
    subtitle: 'Persist in runtime state',
    x: 930,
    y: 390,
    w: 190,
    h: 86,
  },
  {
    id: 'update',
    title: 'Cumulative Understanding',
    subtitle: 'Input + all Q&A',
    x: 620,
    y: 390,
    w: 230,
    h: 86,
  },
  {
    id: 'check',
    title: 'Diagram Readiness',
    subtitle: 'Completeness check',
    x: 330,
    y: 390,
    w: 210,
    h: 86,
  },
  {
    id: 'task5',
    title: 'Task 5 Context',
    subtitle: 'Mermaid handoff input',
    x: 60,
    y: 390,
    w: 190,
    h: 86,
  },
];

const graphEdges: GraphEdge[] = [
  {
    id: 'e1',
    from: 'task3',
    to: 'understand',
    label: 'processed input',
    kind: 'normal',
  },
  {
    id: 'e2',
    from: 'understand',
    to: 'question',
    label: 'understanding',
    kind: 'normal',
  },
  {
    id: 'e3',
    from: 'question',
    to: 'answer',
    label: 'question',
    kind: 'normal',
  },
  {
    id: 'e4',
    from: 'answer',
    to: 'save',
    label: 'answer',
    kind: 'normal',
  },
  {
    id: 'e5',
    from: 'save',
    to: 'update',
    label: 'saved Q&A',
    kind: 'normal',
  },
  {
    id: 'e6',
    from: 'update',
    to: 'check',
    label: 'cumulative understanding',
    kind: 'normal',
  },
  {
    id: 'e7',
    from: 'check',
    to: 'task5',
    label: 'ready / skip',
    kind: 'handoff',
  },
  {
    id: 'e8',
    from: 'check',
    to: 'question',
    label: 'more clarification needed',
    kind: 'loop',
  },
  {
    id: 'e9',
    from: 'answer',
    to: 'task5',
    label: 'skip allowed',
    kind: 'skip',
  },
];

function nodeById(id: string) {
  const node = graphNodes.find((item) => item.id === id);
  if (!node) throw new Error(`Unknown node: ${id}`);
  return node;
}

function nodeCenter(node: GraphNode) {
  return {
    x: node.x + node.w / 2,
    y: node.y + node.h / 2,
  };
}

function edgePath(edge: GraphEdge): string {
  const from = nodeById(edge.from);
  const to = nodeById(edge.to);

  const a = nodeCenter(from);
  const b = nodeCenter(to);

  if (edge.kind === 'loop') {
    return `M ${a.x} ${a.y - 44} C ${a.x + 40} ${a.y - 190}, ${b.x - 40} ${b.y - 190}, ${b.x} ${b.y - 44}`;
  }

  if (edge.kind === 'skip') {
    return `M ${a.x - 70} ${a.y + 30} C ${a.x - 260} ${a.y + 150}, ${b.x + 260} ${b.y + 150}, ${b.x + 70} ${b.y + 30}`;
  }

  return `M ${a.x} ${a.y} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x} ${b.y}`;
}

function labelPosition(edge: GraphEdge) {
  const from = nodeCenter(nodeById(edge.from));
  const to = nodeCenter(nodeById(edge.to));

  if (edge.kind === 'loop') {
    return {
      x: (from.x + to.x) / 2,
      y: 88,
    };
  }

  if (edge.kind === 'skip') {
    return {
      x: (from.x + to.x) / 2,
      y: 580,
    };
  }

  return {
    x: (from.x + to.x) / 2,
    y: (from.y + to.y) / 2 - 12,
  };
}

function getNodeStatus(nodeId: string, state: Layer1GraphState): NodeStatus {
  if (state.nextAction === 'error') {
    const latestErrorSource = state.errors.at(-1)?.source ?? '';

    if (['update', 'check'].includes(nodeId) || latestErrorSource.includes(nodeId)) {
      return 'error';
    }
  }

  if (nodeId === 'task3') {
    return state.processedInput ? 'done' : 'pending';
  }

  if (nodeId === 'understand') {
    if (!state.processedInput) return 'pending';
    if (state.nextAction === 'ask_question' && !state.currentQuestion) return 'active';
    return 'done';
  }

  if (nodeId === 'question') {
    if (state.nextAction === 'ask_question') return 'active';
    if (state.currentQuestion || state.questions.length > 0) return 'done';
    return state.processedInput ? 'waiting' : 'pending';
  }

  if (nodeId === 'answer') {
    if (state.nextAction === 'wait_for_answer') return 'active';
    if (getAnswerCount(state) > 0) return 'done';
    return state.currentQuestion ? 'waiting' : 'pending';
  }

  if (nodeId === 'save') {
    if (state.nextAction === 'update_understanding') return 'active';
    if (getAnswerCount(state) > 0) return 'done';
    return 'pending';
  }

  if (nodeId === 'update') {
    if (state.nextAction === 'update_understanding') return 'active';
    if (getAnswerCount(state) > 0) return 'done';
    return 'pending';
  }

  if (nodeId === 'check') {
    if (state.nextAction === 'check_completeness') return 'active';
    if (state.completeness) return 'done';
    return getAnswerCount(state) > 0 ? 'waiting' : 'pending';
  }

  if (nodeId === 'task5') {
    if (state.nextAction === 'generate_diagram') return 'active';
    if (state.diagramGenerationContext || state.activeStep === 'diagram') return 'done';
    return 'pending';
  }

  return 'pending';
}

function getEdgeStatus(edge: GraphEdge, state: Layer1GraphState): NodeStatus {
  const fromStatus = getNodeStatus(edge.from, state);
  const toStatus = getNodeStatus(edge.to, state);

  if (edge.kind === 'skip') {
    if (state.diagramGenerationContext?.status === 'skipped_to_diagram') return 'done';
    if (state.nextAction === 'wait_for_answer' || state.currentQuestion) return 'waiting';
    return 'pending';
  }

  if (edge.kind === 'handoff') {
    if (state.diagramGenerationContext) return 'done';
    if (state.nextAction === 'generate_diagram') return 'active';
    return 'pending';
  }

  if (edge.kind === 'loop') {
    if (state.nextAction === 'ask_question' && getAnswerCount(state) > 0) return 'active';
    if (state.questions.length > 1) return 'done';
    return 'pending';
  }

  if (toStatus === 'active') return 'active';
  if (fromStatus === 'done' && ['done', 'active', 'waiting'].includes(toStatus)) {
    return 'done';
  }
  if (fromStatus === 'done') return 'waiting';

  return 'pending';
}

function nodeClasses(status: NodeStatus) {
  if (status === 'done') {
    return {
      box: 'border-emerald-300 bg-emerald-50 shadow-emerald-100',
      title: 'text-emerald-950',
      sub: 'text-emerald-700',
      badge: 'bg-emerald-500 text-white',
      label: 'DONE',
    };
  }

  if (status === 'active') {
    return {
      box: 'border-blue-400 bg-blue-50 shadow-blue-200 ring-4 ring-blue-100',
      title: 'text-blue-950',
      sub: 'text-blue-700',
      badge: 'bg-blue-600 text-white',
      label: 'ACTIVE',
    };
  }

  if (status === 'waiting') {
    return {
      box: 'border-violet-300 bg-violet-50 shadow-violet-100',
      title: 'text-violet-950',
      sub: 'text-violet-700',
      badge: 'bg-violet-500 text-white',
      label: 'WAITING',
    };
  }

  if (status === 'error') {
    return {
      box: 'border-amber-400 bg-amber-50 shadow-amber-100',
      title: 'text-amber-950',
      sub: 'text-amber-700',
      badge: 'bg-amber-500 text-white',
      label: 'NOTE',
    };
  }

  return {
    box: 'border-slate-200 bg-white shadow-slate-100',
    title: 'text-slate-800',
    sub: 'text-slate-500',
    badge: 'bg-slate-200 text-slate-600',
    label: 'PENDING',
  };
}

function edgeClasses(status: NodeStatus, kind: GraphEdge['kind']) {
  if (status === 'done') {
    return {
      stroke: '#10b981',
      width: 3,
      dash: kind === 'loop' ? '8 8' : '',
      opacity: 1,
    };
  }

  if (status === 'active') {
    return {
      stroke: '#2563eb',
      width: 4,
      dash: '10 6',
      opacity: 1,
    };
  }

  if (status === 'waiting') {
    return {
      stroke: '#8b5cf6',
      width: 3,
      dash: '5 8',
      opacity: 0.9,
    };
  }

  return {
    stroke: '#cbd5e1',
    width: 2,
    dash: '4 8',
    opacity: 0.7,
  };
}

export function Layer1GraphViewer({ graphState }: { graphState: Layer1GraphState }) {
  const [isOpen, setIsOpen] = useState(false);
  const context = graphState.diagramGenerationContext;

  const stats = useMemo(
    () => ({
      activeStep: graphState.activeStep,
      nextAction: graphState.nextAction,
      questions: graphState.questions.length,
      answers: getAnswerCount(graphState),
      task5: context ? 'Prepared' : 'Not ready',
    }),
    [context, graphState]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 transition hover:bg-blue-100"
      >
        Open LangGraph Viewer
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="max-h-[94vh] w-full max-w-[1500px] overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-7 py-5">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Layer 1 LangGraph Orchestration
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Live node-edge workflow for constructive clarification and Task 5 Mermaid handoff.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="grid max-h-[calc(94vh-94px)] grid-cols-1 overflow-y-auto lg:grid-cols-[1fr_340px]">
              <main className="p-6">
                <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
                  {[
                    ['Active Step', stats.activeStep],
                    ['Next Action', stats.nextAction],
                    ['Questions', String(stats.questions)],
                    ['Answers', String(stats.answers)],
                    ['Task 5 Input', stats.task5],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                        {label}
                      </div>
                      <div className="mt-1 truncate text-sm font-black text-slate-900">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[radial-gradient(circle_at_1px_1px,#dbe3ef_1px,transparent_0)] p-4 shadow-inner [background-size:22px_22px]">
                  <svg
                    viewBox="0 0 1180 650"
                    className="h-[650px] w-full min-w-[980px]"
                    role="img"
                    aria-label="Layer 1 LangGraph orchestration graph"
                  >
                    <defs>
                      <marker
                        id="arrow"
                        markerWidth="12"
                        markerHeight="12"
                        refX="10"
                        refY="6"
                        orient="auto"
                        markerUnits="strokeWidth"
                      >
                        <path d="M2,2 L10,6 L2,10 z" fill="#64748b" />
                      </marker>

                      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow
                          dx="0"
                          dy="8"
                          stdDeviation="8"
                          floodColor="#0f172a"
                          floodOpacity="0.13"
                        />
                      </filter>
                    </defs>

                    {graphEdges.map((edge) => {
                      const status = getEdgeStatus(edge, graphState);
                      const style = edgeClasses(status, edge.kind);
                      const label = labelPosition(edge);

                      return (
                        <g key={edge.id}>
                          <path
                            d={edgePath(edge)}
                            fill="none"
                            stroke={style.stroke}
                            strokeWidth={style.width}
                            strokeDasharray={style.dash}
                            opacity={style.opacity}
                            markerEnd="url(#arrow)"
                          >
                            {status === 'active' && (
                              <animate
                                attributeName="stroke-dashoffset"
                                values="24;0"
                                dur="0.9s"
                                repeatCount="indefinite"
                              />
                            )}
                          </path>

                          <rect
                            x={label.x - 76}
                            y={label.y - 13}
                            width="152"
                            height="26"
                            rx="13"
                            fill="white"
                            opacity="0.94"
                          />
                          <text
                            x={label.x}
                            y={label.y + 4}
                            textAnchor="middle"
                            className="fill-slate-500 text-[11px] font-bold"
                          >
                            {edge.label}
                          </text>
                        </g>
                      );
                    })}

                    {graphNodes.map((node) => {
                      const status = getNodeStatus(node.id, graphState);
                      const classes = nodeClasses(status);

                      const fill =
                        status === 'done'
                          ? '#ecfdf5'
                          : status === 'active'
                            ? '#eff6ff'
                            : status === 'waiting'
                              ? '#f5f3ff'
                              : status === 'error'
                                ? '#fffbeb'
                                : '#ffffff';

                      const stroke =
                        status === 'done'
                          ? '#10b981'
                          : status === 'active'
                            ? '#2563eb'
                            : status === 'waiting'
                              ? '#8b5cf6'
                              : status === 'error'
                                ? '#f59e0b'
                                : '#cbd5e1';

                      return (
                        <g key={node.id} filter="url(#softShadow)">
                          <rect
                            x={node.x}
                            y={node.y}
                            width={node.w}
                            height={node.h}
                            rx="22"
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={status === 'active' ? 3 : 2}
                          />

                          <circle cx={node.x + 28} cy={node.y + 28} r="14" fill={stroke} />

                          <text
                            x={node.x + 28}
                            y={node.y + 33}
                            textAnchor="middle"
                            className="fill-white text-[13px] font-black"
                          >
                            {status === 'done'
                              ? '✓'
                              : status === 'active'
                                ? '●'
                                : status === 'waiting'
                                  ? '…'
                                  : status === 'error'
                                    ? '!'
                                    : '○'}
                          </text>

                          <text
                            x={node.x + 54}
                            y={node.y + 32}
                            className="fill-slate-950 text-[15px] font-black"
                          >
                            {node.title}
                          </text>

                          <text
                            x={node.x + 54}
                            y={node.y + 56}
                            className="fill-slate-500 text-[12px] font-semibold"
                          >
                            {node.subtitle}
                          </text>

                          <rect
                            x={node.x + node.w - 74}
                            y={node.y + node.h - 28}
                            width="58"
                            height="18"
                            rx="9"
                            fill={stroke}
                            opacity={status === 'pending' ? 0.18 : 1}
                          />

                          <text
                            x={node.x + node.w - 45}
                            y={node.y + node.h - 15}
                            textAnchor="middle"
                            className={
                              status === 'pending'
                                ? 'fill-slate-500 text-[8px] font-black'
                                : 'fill-white text-[8px] font-black'
                            }
                          >
                            {classes.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold">
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                    Solid green = completed
                  </div>
                  <div className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                    Animated blue = active
                  </div>
                  <div className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">
                    Dashed purple = waiting/available
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    Grey dashed = pending
                  </div>
                </div>
              </main>

              <aside className="border-l border-slate-200 bg-slate-50 p-6">
                <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <h3 className="text-sm font-black text-emerald-950">Task 5 Handoff Contract</h3>

                  <div className="mt-4 space-y-3 text-sm text-emerald-800">
                    <div className="flex justify-between gap-3">
                      <span>Prepared</span>
                      <span className="font-black">{context ? 'yes' : 'no'}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Status</span>
                      <span className="font-black">{context?.status ?? 'waiting'}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Source</span>
                      <span className="font-black text-right">
                        {context?.source ?? 'layer1 runtime'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Raw input alone</span>
                      <span className="font-black">
                        {context?.task5Instructions.mustNotUseRawInputAlone
                          ? 'forbidden'
                          : 'pending'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Mermaid diagram next</span>
                      <span className="font-black">{context ? 'yes' : 'pending'}</span>
                    </div>
                  </div>
                </section>

                <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-sm font-black text-slate-950">Cumulative Context</h3>

                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Original input</span>
                      <span className="font-black text-slate-900">
                        {graphState.rawInputs.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processed input</span>
                      <span className="font-black text-slate-900">
                        {graphState.processedInput ? 'yes' : 'no'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Questions</span>
                      <span className="font-black text-slate-900">
                        {graphState.questions.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Answers</span>
                      <span className="font-black text-slate-900">
                        {getAnswerCount(graphState)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completeness</span>
                      <span className="font-black text-slate-900">
                        {graphState.completeness ? 'checked' : 'pending'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Future Mujarrad node</span>
                      <span className="font-black text-slate-900">
                        {context?.mujarradPersistenceDraft.shouldCreateOrUpdateMujarradNodeLater
                          ? 'prepared'
                          : 'pending'}
                      </span>
                    </div>
                  </div>
                </section>

                {graphState.errors.length > 0 && (
                  <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <h3 className="text-sm font-black text-amber-950">Runtime Notes</h3>

                    <div className="mt-3 space-y-3 text-xs text-amber-800">
                      {graphState.errors.slice(-4).map((error) => (
                        <div key={error.id}>
                          <div className="font-black">{error.source}</div>
                          <div>{error.message}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </aside>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
