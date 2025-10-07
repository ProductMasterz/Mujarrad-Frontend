'use client';

import { useNodes } from '@/hooks/api';
import { NodeCard } from './NodeCard';
import { Spinner } from '@/components/ui/spinner';

interface NodeListProps {
  workspaceSlug: string;
}

export function NodeList({ workspaceSlug }: NodeListProps) {
  const { data, isLoading, error } = useNodes(workspaceSlug);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load nodes</p>
      </div>
    );
  }

  const nodes = data?.content || [];

  if (nodes.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No nodes yet</p>
        <p className="text-sm text-muted-foreground mt-2">Create your first node to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {nodes.map((node) => (
        <NodeCard key={node.id} node={node} workspaceSlug={workspaceSlug} />
      ))}
    </div>
  );
}
