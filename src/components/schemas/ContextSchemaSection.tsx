'use client';

import { Lock, Unlock, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ContextType } from '@/types/backend-dtos';
import { SchemaFieldItem } from './SchemaFieldItem';

interface ContextSchemaSectionProps {
  contextType: ContextType | null | undefined;
  isLocked: boolean;
}

export function ContextSchemaSection({ contextType, isLocked }: ContextSchemaSectionProps) {
  if (!contextType) {
    return (
      <div className="rounded-[14px] border border-dashed border-border/60 bg-muted/30 px-5 py-6 text-center">
        <Database className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No schema defined for this context</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Create a Context Type to define the schema
        </p>
      </div>
    );
  }

  const fields = Object.entries(contextType.attributeSchema || {});
  const LockIcon = isLocked ? Lock : Unlock;

  return (
    <div className="rounded-[14px] border border-border/60 bg-background shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Schema</h3>
          <Badge variant="outline" className="text-xs">
            {contextType.name}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <LockIcon className={`h-3.5 w-3.5 ${isLocked ? 'text-amber-500' : 'text-muted-foreground/50'}`} />
          <span className={`text-xs ${isLocked ? 'text-amber-600 font-medium' : 'text-muted-foreground/60'}`}>
            {isLocked ? 'Locked' : 'Editable'}
          </span>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="px-4 py-4 text-sm text-muted-foreground">
          No fields defined — all attributes accepted
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {fields.map(([name, field]) => (
            <SchemaFieldItem
              key={name}
              name={name}
              field={field}
              isLocked={isLocked}
            />
          ))}
        </div>
      )}

      {contextType.schemaRelationships && contextType.schemaRelationships.length > 0 && (
        <div className="border-t border-border/40 px-4 py-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Relationships</h4>
          <div className="flex flex-wrap gap-2">
            {contextType.schemaRelationships.map((rel, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {rel.type} → {rel.targetContextType} ({rel.cardinality})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
