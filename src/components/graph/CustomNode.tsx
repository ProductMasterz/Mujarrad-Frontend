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
    border: 'border-[#d9d9d9]',
    accent: 'bg-[#9ca3af]',
    badgeBg: 'bg-[#f3f4f6]',
    badgeText: 'text-[#4b5563]',
    surface: 'bg-white',
    label: 'Regular',
  },
  [NodeType.CONTEXT]: {
    border: 'border-purple-200',
    accent: 'bg-purple-500',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    surface: 'bg-purple-50',
    label: 'Context',
  },
  [NodeType.ASSUMPTION]: {
    border: 'border-yellow-200',
    accent: 'bg-yellow-500',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-700',
    surface: 'bg-yellow-50',
    label: 'Assumption',
  },
  [NodeType.TEMPLATE]: {
    border: 'border-green-200',
    accent: 'bg-green-500',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
    surface: 'bg-green-50',
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
    border: 'border-blue-200',
    accent: 'bg-blue-500',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    surface: 'bg-blue-50',
    label: 'Person',
  },
  place: {
    border: 'border-emerald-200',
    accent: 'bg-emerald-500',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    surface: 'bg-emerald-50',
    label: 'Place',
  },
  event: {
    border: 'border-orange-200',
    accent: 'bg-orange-500',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
    surface: 'bg-orange-50',
    label: 'Event',
  },
  topic: {
    border: 'border-violet-200',
    accent: 'bg-violet-500',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-700',
    surface: 'bg-violet-50',
    label: 'Topic',
  },
  action: {
    border: 'border-rose-200',
    accent: 'bg-rose-500',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700',
    surface: 'bg-rose-50',
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
        'group relative min-w-[180px] max-w-[220px] overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200',
        styleConfig.border,
        styleConfig.surface,
        selected
          ? 'ring-2 ring-[#3b82f6]/30 shadow-[0px_10px_24px_rgba(59,130,246,0.18)]'
          : 'hover:shadow-[0px_10px_24px_rgba(0,0,0,0.10)]'
      )}
      role="button"
      aria-label={`${label} (${nodeTypeLabel})`}
      tabIndex={0}
    >
      <Handle type="target" position={Position.Top} className="h-2 w-2" aria-hidden="true" />

      <div className={cn('h-1.5 w-full', styleConfig.accent)} />

      <div className="px-3 py-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="line-clamp-2 text-sm font-semibold leading-5 text-[#111827]">
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

        <div className="text-[11px] text-[#6b7280]">
          {normalizedEntityType ? 'Entity node' : `${nodeTypeLabel} node`}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="h-2 w-2" aria-hidden="true" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';