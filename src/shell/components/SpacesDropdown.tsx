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
      className="fixed z-[100] w-[188px] rounded-[12px] bg-white py-[8px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] dark:border dark:border-[#374151] dark:bg-[#111827] dark:shadow-[0px_8px_24px_0px_rgba(0,0,0,0.35)]"
      style={{
        left: `${rect.left}px`,
        top: `${rect.bottom + 8}px`,
      }}
    >
      <div className="relative flex items-center justify-between px-[26px] py-[8px]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onBack) {
              onBack();
            } else {
              onClose();
            }
          }}
          className="z-10 flex size-[12px] cursor-pointer items-center justify-center transition-opacity hover:opacity-70"
          aria-label="Back"
        >
          <ChevronDown className="size-[12px] rotate-90 text-[#292D32] dark:text-[#d1d5db]" />
        </button>

        <span
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-[#333] dark:text-white"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Spaces
        </span>

        <button
          onClick={handleAddSpaceClick}
          className="z-10 flex size-[16px] cursor-pointer items-center justify-center text-[#248bf2] transition-colors hover:text-[#1a6bc4] dark:text-[#93c5fd] dark:hover:text-white"
          aria-label="Add space"
        >
          <Plus className="size-[16px]" />
        </button>
      </div>

      <div className="mt-[12px] flex flex-col gap-[8px] px-[26px]">
        {spaces.map((space) => (
          <button
            key={space.id}
            onClick={() => handleSpaceClick(space.id)}
            className={`flex items-center gap-[3px] rounded-[6px] px-[0px] py-[4px] text-left transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#1f2937] ${
              currentSpace === space.id
                ? "text-[#248bf2] dark:text-[#93c5fd]"
                : "text-[#828282] dark:text-[#9ca3af]"
            }`}
          >
            <MoreHorizontal className="size-[16px] rotate-90 text-[#e0e0e0] dark:text-[#4b5563]" />
            <span
              className="font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {space.name}
            </span>
          </button>
        ))}

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
              className="h-[32px] w-full rounded-[10px] border border-[#e0e0e0] bg-white px-[14px] py-[8px] font-['Roboto:Regular',sans-serif] text-[12px] font-normal leading-[18px] tracking-[-0.08px] text-[#828282] focus:border-[#248bf2] focus:outline-none dark:border-[#374151] dark:bg-[#0f172a] dark:text-[#e5e7eb] dark:placeholder:text-[#6b7280] dark:focus:border-[#60a5fa]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            />
          </div>
        )}
      </div>

      {showEmptyState && (
        <p
          className="px-[8px] py-[8px] text-center font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-[#bdbdbd] dark:text-[#6b7280]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          You don&apos;t have any spaces yet, create your first one
        </p>
      )}
    </div>
  );
}