import { SYSTEM_DESIGN_CONFIG } from '../config/systemDesignConfig';

export function SystemDesignHeader() {
  return (
    <header className="px-6 pb-4">
      <div className="mx-auto max-w-7xl rounded-3xl border border-white/70 bg-white/90 px-5 py-4 shadow-md shadow-slate-200/70 backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Mujarrad
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              {SYSTEM_DESIGN_CONFIG.productName}
            </h1>
          </div>

          <div className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white">
            LangGraph
          </div>
        </div>
      </div>
    </header>
  );
}