'use client';

import { Badge } from '@/components/ui/badge';
import type { ContextType } from '@/types/backend-dtos';

const TYPE_COLORS: Record<string, string> = {
  STRING: 'bg-blue-100 text-blue-800',
  NUMBER: 'bg-green-100 text-green-800',
  BOOLEAN: 'bg-amber-100 text-amber-800',
  DATE: 'bg-purple-100 text-purple-800',
  NODE_REF: 'bg-cyan-100 text-cyan-800',
  LIST: 'bg-indigo-100 text-indigo-800',
};

interface SchemaViewerProps {
  contextType: ContextType;
}

export function SchemaViewer({ contextType }: SchemaViewerProps) {
  const fields = Object.entries(contextType.attributeSchema || {});
  const relationships = contextType.schemaRelationships || [];

  if (fields.length === 0 && relationships.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No schema defined — all fields accepted
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-lg">{contextType.name}</h3>
        <span className="text-sm text-muted-foreground">{contextType.slug}</span>
        {contextType.isBuiltin && (
          <Badge variant="secondary">Built-in</Badge>
        )}
      </div>

      {/* Fields table */}
      {fields.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Fields</h4>
          <div className="border rounded-md divide-y">
            {fields.map(([name, field]) => (
              <div key={name} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="font-bold min-w-[120px]">{name}</span>
                <Badge className={TYPE_COLORS[field.type] || ''} variant="outline">
                  {field.type}
                </Badge>
                <Badge variant={field.required ? 'destructive' : 'secondary'}>
                  {field.required ? 'Required' : 'Optional'}
                </Badge>
                {field.description && (
                  <span className="text-muted-foreground">{field.description}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relationships section */}
      {relationships.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Relationships</h4>
          <div className="border rounded-md divide-y">
            {relationships.map((rel, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                <Badge variant="outline">{rel.type}</Badge>
                <span>→ {rel.targetContextType}</span>
                <Badge variant="secondary">{rel.cardinality}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
