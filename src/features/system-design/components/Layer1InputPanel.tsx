'use client';

import { useLayer1Store } from '../stores/useLayer1Store';

export function Layer1InputPanel() {
  const graphState = useLayer1Store(
    (state) => state.graphState,
  );

  const latestRawInput =
    graphState.rawInputs.at(-1);

  const processedInput =
    graphState.processedInput;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          Input
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Describe the system you want to build
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Use the assistant panel to type,
          upload a text file, or describe the
          system by voice. The input is processed
          by the existing Layer 1 LangGraph
          workflow before clarification begins.
        </p>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Input Status
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              {processedInput
                ? 'Input processed'
                : 'Waiting for system description'}
            </h2>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              processedInput
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {processedInput
              ? 'Ready'
              : 'Not processed'}
          </span>
        </div>

        {!latestRawInput ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <div className="font-bold text-slate-800">
              Start in the assistant
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Add a system description using text,
              voice, or a .txt file. All input
              processing still runs through
              LangGraph.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <StatusCard
                label="Source"
                value={latestRawInput.sourceType.replaceAll(
                  '_',
                  ' ',
                )}
              />

              <StatusCard
                label="File"
                value={
                  latestRawInput.metadata?.fileName ??
                  'None'
                }
              />

              <StatusCard
                label="Processed"
                value={
                  processedInput
                    ? 'Yes'
                    : 'No'
                }
              />

              <StatusCard
                label="Chunks"
                value={
                  processedInput
                    ? String(
                        processedInput.inputSize
                          .chunkCount,
                      )
                    : '—'
                }
              />
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Current Input Preview
              </div>

              <div className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {latestRawInput.rawText}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-1 break-words text-sm font-black capitalize text-slate-950">
        {value}
      </div>
    </div>
  );
}
