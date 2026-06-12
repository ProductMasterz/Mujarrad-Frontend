import { pipeline } from '@xenova/transformers';

type WhisperResult = string | { text?: string };
type WhisperTranscriber = (input: string) => Promise<WhisperResult>;

let transcriberPromise: Promise<WhisperTranscriber> | null = null;

async function getTranscriber(): Promise<WhisperTranscriber> {
  transcriberPromise ??= pipeline(
    'automatic-speech-recognition',
    'Xenova/whisper-tiny.en',
  ) as unknown as Promise<WhisperTranscriber>;

  return transcriberPromise;
}

export async function transcribeAudioLocally(audioBlob: Blob): Promise<string> {
  const transcriber = await getTranscriber();
  const audioUrl = URL.createObjectURL(audioBlob);

  try {
    const result = await transcriber(audioUrl);

    if (typeof result === 'string') {
      return result.trim();
    }

    return result.text?.trim() ?? '';
  } finally {
    URL.revokeObjectURL(audioUrl);
  }
}