'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeType } from '@/types/backend-dtos';
import { cn } from '@/lib/utils';

const nodeTypeStyles: Record<NodeType, string> = {
  [NodeType.REGULAR]: 'bg-blue-50 border-blue-500',
  [NodeType.CONTEXT]: 'bg-purple-50 border-purple-500',
  [NodeType.ASSUMPTION]: 'bg-yellow-50 border-yellow-500',
};

export const CustomNode = memo(({ data }: NodeProps) => {
  const { label, nodeType } = data as { label: string; nodeType: NodeType };

  // T077: ARIA labels for graph nodes
  const nodeTypeLabel = nodeType === NodeType.CONTEXT ? 'folder' : nodeType === NodeType.ASSUMPTION ? 'assumption' : 'document';

  return (
    <div
      className={cn('px-4 py-2 shadow-md rounded-md border-2 min-w-[150px]', nodeTypeStyles[nodeType])}
      role="button"
      aria-label={`${label} (${nodeTypeLabel})`}
      tabIndex={0}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" aria-hidden="true" />
      <div className="text-sm font-medium">{label}</div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" aria-hidden="true" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
