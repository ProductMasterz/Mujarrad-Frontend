'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import { nodeKeys } from '@/hooks/api';
import { NodeType } from '@/types/backend-dtos';

interface ContextListProps {
  spaceSlug: string;
  onSelectContext?: (contextSlug: string) => void;
}

export function ContextList({ spaceSlug, onSelectContext }: ContextListProps) {
  const [activeContext, setActiveContext] = useState<string | null>(null);

  const { data: nodes = [] } = useQuery({
    queryKey: nodeKeys.list(spaceSlug, { page: 1, size: 1000 }),
    queryFn: () => nodeService.getNodes(spaceSlug, { page: 1, size: 1000 }),
    enabled: !!spaceSlug,
  });

  const contexts = useMemo(
    () => (Array.isArray(nodes) ? nodes : []).filter((n) => n.nodeType === NodeType.CONTEXT),
    [nodes]
  );

  const handleClick = (contextSlug: string | null) => {
    setActiveContext(contextSlug);
    if (onSelectContext) {
      onSelectContext(contextSlug || '');
    }
  };

  return (
    <div className="space-y-1">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Contexts
      </h3>

      <button
        type="button"
        onClick={() => handleClick(null)}
        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
          activeContext === null
            ? 'bg-primary/10 font-medium text-primary'
            : 'text-foreground hover:bg-muted'
        }`}
      >
        All Nodes
      </button>

      {contexts.length === 0 ? (
        <p className="px-3 py-2 text-xs text-muted-foreground">No contexts</p>
      ) : (
        contexts.map((ctx) => (
          <button
            key={ctx.id}
            type="button"
            onClick={() => handleClick(ctx.id)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
              activeContext === ctx.id
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            {ctx.title}
          </button>
        ))
      )}
    </div>
  );
}
