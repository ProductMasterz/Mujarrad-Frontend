import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import clsx from "clsx";
import { projectsData, Card, CardType } from "../data/projects";
import { UserMenu } from "./UserMenu";
import { ShortcutsModal } from "./ShortcutsModal";
import VuesaxLinearContext from "../imports/VuesaxLinearContext";
import VuesaxLinearNode from "../imports/VuesaxLinearNode";
import { ChatWindow } from "@/components/chat/ChatWindow";

type SidebarProps = {
  isOpen: boolean;
  onItemClick: (id: string) => void;
  selectedItem: string | null;
  onNavigate: (path: string[]) => void;
  onAddNode?: (parentPath: string[], position?: number) => void;
  onLogout: () => void;
  items?: Card[];
  /** When true (at spaces level), hover add button creates a new space instead of node */
  isSpacesLevel?: boolean;
  /** Quick create a new space - called when at spaces level */
  onQuickCreateSpace?: () => void;
};

// Function to render the appropriate icon based on CardType
function renderCardIcon(type: CardType) {
  switch (type) {
    case CardType.EMPTY_CONTEXT:
      // Empty rounded square
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
      // Rounded square with 3 circles in a grid pattern
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
      // Graph icon with connected nodes
      return (
        <div className="size-4">
          <VuesaxLinearContext />
        </div>
      );

    case CardType.NODE:
      // Simple circle (leaf node)
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
    // At spaces level, clicking + creates a new space directly
    if (isSpacesLevel && onQuickCreateSpace) {
      onQuickCreateSpace();
      return;
    }
    // Otherwise, add a child node
    if (onAddChild) {
      onAddChild(currentPath);
      setIsExpanded(true); // Auto-expand to show new child
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
      {/* Hover area for adding between items */}
      <div
        className="absolute inset-x-0 -top-[6px] h-[12px] z-10"
        onMouseEnter={() => setIsHoveringBetween(true)}
        onMouseLeave={() => setIsHoveringBetween(false)}
      >
        {isHoveringBetween && (
          <div className="relative h-full flex items-center">
            {/* Horizontal line indicator */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#248bf2]" />
            {/* Add button */}
            <button
              onClick={handleAddSibling}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[#248bf2] hover:text-[#1976d2] transition-colors bg-white rounded-full"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Item itself */}
      <div
        className="relative"
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
            "flex items-center gap-[12px] w-full text-left transition-colors py-[4px] rounded-[4px]",
            level === 0
              ? "font-['Roboto:Medium',sans-serif] font-medium text-[#4f4f4f]"
              : "font-['Roboto:Regular',sans-serif] font-normal text-[#828282]",
            isSelected && "text-[#248bf2]",
            isHoveringItem && !isSelected && "bg-[#f5f5f5]"
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
          <div className="flex items-center gap-[4px] flex-1">
            {renderCardIcon(item.type)}
            <span
              className="text-[15px] tracking-[-0.24px] leading-[24px] truncate max-w-[140px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {item.title}
            </span>
          </div>
        </button>

        {/* Add child button - appears on item hover */}
        {isHoveringItem && (
          <button
            onClick={handleAddChild}
            className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#828282] hover:text-[#248bf2] transition-colors"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-[28px] flex flex-col gap-[8px] mt-[8px]">
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

export function Sidebar({ isOpen, onItemClick, selectedItem, onNavigate, onAddNode, onLogout, items, isSpacesLevel = false, onQuickCreateSpace }: SidebarProps) {
  // Use provided items or fall back to static projectsData
  const sidebarItems = items || projectsData;
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  //chat
  const [showChatModal, setShowChatModal] = useState(false);
  
  const handleUserClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleShortcutClick = () => {
    setShowShortcutsModal(true);
  };

  // Unified handler for both child and sibling additions
  const handleAddNode = (parentPath: string[], position?: number) => {
    if (onAddNode) {
      onAddNode(parentPath, position);
    }
  };

  return (
    <div
      className={clsx(
        "fixed left-0 top-[76px] h-[calc(100vh-76px)] bg-white border-r border-[#f2f2f2] transition-all duration-300 ease-in-out z-10",
        isOpen ? "w-[276px]" : "w-0"
      )}
      style={{ overflow: isOpen ? "visible" : "hidden" }}
    >
      <div className="flex flex-col h-full w-[276px]">
        {/* Sidebar Items */}
        <div className="flex-1 pt-[29px] px-[17px] overflow-y-auto">
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

        {/* Bottom Icons */}
        <div className="flex gap-[90px] items-center px-[17px] pb-[29px]">
          <div className="relative group">
            <button
              onClick={handleUserClick}
              className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
            >
              <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 22H18V20C18 19.2044 17.6839 18.4413 17.1213 17.8787C16.5587 17.3161 15.7956 17 15 17H9C8.20435 17 7.44129 17.3161 6.87868 17.8787C6.31607 18.4413 6 19.2044 6 20V22H4V20C4 18.6739 4.52678 17.4021 5.46447 16.4645C6.40215 15.5268 7.67392 15 9 15H15C16.3261 15 17.5979 15.5268 18.5355 16.4645C19.4732 17.4021 20 18.6739 20 20V22ZM12 13C11.2121 13 10.4319 12.8448 9.7039 12.5433C8.97595 12.2417 8.31451 11.7998 7.75736 11.2426C7.20021 10.6855 6.75825 10.0241 6.45672 9.2961C6.15519 8.56815 6 7.78793 6 7C6 6.21207 6.15519 5.43185 6.45672 4.7039C6.75825 3.97595 7.20021 3.31451 7.75736 2.75736C8.31451 2.20021 8.97595 1.75825 9.7039 1.45672C10.4319 1.15519 11.2121 1 12 1C13.5913 1 15.1174 1.63214 16.2426 2.75736C17.3679 3.88258 18 5.4087 18 7C18 8.5913 17.3679 10.1174 16.2426 11.2426C15.1174 12.3679 13.5913 13 12 13ZM12 11C13.0609 11 14.0783 10.5786 14.8284 9.82843C15.5786 9.07828 16 8.06087 16 7C16 5.93913 15.5786 4.92172 14.8284 4.17157C14.0783 3.42143 13.0609 3 12 3C10.9391 3 9.92172 3.42143 9.17157 4.17157C8.42143 4.92172 8 5.93913 8 7C8 8.06087 8.42143 9.07828 9.17157 9.82843C9.92172 10.5786 10.9391 11 12 11Z" />
              </svg>
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-[8px] py-[4px] bg-[#333] text-white text-[11px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Profile
            </div>
          </div>
          <div className="relative group">
            <button className="text-[#828282] hover:text-[#4f4f4f] transition-colors">
              <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 11.333L0 9L12 2L24 9V17.5H22V10.167L20 11.333V18.011L19.777 18.286C18.8404 19.4467 17.6557 20.3827 16.3099 21.0255C14.9641 21.6682 13.4914 22.0012 12 22C10.5086 22.0012 9.03588 21.6682 7.69007 21.0255C6.34426 20.3827 5.15955 19.4467 4.223 18.286L4 18.011V11.333ZM6 12.5V17.292C6.74991 18.1442 7.67304 18.8266 8.70772 19.2936C9.7424 19.7606 10.8648 20.0014 12 20C13.1352 20.0015 14.2576 19.7607 15.2923 19.2937C16.327 18.8267 17.2501 18.1443 18 17.292V12.5L12 16L6 12.5ZM3.97 9L12 13.685L20.03 9L12 4.315L3.97 9Z" />
              </svg>
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-[8px] py-[4px] bg-[#333] text-white text-[11px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Learning
            </div>
          </div>
          <div className="relative group">
            <button
              onClick={handleShortcutClick}
              className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
            >
              <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 3V10.267L19.294 6.634L20.294 8.366L14 11.999L20.294 15.634L19.294 17.366L12.999 13.732V21H10.999V13.732L4.705 17.366L3.705 15.634L9.998 12L3.705 8.366L4.705 6.634L11 10.267V3H13Z" />
              </svg>
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-[8px] py-[4px] bg-[#333] text-white text-[11px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Shortcut
            </div>
          </div>
    {/** */}
          <div className="relative group">
        <button
          onClick={() => setShowChatModal(true)}
          className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
        >
          💬
        </button>

        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-[8px] py-[4px] bg-[#333] text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Chat
        </div>
      </div>     
      {/** */}
        </div>
      </div>

      {/* User Menu */}
      {userMenuAnchor && (
        <UserMenu
          onClose={() => setUserMenuAnchor(null)}
          anchorEl={userMenuAnchor}
          onLogout={onLogout}
        />
      )}


     
      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

        {showChatModal && (
      <div className="fixed bottom-6 right-6 w-[380px] h-[420px] bg-white shadow-xl rounded-lg border z-50 flex flex-col">

        {/* Chat header */}
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-sm font-semibold">Chat Assistant</span>

          <button
            onClick={() => setShowChatModal(false)}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Chat body */}
        <div className="flex-1">
          <ChatWindow />
        </div>

  </div>
)}
    </div>
    
  );
}
