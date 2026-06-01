'use client';

import { useRouter } from 'next/navigation';
import { FolderOpen, FileText, Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ContextCardProps {
  spaceSlug: string;
  contextId: string;
  contextSlug: string;
  title: string;
  nodeCount?: number;
  schemaName?: string;
  isBuiltin?: boolean;
  lockLevel?: string;
}

export function ContextCard({
  spaceSlug,
  contextId,
  contextSlug,
  title,
  nodeCount = 0,
  schemaName,
  isBuiltin,
  lockLevel,
}: ContextCardProps) {
  const router = useRouter();

  const isLocked = lockLevel === 'CONTENT_LOCKED' || lockLevel === 'FULLY_LOCKED';

  return (
    <Card
      className="cursor-pointer border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md transition-all group"
      onClick={() => router.push(`/spaces/${spaceSlug}/context/${contextSlug}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
              <FolderOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-sm leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {title}
              </h3>
            </div>
          </div>
          {isBuiltin && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-300">
              System
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
          </span>
          {schemaName && (
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              {schemaName}
            </span>
          )}
          {isLocked && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-400 text-amber-600">
              Locked
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
