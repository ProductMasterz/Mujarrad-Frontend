import { useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ProjectCard } from "./components/ProjectCard";
import { NewNodeModal } from "./components/NewNodeModal";
import { ContextMenu } from "./components/ContextMenu";
import { ShareModal } from "./components/ShareModal";
import { FeedbackModal } from "./components/FeedbackModal";
import { AuthPage } from "./pages/AuthPage";
import { getCurrentCards, buildBreadcrumb, CardType, findCardByPath, projectsData, Card } from "./data/projects";
import { Tab } from "./components/TabsBar";

type Space = {
  id: string;
  name: string;
};

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [showNewNodeModal, setShowNewNodeModal] = useState(false);
  const [newNodeParentPath, setNewNodeParentPath] = useState<string[]>([]);
  const [newNodePosition, setNewNodePosition] = useState<number | undefined>(undefined);
  const [currentSpace, setCurrentSpace] = useState("void");
  const [spaces, setSpaces] = useState<Space[]>([
    { id: "void", name: "Void" },
  ]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    cardId: string;
  } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState("");

  // Tabs state
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: "tab-1",
      title: "Home",
      navigationPath: [],
      spaceId: "void",
    },
  ]);
  const [activeTabId, setActiveTabId] = useState("tab-1");

  // Authentication handlers
  const handleLogin = (email: string, password: string) => {
    // In a real app, this would validate credentials with a backend
    console.log("Login:", email, password);
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail("");
    // Reset app state
    setNavigationPath([]);
    setSidebarOpen(false);
    setTabs([
      {
        id: "tab-1",
        title: "Home",
        navigationPath: [],
        spaceId: "void",
      },
    ]);
    setActiveTabId("tab-1");
  };

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCardClick = (cardId: string) => {
    setNavigationPath([...navigationPath, cardId]);
  };

  const handleSidebarItemClick = (itemId: string) => {
    setNavigationPath([itemId]);
  };

  const handleSidebarNavigate = (path: string[]) => {
    setNavigationPath(path);
  };

  const handleBackClick = () => {
    if (navigationPath.length > 0) {
      setNavigationPath(navigationPath.slice(0, -1));
    }
  };

  const handleAddClick = () => {
    // Reset parent path and position for top-level add
    setNewNodeParentPath(navigationPath);
    setNewNodePosition(undefined);
    setShowNewNodeModal(true);
  };

  const handleNotificationClick = () => {
    alert("Notification button clicked");
  };

  const handleSearchClick = () => {
    // Search modal is now handled in Header component
  };

  const handleMoreClick = () => {
    alert("More button clicked");
  };

  const handleHomeClick = () => {
    setNavigationPath([]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Clicked on "Home"
      setNavigationPath([]);
    } else {
      // Clicked on a breadcrumb item, navigate to that level
      setNavigationPath(navigationPath.slice(0, index + 1));
    }
  };

  const handleCardContextMenu = (e: React.MouseEvent, cardId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      cardId,
    });
  };

  const handleContextMenuAction = (action: string) => {
    if (contextMenu) {
      console.log(`Action "${action}" on card: ${contextMenu.cardId}`);
      // Implement actual actions here
      switch (action) {
        case "openNewTab":
          alert(`Opening ${contextMenu.cardId} in new tab`);
          break;
        case "openAsNode":
          alert(`Opening ${contextMenu.cardId} as a node`);
          break;
        case "rename":
          alert(`Renaming ${contextMenu.cardId}`);
          break;
        case "duplicate":
          alert(`Duplicating ${contextMenu.cardId}`);
          break;
        case "share":
          setSelectedCardId(contextMenu.cardId);
          setShowShareModal(true);
          setContextMenu(null);
          break;
        case "delete":
          alert(`Deleting ${contextMenu.cardId}`);
          break;
      }
    }
  };

  const handleSpaceChange = (spaceId: string) => {
    setCurrentSpace(spaceId);
    // Reset navigation when changing spaces
    setNavigationPath([]);
  };

  const handleAddSpace = (spaceName: string) => {
    const newSpace: Space = {
      id: spaceName.toLowerCase().replace(/\s+/g, "-"),
      name: spaceName,
    };
    setSpaces([...spaces, newSpace]);
    setCurrentSpace(newSpace.id);
    setNavigationPath([]);
  };

  const currentCards = getCurrentCards(navigationPath);
  const breadcrumbPath = buildBreadcrumb(navigationPath);
  const currentSelectedItem = navigationPath.join("/");

  // Get current space name
  const getSpaceName = (spaceId: string) => {
    const space = spaces.find((s) => s.id === spaceId);
    return space ? space.name : spaceId.charAt(0).toUpperCase() + spaceId.slice(1);
  };

  const handleShareClick = () => {
    // Share from header menu - use generic card or current context
    setSelectedCardId("current-project");
    setShowShareModal(true);
  };

  // Get the card type for the selected card (for ShareModal)
  const getSelectedCardType = (): CardType => {
    if (selectedCardId === "current-project") {
      return CardType.FULFILLED_CONTEXT;
    }
    // Find the card in current cards
    const card = currentCards.find((c) => c.id === selectedCardId);
    return card?.type || CardType.FULFILLED_CONTEXT;
  };

  // Handle adding a node from sidebar
  const handleAddNodeFromSidebar = (parentPath: string[], position?: number) => {
    console.log("Add node at path:", parentPath, "position:", position);
    setNewNodeParentPath(parentPath);
    setNewNodePosition(position);
    setShowNewNodeModal(true);
  };

  const handleCloseNewNodeModal = () => {
    setShowNewNodeModal(false);
    setNewNodeParentPath([]);
    setNewNodePosition(undefined);
  };

  // Tab management functions
  const updateActiveTabNavigation = (newPath: string[]) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, navigationPath: newPath, title: newPath.length === 0 ? "Home" : buildBreadcrumb(newPath).slice(-1)[0].title }
          : tab
      )
    );
  };

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
      setActiveTabId(tabId);
      setNavigationPath(tab.navigationPath);
      setCurrentSpace(tab.spaceId);
    }
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close the last tab

    const tabIndex = tabs.findIndex((t) => t.id === tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);

    // If closing the active tab, switch to adjacent tab
    if (tabId === activeTabId) {
      const newActiveTab = newTabs[Math.max(0, tabIndex - 1)];
      setActiveTabId(newActiveTab.id);
      setNavigationPath(newActiveTab.navigationPath);
      setCurrentSpace(newActiveTab.spaceId);
    }
  };

  const handleNewTab = () => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newTabId,
      title: "Home",
      navigationPath: [],
      spaceId: currentSpace,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
    setNavigationPath([]);
  };

  const handleOpenInNewTab = () => {
    const newTabId = `tab-${Date.now()}`;
    const currentTitle = navigationPath.length === 0 ? "Home" : breadcrumbPath.slice(-1)[0].title;
    const newTab: Tab = {
      id: newTabId,
      title: currentTitle,
      navigationPath: [...navigationPath],
      spaceId: currentSpace,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
  };

  // Override navigation handlers to update active tab
  const handleCardClickWithTab = (cardId: string) => {
    const newPath = [...navigationPath, cardId];
    setNavigationPath(newPath);
    updateActiveTabNavigation(newPath);
  };

  const handleSidebarItemClickWithTab = (itemId: string) => {
    const newPath = [itemId];
    setNavigationPath(newPath);
    updateActiveTabNavigation(newPath);
  };

  const handleSidebarNavigateWithTab = (path: string[]) => {
    setNavigationPath(path);
    updateActiveTabNavigation(path);
  };

  const handleBackClickWithTab = () => {
    if (navigationPath.length > 0) {
      const newPath = navigationPath.slice(0, -1);
      setNavigationPath(newPath);
      updateActiveTabNavigation(newPath);
    }
  };

  const handleHomeClickWithTab = () => {
    setNavigationPath([]);
    updateActiveTabNavigation([]);
  };

  const handleBreadcrumbClickWithTab = (index: number) => {
    let newPath: string[];
    if (index === -1) {
      newPath = [];
    } else {
      newPath = navigationPath.slice(0, index + 1);
    }
    setNavigationPath(newPath);
    updateActiveTabNavigation(newPath);
  };

  const handleFeedback = () => {
    setShowFeedbackModal(true);
  };

  return (
    <div className="bg-white min-h-screen relative">
      <Header
        onMenuClick={toggleSidebar}
        onBackClick={handleBackClickWithTab}
        showBackButton={navigationPath.length > 0}
        breadcrumbPath={breadcrumbPath}
        onNotificationClick={handleNotificationClick}
        onSearchClick={handleSearchClick}
        onHomeClick={handleHomeClickWithTab}
        onBreadcrumbClick={handleBreadcrumbClickWithTab}
        // Add menu actions
        onCreateSpace={handleAddClick}
        onCreateNode={handleAddClick}
        onCreateContext={handleAddClick}
        // More menu actions
        onShare={handleShareClick}
        onOpenInNewTab={handleOpenInNewTab}
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
        onFeedback={handleFeedback}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onItemClick={handleSidebarItemClickWithTab}
        selectedItem={currentSelectedItem}
        onNavigate={handleSidebarNavigateWithTab}
        onAddNode={handleAddNodeFromSidebar}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div
        className="pt-[76px] px-[14px] transition-all duration-300"
        style={{
          marginLeft: sidebarOpen ? "276px" : "0",
        }}
      >
        {/* Cards grid */}
        <div className="flex gap-[19px] flex-wrap pt-[15px]">
          {currentCards.map((card) => (
            <ProjectCard
              key={card.id}
              title={card.title}
              color={card.color}
              type={card.type}
              showInfo={card.showInfo}
              onClick={() => handleCardClickWithTab(card.id)}
              onContextMenu={(e) => handleCardContextMenu(e, card.id)}
            />
          ))}
        </div>

        {/* Empty state */}
        {currentCards.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <p
              className="text-[15px] font-['Roboto:Regular',sans-serif] font-normal text-[#828282] tracking-[-0.24px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              No items to display
            </p>
            <p
              className="text-[13px] font-['Roboto:Regular',sans-serif] font-normal text-[#bdbdbd] mt-2 tracking-[-0.24px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Click the + button to add new items
            </p>
          </div>
        )}
      </div>

      {/* New Node Modal */}
      <NewNodeModal
        isOpen={showNewNodeModal}
        onClose={handleCloseNewNodeModal}
        spaceSlug={currentSpace}
        spaceId={currentSpace}
        currentPath={navigationPath}
        currentSpace={currentSpace}
        spaces={spaces}
        onAddSpace={handleAddSpace}
        onSpaceChange={handleSpaceChange}
        parentPath={newNodeParentPath}
        insertPosition={newNodePosition}
      />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onOpenNewTab={() => handleContextMenuAction("openNewTab")}
          onOpenAsNode={() => handleContextMenuAction("openAsNode")}
          onRename={() => handleContextMenuAction("rename")}
          onDuplicate={() => handleContextMenuAction("duplicate")}
          onShare={() => handleContextMenuAction("share")}
          onDelete={() => handleContextMenuAction("delete")}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          cardId={selectedCardId}
          cardType={getSelectedCardType()}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
}
