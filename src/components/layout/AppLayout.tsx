'use client';

import { useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader, Tab } from './Header';
import { AppSidebar, SidebarNode } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
  sidebarItems?: SidebarNode[];
  selectedNodeId?: string | null;
  onNodeSelect?: (id: string) => void;
  onAddNode?: (parentId: string) => void;
  breadcrumbPath?: Array<{ id: string; title: string }>;
}

export function AppLayout({
  children,
  sidebarItems = [],
  selectedNodeId = null,
  onNodeSelect,
  onAddNode,
  breadcrumbPath = [],
}: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Simple tab state - single tab for now
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'Home', path: pathname },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleHomeClick = () => {
    router.push('/spaces');
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleBreadcrumbClick = (index: number) => {
    // Navigate to the breadcrumb item
    // This will be implemented based on your navigation logic
    console.log('Breadcrumb clicked:', index);
  };

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
      router.push(tab.path);
    }
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length > 1) {
      const newTabs = tabs.filter((t) => t.id !== tabId);
      setTabs(newTabs);
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[0].id);
      }
    }
  };

  const handleNewTab = () => {
    const newTab: Tab = {
      id: String(Date.now()),
      title: 'New Tab',
      path: '/spaces',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    router.push('/spaces');
  };

  const handleNodeSelect = (id: string) => {
    if (onNodeSelect) {
      onNodeSelect(id);
    }
  };

  const handleSearchClick = () => {
    // Open command palette (Cmd+K)
    // This can be integrated with existing command palette
    console.log('Search clicked');
  };

  const handleAddClick = () => {
    // Add new node
    console.log('Add clicked');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - 76px total height */}
      <AppHeader
        onMenuClick={handleMenuClick}
        showBackButton={breadcrumbPath.length > 1}
        onBackClick={handleBackClick}
        breadcrumbPath={breadcrumbPath}
        onBreadcrumbClick={handleBreadcrumbClick}
        onHomeClick={handleHomeClick}
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
        onAddClick={handleAddClick}
        onSearchClick={handleSearchClick}
      />

      {/* Sidebar - 276px width, below header */}
      <AppSidebar
        isOpen={sidebarOpen}
        items={sidebarItems}
        selectedId={selectedNodeId}
        onSelect={handleNodeSelect}
        onAddChild={onAddNode}
      />

      {/* Main Content */}
      <main
        className="pt-[76px] transition-all duration-300 ease-in-out"
        style={{
          marginLeft: sidebarOpen ? '276px' : '0',
        }}
      >
        {children}
      </main>
    </div>
  );
}
