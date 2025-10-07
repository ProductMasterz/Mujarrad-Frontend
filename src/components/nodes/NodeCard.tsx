'use client';

import Link from 'next/link';
import { Node, NodeType } from '@/types/backend-dtos';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { truncate, formatRelativeTime } from '@/lib/utils';

interface NodeCardProps {
  node: Node;
  workspaceSlug: string;
}

const nodeTypeColors: Record<NodeType, string> = {
  [NodeType.REGULAR]: 'bg-blue-100 text-blue-800',
  [NodeType.CONTEXT]: 'bg-purple-100 text-purple-800',
  [NodeType.ASSUMPTION]: 'bg-yellow-100 text-yellow-800',
};

export function NodeCard({ node, workspaceSlug }: NodeCardProps) {
  return (
    <Link href={`/workspaces/${workspaceSlug}/nodes/${node.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
    </Link>
  );
}
