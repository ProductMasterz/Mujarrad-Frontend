/**
 * Arrow Diff Utility - Detects arrow changes between element snapshots
 * for syncing connects_to attributes to the backend.
 */

import { ExcalidrawElement } from '@/types/whiteboard';
import { isConnectorType } from './configSchemas';
import { getBoundText } from './elementMapper';

export interface BoundArrow {
  arrow: ExcalidrawElement;
  startElementId: string;
  endElementId: string;
}

export interface ArrowChange {
  arrow: ExcalidrawElement;
  prevStartElementId?: string;
  prevEndElementId?: string;
}

export interface ArrowLabelChange {
  arrow: ExcalidrawElement;
  startElementId: string;
  endElementId: string;
  prevLabel?: string;
  newLabel?: string;
}

export interface ArrowDiffResult {
  added: BoundArrow[];
  removed: BoundArrow[];
  changed: ArrowChange[];
  labelChanged: ArrowLabelChange[];
}

/**
 * Extracts arrows that have both start and end bindings (fully bound).
 */
function getFullyBoundArrows(elements: ExcalidrawElement[]): Map<string, BoundArrow> {
  const map = new Map<string, BoundArrow>();

  for (const el of elements) {
    if (
      !el.isDeleted &&
      isConnectorType(el.type) &&
      el.startBinding?.elementId &&
      el.endBinding?.elementId
    ) {
      map.set(el.id, {
        arrow: el,
        startElementId: el.startBinding.elementId,
        endElementId: el.endBinding.elementId,
      });
    }
  }

  return map;
}

/**
 * Computes the diff between previous and current element arrays,
 * returning which arrows were added, removed, or had their bindings changed.
 */
export function diffArrows(
  prevElements: ExcalidrawElement[],
  currentElements: ExcalidrawElement[]
): ArrowDiffResult {
  const prevArrows = getFullyBoundArrows(prevElements);
  const currentArrows = getFullyBoundArrows(currentElements);

  const added: BoundArrow[] = [];
  const removed: BoundArrow[] = [];
  const changed: ArrowChange[] = [];
  const labelChanged: ArrowLabelChange[] = [];

  // Find added, changed, and label-changed arrows
  for (const [id, current] of currentArrows) {
    const prev = prevArrows.get(id);
    if (!prev) {
      added.push(current);
    } else if (
      prev.startElementId !== current.startElementId ||
      prev.endElementId !== current.endElementId
    ) {
      changed.push({
        arrow: current.arrow,
        prevStartElementId: prev.startElementId,
        prevEndElementId: prev.endElementId,
      });
    } else {
      // Bindings unchanged — check if label changed
      const prevLabel = getBoundText(prev.arrow, prevElements);
      const currentLabel = getBoundText(current.arrow, currentElements);
      if (prevLabel !== currentLabel) {
        labelChanged.push({
          arrow: current.arrow,
          startElementId: current.startElementId,
          endElementId: current.endElementId,
          prevLabel,
          newLabel: currentLabel,
        });
      }
    }
  }

  // Find removed arrows
  for (const [id, prev] of prevArrows) {
    if (!currentArrows.has(id)) {
      removed.push(prev);
    }
  }

  return { added, removed, changed, labelChanged };
}
