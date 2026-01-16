import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, MoreHorizontal } from "lucide-react";

type Space = {
  id: string;
  name: string;
};

type SpacesDropdownProps = {
  onClose: () => void;
  anchorEl: HTMLElement | null;
  currentSpace: string;
  onSpaceChange: (spaceId: string) => void;
  spaces: Space[];
  onAddSpace: (spaceName: string) => void;
  onBack?: () => void;
};

export function SpacesDropdown({
  onClose,
  anchorEl,
  currentSpace,
  onSpaceChange,
  spaces,
  onAddSpace,
  onBack,
}: SpacesDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isAddingSpace, setIsAddingSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isAddingSpace) {
          setIsAddingSpace(false);
          setNewSpaceName("");
        } else {
          onClose();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, anchorEl, isAddingSpace]);

  useEffect(() => {
    if (isAddingSpace && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingSpace]);

  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();

  const handleAddSpaceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingSpace(true);
  };

  const handleCreateSpace = () => {
    if (newSpaceName.trim()) {
      onAddSpace(newSpaceName.trim());
      setNewSpaceName("");
      setIsAddingSpace(false);
      onClose();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateSpace();
    }
  };

  const handleSpaceClick = (spaceId: string) => {
    onSpaceChange(spaceId);
    onClose();
  };

  const showEmptyState = spaces.length === 1 && !isAddingSpace;

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-[12px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] w-[188px] z-[100] py-[8px]"
      style={{
        left: `${rect.left}px`,
        top: `${rect.bottom + 8}px`,
      }}
    >
      {/* Header */}
      <div className="px-[26px] py-[8px] flex items-center justify-between relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onBack) {
              onBack();
            } else {
              onClose();
            }
          }}
          className="flex items-center justify-center size-[12px] hover:opacity-70 transition-opacity cursor-pointer z-10"
          aria-label="Back"
        >
          <ChevronDown className="size-[12px] text-[#292D32] rotate-90" />
        </button>
        <span
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#333] tracking-[-0.08px] leading-[18px] absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Spaces
        </span>
        <button
          onClick={handleAddSpaceClick}
          className="flex items-center justify-center size-[16px] text-[#248bf2] hover:text-[#1a6bc4] transition-colors cursor-pointer z-10"
          aria-label="Add space"
        >
          <Plus className="size-[16px]" />
        </button>
      </div>

      {/* Spaces List */}
      <div className="flex flex-col gap-[8px] mt-[12px] px-[26px]">
        {spaces.map((space) => (
          <button
            key={space.id}
            onClick={() => handleSpaceClick(space.id)}
            className={`flex gap-[3px] items-center text-left py-[4px] px-[0px] rounded-[6px] hover:bg-[#f5f5f5] transition-colors ${
              currentSpace === space.id ? "text-[#248bf2]" : "text-[#828282]"
            }`}
          >
            <MoreHorizontal className="size-[16px] text-[#e0e0e0] rotate-90" />
            <span
              className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] tracking-[-0.08px] leading-[18px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {space.name}
            </span>
          </button>
        ))}

        {/* Input for new space */}
        {isAddingSpace && (
          <div className="mt-[-8px]">
            <input
              ref={inputRef}
              type="text"
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onBlur={handleCreateSpace}
              placeholder="Type Space Name"
              className="w-full h-[32px] px-[14px] py-[8px] bg-white border border-[#e0e0e0] rounded-[10px] font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[#828282] tracking-[-0.08px] leading-[18px] focus:outline-none focus:border-[#248bf2]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            />
          </div>
        )}
      </div>

      {/* Empty State */}
      {showEmptyState && (
        <p
          className="px-[8px] py-[8px] text-center font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#bdbdbd] tracking-[-0.08px] leading-[18px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          You don&apos;t have any spaces yet, create your first one
        </p>
      )}
    </div>
  );
}
