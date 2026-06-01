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
import { useEntityTypeStore } from "@/stores/entityType.store";

type NodeCardProps = {
  title: string;
  preview?: string;
  meta?: string;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  type?: CardType;
  badge?: string;
  entityType?: string;
  nodeKindLabel?: string;
};

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

function getNodeKindChipClasses(nodeKindLabel?: string) {
  const normalized = nodeKindLabel?.toLowerCase()?.trim();

  if (normalized === "context") {
    return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200";
  }

  if (normalized === "attribute") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200";
  }

  if (normalized === "template") {
    return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200";
  }

  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
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
  nodeKindLabel,
}: NodeCardProps) {
  const getEntityType = useEntityTypeStore((state) => state.getType);

  const normalizedEntityType = entityType?.toLowerCase().trim() || "unknown";
  const semanticConfig = getEntityType(normalizedEntityType);
  const hasSemanticType = normalizedEntityType !== "unknown";

  const semanticLabel = hasSemanticType ? semanticConfig.label : "Unclassified";
  const semanticColor = hasSemanticType ? semanticConfig.color : "#94a3b8";

  const structuralLabel =
    nodeKindLabel ||
    (type === CardType.FULFILLED_CONTEXT || type === CardType.GRAPH_CONTEXT
      ? "Context"
      : "Node");

  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="group relative min-h-[176px] w-full cursor-pointer overflow-hidden rounded-[18px] border border-border bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0px_14px_28px_rgba(0,0,0,0.10)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 dark:bg-slate-900 dark:focus:ring-offset-slate-950 dark:hover:shadow-[0px_14px_28px_rgba(0,0,0,0.35)]"
      type="button"
    >
      <div
        className="h-[5px] w-full"
        style={{ backgroundColor: semanticColor }}
      />

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

          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-background/80 opacity-80 transition group-hover:opacity-100"
            style={{ color: semanticColor }}
          >
            {renderIcon(type, normalizedEntityType)}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getNodeKindChipClasses(structuralLabel)}`}
            >
              {structuralLabel}
            </span>

            <span
              className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: `${semanticColor}22`,
                color: semanticColor,
              }}
            >
              {semanticLabel}
            </span>

            {badge && (
              <span className="inline-flex rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {badge}
              </span>
            )}
          </div>

          {meta && (
            <span className="text-[11px] text-muted-foreground/75">
              {meta}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}