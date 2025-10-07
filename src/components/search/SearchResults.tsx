'use client';

import { useSearchNodes } from '@/hooks/api';
import { NodeCard } from '@/components/nodes/NodeCard';
import { Spinner } from '@/components/ui/spinner';

interface SearchResultsProps {
  workspaceSlug: string;
  query: string;
}

export function SearchResults({ workspaceSlug, query }: SearchResultsProps) {
  const { data, isLoading } = useSearchNodes(workspaceSlug, query);

  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Enter a search query to find nodes</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data?.content.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No results found for &quot;{query}&quot;</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Found {data.page.totalElements} result{data.page.totalElements !== 1 ? 's' : ''}
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.content.map((node) => (
          <NodeCard key={node.id} node={node} workspaceSlug={workspaceSlug} />
        ))}
      </div>
    </div>
  );
}
