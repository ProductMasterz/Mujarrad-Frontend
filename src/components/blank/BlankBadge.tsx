'use client';

import { Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useBlankCount } from '@/hooks/api/useBlankNodes';

interface BlankBadgeProps {
  spaceSlug: string;
  className?: string;
}

export function BlankBadge({ spaceSlug, className }: BlankBadgeProps) {
  const { data: count } = useBlankCount(spaceSlug);

  if (!count) return null;

  return (
    <Badge
      variant="secondary"
      className={`inline-flex items-center gap-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 ${className ?? ''}`}
    >
      <Inbox className="h-3 w-3" />
      {count}
    </Badge>
  );
}
