'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeType } from '@/types/backend-dtos';
import { cn } from '@/lib/utils';

const nodeTypeStyles: Record<
  NodeType,
  {
    border: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
    surface: string;
    label: string;
  }
> = {
  [NodeType.REGULAR]: {
    border: 'border-border',
    accent: 'bg-slate-400 dark:bg-slate-500',
    badgeBg: 'bg-muted',
    badgeText: 'text-muted-foreground',
    surface: 'bg-background',
    label: 'Regular',
  },
  [NodeType.CONTEXT]: {
    border: 'border-purple-200 dark:border-purple-800',
    accent: 'bg-purple-500',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/60',
    badgeText: 'text-purple-700 dark:text-purple-200',
    surface: 'bg-purple-50 dark:bg-purple-950/30',
    label: 'Context',
  },
  [NodeType.ASSUMPTION]: {
    border: 'border-yellow-200 dark:border-yellow-800',
    accent: 'bg-yellow-500',
    badgeBg: 'bg-yellow-100 dark:bg-yellow-900/60',
    badgeText: 'text-yellow-700 dark:text-yellow-200',
    surface: 'bg-yellow-50 dark:bg-yellow-950/30',
    label: 'Assumption',
  },
  [NodeType.TEMPLATE]: {
    border: 'border-green-200 dark:border-green-800',
    accent: 'bg-green-500',
    badgeBg: 'bg-green-100 dark:bg-green-900/60',
    badgeText: 'text-green-700 dark:text-green-200',
    surface: 'bg-green-50 dark:bg-green-950/30',
    label: 'Template',
  },
};

const entityTypeStyles: Record<
  string,
  {
    border: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
    surface: string;
    label: string;
  }
> = {
  person: {
    border: 'border-blue-200 dark:border-blue-800',
    accent: 'bg-blue-500',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/60',
    badgeText: 'text-blue-700 dark:text-blue-200',
    surface: 'bg-blue-50 dark:bg-blue-950/30',
    label: 'Person',
  },
  place: {
    border: 'border-emerald-200 dark:border-emerald-800',
    accent: 'bg-emerald-500',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    badgeText: 'text-emerald-700 dark:text-emerald-200',
    surface: 'bg-emerald-50 dark:bg-emerald-950/30',
    label: 'Place',
  },
  event: {
    border: 'border-orange-200 dark:border-orange-800',
    accent: 'bg-orange-500',
    badgeBg: 'bg-orange-100 dark:bg-orange-900/60',
    badgeText: 'text-orange-700 dark:text-orange-200',
    surface: 'bg-orange-50 dark:bg-orange-950/30',
    label: 'Event',
  },
  topic: {
    border: 'border-violet-200 dark:border-violet-800',
    accent: 'bg-violet-500',
    badgeBg: 'bg-violet-100 dark:bg-violet-900/60',
    badgeText: 'text-violet-700 dark:text-violet-200',
    surface: 'bg-violet-50 dark:bg-violet-950/30',
    label: 'Topic',
  },
  action: {
    border: 'border-rose-200 dark:border-rose-800',
    accent: 'bg-rose-500',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/60',
    badgeText: 'text-rose-700 dark:text-rose-200',
    surface: 'bg-rose-50 dark:bg-rose-950/30',
    label: 'Action',
  },
};

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  const {
    label,
    nodeType,
    entityType,
  } = data as {
    label: string;
    nodeType: NodeType;
    entityType?: string;
  };

  const normalizedEntityType = entityType?.toLowerCase().trim();
  const styleConfig =
    (normalizedEntityType && entityTypeStyles[normalizedEntityType]) ||
    nodeTypeStyles[nodeType] ||
    nodeTypeStyles[NodeType.REGULAR];

  const nodeTypeLabel =
    normalizedEntityType
      ? styleConfig.label
      : nodeTypeStyles[nodeType]?.label || 'Node';

  return (
    <div
      className={cn(
        'group relative min-w-[180px] max-w-[220px] overflow-hidden rounded-[16px] border shadow-sm transition-all duration-200',
        styleConfig.border,
        styleConfig.surface,
        selected
          ? 'ring-2 ring-primary/30 shadow-[0px_10px_24px_rgba(59,130,246,0.18)]'
          : 'hover:shadow-[0px_10px_24px_rgba(0,0,0,0.10)] dark:hover:shadow-[0px_10px_24px_rgba(0,0,0,0.35)]'
      )}
      role="button"
      aria-label={`${label} (${nodeTypeLabel})`}
      tabIndex={0}
    >
      <Handle type="target" position={Position.Top} className="h-2 w-2" aria-hidden="true" />

      <div className={cn('h-1.5 w-full', styleConfig.accent)} />

      <div className="px-3 py-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
            {label}
          </div>

          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              styleConfig.badgeBg,
              styleConfig.badgeText
            )}
          >
            {nodeTypeLabel}
          </span>
        </div>

        <div className="text-[11px] text-muted-foreground">
          {normalizedEntityType ? 'Entity node' : `${nodeTypeLabel} node`}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="h-2 w-2" aria-hidden="true" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';