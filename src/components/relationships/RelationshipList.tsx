'use client';

import { attributeService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attributeKeyLabels } from '@/schemas';
import { AttributeKey } from '@/types/backend-dtos';
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
      {attributes.map((attr) => {
        // Use attributeName or attributeType for lookup
        const attrKey = (attr.attributeName || attr.attributeType) as AttributeKey;
        const label = attributeKeyLabels[attrKey] || attrKey;
        return (
          <div key={attr.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Badge>{label}</Badge>
              <div>
                <p className="text-sm font-medium">→ Node {attr.targetNodeId}</p>
                {attr.attributeValue && typeof attr.attributeValue === 'object' && Object.keys(attr.attributeValue).length > 0 && (
                  <p className="text-xs text-muted-foreground">{JSON.stringify(attr.attributeValue)}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteAttribute(Number(attr.id))}
            >
              Remove
            </Button>
          </div>
        );
      })}
    </div>
  );
}
