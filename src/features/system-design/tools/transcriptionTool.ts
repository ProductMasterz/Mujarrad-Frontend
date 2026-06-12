import type { TranscriptionResult } from '../types/input.types';

export interface TranscriptionToolInput {
  audioSourceName?: string;
}

export async function transcribeSystemDesignAudio(
  input: TranscriptionToolInput,
): Promise<TranscriptionResult> {
  throw new Error(
    `Voice transcription is not implemented yet. Source: ${
      input.audioSourceName ?? 'unknown'
    }`,
  );
}
