/**
 * Arrow Sync - Syncs arrow elements to backend connects_to attributes
 */

import { ExcalidrawElement } from '@/types/whiteboard';
import { AttributeTypeMode } from '@/types/backend-dtos';
import { attributeService } from '@/services/api/attribute.service';
import { whiteboardService } from '@/services/api/whiteboard.service';
import { getBoundText } from './elementMapper';
import { ArrowDiffResult, BoundArrow } from './arrowDiff';

/**
 * Synced arrow tracking: arrowElementId → attributeId
 */
export type SyncedArrowsMap = Map<string, string>;

/**
 * Result of the sync operation
 */
export interface ArrowSyncResult {
  promoted: Map<string, string>; // elementId → nodeId (newly created nodes)
  syncedCount: number;
  failedCount: number;
}

/**
 * Builds a map of elementId → nodeId from current elements
 */
function buildElementNodeMap(elements: ExcalidrawElement[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const el of elements) {
    if (el.customData?.nodeId) {
      map.set(el.id, el.customData.nodeId);
    }
  }
  return map;
}

/**
 * Determines which elements need auto-promotion (no nodeId yet)
 */
function getElementsNeedingPromotion(
  diff: ArrowDiffResult,
  elements: ExcalidrawElement[],
  elementNodeMap: Map<string, string>
): ExcalidrawElement[] {
  const needsPromotion = new Set<string>();

  const collectUnlinked = (arrow: BoundArrow | { arrow: ExcalidrawElement }) => {
    const boundArrow = 'startElementId' in arrow ? arrow : null;
    if (!boundArrow) return;
    if (!elementNodeMap.has(boundArrow.startElementId)) {
      needsPromotion.add(boundArrow.startElementId);
    }
    if (!elementNodeMap.has(boundArrow.endElementId)) {
      needsPromotion.add(boundArrow.endElementId);
    }
  };

  for (const added of diff.added) {
    collectUnlinked(added);
  }

  for (const changed of diff.changed) {
    const arrow = changed.arrow;
    if (arrow.startBinding?.elementId && !elementNodeMap.has(arrow.startBinding.elementId)) {
      needsPromotion.add(arrow.startBinding.elementId);
    }
    if (arrow.endBinding?.elementId && !elementNodeMap.has(arrow.endBinding.elementId)) {
      needsPromotion.add(arrow.endBinding.elementId);
    }
  }

  return elements.filter(el => needsPromotion.has(el.id));
}

/**
 * Creates a connects_to attribute for an arrow between two nodes.
 * Looks up bound text on the arrow to use as the relationship label.
 */
async function createArrowAttribute(
  sourceNodeId: string,
  targetNodeId: string,
  arrow: ExcalidrawElement,
  allElements: ExcalidrawElement[]
): Promise<string | null> {
  try {
    const label = getBoundText(arrow, allElements) || arrow.text || undefined;
    const result = await attributeService.createAttribute(sourceNodeId, {
      sourceNodeId,
      targetNodeId,
      attributeType: 'connects_to',
      attributeTypeMode: AttributeTypeMode.SCHEMALESS,
      attributeName: label || 'connects_to',
      attributeValue: {
        excalidraw_element_id: arrow.id,
        connector_meta: {
          source_element_id: arrow.startBinding?.elementId || '',
          target_element_id: arrow.endBinding?.elementId || '',
          bidirectional: arrow.startArrowhead !== null && arrow.endArrowhead !== null,
          label: label,
        },
      },
    });
    return result.id;
  } catch {
    return null;
  }
}

/**
 * Deletes a connects_to attribute
 */
async function deleteArrowAttribute(
  sourceNodeId: string,
  attributeId: string
): Promise<boolean> {
  try {
    await attributeService.deleteAttribute(sourceNodeId, attributeId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Main sync function: reconciles arrow diff with backend attributes.
 * Call after content save succeeds.
 */
export async function syncArrowAttributes(
  spaceSlug: string,
  diff: ArrowDiffResult,
  elements: ExcalidrawElement[],
  syncedArrows: SyncedArrowsMap
): Promise<ArrowSyncResult> {
  let syncedCount = 0;
  let failedCount = 0;

  // Build element → node mapping
  const elementNodeMap = buildElementNodeMap(elements);

  // Auto-promote shapes that need nodes
  const shapesNeedingPromotion = getElementsNeedingPromotion(diff, elements, elementNodeMap);
  let promoted = new Map<string, string>();

  if (shapesNeedingPromotion.length > 0) {
    promoted = await whiteboardService.autoPromoteShapes(spaceSlug, shapesNeedingPromotion, elements);
    // Add promoted nodes to the map
    for (const [elementId, nodeId] of promoted) {
      elementNodeMap.set(elementId, nodeId);
    }
  }

  // Handle added arrows — create attributes
  for (const added of diff.added) {
    const sourceNodeId = elementNodeMap.get(added.startElementId);
    const targetNodeId = elementNodeMap.get(added.endElementId);

    if (!sourceNodeId || !targetNodeId) {
      failedCount++;
      continue;
    }

    const attributeId = await createArrowAttribute(sourceNodeId, targetNodeId, added.arrow, elements);
    if (attributeId) {
      syncedArrows.set(added.arrow.id, attributeId);
      syncedCount++;
    } else {
      failedCount++;
    }
  }

  // Handle removed arrows — delete attributes
  for (const removed of diff.removed) {
    const attributeId = syncedArrows.get(removed.arrow.id);
    if (!attributeId) continue;

    const sourceNodeId = elementNodeMap.get(removed.startElementId);
    if (!sourceNodeId) {
      failedCount++;
      continue;
    }

    const success = await deleteArrowAttribute(sourceNodeId, attributeId);
    if (success) {
      syncedArrows.delete(removed.arrow.id);
      syncedCount++;
    } else {
      failedCount++;
    }
  }

  // Handle changed arrows — delete old attribute, create new one
  for (const changed of diff.changed) {
    const arrow = changed.arrow;
    const oldAttributeId = syncedArrows.get(arrow.id);

    // Delete old attribute if tracked
    if (oldAttributeId && changed.prevStartElementId) {
      const oldSourceNodeId = elementNodeMap.get(changed.prevStartElementId);
      if (oldSourceNodeId) {
        await deleteArrowAttribute(oldSourceNodeId, oldAttributeId);
        syncedArrows.delete(arrow.id);
      }
    }

    // Create new attribute
    const newSourceNodeId = elementNodeMap.get(arrow.startBinding?.elementId || '');
    const newTargetNodeId = elementNodeMap.get(arrow.endBinding?.elementId || '');

    if (newSourceNodeId && newTargetNodeId) {
      const attributeId = await createArrowAttribute(newSourceNodeId, newTargetNodeId, arrow, elements);
      if (attributeId) {
        syncedArrows.set(arrow.id, attributeId);
        syncedCount++;
      } else {
        failedCount++;
      }
    } else {
      failedCount++;
    }
  }

  // Handle label changes — delete old attribute, create new one with updated label
  for (const labelChange of diff.labelChanged) {
    const arrow = labelChange.arrow;
    const oldAttributeId = syncedArrows.get(arrow.id);

    const sourceNodeId = elementNodeMap.get(labelChange.startElementId);
    const targetNodeId = elementNodeMap.get(labelChange.endElementId);

    if (!sourceNodeId || !targetNodeId) {
      failedCount++;
      continue;
    }

    // Delete old attribute
    if (oldAttributeId) {
      await deleteArrowAttribute(sourceNodeId, oldAttributeId);
      syncedArrows.delete(arrow.id);
    }

    // Create new attribute with updated label
    const attributeId = await createArrowAttribute(sourceNodeId, targetNodeId, arrow, elements);
    if (attributeId) {
      syncedArrows.set(arrow.id, attributeId);
      syncedCount++;
    } else {
      failedCount++;
    }
  }

  return { promoted, syncedCount, failedCount };
}
