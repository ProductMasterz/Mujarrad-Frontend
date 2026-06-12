import { SYSTEM_DESIGN_CONFIG } from '../config/systemDesignConfig';

const layers = [
  SYSTEM_DESIGN_CONFIG.layers.layer1,
  SYSTEM_DESIGN_CONFIG.layers.layer2,
  SYSTEM_DESIGN_CONFIG.layers.layer3,
];

export function LayerNavigation() {
  return (
    <section className="px-6">
      <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
        {layers.map((layer) => {
          const isActive = layer.status === 'active';

          return (
            <article
              key={layer.id}
              className={[
                'rounded-2xl border px-4 py-3 shadow-sm transition',
                isActive
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-white/70 bg-white/80 text-slate-950',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p
                    className={[
                      'text-[11px] font-bold uppercase tracking-wide',
                      isActive ? 'text-blue-200' : 'text-slate-500',
                    ].join(' ')}
                  >
                    {layer.name}
                  </p>

                  <h2 className="mt-0.5 text-base font-black">
                    {layer.title}
                  </h2>
                </div>

                <span
                  className={[
                    'rounded-full px-3 py-1 text-[11px] font-bold',
                    isActive
                      ? 'bg-emerald-400 text-emerald-950'
                      : 'bg-slate-100 text-slate-500',
                  ].join(' ')}
                >
                  {isActive ? 'Active' : 'Locked'}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}