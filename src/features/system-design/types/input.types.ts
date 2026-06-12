export type SystemDesignInputSourceType =
  | 'typed_text'
  | 'pasted_text'
  | 'voice_transcript'
  | 'file_text';

export type InputProcessingStatus =
  | 'idle'
  | 'normalizing'
  | 'chunking'
  | 'compressing'
  | 'ready'
  | 'failed';

export type InputProcessingWarningCode =
  | 'empty_input'
  | 'short_input'
  | 'large_input'
  | 'chunking_applied'
  | 'compression_placeholder_used'
  | 'unsupported_source';

export interface InputProcessingWarning {
  code: InputProcessingWarningCode;
  message: string;
}

export interface RawInputPayload {
  id: string;
  sourceType: SystemDesignInputSourceType;
  rawText: string;
  createdAt: string;
  metadata?: {
    fileName?: string;
    audioDurationSeconds?: number;
    language?: string;
  };
}

export interface InputSize {
  characters: number;
  estimatedTokens: number;
  chunkCount: number;
}

export interface TextChunk {
  id: string;
  index: number;
  text: string;
  summary?: string;
  characterStart: number;
  characterEnd: number;
}

export interface ProcessedInputContext {
  id: string;
  sourceInputIds: string[];
  normalizedText: string;
  chunks: TextChunk[];
  compressedSummary: string;
  inputSize: InputSize;
  processingWarnings: InputProcessingWarning[];
  createdAt: string;
}

export interface InputProcessingResult {
  status: InputProcessingStatus;
  rawInput: RawInputPayload;
  processedInput: ProcessedInputContext | null;
  warnings: InputProcessingWarning[];
  errors: string[];
}

export interface TranscriptionResult {
  id: string;
  audioSourceName?: string;
  transcript: string;
  language?: string;
  confidence?: number;
  durationSeconds?: number;
  createdAt: string;
}
