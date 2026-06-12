export function Layer2Locked() {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Layer 2
          </p>

          <h3 className="mt-1 text-lg font-semibold text-slate-950">
            Abstract Logic
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Locked for now. This layer will start only after Layer 1 creates the
            approved artifact bundle.
          </p>

          <ul className="mt-3 list-inside list-disc text-sm leading-6 text-slate-600">
            <li>final-system-spec.md</li>
            <li>system-diagram.drawio.xml</li>
            <li>system-diagram.png or system-diagram.svg</li>
            <li>optional system-diagram-summary.md</li>
          </ul>
        </div>

        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
          Locked
        </span>
      </div>
    </section>
  );
}
