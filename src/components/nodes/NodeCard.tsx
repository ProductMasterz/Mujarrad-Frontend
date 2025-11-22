'use client';

import { useRouter } from 'next/navigation';
import { Node, NodeType } from '@/types/backend-dtos';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { truncate, formatRelativeTime } from '@/lib/utils';

interface NodeCardProps {
  node: Node;
  spaceSlug: string;
}

const nodeTypeColors: Record<NodeType, string> = {
  [NodeType.REGULAR]: 'bg-blue-100 text-blue-800',
  [NodeType.CONTEXT]: 'bg-purple-100 text-purple-800',
  [NodeType.ASSUMPTION]: 'bg-yellow-100 text-yellow-800',
  [NodeType.TEMPLATE]: 'bg-green-100 text-green-800',
};

export function NodeCard({ node, spaceSlug }: NodeCardProps) {
  const router = useRouter();

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/spaces/${spaceSlug}/node/${node.id}`);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Single click can also navigate, or we can disable it
    // For now, keeping single-click navigation as well
    if (e.detail === 1) {
      router.push(`/spaces/${spaceSlug}/node/${node.id}`);
    }
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{node.title}</CardTitle>
          <Badge className={nodeTypeColors[node.nodeType]}>{node.nodeType}</Badge>
        </div>
        <CardDescription>
          {truncate(node.content, 100) || 'No content'}
        </CardDescription>
        <div className="text-xs text-muted-foreground pt-2">
          Updated {formatRelativeTime(node.updatedAt)}
        </div>
      </CardHeader>
    </Card>
  );
}
