'use client';

import { useMemo } from 'react';
import { NodeCard } from '@/shell/components/NodeCard';
import { CardType } from '@/shell/data/projects';
import type { Node } from '@/types/backend-dtos';
import { getNodeEntityType } from '@/lib/entity-types';
import { parseNodeDetails } from '@/lib/node-utils';

interface NodeGridProps {
  nodes: Node[];
  isLoading?: boolean;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptySubtitle?: string;
  onCardClick: (node: Node) => void;
  onCardContextMenu: (e: React.MouseEvent, node: Node) => void;
  cardType?: CardType;
  getNodeKindLabel?: (node: Node) => string;
  searchTerm?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  getNodeBadge?: (node: Node) => string | undefined;
  renderCardWrapper?: (node: Node, cardElement: React.ReactNode) => React.ReactNode;
}

function shouldShowNodeInGrid(node: Node): boolean {
  const details = parseNodeDetails(node);

  if (details.showInSpaceList === false) return false;
  if (details.blockType) return false;
  if (node.isBuiltin) return false;

  return true;
}

export function NodeGrid({
  nodes,
  isLoading,
  emptyIcon,
  emptyTitle = 'No nodes',
  emptySubtitle,
  onCardClick,
  onCardContextMenu,
  cardType = CardType.NODE,
  getNodeKindLabel,
  searchTerm,
  sortBy = 'updatedAt',
  getNodeBadge,
  renderCardWrapper,
}: NodeGridProps) {
  const filteredAndSorted = useMemo(() => {
    let result = nodes.filter(shouldShowNodeInGrid);

    const term = (searchTerm || '').trim().toLowerCase();
    if (term) {
      result = result.filter((node) => {
        const details = parseNodeDetails(node);

        const searchableText = [
          node.title,
          node.content,
          node.semanticType,
          node.entityType,
          details.semanticType,
          details.entityType,
          details.createdFrom,
          details.generatedBy,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableText.includes(term);
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'createdAt')
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return (
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime()
      );
    });

    return result;
  }, [nodes, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (filteredAndSorted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        {emptyIcon && <div className="mx-auto mb-2">{emptyIcon}</div>}
        <p className="text-sm text-muted-foreground">{emptyTitle}</p>
        {emptySubtitle && (
          <p className="text-xs text-muted-foreground/70 mt-1">{emptySubtitle}</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
      {filteredAndSorted.map((node) => {
        const preview = (node.content || '').trim().slice(0, 120) || undefined;
        const meta = node.updatedAt
          ? `Updated ${new Date(node.updatedAt).toLocaleDateString()}`
          : `Created ${new Date(node.createdAt).toLocaleDateString()}`;

        const kindLabel = getNodeKindLabel
          ? getNodeKindLabel(node)
          : node.nodeType === 'ATTRIBUTE'
            ? 'Attribute'
            : node.nodeType === 'CONTEXT'
              ? 'Context'
              : 'Regular';

        const entityType = getNodeEntityType(node);

        const card = (
          <NodeCard
            key={node.id}
            node={node}
            title={node.title}
            preview={preview}
            meta={meta}
            type={cardType}
            badge={getNodeBadge?.(node)}
            nodeKindLabel={kindLabel}
            entityType={entityType}
            onClick={() => onCardClick(node)}
            onContextMenu={(e) => onCardContextMenu(e, node)}
          />
        );

        if (renderCardWrapper) {
          return (
            <div key={node.id}>
              {renderCardWrapper(node, card)}
            </div>
          );
        }

        return <div key={node.id}>{card}</div>;
      })}
    </div>
  );
}
