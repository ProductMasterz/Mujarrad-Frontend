'use client';

import Link from 'next/link';
import { Workspace } from '@/types/backend-dtos';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';

interface WorkspaceCardProps {
  workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Link href={`/workspaces/${workspace.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle>{workspace.name}</CardTitle>
          <CardDescription>{workspace.slug}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>Updated {formatRelativeTime(workspace.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
