'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWorkspaceSchema, type CreateWorkspaceFormData } from '@/schemas';
import { useCreateWorkspace } from '@/hooks/api';
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
import { Textarea } from '@/components/ui/textarea';
import { isApiError } from '@/lib/errors';

export function CreateWorkspaceDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createWorkspace, isPending } = useCreateWorkspace();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  const onSubmit = (data: CreateWorkspaceFormData) => {
    createWorkspace(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
      onError: (error) => {
        if (isApiError(error)) {
          setError('root', { message: error.getUserMessage() });
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Workspace</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to organize your knowledge graph
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="My Workspace" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="my-workspace" {...register('slug')} />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="A workspace for..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
