'use client';

import { useSpace } from '@/hooks/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EditSpaceDialog } from './EditSpaceDialog';
import { DeleteSpaceDialog } from './DeleteSpaceDialog';
import { CollaboratorList } from './CollaboratorList';

interface SpaceSettingsProps {
  spaceSlug: string;
  currentUserId: string;
}

export function SpaceSettings({ spaceSlug, currentUserId }: SpaceSettingsProps) {
  const { data: space, isLoading } = useSpace(spaceSlug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Space not found</p>
      </div>
    );
  }

  const isOwner = space.ownerId === currentUserId;
  // TODO: Implement collaborator check when API is ready
  const canEdit = isOwner;

  return (
    <div className="space-y-6">
      {/* Space Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{space.name}</CardTitle>
              <CardDescription>Space settings and information</CardDescription>
            </div>
            <Badge variant={isOwner ? 'default' : 'secondary'}>
              {isOwner ? 'Owner' : 'Collaborator'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Slug</p>
              <p className="font-mono">{space.slug}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p>{new Date(space.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-2 pt-4 border-t">
              <EditSpaceDialog spaceSlug={spaceSlug} />
              {isOwner && (
                <DeleteSpaceDialog
                  spaceId={Number(space.id)}
                  spaceName={space.name}
                  nodeCount={0}
                  relationshipCount={0}
                  versionCount={0}
                />
              )}
            </div>
          )}

          {!canEdit && (
            <p className="text-sm text-muted-foreground pt-4 border-t">
              You have read-only access to this space
            </p>
          )}
        </CardContent>
      </Card>

      {/* Collaborators Card */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Collaborators</CardTitle>
            <CardDescription>Manage who can access and edit this space</CardDescription>
          </CardHeader>
          <CardContent>
            <CollaboratorList spaceId={Number(space.id)} isOwner={isOwner} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
