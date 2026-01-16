'use client';

import { Info } from 'lucide-react';
import { CardType } from './types';
import { CardTypeIcon } from './CardTypeIcon';
import { SpaceIcon } from './SpaceIcon';

interface NodeCardProps {
  title: string;
  color: string;
  type?: CardType;
  isSpace?: boolean; // If true, use SpaceIcon instead of CardTypeIcon
  showInfo?: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function NodeCard({
  title,
  color,
  type = CardType.EMPTY_CONTEXT,
  isSpace = false,
  showInfo = false,
  onClick,
  onContextMenu,
}: NodeCardProps) {
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="h-[113px] w-[215px] relative group transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* White background with border */}
      <div className="absolute inset-0 bg-white border border-[#e0e0e0] rounded-[12px] group-hover:border-[#bdbdbd] transition-colors" />

      {/* Colored bar at top */}
      <div
        className="absolute top-[1px] left-[9px] right-[9px] h-[3px] rounded-[12px]"
        style={{ backgroundColor: color }}
      />

      {/* Icon at bottom right - Space icon or Card type icon */}
      <div className="absolute bottom-[7px] right-[5px] w-[16px] h-[16px] text-[#bdbdbd]">
        {isSpace ? <SpaceIcon /> : <CardTypeIcon type={type} />}
      </div>

      {/* Info icon at top right (if needed) */}
      {showInfo && (
        <div className="absolute right-[12px] top-[12px] text-black">
          <Info className="size-3" strokeWidth={2} />
        </div>
      )}

      {/* Title text at top left */}
      <p className="absolute left-[12px] top-[12px] font-semibold text-[15px] text-black tracking-[-0.24px] text-left max-w-[180px] truncate">
        {title}
      </p>
    </button>
  );
}
