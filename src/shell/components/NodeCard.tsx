import { CardType } from "../data/projects";
import VuesaxLinearContext from "../imports/VuesaxLinearContext";
import VuesaxLinearNode from "../imports/VuesaxLinearNode";

type NodeCardProps = {
  title: string;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  type?: CardType;
  badge?: string;
  entityType?: string;
};

function getNodeColor(entityType?: string, type?: CardType) {
  const normalized = entityType?.toLowerCase()?.trim();

  if (normalized === "person") {
    return {
      border: "border-blue-200",
      surface: "bg-blue-50",
      accent: "bg-blue-500",
      chipBg: "bg-blue-100",
      chipText: "text-blue-700",
      icon: "text-blue-500",
    };
  }

  if (normalized === "place") {
    return {
      border: "border-emerald-200",
      surface: "bg-emerald-50",
      accent: "bg-emerald-500",
      chipBg: "bg-emerald-100",
      chipText: "text-emerald-700",
      icon: "text-emerald-500",
    };
  }

  if (normalized === "action") {
    return {
      border: "border-rose-200",
      surface: "bg-rose-50",
      accent: "bg-rose-500",
      chipBg: "bg-rose-100",
      chipText: "text-rose-700",
      icon: "text-rose-500",
    };
  }

  if (normalized === "topic") {
    return {
      border: "border-violet-200",
      surface: "bg-violet-50",
      accent: "bg-violet-500",
      chipBg: "bg-violet-100",
      chipText: "text-violet-700",
      icon: "text-violet-500",
    };
  }

  if (normalized === "event") {
    return {
      border: "border-orange-200",
      surface: "bg-orange-50",
      accent: "bg-orange-500",
      chipBg: "bg-orange-100",
      chipText: "text-orange-700",
      icon: "text-orange-500",
    };
  }

  if (type === CardType.FULFILLED_CONTEXT || type === CardType.GRAPH_CONTEXT) {
    return {
      border: "border-purple-200",
      surface: "bg-purple-50",
      accent: "bg-purple-500",
      chipBg: "bg-purple-100",
      chipText: "text-purple-700",
      icon: "text-purple-500",
    };
  }

  return {
    border: "border-slate-200",
    surface: "bg-white",
    accent: "bg-slate-400",
    chipBg: "bg-slate-100",
    chipText: "text-slate-700",
    icon: "text-slate-500",
  };
}

function renderIcon(type?: CardType) {
  if (type === CardType.FULFILLED_CONTEXT || type === CardType.GRAPH_CONTEXT) {
    return (
      <div className="h-4 w-4">
        <VuesaxLinearContext />
      </div>
    );
  }

  return (
    <div className="h-4 w-4">
      <VuesaxLinearNode />
    </div>
  );
}

export function NodeCard({
  title,
  onClick,
  onContextMenu,
  type = CardType.NODE,
  badge,
  entityType,
}: NodeCardProps) {
  const colors = getNodeColor(entityType, type);

  const label =
    entityType ||
    (type === CardType.FULFILLED_CONTEXT || type === CardType.GRAPH_CONTEXT
      ? "Context"
      : "Node");

  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`group relative h-[120px] w-[220px] overflow-hidden rounded-[18px] border ${colors.border} ${colors.surface} text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0px_10px_24px_rgba(0,0,0,0.10)]`}
      type="button"
    >
      <div className={`h-[5px] w-full ${colors.accent}`} />

      <div className="flex h-[calc(100%-5px)] flex-col justify-between px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="line-clamp-2 text-[15px] font-semibold leading-6 text-[#111827]">
              {title}
            </p>
          </div>

          <div className={`${colors.icon} shrink-0 opacity-80 transition group-hover:opacity-100`}>
            {renderIcon(type)}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${colors.chipBg} ${colors.chipText}`}
          >
            {label}
          </span>

          {badge && (
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
              {badge}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}