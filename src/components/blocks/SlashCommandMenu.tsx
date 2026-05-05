'use client';

import { useState, useEffect, useRef, useCallback, KeyboardEvent } from 'react';
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

/**
 * SlashCommandMenu - Command palette for inserting blocks
 *
 * Features:
 * - Search/filter by query
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Click to select
 * - Auto-scroll to selected item
 */
export function SlashCommandMenu({
  isOpen,
  query,
  position,
  onSelect,
  onClose,
  onQueryChange,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Filter items by query
  const filteredItems = SLASH_MENU_ITEMS.filter((item) => {
    const searchQuery = query.toLowerCase();
    return (
      item.label.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery) ||
      item.keywords.some((k) => k.toLowerCase().includes(searchQuery))
    );
  });

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredItems.length - 1 ? prev + 1 : 0
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredItems.length - 1
          );
          break;

        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            onSelect(filteredItems[selectedIndex].type);
          }
          break;

        case 'Escape':
          e.preventDefault();
          onClose();
          break;

        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            setSelectedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredItems.length - 1
            );
          } else {
            setSelectedIndex((prev) =>
              prev < filteredItems.length - 1 ? prev + 1 : 0
            );
          }
          break;
      }
    },
    [filteredItems, selectedIndex, onSelect, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="
        fixed z-50 w-72 max-h-80 overflow-auto
        bg-white
        border border-gray-200
        rounded-lg shadow-lg
      "
      style={{
        top: position.top,
        left: position.left,
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Search input */}
      <div className="p-2 border-b border-gray-200">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Filter blocks..."
          className="
            w-full px-2 py-1 text-sm
            bg-gray-100
            border-none rounded
            outline-none focus:ring-2 focus:ring-blue-500
            text-gray-900
            placeholder-gray-500
          "
          autoFocus
        />
      </div>

      {/* Menu items */}
      <div className="py-1">
        {filteredItems.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500">
            No blocks found
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <button
              key={item.type}
              ref={index === selectedIndex ? selectedItemRef : null}
              type="button"
              onClick={() => onSelect(item.type)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 text-left
                transition-colors duration-100
                ${
                  index === selectedIndex
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-100'
                }
              `}
            >
              {/* Icon */}
              <span
                className={`
                  w-8 h-8 flex items-center justify-center
                  text-lg rounded
                  ${
                    index === selectedIndex
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }
                `}
              >
                {item.icon}
              </span>

              {/* Label and description */}
              <div className="flex-1 min-w-0">
                <div
                  className={`
                    text-sm font-medium
                    ${
                      index === selectedIndex
                        ? 'text-blue-700'
                        : 'text-gray-900'
                    }
                  `}
                >
                  {item.label}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {item.description}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-gray-200 text-xs text-gray-400">
        ↑↓ navigate • Enter select • Esc close
      </div>
    </div>
  );
}

export default SlashCommandMenu;
