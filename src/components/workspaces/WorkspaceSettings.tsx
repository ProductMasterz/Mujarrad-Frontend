'use client';

import { useWorkspace } from '@/hooks/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EditWorkspaceDialog } from './EditWorkspaceDialog';
import { DeleteWorkspaceDialog } from './DeleteWorkspaceDialog';
import { CollaboratorList } from './CollaboratorList';

interface WorkspaceSettingsProps {
  workspaceSlug: string;
  currentUserId: string;
}

export function WorkspaceSettings({ workspaceSlug, currentUserId }: WorkspaceSettingsProps) {
  const { data: workspace, isLoading } = useWorkspace(workspaceSlug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Workspace not found</p>
      </div>
    );
  }

  const isOwner = workspace.ownerId === currentUserId;
  const isCollaborator = workspace.collaborators?.some(c => c.userId === currentUserId);
  const canEdit = isOwner || isCollaborator;

  return (
    <div className="space-y-6">
      {/* Workspace Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{workspace.name}</CardTitle>
              <CardDescription>Workspace settings and information</CardDescription>
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
              <p className="font-mono">{workspace.slug}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p>{new Date(workspace.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Description</p>
              <p>{workspace.description || 'No description'}</p>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-2 pt-4 border-t">
              <EditWorkspaceDialog workspaceSlug={workspaceSlug} />
              {isOwner && (
                <DeleteWorkspaceDialog
                  workspaceId={workspace.id}
                  workspaceName={workspace.name}
                  nodeCount={workspace.nodeCount || 0}
                  relationshipCount={workspace.relationshipCount || 0}
                  versionCount={workspace.versionCount || 0}
                />
              )}
            </div>
          )}

          {!canEdit && (
            <p className="text-sm text-muted-foreground pt-4 border-t">
              You have read-only access to this workspace
            </p>
          )}
        </CardContent>
      </Card>

      {/* Collaborators Card */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Collaborators</CardTitle>
            <CardDescription>Manage who can access and edit this workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <CollaboratorList workspaceId={workspace.id} isOwner={isOwner} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
