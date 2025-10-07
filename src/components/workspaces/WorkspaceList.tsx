'use client';

import { useWorkspaces } from '@/hooks/api';
import { WorkspaceCard } from './WorkspaceCard';
import { Spinner } from '@/components/ui/spinner';

export function WorkspaceList() {
  const { data, isLoading, error } = useWorkspaces();

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
        <p className="text-destructive">Failed to load workspaces</p>
      </div>
    );
  }

  if (!data?.content.length) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No workspaces yet</p>
        <p className="text-sm text-muted-foreground mt-2">Create your first workspace to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.content.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </div>
  );
}
