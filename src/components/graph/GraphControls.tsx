/**
 * GraphControls component
 * Controls for filtering graph view
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GraphViewMode } from '@/types/graph';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface GraphControlsProps {
  viewMode: GraphViewMode;
  onViewModeChange: (mode: Partial<GraphViewMode>) => void;
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[#4f4f4f] cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded"
      />
      <span>{label}</span>
    </label>
  );
}

function DropdownSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-medium text-[#111827] shadow-sm transition hover:bg-[#f9fafb]"
      >
        <span>{title}</span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-[#6b7280]" />
        ) : (
          <ChevronRight className="h-4 w-4 text-[#6b7280]" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-20 min-w-[250px] rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0px_10px_30px_0px_rgba(0,0,0,0.10),0px_2px_10px_0px_rgba(0,0,0,0.05)]">
          <div className="space-y-3">{children}</div>
        </div>
      )}
    </div>
  );
}

/**
 * GraphControls component
 * Grouped dropdown controls for chat, entities, and system nodes
 */
export function GraphControls({ viewMode, onViewModeChange }: GraphControlsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [openSection, setOpenSection] = useState<'chat' | 'entities' | 'system' | null>('entities');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenSection(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSection = (section: 'chat' | 'entities' | 'system') => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const handleChatGroupChange = (checked: boolean) => {
    onViewModeChange({
      showChat: checked,
      showConversationNodes: checked,
      showUserMessages: checked,
      showAssistantMessages: checked,
      showChatRelations: checked,
    });
  };

  const handleEntitiesGroupChange = (checked: boolean) => {
    onViewModeChange({
      showEntities: checked,
      showPerson: checked,
      showPlace: checked,
      showAction: checked,
      showTopic: checked,
      showEvent: checked,
      showEntityRelations: checked,
    });
  };

  const handleSystemGroupChange = (checked: boolean) => {
    onViewModeChange({
      showSystem: checked,
      showRegular: checked,
      showContext: checked,
      showAssumption: checked,
      showTemplate: checked,
      showBlocks: checked,
      showReferences: checked,
    });
  };

  return (
    <div
      ref={containerRef}
      className="border-b border-[#e6e6e6] bg-[#fafafa] px-4 py-3"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-sm font-medium text-[#4f4f4f] mr-1">Filters:</div>

        <DropdownSection
          title="Chat"
          open={openSection === 'chat'}
          onToggle={() => toggleSection('chat')}
        >
          <Toggle
            label="Enable chat group"
            checked={viewMode.showChat}
            onChange={handleChatGroupChange}
          />

          <div className="ml-5 space-y-2">
            <Toggle
              label="Conversations"
              checked={viewMode.showConversationNodes}
              onChange={(checked) => onViewModeChange({ showConversationNodes: checked })}
            />
            <Toggle
              label="User messages"
              checked={viewMode.showUserMessages}
              onChange={(checked) => onViewModeChange({ showUserMessages: checked })}
            />
            <Toggle
              label="Assistant messages"
              checked={viewMode.showAssistantMessages}
              onChange={(checked) => onViewModeChange({ showAssistantMessages: checked })}
            />
            <Toggle
              label="Chat links"
              checked={viewMode.showChatRelations}
              onChange={(checked) => onViewModeChange({ showChatRelations: checked })}
            />
          </div>
        </DropdownSection>

        <DropdownSection
          title="Entities"
          open={openSection === 'entities'}
          onToggle={() => toggleSection('entities')}
        >
          <Toggle
            label="Enable entity group"
            checked={viewMode.showEntities}
            onChange={handleEntitiesGroupChange}
          />

          <div className="ml-5 space-y-2">
            <Toggle
              label="People"
              checked={viewMode.showPerson}
              onChange={(checked) => onViewModeChange({ showPerson: checked })}
            />
            <Toggle
              label="Places"
              checked={viewMode.showPlace}
              onChange={(checked) => onViewModeChange({ showPlace: checked })}
            />
            <Toggle
              label="Actions"
              checked={viewMode.showAction}
              onChange={(checked) => onViewModeChange({ showAction: checked })}
            />
            <Toggle
              label="Topics"
              checked={viewMode.showTopic}
              onChange={(checked) => onViewModeChange({ showTopic: checked })}
            />
            <Toggle
              label="Events"
              checked={viewMode.showEvent}
              onChange={(checked) => onViewModeChange({ showEvent: checked })}
            />
            <Toggle
              label="Entity relations"
              checked={viewMode.showEntityRelations}
              onChange={(checked) => onViewModeChange({ showEntityRelations: checked })}
            />
          </div>
        </DropdownSection>

        <DropdownSection
          title="System"
          open={openSection === 'system'}
          onToggle={() => toggleSection('system')}
        >
          <Toggle
            label="Enable system group"
            checked={viewMode.showSystem}
            onChange={handleSystemGroupChange}
          />

          <div className="ml-5 space-y-2">
            <Toggle
              label="Regular"
              checked={viewMode.showRegular}
              onChange={(checked) => onViewModeChange({ showRegular: checked })}
            />
            <Toggle
              label="Context"
              checked={viewMode.showContext}
              onChange={(checked) => onViewModeChange({ showContext: checked })}
            />
            <Toggle
              label="Assumptions"
              checked={viewMode.showAssumption}
              onChange={(checked) => onViewModeChange({ showAssumption: checked })}
            />
            <Toggle
              label="Templates"
              checked={viewMode.showTemplate}
              onChange={(checked) => onViewModeChange({ showTemplate: checked })}
            />
            <Toggle
              label="Blocks"
              checked={viewMode.showBlocks}
              onChange={(checked) => onViewModeChange({ showBlocks: checked })}
            />
            <Toggle
              label="References"
              checked={viewMode.showReferences}
              onChange={(checked) => onViewModeChange({ showReferences: checked })}
            />
          </div>
        </DropdownSection>
      </div>
    </div>
  );
}