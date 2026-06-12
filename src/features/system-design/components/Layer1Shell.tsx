export function Layer1Shell() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Layer 1 Active
        </p>

        <h2 className="text-2xl font-semibold text-slate-950">
          System Design Workflow
        </h2>

        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Task 1 creates the shell and architecture foundation only. The next
          tasks will add the input pipeline, LangGraph state machine,
          clarification loop, Markdown specification, Draw.io generation, and
          final exports.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          'Input',
          'Processing',
          'Clarification',
          'Specification',
          'Diagram',
          'Review',
          'Export',
          'Layer 2 Ready',
        ].map((step, index) => (
          <div
            key={step}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-xs font-semibold text-slate-500">
              Step {index + 1}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{step}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        LangGraph execution will be wired through server-side Next.js API routes
        in the following tasks. The browser UI must not call the AI provider
        directly.
      </div>
    </section>
  );
}
