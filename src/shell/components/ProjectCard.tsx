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
  showInfo = false,
}: ProjectCardProps) {
  const renderIcon = () => {
    switch (type) {
      case CardType.EMPTY_CONTEXT:
        return (
          <svg className="block h-4 w-4" fill="none" viewBox="0 0 16 16">
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
        return (
          <svg className="block h-4 w-4" fill="none" viewBox="0 0 16 16">
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
        return (
          <div className="h-4 w-4">
            <VuesaxLinearContext />
          </div>
        );

      case CardType.NODE:
        return (
          <div className="h-4 w-4">
            <VuesaxLinearNode />
          </div>
        );

      default:
        return (
          <svg className="block h-4 w-4" fill="none" viewBox="0 0 16 16">
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
    className="group relative h-[156px] w-full overflow-hidden rounded-[28px] border border-[#e8ecf2] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)] text-left shadow-[0px_6px_20px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d7deea] hover:shadow-[0px_14px_32px_rgba(15,23,42,0.10)] dark:border-[#374151] dark:bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)] dark:hover:border-[#4b5563] dark:hover:shadow-[0px_14px_32px_rgba(0,0,0,0.35)]"
    type="button"
  >
    <div
      className="absolute left-0 top-0 h-full w-[6px]"
      style={{ backgroundColor: color }}
    />

    <div
      className="absolute right-[-30px] top-[-30px] h-[100px] w-[100px] rounded-full opacity-10 blur-2xl"
      style={{ backgroundColor: color }}
    />

    <div className="flex h-full flex-col justify-between px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-[17px] font-semibold leading-6 text-[#0f172a] dark:text-white">
            {title}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#edf1f5] bg-white text-[#94a3b8] shadow-sm transition-colors duration-200 group-hover:text-[#475569] dark:border-[#374151] dark:bg-[#111827] dark:text-[#9ca3af] dark:group-hover:text-white">
          {renderIcon()}
        </div>
      </div>

      <div className="text-[12px] leading-5 text-[#64748b] dark:text-[#9ca3af]">
        Open to explore nodes, graph, and whiteboard.
      </div>
    </div>
  </button>
);
}