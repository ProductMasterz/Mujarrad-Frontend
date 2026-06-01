'use client';

import { useState } from 'react';
import { Inbox, Trash2, ArrowRightCircle, Pencil } from 'lucide-react';
import { useVoidNodes, useDeleteVoidNode } from '@/hooks/api/useVoidNodes';
import { useNotificationStore } from '@/stores/notificationStore';
import { AssignVoidDialog } from '@/components/void/AssignVoidDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VoidPage() {
  const { data: nodes, isLoading } = useVoidNodes();
  const deleteMutation = useDeleteVoidNode();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [assignNodeId, setAssignNodeId] = useState<string | null>(null);

  const handleDelete = (nodeId: string) => {
    deleteMutation.mutate(nodeId, {
      onSuccess: () => {
        addNotification({ type: 'success', source: 'node', title: 'Note deleted' });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <Inbox className="size-16 text-indigo-400/60" strokeWidth={1} />
        <p className="text-lg text-muted-foreground">No quick notes yet</p>
        <p className="text-sm text-muted-foreground">Use the Quick Note button to capture ideas fast.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-300">The Void</h1>
        <p className="text-sm text-muted-foreground mt-1">Quick notes — assign to a space and context when ready</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((node: any) => (
          <Card
            key={node.id}
            className="flex flex-col gap-2 border-neutral-300/60 bg-neutral-100/40 p-4 dark:border-neutral-700/50 dark:bg-neutral-900/30"
          >
            <h3 className="font-medium text-foreground">{node.title}</h3>
            {node.content && (
              <p className="line-clamp-3 text-sm text-muted-foreground">{node.content}</p>
            )}
            <p className="mt-auto pt-2 text-xs text-muted-foreground">
              {new Date(node.createdAt).toLocaleDateString()}
            </p>
            <div className="flex gap-1 pt-1">
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => setAssignNodeId(node.id)}
              >
                <ArrowRightCircle className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-destructive hover:text-destructive"
                onClick={() => handleDelete(node.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {assignNodeId && (
        <AssignVoidDialog
          nodeId={assignNodeId}
          open={!!assignNodeId}
          onOpenChange={(open) => { if (!open) setAssignNodeId(null); }}
        />
      )}
    </div>
  );
}
