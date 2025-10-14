'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inviteCollaboratorSchema, type InviteCollaboratorFormData } from '@/schemas';
import { useInviteCollaborator } from '@/hooks/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isApiError } from '@/lib/errors';

interface InviteCollaboratorDialogProps {
  spaceId: number;
}

export function InviteCollaboratorDialog({ spaceId }: InviteCollaboratorDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: inviteCollaborator, isPending: isLoading } = useInviteCollaborator(spaceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<InviteCollaboratorFormData>({
    resolver: zodResolver(inviteCollaboratorSchema),
  });

  const onSubmit = (data: InviteCollaboratorFormData) => {
    inviteCollaborator(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
      onError: (error) => {
        if (isApiError(error)) {
          setError('root', { message: error.getUserMessage() });
        } else {
          setError('root', { message: 'Failed to invite collaborator' });
        }
      },
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Invite Collaborator</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
          <DialogDescription>
            Invite a user to collaborate on this space. They will have edit permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-destructive">{String(errors.email.message)}</p>}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="username"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{String(errors.username.message)}</p>
              )}
            </div>

            {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Inviting...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
