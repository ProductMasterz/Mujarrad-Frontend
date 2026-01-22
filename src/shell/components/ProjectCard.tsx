import { Info } from "lucide-react";
import { CardType } from "../data/projects";
import VuesaxLinearContext from "../imports/VuesaxLinearContext";
import VuesaxLinearNode from "../imports/VuesaxLinearNode";

type ProjectCardProps = {
  title: string;
  color: string;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  type?: CardType;
  showInfo?: boolean;
};

export function ProjectCard({
  title,
  color,
  onClick,
  onContextMenu,
  type = CardType.EMPTY_CONTEXT,
  showInfo = false
}: ProjectCardProps) {
  // Function to render the appropriate icon based on CardType
  const renderIcon = () => {
    switch (type) {
      case CardType.EMPTY_CONTEXT:
        // Empty rounded square
        return (
          <svg className="block size-full" fill="none" viewBox="0 0 16 16">
            <rect
              x="1.33"
              y="1.33"
              width="13.34"
              height="13.34"
              rx="4.67"
              stroke="currentColor"
              strokeWidth="1.2"
              fill="none"
            />
          </svg>
        );

      case CardType.FULFILLED_CONTEXT:
        // Rounded square with 3 circles in a grid pattern
        return (
          <svg className="block size-full" fill="none" viewBox="0 0 16 16">
            <rect
              x="1.33"
              y="1.33"
              width="13.34"
              height="13.34"
              rx="4.67"
              stroke="currentColor"
              strokeWidth="1.2"
              fill="none"
            />
            <circle cx="5.2" cy="5.2" r="1.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="10.8" cy="5.2" r="1.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="5.3" cy="10.7" r="1.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        );

      case CardType.GRAPH_CONTEXT:
        // Rounded square with graph shape (connected nodes) - using Figma import
        return (
          <div className="size-full">
            <VuesaxLinearContext />
          </div>
        );

      case CardType.NODE:
        // Simple circle (leaf node) - using Figma import
        return (
          <div className="size-full">
            <VuesaxLinearNode />
          </div>
        );

      default:
        return (
          <svg className="block size-full" fill="none" viewBox="0 0 16 16">
            <rect
              x="1.33"
              y="1.33"
              width="13.34"
              height="13.34"
              rx="4.67"
              stroke="currentColor"
              strokeWidth="1.2"
              fill="none"
            />
          </svg>
        );
    }
  };

  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="h-[113px] w-[215px] relative group transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* White background with border */}
      <div className="absolute inset-0 bg-white border border-[#e0e0e0] rounded-[12px] group-hover:border-[#bdbdbd] transition-colors" />

      {/* Colored bar at top - matching Figma design: inset-[0.88%_4.19%_96.46%_4.19%] */}
      <div
        className="absolute inset-[1px_9px_109px_9px] rounded-[12px]"
        style={{ backgroundColor: color }}
      />

      {/* Icon at bottom right - matching Figma design: inset-[79.65%_2.33%_6.19%_90.23%] */}
      <div className="absolute inset-[90px_5px_7px_194px] text-[#bdbdbd]">
        {renderIcon()}
      </div>

      {/* Info icon at top right (if needed) */}
      {showInfo && (
        <div className="absolute right-[12px] top-[12px] text-black">
          <Info className="size-3" strokeWidth={2} />
        </div>
      )}

      {/* Title text at top left - matching Figma design: inset-[10.62%_80.47%_68.14%_5.58%] */}
      <p
        className="absolute left-[12px] top-[12px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[15px] text-black tracking-[-0.24px] text-left"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        {title}
      </p>
    </button>
  );
}
