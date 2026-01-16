'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeTypeIcon } from './NodeTypeIcon';
import { NodeType } from '@/types/backend-dtos';

export interface SidebarNode {
  id: string;
  title: string;
  type: NodeType;
  children?: SidebarNode[];
}

interface SidebarItemProps {
  item: SidebarNode;
  level?: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddChild?: (parentId: string) => void;
}

export function SidebarItem({
  item,
  level = 0,
  selectedId,
  onSelect,
  onAddChild,
}: SidebarItemProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const [isHovering, setIsHovering] = useState(false);

  const hasChildren = item.children && item.children.length > 0;
  const isSelected = item.id === selectedId;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
    onSelect(item.id);
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddChild) {
      onAddChild(item.id);
      setIsExpanded(true);
    }
  };

  return (
    <div className="relative">
      <div
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <button
          onClick={handleClick}
          className={cn(
            'flex items-center gap-[12px] w-full text-left transition-colors py-[4px] px-[4px] rounded-[4px]',
            level === 0
              ? 'font-medium text-[#4f4f4f]'
              : 'font-normal text-[#828282]',
            isSelected && 'text-[#248bf2]',
            isHovering && !isSelected && 'bg-[#f5f5f5]'
          )}
        >
          {/* Expand/Collapse Arrow */}
          <div className="shrink-0 w-3">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="size-3" strokeWidth={1.5} />
              ) : (
                <ChevronRight className="size-3" strokeWidth={1.5} />
              )
            ) : null}
          </div>

          {/* Icon and Title */}
          <div className="flex items-center gap-[4px] flex-1 min-w-0">
            <NodeTypeIcon type={item.type} hasChildren={hasChildren} />
            <span className="text-[15px] tracking-[-0.24px] leading-[24px] truncate">
              {item.title}
            </span>
          </div>
        </button>

        {/* Add child button on hover */}
        {isHovering && onAddChild && (
          <button
            onClick={handleAddChild}
            className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#828282] hover:text-[#248bf2] transition-colors"
          >
            <Plus className="size-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-[28px] flex flex-col gap-[8px] mt-[8px]">
          {item.children!.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
