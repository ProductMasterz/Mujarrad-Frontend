import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { projectsData, Card, CardType } from "../data/projects";
import VuesaxLinearContext from "../imports/VuesaxLinearContext";
import VuesaxLinearNode from "../imports/VuesaxLinearNode";

type SidebarProps = {
  isOpen: boolean;
  selectedItem: string | null;
  onNavigate: (path: string[]) => void;
  onAddNode?: (parentPath: string[], position?: number) => void;
  items?: Card[];
  isSpacesLevel?: boolean;
  onQuickCreateSpace?: () => void;
};

function renderCardIcon(type: CardType) {
  switch (type) {
    case CardType.EMPTY_CONTEXT:
      return (
        <svg className="size-4" fill="none" viewBox="0 0 16 16">
          <rect
            x="1.33"
            y="1.33"
            width="13.34"
            height="13.34"
            rx="4.67"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      );

    case CardType.FULFILLED_CONTEXT:
      return (
        <svg className="size-4" fill="none" viewBox="0 0 16 16">
          <rect
            x="1.33"
            y="1.33"
            width="13.34"
            height="13.34"
            rx="4.67"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
          <circle cx="5.2" cy="5.2" r="1.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="10.8" cy="5.2" r="1.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="5.3" cy="10.7" r="1.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      );

    case CardType.GRAPH_CONTEXT:
      return (
        <div className="size-4">
          <VuesaxLinearContext />
        </div>
      );

    case CardType.NODE:
      return (
        <div className="size-4">
          <VuesaxLinearNode />
        </div>
      );

    default:
      return (
        <svg className="size-4" fill="none" viewBox="0 0 16 16">
          <rect
            x="1.33"
            y="1.33"
            width="13.34"
            height="13.34"
            rx="4.67"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      );
  }
}

function SidebarItem({
  item,
  level = 0,
  onNavigate,
  selectedItem,
  parentPath = [],
  onAddChild,
  onAddSibling,
  index = 0,
  isSpacesLevel = false,
  onQuickCreateSpace,
}: {
  item: Card;
  level?: number;
  onNavigate: (path: string[]) => void;
  selectedItem: string | null;
  parentPath?: string[];
  onAddChild?: (itemPath: string[]) => void;
  onAddSibling?: (itemPath: string[], position: number) => void;
  index?: number;
  isSpacesLevel?: boolean;
  onQuickCreateSpace?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const [isHoveringItem, setIsHoveringItem] = useState(false);
  const [isHoveringBetween, setIsHoveringBetween] = useState(false);

  const hasChildren = item.children && item.children.length > 0;
  const currentPath = [...parentPath, item.id];
  const isSelected = currentPath.join("/") === selectedItem;

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isSpacesLevel && onQuickCreateSpace) {
      onQuickCreateSpace();
      return;
    }

    if (onAddChild) {
      onAddChild(currentPath);
      setIsExpanded(true);
    }
  };

  const handleAddSibling = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddSibling) {
      onAddSibling(parentPath, index + 1);
    }
  };

  return (
    <div className="relative">
      <div
        className="absolute inset-x-0 -top-[6px] h-[12px] z-10"
        onMouseEnter={() => setIsHoveringBetween(true)}
        onMouseLeave={() => setIsHoveringBetween(false)}
      >
        {isHoveringBetween && (
          <div className="relative flex h-full items-center">
            <div className="absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 bg-[#248bf2]" />
            <button
              onClick={handleAddSibling}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white text-[#248bf2] transition-colors hover:text-[#1976d2] dark:bg-[#111827]"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div
        className="group relative"
        onMouseEnter={() => setIsHoveringItem(true)}
        onMouseLeave={() => setIsHoveringItem(false)}
      >
        <button
          onClick={() => {
            if (hasChildren) {
              setIsExpanded(!isExpanded);
            }
            onNavigate(currentPath);
          }}
          className={clsx(
            "flex w-full items-center gap-[10px] rounded-xl px-[10px] py-[8px] text-left transition-colors",
            level === 0
              ? "font-medium text-slate-700 dark:text-slate-200"
              : "font-normal text-slate-500 dark:text-slate-400",
            isSelected && "bg-slate-100 text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-white dark:ring-slate-700",
            isHoveringItem && !isSelected && "bg-slate-50 dark:bg-slate-800/60"
          )}
        >
          {hasChildren ? (
            <div className="shrink-0">
              {isExpanded ? (
                <ChevronDown className="size-3" strokeWidth={1.5} />
              ) : (
                <ChevronRight className="size-3" strokeWidth={1.5} />
              )}
            </div>
          ) : (
            <div className="size-3" />
          )}

          <div className="flex flex-1 items-center gap-[4px]">
            {renderCardIcon(item.type)}
            <span
              className="max-w-[170px] truncate text-[14px] leading-5"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {item.title}
            </span>
          </div>
        </button>

        {isHoveringItem && (
          <button
            onClick={handleAddChild}
            className="absolute right-[4px] top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-[28px] mt-[8px] flex flex-col gap-[8px]">
          {item.children!.map((child, idx) => (
            <SidebarItem
              key={child.id}
              item={child}
              level={level + 1}
              onNavigate={onNavigate}
              selectedItem={selectedItem}
              parentPath={currentPath}
              onAddChild={onAddChild}
              onAddSibling={onAddSibling}
              index={idx}
              isSpacesLevel={false}
              onQuickCreateSpace={onQuickCreateSpace}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  isOpen,
  selectedItem,
  onNavigate,
  onAddNode,
  items,
  isSpacesLevel = false,
  onQuickCreateSpace,
}: SidebarProps) {
  const sidebarItems = items || projectsData;

  const handleAddNode = (parentPath: string[], position?: number) => {
    if (onAddNode) {
      onAddNode(parentPath, position);
    }
  };

  return (
    <div
      className={clsx(
        "fixed left-0 top-[76px] z-10 h-[calc(100vh-76px)] border-r border-border bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out dark:bg-background/95",
        isOpen ? "w-[276px]" : "w-0"
      )}
      style={{ overflow: isOpen ? "visible" : "hidden" }}
    >
      <div className="flex h-full w-[276px] flex-col">
        <div className="flex-1 overflow-y-auto px-[16px] pt-[20px]">
          <div className="flex flex-col gap-[12px]">
            {sidebarItems.map((item, idx) => (
              <SidebarItem
                key={item.id}
                item={item}
                onNavigate={onNavigate}
                selectedItem={selectedItem}
                onAddChild={handleAddNode}
                onAddSibling={handleAddNode}
                index={idx}
                isSpacesLevel={isSpacesLevel}
                onQuickCreateSpace={onQuickCreateSpace}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}