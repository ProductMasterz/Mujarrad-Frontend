import type { Layer1GraphEvent, Layer1GraphState } from '../types/graph.types';
import { runLayer1GraphEvent } from './layer1GraphRunner';

/**
 * Task 3 graph contract.
 *
 * This file is the single import point for Layer 1 graph execution.
 * The current implementation runs the deterministic server-side graph runner.
 * Future Task 4+ nodes can expand this into a full LangGraph StateGraph while
 * keeping the same public call shape.
 */
export async function invokeLayer1Graph(
  event: Layer1GraphEvent,
  existingState?: Layer1GraphState,
) {
  return runLayer1GraphEvent(event, existingState);
}
