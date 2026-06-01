'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeType, type Node as BackendNode } from '@/types/backend-dtos';
import { cn } from '@/lib/utils';
import { useEntityTypeStore } from '@/stores/entityType.store';
import { getNodeEntityType } from '@/lib/entity-types';
import { Lock, Shield } from 'lucide-react';

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
  [NodeType.ATTRIBUTE]: {
    border: 'border-yellow-200 dark:border-yellow-800',
    accent: 'bg-yellow-500',
    badgeBg: 'bg-yellow-100 dark:bg-yellow-900/60',
    badgeText: 'text-yellow-700 dark:text-yellow-200',
    surface: 'bg-yellow-50 dark:bg-yellow-950/30',
    label: 'Attribute',
  },
};


export const CustomNode = memo(({ data, selected }: NodeProps) => {
  const { label, nodeType, entityType, node } = data as {
    label: string;
    nodeType: NodeType;
    entityType?: string;
    node?: BackendNode;
  };

  const isLocked = node?.lockLevel && node.lockLevel !== 'UNLOCKED';
  const isFullyLocked = node?.lockLevel === 'FULLY_LOCKED';
  const isBuiltin = node?.isBuiltin === true;

  const getType = useEntityTypeStore((state) => state.getType);

  const normalizedEntityType =
    entityType?.toLowerCase().trim() || getNodeEntityType(node);

  const hasSemanticType =
    Boolean(normalizedEntityType) && normalizedEntityType !== 'unknown';

  const semanticConfig = getType(normalizedEntityType || 'unknown');
  const structuralConfig =
    nodeTypeStyles[nodeType] || nodeTypeStyles[NodeType.REGULAR];

  const nodeTypeLabel = hasSemanticType
    ? semanticConfig.label
    : structuralConfig.label;


  return (
    <div
      className={cn(
        'group relative min-w-[180px] max-w-[220px] overflow-hidden rounded-[16px] border shadow-sm transition-all duration-200',
        hasSemanticType ? 'border-border' : structuralConfig.border,
        hasSemanticType ? 'bg-background' : structuralConfig.surface,
        selected
          ? 'ring-2 ring-primary/30 shadow-[0px_10px_24px_rgba(59,130,246,0.18)]'
          : 'hover:shadow-[0px_10px_24px_rgba(0,0,0,0.10)] dark:hover:shadow-[0px_10px_24px_rgba(0,0,0,0.35)]'
      )}
      role="button"
      aria-label={`${label} (${nodeTypeLabel})`}
      tabIndex={0}
    >
      <Handle type="target" position={Position.Top} className="h-2 w-2" aria-hidden="true" />

      <div
        className={cn('h-1.5 w-full', !hasSemanticType && structuralConfig.accent)}
        style={hasSemanticType ? { backgroundColor: semanticConfig.color } : undefined}
      />

      <div className="px-3 py-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="line-clamp-2 text-sm font-semibold leading-5 text-foreground flex items-center gap-1.5">
            {isBuiltin && (
              <Shield className="h-3.5 w-3.5 shrink-0 text-blue-500" aria-label="Built-in node" />
            )}
            {isLocked && (
              <Lock
                className={cn(
                  'h-3.5 w-3.5 shrink-0',
                  isFullyLocked ? 'text-red-500' : 'text-amber-500'
                )}
                aria-label={isFullyLocked ? 'Fully locked' : 'Content locked'}
              />
            )}
            {label}
          </div>

          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              !hasSemanticType && structuralConfig.badgeBg,
              !hasSemanticType && structuralConfig.badgeText
            )}
            style={
              hasSemanticType
                ? {
                    backgroundColor: `${semanticConfig.color}22`,
                    color: semanticConfig.color,
                  }
                : undefined
            }
          >
            {nodeTypeLabel}
          </span>
        </div>

        <div className="text-[11px] text-muted-foreground">
          {isBuiltin
            ? 'Built-in'
            : isLocked
            ? isFullyLocked
              ? 'Fully locked'
              : 'Content locked'
            : hasSemanticType
            ? 'Semantic node'
            : `${nodeTypeLabel} node`}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="h-2 w-2" aria-hidden="true" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';