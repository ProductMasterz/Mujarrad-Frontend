import { SYSTEM_DESIGN_CONFIG } from '../config/systemDesignConfig';

const layers = [
  SYSTEM_DESIGN_CONFIG.layers.layer1,
  SYSTEM_DESIGN_CONFIG.layers.layer2,
  SYSTEM_DESIGN_CONFIG.layers.layer3,
];

export function LayerNavigation() {
  return (
    <section className="border-b border-slate-200 bg-slate-50 px-6 py-4">
      <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
        {layers.map((layer) => {
          const isActive = layer.status === 'active';

          return (
            <article
              key={layer.id}
              className={[
                'rounded-2xl border p-4 shadow-sm transition',
                isActive
                  ? 'border-slate-900 bg-white'
                  : 'border-slate-200 bg-white/70 opacity-75',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {layer.name}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-950">
                    {layer.title}
                  </h2>
                </div>

                <span
                  className={[
                    'rounded-full px-3 py-1 text-xs font-medium',
                    isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500',
                  ].join(' ')}
                >
                  {isActive ? 'Active' : 'Locked'}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {layer.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

