'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAttributeSchema, type CreateAttributeFormData, attributeKeyLabels, attributeKeyDescriptions } from '@/schemas';
import { useCreateAttribute, useNodes } from '@/hooks/api';
import { AttributeKey } from '@/types/backend-dtos';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isApiError } from '@/lib/errors';

interface CreateRelationshipDialogProps {
  workspaceSlug: string;
  sourceNodeId: number;
  sourceNodeName: string;
}

export function CreateRelationshipDialog({
  workspaceSlug,
  sourceNodeId,
  sourceNodeName
}: CreateRelationshipDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: nodesData } = useNodes(workspaceSlug);
  const { mutate: createAttribute, isPending: isLoading } = useCreateAttribute(workspaceSlug);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
    reset,
  } = useForm<CreateAttributeFormData>({
    resolver: zodResolver(createAttributeSchema),
  });

  const selectedAttributeKey = watch('attributeKey');

  const onSubmit = (data: CreateAttributeFormData) => {
    createAttribute(
      { sourceNodeId, data },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
        onError: (error) => {
          if (isApiError(error)) {
            if (error.statusCode === 409) {
              setError('root', {
                message: 'Circular containment detected. This relationship would create a cycle.'
              });
            } else {
              setError('root', { message: error.getUserMessage() });
            }
          }
        },
      }
    );
  };

  const availableNodes = nodesData?.content.filter(node => node.id !== sourceNodeId) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Relationship</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Relationship</DialogTitle>
          <DialogDescription>
            Create a relationship from <strong>{sourceNodeName}</strong> to another node
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="targetNodeId">Target Node</Label>
              <Select onValueChange={(value) => setValue('targetNodeId', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a node" />
                </SelectTrigger>
                <SelectContent>
                  {availableNodes.map((node) => (
                    <SelectItem key={node.id} value={String(node.id)}>
                      {node.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.targetNodeId && (
                <p className="text-sm text-destructive">{errors.targetNodeId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="attributeKey">Relationship Type</Label>
              <Select onValueChange={(value) => setValue('attributeKey', value as AttributeKey)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(attributeKeyLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.attributeKey && (
                <p className="text-sm text-destructive">{errors.attributeKey.message}</p>
              )}
              {selectedAttributeKey && (
                <p className="text-xs text-muted-foreground">
                  {attributeKeyDescriptions[selectedAttributeKey]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="attributeValue">Label (optional)</Label>
              <Input id="attributeValue" placeholder="e.g., implements, extends" {...register('attributeValue')} />
              {errors.attributeValue && (
                <p className="text-sm text-destructive">{errors.attributeValue.message}</p>
              )}
            </div>

            {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !availableNodes.length}>
              {isLoading ? 'Creating...' : 'Create Relationship'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
