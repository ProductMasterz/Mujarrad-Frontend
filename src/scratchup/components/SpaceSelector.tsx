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
        className="bg-[#e4f1ff] h-[32px] px-[12px] py-0 rounded-[100px] flex gap-[8px] items-center hover:bg-[#d4e7ff] transition-colors"
      >
        <span
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#248bf2] tracking-[-0.08px] leading-[18px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Space: {currentSpaceName}
        </span>
        <div className="size-[16px] flex items-center justify-center">
          <ChevronDown className="size-[12px] text-[#248bf2]" />
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
