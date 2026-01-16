'use client';

import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  id: string;
  title: string;
}

interface BreadcrumbProps {
  path: BreadcrumbItem[];
  onBreadcrumbClick: (index: number) => void;
  maxVisible?: number;
}

export function Breadcrumb({ path, onBreadcrumbClick, maxVisible = 3 }: BreadcrumbProps) {
  if (path.length === 0) return null;

  const showEllipsis = path.length > maxVisible;
  const visiblePath = showEllipsis
    ? [path[0], ...path.slice(-maxVisible + 1)]
    : path;

  return (
    <div className="flex items-center gap-[6px]">
      {visiblePath.map((item, index) => {
        const isLast = index === visiblePath.length - 1;
        const actualIndex = showEllipsis && index > 0
          ? path.length - (visiblePath.length - index)
          : index;

        return (
          <div key={item.id} className="flex items-center gap-[6px]">
            {showEllipsis && index === 1 && (
              <>
                <span className="text-[13px] text-[#bdbdbd] tracking-[-0.08px]">...</span>
                <ChevronRight className="size-3 text-[#bdbdbd]" strokeWidth={2} />
              </>
            )}
            <button
              onClick={() => onBreadcrumbClick(actualIndex)}
              className={`font-normal text-[13px] tracking-[-0.08px] transition-colors ${
                isLast ? 'text-[#333]' : 'text-[#828282] hover:text-[#4f4f4f]'
              }`}
            >
              {item.title}
            </button>
            {!isLast && (
              <ChevronRight className="size-3 text-[#bdbdbd]" strokeWidth={2} />
            )}
          </div>
        );
      })}
    </div>
  );
}
