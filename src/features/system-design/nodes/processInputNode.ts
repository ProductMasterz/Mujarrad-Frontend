import type {
  InputProcessingResult,
  RawInputPayload,
} from '../types/input.types';
import { processSystemDesignInput } from '../tools/inputProcessingTool';

export interface ProcessInputNodeInput {
  rawInput: RawInputPayload;
}

export interface ProcessInputNodeOutput {
  processingResult: InputProcessingResult;
}

export async function processInputNode(
  input: ProcessInputNodeInput,
): Promise<ProcessInputNodeOutput> {
  return {
    processingResult: processSystemDesignInput(input.rawInput),
  };
}
