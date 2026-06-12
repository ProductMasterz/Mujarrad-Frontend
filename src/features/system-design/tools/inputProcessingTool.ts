import { SYSTEM_DESIGN_CONFIG } from '../config/systemDesignConfig';
import type {
  InputProcessingResult,
  InputProcessingWarning,
  ProcessedInputContext,
  RawInputPayload,
} from '../types/input.types';
import { createDeterministicInputSummary } from '../utils/contextCompression';
import { createIsoTimestamp, createSystemDesignId } from '../utils/id';
import {
  estimateTokenCount,
  normalizeSystemDesignInput,
} from '../utils/inputNormalization';
import { shouldChunkText, splitTextIntoChunks } from '../utils/textChunking';

export function processSystemDesignInput(
  rawInput: RawInputPayload,
): InputProcessingResult {
  const warnings: InputProcessingWarning[] = [];
  const errors: string[] = [];

  const normalizedText = normalizeSystemDesignInput(rawInput.rawText);

  if (!normalizedText) {
    warnings.push({
      code: 'empty_input',
      message: 'Input is empty. Add a system idea before continuing.',
    });

    return {
      status: 'failed',
      rawInput,
      processedInput: null,
      warnings,
      errors: ['Input text is empty.'],
    };
  }

  if (normalizedText.length < 40) {
    warnings.push({
      code: 'short_input',
      message:
        'Input is very short. You can continue, but more detail will improve the clarification questions.',
    });
  }

  const shouldChunk = shouldChunkText(
    normalizedText,
    SYSTEM_DESIGN_CONFIG.inputLimits.maxDirectCharacters,
  );

  if (shouldChunk) {
    warnings.push({
      code: 'large_input',
      message:
        'Input is large and will be split into traceable chunks before clarification.',
    });
  }

  const chunks = splitTextIntoChunks(normalizedText, {
    maxChunkCharacters: shouldChunk
      ? SYSTEM_DESIGN_CONFIG.inputLimits.maxChunkCharacters
      : SYSTEM_DESIGN_CONFIG.inputLimits.maxDirectCharacters,
    chunkOverlapCharacters:
      SYSTEM_DESIGN_CONFIG.inputLimits.chunkOverlapCharacters,
  });

  if (chunks.length > 1) {
    warnings.push({
      code: 'chunking_applied',
      message: `Input was split into ${chunks.length} chunks.`,
    });

    warnings.push({
      code: 'compression_placeholder_used',
      message:
        'A deterministic summary placeholder was created. AI compression can be added later through LangGraph.',
    });
  }

  const compressedSummary = createDeterministicInputSummary(
    normalizedText,
    chunks,
  );

  const processedInput: ProcessedInputContext = {
    id: createSystemDesignId('processed-input'),
    sourceInputIds: [rawInput.id],
    normalizedText,
    chunks,
    compressedSummary,
    inputSize: {
      characters: normalizedText.length,
      estimatedTokens: estimateTokenCount(normalizedText),
      chunkCount: chunks.length,
    },
    processingWarnings: warnings,
    createdAt: createIsoTimestamp(),
  };

  return {
    status: 'ready',
    rawInput,
    processedInput,
    warnings,
    errors,
  };
}
