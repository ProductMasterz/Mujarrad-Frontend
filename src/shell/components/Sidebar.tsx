'use client';

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, CloudOff, Package, FolderOpen, FileText, Plus } from "lucide-react";
import clsx from "clsx";
import { projectsData, Card, CardType } from "../data/projects";
import VuesaxLinearContext from "../imports/VuesaxLinearContext";
import VuesaxLinearNode from "../imports/VuesaxLinearNode";
import { OrgSwitcher } from "@/components/organizations/OrgSwitcher";
import { Badge } from "@/components/ui/badge";
import { useSpaces } from "@/hooks/api/useSpaces";
import { useVoidNodes } from "@/hooks/api/useVoidNodes";
import { useNodes } from "@/hooks/api/useNodes";
import { useBlankCount } from "@/hooks/api/useBlankNodes";
import { NodeType } from "@/types/backend-dtos";

type SidebarProps = {
  isOpen: boolean;
  selectedItem: string | null;
  onNavigate: (path: string[]) => void;
  onAddNode?: (parentPath: string[], position?: number) => void;
  onItemClick?: (itemId: string) => void;
  onLogout?: () => void;
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

/** Expanded space showing its contexts and blank count */
function SpaceContextList({ spaceSlug }: { spaceSlug: string }) {
  const router = useRouter();
  const { data: nodes } = useNodes(spaceSlug);
  const { data: blankCount } = useBlankCount(spaceSlug);

  const contexts = (nodes ?? []).filter(
    (n) => n.nodeType === NodeType.CONTEXT
  );

  return (
    <div className="ml-[28px] mt-[4px] flex flex-col gap-[2px]">
      {contexts.map((ctx) => (
        <button
          key={ctx.id}
          onClick={() => router.push(`/spaces/${spaceSlug}/context/${ctx.slug}`)}
          className="flex w-full items-center gap-[6px] rounded-lg px-[8px] py-[5px] text-left text-[13px] text-slate-500 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60"
        >
          <FolderOpen className="size-3.5 shrink-0" strokeWidth={1.5} />
          <span className="flex-1 truncate">{ctx.title}</span>
        </button>
      ))}
      {(blankCount ?? 0) > 0 && (
        <button
          onClick={() => router.push(`/spaces/${spaceSlug}`)}
          className="flex w-full items-center gap-[6px] rounded-lg px-[8px] py-[5px] text-left text-[13px] text-slate-500 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60"
        >
          <FileText className="size-3.5 shrink-0" strokeWidth={1.5} />
          <span className="flex-1 truncate">Blank</span>
          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
            {blankCount}
          </Badge>
        </button>
      )}
    </div>
  );
}

/** Space item in the sidebar with expand-on-select behavior */
function SpaceItem({
  space,
  isActive,
}: {
  space: { id: string; slug: string; name: string };
  isActive: boolean;
}) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(isActive);

  // Auto-expand when active
  if (isActive && !isExpanded) {
    setIsExpanded(true);
  }

  return (
    <div>
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          router.push(`/spaces/${space.slug}`);
        }}
        className={clsx(
          "flex w-full items-center gap-[8px] rounded-xl px-[10px] py-[7px] text-left text-[14px] transition-colors",
          isActive
            ? "bg-slate-100 font-medium text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-white dark:ring-slate-700"
            : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
        )}
      >
        <div className="shrink-0">
          {isExpanded ? (
            <ChevronDown className="size-3" strokeWidth={1.5} />
          ) : (
            <ChevronRight className="size-3" strokeWidth={1.5} />
          )}
        </div>
        <span className="flex-1 truncate">{space.name}</span>
      </button>
      {isExpanded && <SpaceContextList spaceSlug={space.slug} />}
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
  const router = useRouter();
  const pathname = usePathname();
  const sidebarItems = items || projectsData;

  const { data: spaces } = useSpaces();
  const { data: voidNodes } = useVoidNodes();

  const voidCount = voidNodes?.length ?? 0;

  // Extract current space slug from URL
  const spaceSlugMatch = pathname.match(/^\/spaces\/([^/]+)/);
  const currentSpaceSlug = spaceSlugMatch ? spaceSlugMatch[1] : null;

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
        {/* Org Switcher */}
        <div className="border-b border-border px-[16px] py-[12px]">
          <OrgSwitcher />
        </div>

        <div className="flex-1 overflow-y-auto px-[16px] pt-[20px]">
          {/* Spaces Section */}
          <div className="mb-[16px]">
            <div className="mb-[8px] flex items-center gap-[6px] px-[10px] text-[12px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              <Package className="size-3.5" strokeWidth={1.5} />
              <span>Spaces</span>
            </div>
            <div className="flex flex-col gap-[4px]">
              {(spaces ?? []).map((space) => (
                <SpaceItem
                  key={space.id}
                  space={space}
                  isActive={currentSpaceSlug === space.slug}
                />
              ))}
              {/* + Create Space */}
              <button
                onClick={() => onQuickCreateSpace?.()}
                className="flex w-full items-center gap-[8px] rounded-xl px-[10px] py-[7px] text-left text-[13px] text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800/60 dark:hover:text-slate-300"
              >
                <Plus className="size-3.5" strokeWidth={1.5} />
                <span>Create Space</span>
              </button>
            </div>
          </div>

          {/* Separator */}
          <div className="mx-[10px] mb-[16px] border-t border-border" />

          {/* The Void */}
          <button
            onClick={() => router.push('/void')}
            className={clsx(
              "flex w-full items-center gap-[8px] rounded-xl px-[10px] py-[8px] text-left text-[14px] transition-colors",
              pathname === '/void'
                ? "bg-slate-100 font-medium text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-white dark:ring-slate-700"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
            )}
          >
            <CloudOff className="size-4 shrink-0" strokeWidth={1.5} />
            <span className="flex-1">The Void</span>
            {voidCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {voidCount}
              </Badge>
            )}
          </button>

          {/* Legacy sidebar items (if any non-space items passed) */}
          {sidebarItems.length > 0 && !spaces?.length && (
            <div className="mt-[16px] flex flex-col gap-[12px]">
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
          )}
        </div>
      </div>
    </div>
  );
}
