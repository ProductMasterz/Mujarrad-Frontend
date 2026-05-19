'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, FileText, Folder, Loader2 } from 'lucide-react';
import { useSearchNodes } from '@/hooks/api';
import { useSpaces } from '@/hooks/api';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSpaceSlug?: string;
}

export function CommandPalette({ open, onOpenChange, currentSpaceSlug }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedSpace, setSelectedSpace] = useState<string>(currentSpaceSlug || '');

  // Fetch spaces for space switcher
  const { data: spaces } = useSpaces();

  // Update selected space when current space changes
  useEffect(() => {
    if (currentSpaceSlug) {
      setSelectedSpace(currentSpaceSlug);
    }
  }, [currentSpaceSlug]);

  // Search nodes in the selected space
  const { data: searchResponse, isLoading } = useSearchNodes(
    selectedSpace,
    search,
    {}
  );
  const searchResults = searchResponse?.content || [];

  const handleSelectNode = useCallback((nodeId: string) => {
    if (selectedSpace) {
      router.push(`/spaces/${selectedSpace}/node/${nodeId}`);
      onOpenChange(false);
      setSearch('');
    }
  }, [selectedSpace, router, onOpenChange]);

  const handleSelectSpace = useCallback((slug: string) => {
    router.push(`/spaces/${slug}`);
    onOpenChange(false);
    setSearch('');
  }, [router, onOpenChange]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <Command className="rounded-lg border-none shadow-lg">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Search nodes or switch space..."
              value={search}
              onValueChange={setSearch}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                'No results found.'
              )}
            </Command.Empty>

            {/* Spaces Group */}
            {!search && spaces && spaces.length > 0 && (
              <Command.Group heading="Spaces">
                {spaces.map((space) => (
                  <Command.Item
                    key={space.slug}
                    value={`space-${space.slug}`}
                    onSelect={() => handleSelectSpace(space.slug)}
                    className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-accent"
                  >
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{space.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {space.slug}
                      </div>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Search Results Group */}
            {search && searchResults.length > 0 && (
              <Command.Group heading="Search Results">
                {searchResults.map((node) => (
                  <Command.Item
                    key={node.id}
                    value={`node-${node.id}`}
                    onSelect={() => handleSelectNode(node.id.toString())}
                    className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-accent"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{node.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded',
                            node.nodeType === 'CONTEXT'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          )}
                        >
                          {node.nodeType}
                        </span>
                        {node.content && (
                          <span className="truncate max-w-md">
                            {node.content.substring(0, 100)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
