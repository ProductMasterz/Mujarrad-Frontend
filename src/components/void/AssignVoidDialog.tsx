'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSpaces } from '@/hooks/api';
import { useAssignVoidToSpace } from '@/hooks/api/useVoidNodes';
import { useNotificationStore } from '@/stores/notificationStore';

type AssignVoidDialogProps = {
  nodeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AssignVoidDialog({ nodeId, open, onOpenChange }: AssignVoidDialogProps) {
  const [spaceId, setSpaceId] = useState('');
  const { data: spaces } = useSpaces();
  const assignMutation = useAssignVoidToSpace();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const handleAssign = () => {
    if (!spaceId) return;
    assignMutation.mutate(
      { nodeId, spaceId },
      {
        onSuccess: () => {
          addNotification({ type: 'success', source: 'node', title: 'Note assigned to space' });
          setSpaceId('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign to Space</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Select value={spaceId} onValueChange={setSpaceId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a space..." />
            </SelectTrigger>
            <SelectContent>
              {(spaces ?? []).map((space: any) => (
                <SelectItem key={space.id} value={space.id}>
                  {space.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!spaceId || assignMutation.isPending}>
            {assignMutation.isPending ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
