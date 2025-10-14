'use client';

import { useSpaces } from '@/hooks/api';
import { SpaceCard } from './SpaceCard';
import { Spinner } from '@/components/ui/spinner';

export function SpaceList() {
  const { data, isLoading, error } = useSpaces();

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
        <p className="text-destructive">Failed to load spaces</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No spaces yet</p>
        <p className="text-sm text-muted-foreground mt-2">Create your first space to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((space) => (
        <SpaceCard key={space.id} space={space} />
      ))}
    </div>
  );
}
