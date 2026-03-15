import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SpacesDropdown } from "./SpacesDropdown";

type Space = {
  id: string;
  name: string;
};

type SpaceSelectorProps = {
  currentSpace: string;
  currentSpaceName: string;
  onSpaceChange: (spaceId: string) => void;
  spaces: Space[];
  onAddSpace: (spaceName: string) => void;
};

export function SpaceSelector({
  currentSpace,
  currentSpaceName,
  onSpaceChange,
  spaces,
  onAddSpace,
}: SpaceSelectorProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex h-[32px] items-center gap-[8px] rounded-[100px] bg-[#e4f1ff] px-[12px] py-0 transition-colors hover:bg-[#d4e7ff] dark:bg-[#1e3a5f] dark:hover:bg-[#25456f]"
      >
        <span
          className="font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-[#248bf2] dark:text-[#93c5fd]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Space: {currentSpaceName}
        </span>
        <div className="flex size-[16px] items-center justify-center">
          <ChevronDown className="size-[12px] text-[#248bf2] dark:text-[#93c5fd]" />
        </div>
      </button>

      {anchorEl && (
        <SpacesDropdown
          onClose={handleClose}
          anchorEl={anchorEl}
          currentSpace={currentSpace}
          onSpaceChange={(spaceId) => {
            onSpaceChange(spaceId);
            handleClose();
          }}
          spaces={spaces}
          onAddSpace={onAddSpace}
        />
      )}
    </>
  );
}