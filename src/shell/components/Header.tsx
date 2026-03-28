import { Menu, ArrowLeft, Plus, Bell, Search, MoreVertical, HelpCircle, MessageSquare } from "lucide-react";
import { Breadcrumb } from "./Breadcrumb";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { MoreMenuDropdown } from "./MoreMenuDropdown";
import { AddMenuDropdown } from "./AddMenuDropdown";
import { SearchModal } from "./SearchModal";
import { TabsBar, Tab } from "./TabsBar";
import { HelpDropdown } from "./HelpDropdown";
import { useNavigationStore } from "@/stores/navigationStore";
import { useChatPanelStore } from "@/stores/chatPanel.store";

type HeaderProps = {
  onMenuClick: () => void;
  onBackClick: () => void;
  showBackButton: boolean;
  breadcrumbPath: Array<{ id: string; title: string }>;
  onNotificationClick: () => void;
  onSearchClick: () => void;
  onHomeClick: () => void;
  onBreadcrumbClick: (index: number) => void;
  // Add menu actions
  onCreateSpace?: () => void;
  onCreateNode?: () => void;
  onCreateContext?: () => void;
  // More menu actions
  onShare?: () => void;
  onOpenInNewTab?: () => void;
  onOpenAsNode?: () => void;
  onLock?: () => void;
  onWhiteboard?: () => void;
  onDelete?: () => void;
  onClearSpace?: () => void;
  onMoveTo?: () => void;
  // Tabs
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  onFeedback: () => void;
};

export function Header({
  onMenuClick,
  onBackClick,
  showBackButton,
  breadcrumbPath,
  onNotificationClick,
  onSearchClick,
  onHomeClick,
  onBreadcrumbClick,
  // Add menu actions
  onCreateSpace,
  onCreateNode,
  onCreateContext,
  // More menu actions
  onShare,
  onOpenInNewTab,
  onOpenAsNode,
  onLock,
  onWhiteboard,
  onDelete,
  onClearSpace,
  onMoveTo,
  // Tabs
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
  onFeedback,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const openChat = useChatPanelStore((state) => state.openChat);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
  const [helpAnchor, setHelpAnchor] = useState<HTMLElement | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const currentSpaceSlug = pathname.match(/^\/spaces\/([^/]+)/)?.[1];

  // Get tooltip from navigation store
  const addButtonTooltip = useNavigationStore((state) => state.addButtonTooltip);

  const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleAddClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleHelpClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setHelpAnchor(event.currentTarget);
  };

  const handleSearchClick = () => {
    setSearchModalOpen(true);
    onSearchClick();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Top gray bar with tabs */}
      <div className="h-[33px] bg-[#f2f2f2] flex items-center px-[9px] gap-[12px]">
        <button
          onClick={onHomeClick}
          className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
          aria-label="Home"
        >
          <svg className="size-[18px]" viewBox="0 0 18 18" fill="none">
            <path
              d="M7.04998 2.98498L2.32498 6.85498C1.79998 7.27498 1.37498 8.18998 1.37498 8.87998V13.78C1.37498 15.18 2.51998 16.33 3.91998 16.33H14.08C15.48 16.33 16.625 15.18 16.625 13.785V8.99998C16.625 8.23498 16.14 7.26748 15.545 6.86248L10.12 2.87248C9.26998 2.26498 7.86748 2.29498 7.04998 2.98498Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <path
              d="M9 13.4999V10.9999"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </button>

        {/* Tabs */}
        <TabsBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={onTabClick}
          onTabClose={onTabClose}
          onNewTab={onNewTab}
        />
      </div>

      {/* Main navigation bar */}
      <div className="h-[43px] bg-white border-b border-[#f2f2f2] flex items-center justify-between px-[9px]">
        {/* Left section */}
        <div className="flex items-center gap-[12px]">
          <button
            onClick={onMenuClick}
            className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
            aria-label="Menu"
          >
            <Menu className="size-6" strokeWidth={1.5} />
          </button>

          {showBackButton && (
            <button
              onClick={onBackClick}
              className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="size-6" strokeWidth={1.5} />
            </button>
          )}

          <Breadcrumb path={breadcrumbPath} onBreadcrumbClick={onBreadcrumbClick} />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-[15px]">
          <div className="relative">
            <button
              onClick={handleAddClick}
              onMouseEnter={() => setHoveredButton("add")}
              onMouseLeave={() => setHoveredButton(null)}
              className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
              aria-label="Add"
            >
              <Plus className="size-6" strokeWidth={1.5} />
            </button>
            {hoveredButton === "add" && !addMenuAnchor && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif]">
                {addButtonTooltip}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={handleNotificationClick}
              onMouseEnter={() => setHoveredButton("notification")}
              onMouseLeave={() => setHoveredButton(null)}
              className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="size-6" strokeWidth={1.5} />
            </button>
            {hoveredButton === "notification" && !notificationAnchor && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif]">
                Notifications
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => openChat(currentSpaceSlug)}
              onMouseEnter={() => setHoveredButton("chat")}
              onMouseLeave={() => setHoveredButton(null)}
              className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
              aria-label="Chat"
            >
              <MessageSquare className="size-6" strokeWidth={1.5} />
            </button>
            {hoveredButton === "chat" && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif]">
                Open Chatbot
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={handleSearchClick}
              onMouseEnter={() => setHoveredButton("search")}
              onMouseLeave={() => setHoveredButton(null)}
              className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
              aria-label="Search"
            >
              <Search className="size-6" strokeWidth={1.5} />
            </button>
            {hoveredButton === "search" && !searchModalOpen && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif]">
                Search and jump to node
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={handleHelpClick}
              onMouseEnter={() => setHoveredButton("help")}
              onMouseLeave={() => setHoveredButton(null)}
              className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
              aria-label="Help"
            >
              <HelpCircle className="size-6" strokeWidth={1.5} />
            </button>
            {hoveredButton === "help" && !helpAnchor && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif]">
                Help & Support
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={handleMoreClick}
              onMouseEnter={() => setHoveredButton("more")}
              onMouseLeave={() => setHoveredButton(null)}
              className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
              aria-label="More"
            >
              <MoreVertical className="size-6" strokeWidth={1.5} />
            </button>
            {hoveredButton === "more" && !moreMenuAnchor && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif]">
                More options
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {notificationAnchor && (
        <NotificationsDropdown
          onClose={() => setNotificationAnchor(null)}
          anchorEl={notificationAnchor}
        />
      )}

      {/* Add Menu Dropdown */}
      {addMenuAnchor && (
        <AddMenuDropdown
          onClose={() => setAddMenuAnchor(null)}
          anchorEl={addMenuAnchor}
          onCreateSpace={onCreateSpace}
          onCreateNode={onCreateNode}
          onCreateContext={onCreateContext}
        />
      )}

      {/* More Menu Dropdown */}
      {moreMenuAnchor && (
        <MoreMenuDropdown
          onClose={() => setMoreMenuAnchor(null)}
          anchorEl={moreMenuAnchor}
          onShare={onShare}
          onOpenInNewTab={onOpenInNewTab}
          onOpenAsNode={onOpenAsNode}
          onLock={onLock}
          onWhiteboard={onWhiteboard}
          onDelete={onDelete}
          onClearSpace={onClearSpace}
          onMoveTo={onMoveTo}
        />
      )}

      {/* Help Dropdown */}
      {helpAnchor && (
        <HelpDropdown
          onClose={() => setHelpAnchor(null)}
          anchorEl={helpAnchor}
          onFeedback={onFeedback}
        />
      )}

      {/* Search Modal */}
      {searchModalOpen && (
        <SearchModal
          onClose={() => setSearchModalOpen(false)}
        />
      )}
    </div>
  );
}
