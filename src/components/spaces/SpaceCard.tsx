'use client';

import Link from 'next/link';
import { Space } from '@/types/backend-dtos';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';

interface SpaceCardProps {
  space: Space;
}

export function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Link href={`/spaces/${space.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle>{space.name}</CardTitle>
          <CardDescription>{space.slug}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>Updated {formatRelativeTime(space.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
