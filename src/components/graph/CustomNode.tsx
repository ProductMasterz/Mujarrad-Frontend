'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeType } from '@/types/backend-dtos';
import { cn } from '@/lib/utils';

const nodeTypeStyles: Record<NodeType, string> = {
  [NodeType.REGULAR]: 'bg-white border-[#d9d9d9]',
  [NodeType.CONTEXT]: 'bg-purple-50 border-purple-500',
  [NodeType.ASSUMPTION]: 'bg-yellow-50 border-yellow-500',
  [NodeType.TEMPLATE]: 'bg-green-50 border-green-500',
};

const entityTypeStyles: Record<string, string> = {
  person: 'bg-blue-50 border-blue-500',
  place: 'bg-emerald-50 border-emerald-500',
  event: 'bg-orange-50 border-orange-500',
  topic: 'bg-violet-50 border-violet-500',
  action: 'bg-rose-50 border-rose-500',
};

export const CustomNode = memo(({ data }: NodeProps) => {
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
  const entityStyle =
    normalizedEntityType && entityTypeStyles[normalizedEntityType]
      ? entityTypeStyles[normalizedEntityType]
      : null;

  const nodeTypeLabel =
    nodeType === NodeType.CONTEXT
      ? 'folder'
      : nodeType === NodeType.ASSUMPTION
      ? 'assumption'
      : 'document';

  return (
    <div
      className={cn(
        'px-4 py-2 shadow-md rounded-md border-2 min-w-[150px]',
        entityStyle ?? nodeTypeStyles[nodeType] ?? 'bg-white border-[#d9d9d9]'
      )}
      role="button"
      aria-label={`${label} (${normalizedEntityType || nodeTypeLabel})`}
      tabIndex={0}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" aria-hidden="true" />
      <div className="text-sm font-medium">{label}</div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" aria-hidden="true" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';