'use client';

import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { FieldSchema } from '@/types/backend-dtos';

const TYPE_COLORS: Record<string, string> = {
  STRING: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  NUMBER: 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/40 dark:text-green-300',
  BOOLEAN: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  DATE: 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  NODE_REF: 'border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  LIST: 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
};

interface SchemaFieldItemProps {
  name: string;
  field: FieldSchema;
  isLocked: boolean;
}

export function SchemaFieldItem({ name, field, isLocked }: SchemaFieldItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 text-sm group">
      {isLocked && (
        <Lock className="h-3 w-3 text-amber-500 flex-shrink-0" />
      )}
      <span className="font-medium min-w-[100px]">{name}</span>
      <Badge variant="outline" className={`text-xs ${TYPE_COLORS[field.type] || ''}`}>
        {field.type}
      </Badge>
      {field.required && (
        <Badge variant="destructive" className="text-xs">
          Required
        </Badge>
      )}
      {field.description && (
        <span className="text-muted-foreground text-xs truncate">{field.description}</span>
      )}
      {field.default !== undefined && field.default !== null && (
        <span className="text-xs text-muted-foreground/70 ml-auto">
          default: {String(field.default)}
        </span>
      )}
    </div>
  );
}
