import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { projectsData, Card, CardType } from '../data/projects';
import { UserMenu } from './UserMenu';
import { ShortcutsModal } from './ShortcutsModal';
import VuesaxLinearContext from '../imports/VuesaxLinearContext';
import VuesaxLinearNode from '../imports/VuesaxLinearNode';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useParams } from 'next/navigation';

type SidebarProps = {
  isOpen: boolean;
  onItemClick: (id: string) => void;
  selectedItem: string | null;
  onNavigate: (path: string[]) => void;
  onAddNode?: (parentPath: string[], position?: number) => void;
  onLogout: () => void;
  items?: Card[];
  isSpacesLevel?: boolean;
  onQuickCreateSpace?: () => void;
};

// ---------------- ICONS ----------------
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
          />
          <circle cx="5.2" cy="5.2" r="1.2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10.8" cy="5.2" r="1.2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="5.3" cy="10.7" r="1.2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );

    case CardType.GRAPH_CONTEXT:
      return <VuesaxLinearContext />;

    case CardType.NODE:
      return <VuesaxLinearNode />;

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
          />
        </svg>
      );
  }
}

// ---------------- SIDEBAR ITEM ----------------
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
  onSpaceSelect,
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
  onSpaceSelect?: (spaceId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const [isHoveringItem, setIsHoveringItem] = useState(false);
  const [isHoveringBetween, setIsHoveringBetween] = useState(false);

  const hasChildren = item.children && item.children.length > 0;
  const currentPath = [...parentPath, item.id];
  const isSelected = currentPath.join('/') === selectedItem;

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isSpacesLevel && onQuickCreateSpace) {
      onQuickCreateSpace();
      return;
    }

    onAddChild?.(currentPath);
    setIsExpanded(true);
  };

  const handleAddSibling = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddSibling?.(parentPath, index + 1);
  };

  return (
    <div className="relative">
      {/* between add */}
      <div
        className="absolute inset-x-0 -top-[6px] h-[12px] z-10"
        onMouseEnter={() => setIsHoveringBetween(true)}
        onMouseLeave={() => setIsHoveringBetween(false)}
      >
        {isHoveringBetween && (
          <div className="relative h-full flex items-center">
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#248bf2]" />
            <button
              onClick={handleAddSibling}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[#248bf2]"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* item */}
      <div
        onMouseEnter={() => setIsHoveringItem(true)}
        onMouseLeave={() => setIsHoveringItem(false)}
      >
        <button
          onClick={() => {
            if (hasChildren) setIsExpanded(!isExpanded);

            console.log(' SPACE CLICKED:', item.id, item.title);

            onNavigate(currentPath);
          }}
          className={clsx(
            'flex items-center gap-[12px] w-full py-[4px]',
            isSelected && 'text-[#248bf2]'
          )}
        >
          {hasChildren ? isExpanded ? <ChevronDown /> : <ChevronRight /> : <div className="w-3" />}
          {renderCardIcon(item.type)}
          <span>{item.title}</span>
        </button>

        {isHoveringItem && (
          <button onClick={handleAddChild} className="absolute right-2 top-1/2">
            +
          </button>
        )}
      </div>

      {/* children */}
      {hasChildren && isExpanded && (
        <div className="ml-[28px] flex flex-col gap-[8px]">
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
              onSpaceSelect={onSpaceSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- SIDEBAR ----------------
export function Sidebar({
  isOpen,
  onItemClick,
  selectedItem,
  onNavigate,
  onAddNode,
  onLogout,
  items,
  isSpacesLevel = false,
  onQuickCreateSpace,
}: SidebarProps) {
  const sidebarItems = items || projectsData;
  const [showChatModal, setShowChatModal] = useState(false);
  const params = useParams();
  const currentSpaceId = params?.slug as string | undefined;
  const handleAddNode = (parentPath: string[], position?: number) => {
    onAddNode?.(parentPath, position);
  };

  return (
    <div
      className={clsx(
        'fixed left-0 top-[76px] h-[calc(100vh-76px)] bg-white border-r',
        isOpen ? 'w-[276px]' : 'w-0'
      )}
    >
      <div className="flex flex-col h-full w-[276px]">
        {/* ITEMS */}
        <div className="flex-1 overflow-y-auto px-[17px] pt-[29px]">
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
        <div className="relative w-full h-full">
          {/* SHOW NODES ONLY WHEN CHAT IS CLOSED */}
          {!showChatModal && (
            <div className="flex gap-[19px] flex-wrap pt-[15px]">{/* your nodes here */}</div>
          )}

          {/* FULLSCREEN CHAT */}
          {showChatModal && currentSpaceId && (
            <div className="fixed inset-0 z-[999999] bg-white flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Chat Assistant</h2>

                <button
                  onClick={() => setShowChatModal(false)}
                  className="px-3 py-1 rounded bg-black text-white"
                >
                  ✕ Close
                </button>
              </div>

              {/* CHAT CONTENT */}
              <div className="flex-1 overflow-hidden">
                <ChatWindow spaceSlug={currentSpaceId} />
              </div>
            </div>
          )}

          {/* CHAT BUTTON */}
          {!!currentSpaceId && !showChatModal && (
            <div className="fixed bottom-6 right-6 ">
              <button
                className="bg-black text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 transition"
                onClick={() => setShowChatModal(true)}
              >
                Chat Window 💬
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
  );
}
