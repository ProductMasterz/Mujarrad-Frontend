'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateContextType } from '@/hooks/api/useContextTypes';
import { useNotificationStore } from '@/stores/notificationStore';
import type { FieldSchema, SchemaRelationshipDefinition } from '@/types/backend-dtos';

interface FieldRow {
  name: string;
  type: FieldSchema['type'];
  required: boolean;
}

interface RelRow {
  type: string;
  targetContextType: string;
  cardinality: SchemaRelationshipDefinition['cardinality'];
}

interface CreateContextTypeDialogProps {
  spaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceMode?: 'CONFIGURATION' | 'PRODUCTION';
}

const FIELD_TYPES: FieldSchema['type'][] = ['STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'NODE_REF', 'LIST'];
const CARDINALITIES: SchemaRelationshipDefinition['cardinality'][] = ['ONE_TO_ONE', 'ONE_TO_MANY', 'MANY_TO_ONE', 'MANY_TO_MANY'];

export function CreateContextTypeDialog({ spaceId, open, onOpenChange, spaceMode }: CreateContextTypeDialogProps) {
  const createContextType = useCreateContextType();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [name, setName] = useState('');
  const [fields, setFields] = useState<FieldRow[]>([]);
  const [relationships, setRelationships] = useState<RelRow[]>([]);

  const reset = () => {
    setName('');
    setFields([]);
    setRelationships([]);
  };

  const handleSubmit = () => {
    const attributeSchema: Record<string, FieldSchema> = {};
    for (const f of fields) {
      if (f.name.trim()) {
        attributeSchema[f.name.trim()] = { type: f.type, required: f.required };
      }
    }

    const schemaRelationships: SchemaRelationshipDefinition[] = relationships
      .filter((r) => r.type.trim() && r.targetContextType.trim())
      .map((r) => ({ type: r.type.trim(), targetContextType: r.targetContextType.trim(), cardinality: r.cardinality }));

    createContextType.mutate(
      {
        spaceId,
        data: {
          name: name.trim(),
          attributeSchema: Object.keys(attributeSchema).length > 0 ? attributeSchema : undefined,
          schemaRelationships: schemaRelationships.length > 0 ? schemaRelationships : undefined,
        },
        spaceMode,
      },
      {
        onSuccess: () => {
          addNotification({ type: 'success', source: 'node', title: 'Context type created' });
          reset();
          onOpenChange(false);
        },
        onError: () => {
          addNotification({ type: 'error', source: 'node', title: 'Failed to create context type' });
        },
      }
    );
  };

  const addField = () => setFields([...fields, { name: '', type: 'STRING', required: false }]);
  const removeField = (i: number) => setFields(fields.filter((_, idx) => idx !== i));
  const updateField = (i: number, patch: Partial<FieldRow>) => setFields(fields.map((f, idx) => idx === i ? { ...f, ...patch } : f));

  const addRel = () => setRelationships([...relationships, { type: '', targetContextType: '', cardinality: 'ONE_TO_MANY' }]);
  const removeRel = (i: number) => setRelationships(relationships.filter((_, idx) => idx !== i));
  const updateRel = (i: number, patch: Partial<RelRow>) => setRelationships(relationships.map((r, idx) => idx === i ? { ...r, ...patch } : r));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Context Type</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="ct-name">Name *</Label>
            <Input id="ct-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Person" />
          </div>

          {/* Fields */}
          <div className="space-y-2">
            <Label>Fields</Label>
            {fields.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  placeholder="Field name"
                  value={f.name}
                  onChange={(e) => updateField(i, { name: e.target.value })}
                />
                <Select value={f.type} onValueChange={(v) => updateField(i, { type: v as FieldSchema['type'] })}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) => updateField(i, { required: e.target.checked })}
                  />
                  Req
                </label>
                <Button variant="ghost" size="icon" onClick={() => removeField(i)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addField}>
              <Plus className="h-4 w-4 mr-1" /> Add Field
            </Button>
          </div>

          {/* Relationships */}
          <div className="space-y-2">
            <Label>Relationships</Label>
            {relationships.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  placeholder="Type (e.g. ASSIGNED_TO)"
                  value={r.type}
                  onChange={(e) => updateRel(i, { type: e.target.value })}
                />
                <Input
                  className="flex-1"
                  placeholder="Target slug"
                  value={r.targetContextType}
                  onChange={(e) => updateRel(i, { targetContextType: e.target.value })}
                />
                <Select value={r.cardinality} onValueChange={(v) => updateRel(i, { cardinality: v as SchemaRelationshipDefinition['cardinality'] })}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARDINALITIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => removeRel(i)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addRel}>
              <Plus className="h-4 w-4 mr-1" /> Add Relationship
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || createContextType.isPending}>
            {createContextType.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
