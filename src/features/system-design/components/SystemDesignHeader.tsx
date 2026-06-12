import { SYSTEM_DESIGN_CONFIG } from '../config/systemDesignConfig';

export function SystemDesignHeader() {
  return (
    <header className="border-b border-slate-200 bg-white px-6 py-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Mujarrad Orchestration
        </p>

        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              {SYSTEM_DESIGN_CONFIG.productName}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Layer 1 of the Mujarrad orchestration system. Build a structured
              system specification, generate a Draw.io architecture diagram, and
              prepare the approved artifact bundle for future Layer 2.
            </p>
          </div>

          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
            LangGraph orchestration: server-side
          </div>
        </div>
      </div>
    </header>
  );
}
