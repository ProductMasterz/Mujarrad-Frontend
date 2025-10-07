'use client';

import { attributeService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attributeKeyLabels } from '@/schemas';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

interface RelationshipListProps {
  workspaceSlug: string;
  nodeId: number;
}

export function RelationshipList({ workspaceSlug, nodeId }: RelationshipListProps) {
  const queryClient = useQueryClient();

  const { data: attributes, isLoading } = useQuery({
    queryKey: ['workspaces', workspaceSlug, 'nodes', nodeId, 'attributes'],
    queryFn: () => attributeService.getNodeAttributes(workspaceSlug, nodeId),
  });

  const { mutate: deleteAttribute } = useMutation({
    mutationFn: (attributeId: number) =>
      attributeService.deleteAttribute(workspaceSlug, nodeId, attributeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceSlug, 'nodes', nodeId, 'attributes']
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceSlug, 'graph']
      });
    },
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (!attributes?.length) {
    return (
      <div className="text-center py-6 border-2 border-dashed rounded-lg">
        <p className="text-sm text-muted-foreground">No relationships yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {attributes.map((attr) => (
        <div key={attr.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Badge>{attributeKeyLabels[attr.attributeKey]}</Badge>
            <div>
              <p className="text-sm font-medium">→ Node {attr.targetNodeId}</p>
              {attr.attributeValue && (
                <p className="text-xs text-muted-foreground">{attr.attributeValue}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteAttribute(attr.id)}
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
