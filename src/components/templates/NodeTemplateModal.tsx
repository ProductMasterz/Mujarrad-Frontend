'use client';

import { useMemo, useState } from 'react';
import { X, Search, LayoutTemplate, Check } from 'lucide-react';
import {
  NODE_TEMPLATES,
  getNodeTemplateCategories,
  type NodeTemplate,
} from './nodeTemplates';
import { Button } from '@/components/ui/button';

type NodeTemplateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: NodeTemplate, mode: 'replace' | 'append') => Promise<void> | void;
  showApplyMode?: boolean;
};

export function NodeTemplateModal({
  isOpen,
  onClose,
  onUseTemplate,
  showApplyMode = true,
}: NodeTemplateModalProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    NODE_TEMPLATES[0]?.id ?? ''
  );
  const [mode, setMode] = useState<'replace' | 'append'>('replace');
  const [isApplying, setIsApplying] = useState(false);

  const categories = useMemo(() => ['All', ...getNodeTemplateCategories()], []);

  const filteredTemplates = useMemo(() => {
    const term = search.trim().toLowerCase();

    return NODE_TEMPLATES.filter((template) => {
      const matchesCategory = category === 'All' || template.category === category;

      const matchesSearch =
        !term ||
        template.name.toLowerCase().includes(term) ||
        template.description.toLowerCase().includes(term) ||
        template.bestFor.toLowerCase().includes(term) ||
        template.category.toLowerCase().includes(term) ||
        template.blocks.some((block) =>
          block.content.toLowerCase().includes(term)
        );

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const selectedTemplate =
    filteredTemplates.find((template) => template.id === selectedTemplateId) ??
    filteredTemplates[0] ??
    NODE_TEMPLATES[0];

  if (!isOpen) return null;

  const handleUseTemplate = async () => {
    if (!selectedTemplate) return;

    setIsApplying(true);
    try {
      await onUseTemplate(selectedTemplate, showApplyMode ? mode : 'replace');
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/50 px-4">
      <div className="flex h-[min(760px,calc(100vh-40px))] w-[min(1180px,calc(100vw-32px))] flex-col overflow-hidden rounded-[28px] border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
              <LayoutTemplate className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Node templates</h2>
              <p className="text-sm text-muted-foreground">
                Choose a template, preview its blocks, then apply it to this node.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[360px_1fr]">
          <div className="min-h-0 border-b border-border md:border-b-0 md:border-r">
            <div className="border-b border-border p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search templates..."
                  className="h-11 w-full rounded-2xl border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      category === item
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-full overflow-y-auto p-3">
              {filteredTemplates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No templates found.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTemplates.map((template) => {
                    const isSelected = template.id === selectedTemplate?.id;

                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplateId(template.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                            : 'border-border bg-background hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-foreground">
                              {template.name}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {template.category}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>

                        <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">
                          {template.description}
                        </p>

                        <div className="mt-3 text-xs text-muted-foreground">
                          {template.blocks.length} blocks
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-col">
            {selectedTemplate ? (
              <>
                <div className="border-b border-border p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="mb-2 inline-flex rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                        {selectedTemplate.category}
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground">
                        {selectedTemplate.name}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {selectedTemplate.description}
                      </p>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        <span className="font-medium text-foreground">Best for:</span>{' '}
                        {selectedTemplate.bestFor}
                      </p>
                    </div>

                    {selectedTemplate.semanticType && (
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                        style={{
                          backgroundColor: `${selectedTemplate.accentColor ?? '#94a3b8'}22`,
                          color: selectedTemplate.accentColor ?? '#94a3b8',
                        }}
                      >
                        {selectedTemplate.semanticType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-6">
                  <div className="mx-auto max-w-3xl rounded-[24px] border border-border bg-background p-6 shadow-sm">
                    <div className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Preview
                    </div>

                    <div className="space-y-3">
                      {selectedTemplate.blocks.map((block, index) => (
                        <div
                          key={`${block.type}-${index}`}
                          className="rounded-2xl border border-border bg-muted/20 p-4"
                        >
                          <div className="mb-2 inline-flex rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {block.type.replace(/_/g, ' ')}
                          </div>

                          {block.type === 'divider' ? (
                            <div className="border-t border-border py-2" />
                          ) : block.type === 'todo' ? (
                            <div className="flex items-center gap-3 text-sm text-foreground">
                              <input type="checkbox" checked={!!block.checked} readOnly />
                              <span>{block.content || 'Empty task'}</span>
                            </div>
                          ) : block.type.startsWith('heading') ? (
                            <div className="text-lg font-semibold text-foreground">
                              {block.content || 'Untitled heading'}
                            </div>
                          ) : block.type === 'quote' ? (
                            <blockquote className="border-l-4 border-border pl-4 text-sm italic text-muted-foreground">
                              {block.content || 'Quote'}
                            </blockquote>
                          ) : block.type === 'callout' ? (
                            <div className="rounded-xl border border-border bg-background p-3 text-sm text-foreground">
                              {block.content || 'Callout'}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                              {block.content || 'Empty text block'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  {showApplyMode ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground">Apply mode:</span>

                      <button
                        type="button"
                        onClick={() => setMode('replace')}
                        className={`rounded-xl border px-3 py-2 text-sm transition ${
                          mode === 'replace'
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        Replace and transfer content
                      </button>

                      <button
                        type="button"
                        onClick={() => setMode('append')}
                        className={`rounded-xl border px-3 py-2 text-sm transition ${
                          mode === 'append'
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        Insert below
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      This template will be added after the node is created.
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleUseTemplate}
                      disabled={isApplying}
                    >
                      {isApplying ? 'Applying...' : 'Use this template'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Select a template.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NodeTemplateModal;