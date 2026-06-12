export function Layer3Locked() {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Layer 3
          </p>

          <h3 className="mt-1 text-lg font-semibold text-slate-950">
            Code Machine
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Locked for now. This layer will start only after future Layer 2
            produces validated abstract logic output.
          </p>
        </div>

        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
          Locked
        </span>
      </div>
    </section>
  );
}
