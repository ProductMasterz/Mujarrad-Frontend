'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number } | null;
  onClose: () => void;
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (!position || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + rect.width > viewportWidth - 10) {
      x = viewportWidth - rect.width - 10;
    }

    // Adjust vertical position
    if (y + rect.height > viewportHeight - 10) {
      y = viewportHeight - rect.height - 10;
    }

    setAdjustedPosition({ x: Math.max(10, x), y: Math.max(10, y) });
  }, [position]);

  // Close on click outside
  useEffect(() => {
    if (!position) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [position, onClose]);

  if (!position) return null;

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    item.onClick?.();
    onClose();
  };

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] py-[6px] bg-white rounded-[8px] shadow-lg border border-[#e0e0e0]"
      style={{
        left: adjustedPosition?.x ?? position.x,
        top: adjustedPosition?.y ?? position.y,
      }}
    >
      {items.map((item) =>
        item.divider ? (
          <div key={item.id} className="my-[6px] h-[1px] bg-[#e0e0e0]" />
        ) : (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            onClick={() => handleItemClick(item)}
            className={`
              w-full px-[14px] py-[8px] flex items-center gap-[10px]
              text-left text-[13px] font-normal tracking-[-0.08px]
              transition-colors
              ${item.disabled
                ? 'text-[#bdbdbd] cursor-not-allowed'
                : item.danger
                  ? 'text-[#d4183d] hover:bg-[#fef2f2]'
                  : 'text-[#333] hover:bg-[#f5f5f5]'
              }
            `}
          >
            {item.icon && (
              <span className="w-[16px] h-[16px] flex items-center justify-center">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
          </button>
        )
      )}
    </div>,
    document.body
  );
}

// Hook for managing context menu state
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number } | null;
    data: unknown;
  }>({
    position: null,
    data: null,
  });

  const openContextMenu = useCallback((e: React.MouseEvent, data?: unknown) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      data,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ position: null, data: null });
  }, []);

  return {
    position: contextMenu.position,
    data: contextMenu.data,
    openContextMenu,
    closeContextMenu,
  };
}
