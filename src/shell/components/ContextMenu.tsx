import { useEffect, useRef } from "react";

type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  onOpenNewTab: () => void;
  onOpenAsNode: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onDelete: () => void;
};

export function ContextMenu({
  x,
  y,
  onClose,
  onOpenNewTab,
  onOpenAsNode,
  onRename,
  onDuplicate,
  onShare,
  onDelete,
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

  const menuItems = [
    { label: "Open on new Tap Window", onClick: onOpenNewTab },
    { label: "Open as a node", onClick: onOpenAsNode },
    { label: "Rename", onClick: onRename },
    { label: "Duplicate", onClick: onDuplicate },
    { label: "Share", onClick: onShare },
    { label: "Delete", onClick: onDelete },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-[12px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] w-[205px] py-[15px] px-[12px] z-[100]"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="flex flex-col gap-[8px]">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className="text-left font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] hover:text-[#333] transition-colors tracking-[-0.08px] leading-[18px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
