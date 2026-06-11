import { useEffect, useRef } from "react";

type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  onOpenNewTab: () => void;
  onOpenAsNode: () => void;
  openAsLabel?: string;
  onRename: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onDelete: () => void;
  onMoveTo?: () => void;
  onMakeChildOf?: () => void;
  onRemoveFromContext?: () => void;
  onSetSemanticType?: (type: string) => void;
  onViewAttributes?: () => void;
  contextName?: string;
  currentSemanticType?: string;
};

export function ContextMenu({
  x,
  y,
  onClose,
  onOpenNewTab,
  onOpenAsNode,
  openAsLabel = 'Open',
  onRename,
  onDuplicate,
  onShare,
  onDelete,
  onMoveTo,
  onMakeChildOf,
  onRemoveFromContext,
  onSetSemanticType,
  onViewAttributes,
  contextName,
  currentSemanticType,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const menuItems: Array<{ label: string; onClick: () => void; destructive?: boolean }> = [
    { label: "Open in New Tab", onClick: onOpenNewTab },
    { label: openAsLabel, onClick: onOpenAsNode },
  ];

  if (onMakeChildOf) {
    menuItems.push({ label: "Make a Child Of...", onClick: onMakeChildOf });
  }
  if (onMoveTo) {
    menuItems.push({ label: "Move To Space...", onClick: onMoveTo });
  }

  if (onRemoveFromContext && contextName) {
    menuItems.push({
      label: `Remove from ${contextName}`,
      onClick: onRemoveFromContext,
      destructive: true,
    });
  }

  if (onSetSemanticType) {
    const semanticTypes = ['Person', 'Place', 'Action', 'Topic', 'Event'];
    for (const type of semanticTypes) {
      const isActive = currentSemanticType?.toLowerCase() === type.toLowerCase();
      menuItems.push({
        label: `${isActive ? '● ' : ''}Set as ${type}`,
        onClick: () => onSetSemanticType(type.toLowerCase()),
      });
    }
  }

  if (onViewAttributes) {
    menuItems.push({ label: "View Attributes", onClick: onViewAttributes });
  }

  menuItems.push(
    { label: "Rename", onClick: onRename },
    { label: "Duplicate", onClick: onDuplicate },
    { label: "Share", onClick: onShare },
    { label: "Delete", onClick: onDelete, destructive: true },
  );

  const menuWidth = 205;
  const menuHeight = 280;
  const padding = 12;

  const left = Math.min(x, window.innerWidth - menuWidth - padding);
  const top = Math.min(y, window.innerHeight - menuHeight - padding);

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] w-[205px] rounded-[12px] border border-border bg-background px-[12px] py-[12px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] dark:shadow-[0px_10px_30px_rgba(0,0,0,0.35)]"
      style={{
        left: `${left}px`,
        top: `${top}px`,
      }}
    >
      <div className="flex flex-col gap-[4px]">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`rounded-[8px] px-[10px] py-[8px] text-left font-['Roboto:Regular',sans-serif] text-[13px] leading-[18px] tracking-[-0.08px] transition-colors ${
              item.destructive
                ? "text-[#d4183d] hover:bg-[#fef2f2] dark:hover:bg-[#3a161c]"
                : "text-foreground hover:bg-accent"
            }`}
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
