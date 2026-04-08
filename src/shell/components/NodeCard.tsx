import { CardType } from "../data/projects";
import VuesaxLinearContext from "../imports/VuesaxLinearContext";
import VuesaxLinearNode from "../imports/VuesaxLinearNode";
import {
  User,
  MapPin,
  Zap,
  BookOpen,
  CalendarDays,
} from "lucide-react";

type NodeCardProps = {
  title: string;
  preview?: string;
  meta?: string;
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
      border: "border-blue-200 dark:border-blue-800",
      surface: "bg-white dark:bg-slate-900",
      accent: "bg-blue-500",
      chipBg: "bg-blue-100 dark:bg-blue-900/60",
      chipText: "text-blue-700 dark:text-blue-200",
      icon: "text-blue-500 dark:text-blue-300",
    };
  }

  if (normalized === "place") {
    return {
      border: "border-emerald-200 dark:border-emerald-800",
      surface: "bg-white dark:bg-slate-900",
      accent: "bg-emerald-500",
      chipBg: "bg-emerald-100 dark:bg-emerald-900/60",
      chipText: "text-emerald-700 dark:text-emerald-200",
      icon: "text-emerald-500 dark:text-emerald-300",
    };
  }

  if (normalized === "action") {
    return {
      border: "border-rose-200 dark:border-rose-800",
      surface: "bg-white dark:bg-slate-900",
      accent: "bg-rose-500",
      chipBg: "bg-rose-100 dark:bg-rose-900/60",
      chipText: "text-rose-700 dark:text-rose-200",
      icon: "text-rose-500 dark:text-rose-300",
    };
  }

  if (normalized === "topic") {
    return {
      border: "border-violet-200 dark:border-violet-800",
      surface: "bg-white dark:bg-slate-900",
      accent: "bg-violet-500",
      chipBg: "bg-violet-100 dark:bg-violet-900/60",
      chipText: "text-violet-700 dark:text-violet-200",
      icon: "text-violet-500 dark:text-violet-300",
    };
  }

  if (normalized === "event") {
    return {
      border: "border-orange-200 dark:border-orange-800",
      surface: "bg-white dark:bg-slate-900",
      accent: "bg-orange-500",
      chipBg: "bg-orange-100 dark:bg-orange-900/60",
      chipText: "text-orange-700 dark:text-orange-200",
      icon: "text-orange-500 dark:text-orange-300",
    };
  }

  if (type === CardType.FULFILLED_CONTEXT || type === CardType.GRAPH_CONTEXT) {
    return {
      border: "border-purple-200 dark:border-purple-800",
      surface: "bg-white dark:bg-slate-900",
      accent: "bg-purple-500",
      chipBg: "bg-purple-100 dark:bg-purple-900/60",
      chipText: "text-purple-700 dark:text-purple-200",
      icon: "text-purple-500 dark:text-purple-300",
    };
  }

  return {
    border: "border-slate-200 dark:border-slate-700",
    surface: "bg-white dark:bg-slate-900",
    accent: "bg-slate-400 dark:bg-slate-500",
    chipBg: "bg-slate-100 dark:bg-slate-800",
    chipText: "text-slate-700 dark:text-slate-200",
    icon: "text-slate-500 dark:text-slate-300",
  };
}

function renderIcon(type?: CardType, entityType?: string) {
  const normalized = entityType?.toLowerCase()?.trim();

  if (normalized === "person") {
    return <User className="h-4 w-4" strokeWidth={1.8} />;
  }

  if (normalized === "place") {
    return <MapPin className="h-4 w-4" strokeWidth={1.8} />;
  }

  if (normalized === "action") {
    return <Zap className="h-4 w-4" strokeWidth={1.8} />;
  }

  if (normalized === "topic") {
    return <BookOpen className="h-4 w-4" strokeWidth={1.8} />;
  }

  if (normalized === "event") {
    return <CalendarDays className="h-4 w-4" strokeWidth={1.8} />;
  }

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
  preview,
  meta,
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
      className={`group relative min-h-[168px] w-full overflow-hidden rounded-[18px] border ${colors.border} ${colors.surface} cursor-pointer text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0px_14px_28px_rgba(0,0,0,0.10)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 dark:focus:ring-offset-slate-950 dark:hover:shadow-[0px_14px_28px_rgba(0,0,0,0.35)]`}
      type="button"
    >
      <div className={`h-[5px] w-full ${colors.accent}`} />

      <div className="flex h-[calc(100%-5px)] flex-col justify-between px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="line-clamp-2 text-[15px] font-semibold leading-[1.45] text-[#111827] dark:text-white">
              {title}
            </p>

            {preview && (
              <p className="mt-2 line-clamp-2 text-[12px] leading-[1.45] text-muted-foreground/85">
                {preview}
              </p>
            )}
          </div>

          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-background/80 ${colors.icon} opacity-80 transition group-hover:opacity-100`}>
            {renderIcon(type, entityType)}
          </div>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col gap-2">
            <span
              className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${colors.chipBg} ${colors.chipText}`}
            >
              {label}
            </span>

            {meta && (
              <span className="text-[11px] text-muted-foreground/75">
                {meta}
              </span>
            )}
          </div>

          {badge && (
            <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {badge}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}