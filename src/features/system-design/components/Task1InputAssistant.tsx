'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useLayer1Store } from '../stores/useLayer1Store';
import type {
  InputProcessingResult,
  InputProcessingStatus as InputProcessingStatusValue,
  RawInputPayload,
  SystemDesignInputSourceType,
} from '../types/input.types';
import {
  createIsoTimestamp,
  createSystemDesignId,
} from '../utils/id';
import {
  estimateTokenCount,
  getInputSizeLabel,
  normalizeSystemDesignInput,
} from '../utils/inputNormalization';
import {
  transcribeAudioLocally,
} from '../utils/localWhisperTranscription';

const minimumUsefulCharacters = 40;

function getSupportedAudioMimeType():
  | string
  | undefined {
  if (typeof MediaRecorder === 'undefined') {
    return undefined;
  }

  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
  ];

  return mimeTypes.find((mimeType) =>
    MediaRecorder.isTypeSupported(mimeType),
  );
}

export function Task1InputAssistant() {
  const graphState = useLayer1Store(
    (state) => state.graphState,
  );

  const syncFromGraphState = useLayer1Store(
    (state) => state.syncFromGraphState,
  );

  const resetRun = useLayer1Store(
    (state) => state.resetRun,
  );

  const latestRawInput =
    graphState.rawInputs.at(-1);

  const [inputText, setInputText] =
    useState('');

  const [status, setStatus] =
    useState<InputProcessingStatusValue>(
      'idle',
    );

  const [sourceType, setSourceType] =
    useState<SystemDesignInputSourceType>(
      'typed_text',
    );

  const [
    processingResult,
    setProcessingResult,
  ] = useState<InputProcessingResult | null>(
    null,
  );

  const [isRecording, setIsRecording] =
    useState(false);

  const [
    isTranscribing,
    setIsTranscribing,
  ] = useState(false);

  const [fileName, setFileName] =
    useState<string | undefined>();

  const [inputError, setInputError] =
    useState<string | undefined>();

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const audioChunksRef =
    useRef<Blob[]>([]);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const normalizedPreview = useMemo(
    () =>
      normalizeSystemDesignInput(inputText),
    [inputText],
  );

  const characterCount =
    normalizedPreview.length;

  const estimatedTokens =
    estimateTokenCount(normalizedPreview);

  const inputSizeLabel =
    getInputSizeLabel(characterCount);

  const isEmpty = characterCount === 0;

  const isShort =
    characterCount > 0 &&
    characterCount < minimumUsefulCharacters;

  const chunkCount =
    processingResult?.processedInput?.inputSize
      .chunkCount;

  const sourceLabel =
    sourceType.replace('_', ' ');

  const hasProcessedInput = Boolean(
    processingResult?.processedInput ??
      graphState.processedInput,
  );

  useEffect(() => {
    if (!latestRawInput?.rawText) {
      return;
    }

    setInputText(
      (currentText) =>
        currentText ||
        latestRawInput.rawText,
    );

    setSourceType(
      latestRawInput.sourceType,
    );

    setFileName(
      latestRawInput.metadata?.fileName,
    );
  }, [
    latestRawInput?.id,
    latestRawInput?.rawText,
    latestRawInput?.sourceType,
    latestRawInput?.metadata?.fileName,
  ]);

  useEffect(() => {
    if (
      graphState.processedInput &&
      status === 'idle'
    ) {
      setStatus('ready');
    }
  }, [graphState.processedInput, status]);

  async function submitInputToLayer1Graph(
    rawInput: RawInputPayload,
  ) {
    const latestState =
      useLayer1Store.getState().graphState;

    const response = await fetch(
      '/api/system-builder/layer1',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: {
            type: 'submit_input',
            rawInput,
          },
          state: latestState,
        }),
      },
    );

    return (await response.json()) as {
      ok: boolean;
      state?: typeof graphState;
      processingResult?: InputProcessingResult;
      message?: string;
      error?: string;
    };
  }

  function resetProcessingState() {
    setStatus('idle');
    setProcessingResult(null);
    setInputError(undefined);
  }

  function handleTextChange(
    nextText: string,
  ) {
    setInputText(nextText);
    setSourceType('typed_text');
    setFileName(undefined);
    resetProcessingState();
  }

  function handleClear() {
    mediaRecorderRef.current?.stop();

    setInputText('');
    setStatus('idle');
    setSourceType('typed_text');
    setProcessingResult(null);
    setIsRecording(false);
    setIsTranscribing(false);
    setFileName(undefined);
    setInputError(undefined);

    audioChunksRef.current = [];

    resetRun();
  }

  async function handleProcessInput() {
    const rawInput: RawInputPayload = {
      id: createSystemDesignId('raw-input'),
      sourceType,
      rawText: inputText,
      createdAt: createIsoTimestamp(),
      metadata: fileName
        ? {
            fileName,
          }
        : undefined,
    };

    setStatus('normalizing');
    setInputError(undefined);

    try {
      const result =
        await submitInputToLayer1Graph(
          rawInput,
        );

      if (
        !result.ok ||
        !result.state ||
        !result.processingResult
      ) {
        setStatus('failed');

        setInputError(
          result.message ??
            result.error ??
            'Input processing failed.',
        );

        return;
      }

      setProcessingResult(
        result.processingResult,
      );

      syncFromGraphState(result.state);

      setStatus(
        result.processingResult.status ===
          'ready'
          ? 'ready'
          : 'failed',
      );
    } catch {
      setStatus('failed');

      setInputError(
        'Layer 1 runtime request failed.',
      );
    }
  }

  async function transcribeRecordedAudio(
    audioBlob: Blob,
  ) {
    setIsTranscribing(true);
    setInputError(undefined);

    try {
      const transcript =
        await transcribeAudioLocally(
          audioBlob,
        );

      if (!transcript) {
        setInputError(
          'No speech detected.',
        );

        return;
      }

      setInputText((currentText) =>
        `${currentText}${
          currentText ? ' ' : ''
        }${transcript}`,
      );

      setSourceType('voice_transcript');
      setFileName(undefined);
      setStatus('idle');
      setProcessingResult(null);
    } catch {
      setInputError(
        'Local voice transcription failed. Try a shorter recording or type/paste the text manually.',
      );
    } finally {
      setIsTranscribing(false);
    }
  }

  async function handleToggleRecording() {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    if (
      !navigator.mediaDevices?.getUserMedia
    ) {
      setInputError(
        'Microphone is not supported in this browser.',
      );

      return;
    }

    if (
      typeof MediaRecorder === 'undefined'
    ) {
      setInputError(
        'Audio recording is not supported in this browser.',
      );

      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          },
        );

      const mimeType =
        getSupportedAudioMimeType();

      const mediaRecorder =
        new MediaRecorder(
          stream,
          mimeType
            ? {
                mimeType,
              }
            : undefined,
        );

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (
        event,
      ) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(
            event.data,
          );
        }
      };

      mediaRecorder.onstop = () => {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop(),
          );

        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type:
              mediaRecorder.mimeType ||
              'audio/webm',
          },
        );

        audioChunksRef.current = [];
        setIsRecording(false);

        if (audioBlob.size === 0) {
          setInputError(
            'Recording was empty.',
          );

          return;
        }

        void transcribeRecordedAudio(
          audioBlob,
        );
      };

      mediaRecorderRef.current =
        mediaRecorder;

      mediaRecorder.start();
      setIsRecording(true);
      setInputError(undefined);
      resetProcessingState();
    } catch {
      setInputError(
        'Microphone permission is blocked.',
      );

      setIsRecording(false);
    }
  }

  async function handleFileSelected(
    file: File,
  ) {
    setInputError(undefined);

    const isTxtFile =
      file.name
        .toLowerCase()
        .endsWith('.txt') ||
      file.type === 'text/plain';

    if (!isTxtFile) {
      setInputError(
        'Only .txt files are accepted.',
      );

      return;
    }

    try {
      const text = await file.text();

      setInputText(text);
      setSourceType('file_text');
      setFileName(file.name);
      setStatus('idle');
      setProcessingResult(null);
    } catch {
      setInputError(
        'Could not read text file.',
      );
    }
  }

  function getSmartStatus() {
    if (inputError) {
      return {
        tone: 'error',
        label: inputError,
      };
    }

    if (isRecording) {
      return {
        tone: 'recording',
        label:
          'Recording… click mic to stop',
      };
    }

    if (isTranscribing) {
      return {
        tone: 'working',
        label: 'Transcribing locally…',
      };
    }

    if (hasProcessedInput) {
      return {
        tone: 'success',
        label: `Ready · ${
          chunkCount ?? 1
        } chunk${
          chunkCount === 1 ? '' : 's'
        }`,
      };
    }

    if (isShort) {
      return {
        tone: 'warning',
        label:
          'Short input · add more detail for better questions',
      };
    }

    if (!isEmpty) {
      return {
        tone: 'neutral',
        label: 'Ready to process',
      };
    }

    return {
      tone: 'muted',
      label:
        'Add text, voice, or .txt file',
    };
  }

  const smartStatus = getSmartStatus();

  return (
    <>
      <header className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2a8 8 0 0 0-8 8v4a4 4 0 0 0 4 4h1" />
                  <path d="M12 2a8 8 0 0 1 8 8v4a4 4 0 0 1-4 4h-1" />
                  <path d="M9 22h6" />
                </svg>
              </span>

              <div>
                <h2 className="text-base font-black text-slate-950">
                  System Builder Assistant
                </h2>

                <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Input mode
                </div>
              </div>
            </div>
          </div>

          {!isEmpty || processingResult || fileName ? (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              Clear
            </button>
          ) : null}
        </div>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 10h8" />
              <path d="M8 14h5" />
              <path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.5-4A8 8 0 1 1 21 12Z" />
            </svg>
          </div>

          <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3">
            <p className="text-sm font-semibold leading-6 text-slate-800">
              Tell me about the system you want to build.
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              You can type a description, upload a text file, or use your
              microphone. I will process it through Layer 1 before we begin
              clarification.
            </p>
          </div>
        </div>

        {fileName ? (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>

            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-wide text-violet-600">
                Attached file
              </div>

              <div className="truncate text-sm font-bold text-violet-950">
                {fileName}
              </div>
            </div>
          </div>
        ) : null}

        {processingResult?.errors.length ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {processingResult.errors[0]}
          </div>
        ) : null}
      </section>

      <footer className="border-t border-slate-200 bg-white p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              void handleFileSelected(file);
            }

            event.target.value = '';
          }}
        />

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
          <textarea
            value={inputText}
            onChange={(event) =>
              handleTextChange(event.target.value)
            }
            rows={4}
            placeholder="Describe the system you want to build..."
            disabled={
              isRecording ||
              isTranscribing ||
              status === 'normalizing'
            }
            className="min-h-[110px] w-full resize-none border-0 bg-transparent px-4 pt-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 disabled:opacity-50"
          />

          <div className="flex items-center justify-between gap-3 px-3 pb-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  isRecording ||
                  isTranscribing ||
                  status === 'normalizing'
                }
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 disabled:opacity-40"
                title="Upload .txt file"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21.4 11.6 12 21a6 6 0 0 1-8.5-8.5l10-10a4 4 0 0 1 5.7 5.7L9.5 18a2 2 0 1 1-2.8-2.8l9-9" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleToggleRecording()
                }
                disabled={
                  isTranscribing ||
                  status === 'normalizing'
                }
                className={[
                  'flex h-9 w-9 items-center justify-center rounded-full transition disabled:opacity-40',
                  isRecording
                    ? 'bg-red-500 text-white shadow-md shadow-red-200'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-blue-700',
                ].join(' ')}
                title={
                  isRecording
                    ? 'Stop recording'
                    : 'Start voice input'
                }
              >
                {isRecording ? (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    <rect
                      x="7"
                      y="7"
                      width="10"
                      height="10"
                      rx="1"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <path d="M12 19v3" />
                  </svg>
                )}
              </button>

              <span className="ml-1 text-xs font-semibold text-slate-400">
                {isRecording
                  ? 'Recording...'
                  : isTranscribing
                    ? 'Transcribing...'
                    : sourceLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                void handleProcessInput()
              }
              disabled={
                isEmpty ||
                isRecording ||
                isTranscribing ||
                status === 'normalizing'
              }
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              title="Process system input"
            >
              {status === 'normalizing' ? (
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    opacity="0.25"
                  />
                  <path d="M21 12a9 9 0 0 0-9-9" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="m5 12 14-7-4 14-3-6-7-1Z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span>{inputSizeLabel}</span>

            <span>·</span>

            <span>
              {characterCount.toLocaleString()} chars
            </span>

            <span>·</span>

            <span>
              ~{estimatedTokens.toLocaleString()} tokens
            </span>
          </div>

          <span
            className={[
              'text-[11px] font-bold',
              smartStatus.tone === 'success'
                ? 'text-emerald-700'
                : smartStatus.tone === 'warning'
                  ? 'text-amber-700'
                  : smartStatus.tone === 'error'
                    ? 'text-red-700'
                    : smartStatus.tone === 'recording'
                      ? 'text-red-600'
                      : smartStatus.tone === 'working'
                        ? 'text-blue-700'
                        : 'text-slate-400',
            ].join(' ')}
          >
            {smartStatus.label}
          </span>
        </div>
      </footer>
    </>
  );
}
