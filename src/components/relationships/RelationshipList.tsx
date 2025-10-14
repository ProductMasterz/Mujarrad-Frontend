'use client';

import { attributeService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attributeKeyLabels } from '@/schemas';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

interface RelationshipListProps {
  spaceSlug: string;
  nodeId: number;
}

export function RelationshipList({ spaceSlug, nodeId }: RelationshipListProps) {
  const queryClient = useQueryClient();

  const { data: attributes, isLoading } = useQuery({
    queryKey: ['spaces', spaceSlug, 'nodes', nodeId, 'attributes'],
    queryFn: () => attributeService.getNodeAttributes(nodeId.toString()),
  });

  const { mutate: deleteAttribute } = useMutation({
    mutationFn: (attributeId: number) =>
      attributeService.deleteAttribute(nodeId.toString(), attributeId.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['spaces', spaceSlug, 'nodes', nodeId, 'attributes']
      });
      queryClient.invalidateQueries({
        queryKey: ['spaces', spaceSlug, 'graph']
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
