'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
  useMemo,
} from 'react';
import type { BlockType, SlashMenuItem } from './types';
import { SLASH_MENU_ITEMS } from './types';

interface SlashCommandMenuProps {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  onQueryChange: (query: string) => void;
}

type PrettySlashMenuItem = SlashMenuItem & {
  example: string;
  group: string;
};

interface GroupedItem {
  group: string;
  items: PrettySlashMenuItem[];
}

const GROUP_ORDER = [
  'Basic',
  'Headings',
  'Lists',
  'Advanced',
  'Media',
] as const;

const ITEM_GROUPS: Record<BlockType, string> = {
  text: 'Basic',
  quote: 'Basic',
  divider: 'Basic',

  heading_1: 'Headings',
  heading_2: 'Headings',
  heading_3: 'Headings',

  bullet_list: 'Lists',
  numbered_list: 'Lists',
  todo: 'Lists',

  code: 'Advanced',
  math: 'Advanced',
  mermaid: 'Advanced',
  callout: 'Advanced',

  image: 'Media',
};

const PRETTY_TITLES: Partial<Record<BlockType, string>> = {
  text: 'Text',
  heading_1: 'Heading 1',
  heading_2: 'Heading 2',
  heading_3: 'Heading 3',
  bullet_list: 'Bullet List',
  numbered_list: 'Numbered List',
  todo: 'To-do',
  quote: 'Quote',
  divider: 'Divider',
  code: 'Code',
  math: 'Math',
  mermaid: 'Diagram',
  callout: 'Callout',
  image: 'Image',
};

const PRETTY_DESCRIPTIONS: Partial<Record<BlockType, string>> = {
  text: 'Just start writing with plain text.',
  heading_1: 'Big section title.',
  heading_2: 'Medium section title.',
  heading_3: 'Small section title.',
  bullet_list: 'Create an unordered list.',
  numbered_list: 'Create a numbered list.',
  todo: 'Track tasks with checkboxes.',
  quote: 'Highlight a quote or statement.',
  divider: 'Separate content sections.',
  code: 'Insert a formatted code block.',
  math: 'Write a LaTeX equation.',
  mermaid: 'Insert a Mermaid diagram.',
  callout: 'Emphasize important information.',
  image: 'Upload or embed an image.',
};

const PRETTY_EXAMPLES: Partial<Record<BlockType, string>> = {
  text: 'For notes, ideas, and normal writing',
  heading_1: 'For major sections',
  heading_2: 'For subsections',
  heading_3: 'For smaller subsections',
  bullet_list: 'For unordered points',
  numbered_list: 'For steps and sequences',
  todo: 'For tasks and checklists',
  quote: 'For references or important lines',
  divider: 'For visual separation',
  code: 'For code snippets',
  math: 'For formulas and equations',
  mermaid: 'For flows and structures',
  callout: 'For notes, warnings, or tips',
  image: 'For screenshots and visuals',
};

function getPrettyItem(item: SlashMenuItem): PrettySlashMenuItem {
  return {
    ...item,
    label: PRETTY_TITLES[item.type] ?? item.label,
    description: PRETTY_DESCRIPTIONS[item.type] ?? item.description,
    example: PRETTY_EXAMPLES[item.type] ?? '',
    group: ITEM_GROUPS[item.type] ?? 'Basic',
  };
}

export function SlashCommandMenu({
  isOpen,
  query,
  position,
  onSelect,
  onClose,
  onQueryChange,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredType, setHoveredType] = useState<BlockType | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const prettyItems = useMemo(
    () => SLASH_MENU_ITEMS.map(getPrettyItem),
    []
  );

  const filteredItems = useMemo(() => {
    const searchQuery = query.trim().toLowerCase();

    if (!searchQuery) return prettyItems;

    return prettyItems.filter((item) => {
      return (
        item.label.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery) ||
        item.group.toLowerCase().includes(searchQuery) ||
        item.keywords.some((k) => k.toLowerCase().includes(searchQuery))
      );
    });
  }, [prettyItems, query]);

  const groupedItems = useMemo<GroupedItem[]>(() => {
    const grouped = new Map<string, PrettySlashMenuItem[]>();

    for (const item of filteredItems) {
      const group = ITEM_GROUPS[item.type] ?? 'Basic';
      const existing = grouped.get(group) ?? [];
      existing.push(item);
      grouped.set(group, existing);
    }

    return GROUP_ORDER
      .map((group) => ({
        group,
        items: grouped.get(group) ?? [],
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredItems]);

  const flatItems = useMemo(
    () => groupedItems.flatMap((group) => group.items),
    [groupedItems]
  );

  const flatIndexMap = useMemo(() => {
    return new Map(flatItems.map((item, index) => [item.type, index]));
  }, [flatItems]);

  const activeItem =
    flatItems[selectedIndex] ??
    flatItems[0] ??
    null;

  const previewItem =
    prettyItems.find((item) => item.type === hoveredType) ??
    activeItem;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setHoveredType(null);
      return;
    }
    setHoveredType(null);
  }, [isOpen]);

  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleWindowResize = () => {
      onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleWindowResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!flatItems.length) {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatItems.length - 1 ? prev + 1 : 0
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatItems.length - 1
          );
          break;

        case 'Enter':
          e.preventDefault();
          if (flatItems[selectedIndex]) {
            onSelect(flatItems[selectedIndex].type);
          }
          break;

        case 'Escape':
          e.preventDefault();
          onClose();
          break;

        case 'Tab':
          e.preventDefault();
          setSelectedIndex((prev) =>
            e.shiftKey
              ? prev > 0
                ? prev - 1
                : flatItems.length - 1
              : prev < flatItems.length - 1
              ? prev + 1
              : 0
          );
          break;
      }
    },
    [flatItems, selectedIndex, onClose, onSelect]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="
        fixed z-[100]
        w-[min(820px,calc(100vw-24px))]
        overflow-hidden rounded-2xl border border-border
        bg-background text-foreground shadow-2xl
      "
      style={{
        top: position.top,
        left: position.left,
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr]">
        {/* Left side */}
        <div className="min-w-0 border-b border-border md:border-b-0 md:border-r">
          <div className="border-b border-border p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Insert block
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Filter blocks..."
              className="
                w-full rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm
                text-foreground outline-none placeholder:text-muted-foreground
                focus:border-primary focus:ring-2 focus:ring-primary/15
              "
            />
          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">
            {flatItems.length === 0 ? (
              <div className="rounded-xl px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">
                No blocks found
              </div>
            ) : (
              groupedItems.map((group) => (
                <div key={group.group} className="mb-3 last:mb-0">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {group.group}
                  </div>

                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const globalIndex = flatIndexMap.get(item.type) ?? 0;
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={item.type}
                          ref={isSelected ? selectedItemRef : null}
                          type="button"
                          onClick={() => onSelect(item.type)}
                          onMouseEnter={() => {
                            setSelectedIndex(globalIndex);
                            setHoveredType(item.type);
                          }}
                          className={`
                            w-full rounded-xl px-3 py-3 text-left transition-all
                            ${
                              isSelected
                                ? 'bg-muted text-foreground ring-1 ring-border'
                                : 'bg-transparent text-foreground hover:bg-muted/70'
                            }
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`
                                flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold
                                ${
                                  isSelected
                                    ? 'bg-background text-foreground border border-border'
                                    : 'bg-muted text-foreground/80'
                                }
                              `}
                            >
                              {item.icon}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <div className="truncate text-sm font-semibold">
                                  {PRETTY_TITLES[item.type] ?? item.label}
                                </div>
                                <div
                                  className={`
                                    rounded-full px-2 py-0.5 text-[10px] font-medium
                                    ${
                                      isSelected
                                        ? 'bg-background text-muted-foreground border border-border'
                                        : 'bg-muted text-muted-foreground'
                                    }
                                  `}
                                >
                                  /{item.label.toLowerCase().replace(/\s+/g, '-')}
                                </div>
                              </div>

                              <div
                                className={`
                                  mt-1 text-xs
                                  ${isSelected ? 'text-muted-foreground' : 'text-muted-foreground'}
                                `}
                              >
                                {PRETTY_DESCRIPTIONS[item.type] ?? item.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
            ↑↓ navigate • Enter select • Esc close
          </div>
        </div>

        {/* Right side preview */}
        <div className="hidden min-h-[420px] flex-col bg-muted/20 md:flex">
          <div className="border-b border-border px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Preview
            </div>
          </div>

          <div className="flex-1 p-4">
            {previewItem ? (
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-lg font-semibold text-foreground">
                    {previewItem.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {PRETTY_TITLES[previewItem.type] ?? previewItem.label}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {ITEM_GROUPS[previewItem.type] ?? 'Basic'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                      Description
                    </div>
                    <div className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                      {PRETTY_DESCRIPTIONS[previewItem.type] ?? previewItem.description}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                      Best for
                    </div>
                    <div className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                      {PRETTY_EXAMPLES[previewItem.type] ?? 'General content block'}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                      Keywords
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {previewItem.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="
                            rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600
                            dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300
                          "
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                Select a block to preview it.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlashCommandMenu;