'use client';

import { versionService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { formatDateTime } from '@/lib/utils';

interface VersionHistoryProps {
  spaceSlug: string;
  nodeId: number;
  currentVersion: number;
}

export function VersionHistory({ spaceSlug, nodeId, currentVersion }: VersionHistoryProps) {
  const queryClient = useQueryClient();

  const { data: versions, isLoading } = useQuery({
    queryKey: ['spaces', spaceSlug, 'nodes', nodeId, 'versions'],
    queryFn: () => versionService.getNodeVersions(spaceSlug, nodeId),
  });

  const { mutate: restoreVersion, isPending: isRestoring } = useMutation({
    mutationFn: (versionId: number) =>
      versionService.restoreVersion(spaceSlug, nodeId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'nodes', nodeId] });
      queryClient.invalidateQueries({
        queryKey: ['spaces', spaceSlug, 'nodes', nodeId, 'versions']
      });
    },
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (!versions?.length) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">No version history</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {versions.map((version) => (
        <div
          key={version.id}
          className="flex items-start justify-between p-4 border rounded-lg"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">Version {version.version}</span>
              {version.version === currentVersion && (
                <Badge variant="secondary">Current</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(version.createdAt)}
            </p>
            <p className="text-sm mt-2 line-clamp-2">{version.title}</p>
          </div>
          {version.version !== currentVersion && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => restoreVersion(version.id)}
              disabled={isRestoring}
            >
              Restore
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
