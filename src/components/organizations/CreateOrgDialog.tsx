'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateOrganization } from '@/hooks/api/useOrganizations';
import { useNotificationStore } from '@/stores/notificationStore';

type CreateOrgDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateOrgDialog({ open, onOpenChange }: CreateOrgDialogProps) {
  const [name, setName] = useState('');
  const createOrg = useCreateOrganization();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const handleCreate = () => {
    if (!name.trim()) return;
    createOrg.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          addNotification({ type: 'success', source: 'system', title: 'Organization created' });
          setName('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Team Organization</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="org-name">Organization Name</Label>
          <Input
            id="org-name"
            placeholder="My Team"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || createOrg.isPending}>
            {createOrg.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
