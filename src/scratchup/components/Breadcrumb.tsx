import { ChevronRight } from "lucide-react";

type BreadcrumbProps = {
  path: Array<{ id: string; title: string }>;
  onBreadcrumbClick: (index: number) => void;
};

export function Breadcrumb({ path, onBreadcrumbClick }: BreadcrumbProps) {
  if (path.length === 0) {
    return (
      <div className="flex items-center gap-[6px]">
        <button
          onClick={() => onBreadcrumbClick(-1)}
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] hover:text-[#4f4f4f] transition-colors tracking-[-0.08px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-[6px]">
      <button
        onClick={() => onBreadcrumbClick(-1)}
        className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] hover:text-[#4f4f4f] transition-colors tracking-[-0.08px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        Home
      </button>
      <ChevronRight className="size-3 text-[#bdbdbd]" strokeWidth={2} />
      <span
        className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#bdbdbd] tracking-[-0.08px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        ...
      </span>
      <ChevronRight className="size-3 text-[#bdbdbd]" strokeWidth={2} />
      {path.map((item, index) => (
        <div key={item.id} className="flex items-center gap-[6px]">
          <button
            onClick={() => onBreadcrumbClick(index)}
            className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] hover:text-[#4f4f4f] transition-colors tracking-[-0.08px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            {item.title}
          </button>
          {index < path.length - 1 && (
            <ChevronRight className="size-3 text-[#bdbdbd]" strokeWidth={2} />
          )}
        </div>
      ))}
    </div>
  );
}
