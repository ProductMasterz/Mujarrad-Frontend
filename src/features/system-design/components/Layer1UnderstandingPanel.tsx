'use client';

import type {
  SystemUnderstanding,
} from '../types/layer1.types';

export function Layer1UnderstandingPanel({
  understanding,
}: {
  understanding: SystemUnderstanding;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-900">
          System Understanding
        </h3>

        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
          Confidence:{' '}
          {Math.round(
            understanding.confidence *
              100,
          )}
          %
        </span>
      </div>

      <div className="space-y-5">
        <UnderstandingSection
          title="Goal"
        >
          <p className="text-sm leading-6 text-slate-600">
            {understanding.goal ||
              'Not specified yet'}
          </p>
        </UnderstandingSection>

        {understanding.summary ? (
          <UnderstandingSection
            title="Current Summary"
          >
            <p className="text-sm leading-6 text-slate-600">
              {understanding.summary}
            </p>
          </UnderstandingSection>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <StringList
            title="Primary Users"
            items={
              understanding.primaryUsers
            }
          />

          <StringList
            title="Roles"
            items={
              understanding.roles
            }
          />
        </div>

        <UnderstandingSection
          title="Main Workflows"
        >
          {understanding.workflows.length ? (
            <div className="space-y-3">
              {understanding.workflows.map(
                (workflow) => (
                  <div
                    key={workflow.id}
                    className="rounded-xl border border-blue-100 bg-blue-50/50 p-3"
                  >
                    <p className="text-sm font-bold text-slate-800">
                      {workflow.title}
                    </p>

                    {workflow.steps.length ? (
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-5 text-slate-600">
                        {workflow.steps.map(
                          (
                            step,
                            index,
                          ) => (
                            <li
                              key={`${workflow.id}-${index}`}
                            >
                              {step}
                            </li>
                          ),
                        )}
                      </ol>
                    ) : null}
                  </div>
                ),
              )}
            </div>
          ) : (
            <EmptyState />
          )}
        </UnderstandingSection>

        <UnderstandingSection
          title="Key Entities"
        >
          {understanding.entities.length ? (
            <div className="flex flex-wrap gap-2">
              {understanding.entities.map(
                (entity) => (
                  <span
                    key={entity.id}
                    className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
                  >
                    {entity.name}
                  </span>
                ),
              )}
            </div>
          ) : (
            <EmptyState />
          )}
        </UnderstandingSection>

        <NamedList
          title="Integrations"
          items={understanding.integrations.map(
            (item) => ({
              id: item.id,
              text: item.name,
            }),
          )}
        />

        <NamedList
          title="Business Rules"
          items={understanding.businessRules.map(
            (item) => ({
              id: item.id,
              text: item.rule,
            }),
          )}
        />

        <NamedList
          title="Security"
          items={understanding.security.map(
            (item) => ({
              id: item.id,
              text: item.requirement,
            }),
          )}
        />

        <StringList
          title="Open Questions"
          items={
            understanding.openQuestions
          }
        />
      </div>
    </div>
  );
}

function UnderstandingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
        {title}
      </h4>

      {children}
    </section>
  );
}

function StringList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <UnderstandingSection
      title={title}
    >
      {items.length ? (
        <ul className="space-y-1 text-sm text-slate-600">
          {items.map(
            (item, index) => (
              <li
                key={`${title}-${index}`}
              >
                • {item}
              </li>
            ),
          )}
        </ul>
      ) : (
        <EmptyState />
      )}
    </UnderstandingSection>
  );
}

function NamedList({
  title,
  items,
}: {
  title: string;
  items: Array<{
    id: string;
    text: string;
  }>;
}) {
  return (
    <UnderstandingSection
      title={title}
    >
      {items.length ? (
        <ul className="space-y-1 text-sm text-slate-600">
          {items.map(
            (item) => (
              <li key={item.id}>
                • {item.text}
              </li>
            ),
          )}
        </ul>
      ) : (
        <EmptyState />
      )}
    </UnderstandingSection>
  );
}

function EmptyState() {
  return (
    <p className="text-sm text-slate-400">
      None identified yet
    </p>
  );
}
