'use client';

import { useState } from 'react';
import { Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContextTypes, useDeleteContextType } from '@/hooks/api/useContextTypes';
import { useNotificationStore } from '@/stores/notificationStore';
import { SchemaViewer } from './SchemaViewer';
import { CreateContextTypeDialog } from './CreateContextTypeDialog';
import type { ContextType } from '@/types/backend-dtos';

interface ContextTypeListProps {
  spaceId: string;
  isLocked?: boolean;
}

export function ContextTypeList({ spaceId, isLocked }: ContextTypeListProps) {
  const { data: contextTypes, isLoading } = useContextTypes(spaceId);
  const deleteContextType = useDeleteContextType();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const handleDelete = (ct: ContextType) => {
    deleteContextType.mutate(
      { spaceId, slug: ct.slug },
      {
        onSuccess: () => {
          addNotification({ type: 'success', source: 'node', title: 'Context type deleted' });
        },
        onError: () => {
          addNotification({ type: 'error', source: 'node', title: 'Failed to delete context type' });
        },
      }
    );
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-4">Loading schemas...</p>;
  }

  const types = contextTypes || [];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Context Types</h2>
        <Button size="sm" disabled={isLocked} onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Create Context Type
        </Button>
      </div>

      {/* List */}
      {types.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No schemas defined for this space</p>
      ) : (
        <div className="border rounded-md divide-y">
          {types.map((ct) => (
            <div key={ct.slug}>
              <div
                className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedSlug(expandedSlug === ct.slug ? null : ct.slug)}
              >
                {expandedSlug === ct.slug ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="font-medium">{ct.name}</span>
                <span className="text-sm text-muted-foreground">{ct.slug}</span>
                <Badge variant="secondary">{Object.keys(ct.attributeSchema || {}).length} fields</Badge>
                <Badge variant="secondary">{(ct.schemaRelationships || []).length} rels</Badge>
                {ct.isBuiltin && <Badge variant="outline">Built-in</Badge>}
                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={ct.isBuiltin || isLocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(ct);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {expandedSlug === ct.slug && (
                <div className="px-6 py-3 bg-muted/30">
                  <SchemaViewer contextType={ct} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateContextTypeDialog
        spaceId={spaceId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
