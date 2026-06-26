import type {
  Layer1GraphEvent,
  Layer1GraphResult,
  Layer1GraphState,
} from '../types/graph.types';
import { invokeLayer1Graph } from './layer1Graph';

/**
 * Backward-compatible export for older imports.
 * The real Layer 1 runtime now lives in layer1Graph.ts and uses LangGraph StateGraph.
 */
export async function runLayer1GraphEvent(
  event: Layer1GraphEvent,
  existingState?: Layer1GraphState,
): Promise<Layer1GraphResult> {
  return invokeLayer1Graph(event, existingState);
}
