'use client';

import { useMemo, useRef, useState } from 'react';

import { useLayer1Store } from '../stores/useLayer1Store';
import type {
  InputProcessingResult,
  InputProcessingStatus as InputProcessingStatusValue,
  RawInputPayload,
  SystemDesignInputSourceType,
} from '../types/input.types';
import { createIsoTimestamp, createSystemDesignId } from '../utils/id';
import {
  estimateTokenCount,
  getInputSizeLabel,
  normalizeSystemDesignInput,
} from '../utils/inputNormalization';
import { transcribeAudioLocally } from '../utils/localWhisperTranscription';

const minimumUsefulCharacters = 40;

function getSupportedAudioMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') {
    return undefined;
  }

  const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

  return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

export function Layer1InputPanel() {
  const graphState = useLayer1Store((state) => state.graphState);
  const syncFromGraphState = useLayer1Store(
    (state) => state.syncFromGraphState,
  );

  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<InputProcessingStatusValue>('idle');
  const [sourceType, setSourceType] =
    useState<SystemDesignInputSourceType>('typed_text');
  const [processingResult, setProcessingResult] =
    useState<InputProcessingResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [fileName, setFileName] = useState<string | undefined>();
  const [inputError, setInputError] = useState<string | undefined>();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const normalizedPreview = useMemo(
    () => normalizeSystemDesignInput(inputText),
    [inputText],
  );

  const characterCount = normalizedPreview.length;
  const estimatedTokens = estimateTokenCount(normalizedPreview);
  const inputSizeLabel = getInputSizeLabel(characterCount);
  const isEmpty = characterCount === 0;
  const isShort = characterCount > 0 && characterCount < minimumUsefulCharacters;

  const chunkCount = processingResult?.processedInput?.inputSize.chunkCount;
  const sourceLabel = sourceType.replace('_', ' ');
  const hasProcessedInput = Boolean(processingResult?.processedInput);

  async function submitInputToLayer1Graph(rawInput: RawInputPayload) {
    const response = await fetch('/api/system-builder/layer1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: {
          type: 'submit_input',
          rawInput,
        },
        state: graphState,
      }),
    });

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

  function handleTextChange(nextText: string) {
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
  }

  async function handleProcessInput() {
    const rawInput: RawInputPayload = {
      id: createSystemDesignId('raw-input'),
      sourceType,
      rawText: inputText,
      createdAt: createIsoTimestamp(),
      metadata: fileName ? { fileName } : undefined,
    };

    setStatus('normalizing');
    setInputError(undefined);

    try {
      const result = await submitInputToLayer1Graph(rawInput);

      if (!result.ok || !result.state || !result.processingResult) {
        setStatus('failed');
        setInputError(result.message ?? result.error ?? 'Input processing failed.');
        return;
      }

      setProcessingResult(result.processingResult);
      syncFromGraphState(result.state);

      if (result.processingResult.status === 'ready') {
        setStatus('ready');
      } else {
        setStatus('failed');
      }
    } catch {
      setStatus('failed');
      setInputError('Layer 1 runtime request failed.');
    }
  }

  async function transcribeRecordedAudio(audioBlob: Blob) {
    setIsTranscribing(true);
    setInputError(undefined);

    try {
      const transcript = await transcribeAudioLocally(audioBlob);

      if (!transcript) {
        setInputError('No speech detected.');
        return;
      }

      setInputText((currentText) =>
        `${currentText}${currentText ? ' ' : ''}${transcript}`,
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

    if (!navigator.mediaDevices?.getUserMedia) {
      setInputError('Microphone is not supported in this browser.');
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      setInputError('Audio recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      const mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });

        audioChunksRef.current = [];
        setIsRecording(false);

        if (audioBlob.size === 0) {
          setInputError('Recording was empty.');
          return;
        }

        void transcribeRecordedAudio(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setInputError(undefined);
      resetProcessingState();
    } catch {
      setInputError('Microphone permission is blocked.');
      setIsRecording(false);
    }
  }

  async function handleFileSelected(file: File) {
    setInputError(undefined);

    const isTxtFile =
      file.name.toLowerCase().endsWith('.txt') || file.type === 'text/plain';

    if (!isTxtFile) {
      setInputError('Only .txt files are accepted.');
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
      setInputError('Could not read text file.');
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
        label: 'Recording… click mic to stop',
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
        label: `Ready · ${chunkCount ?? 1} chunk${chunkCount === 1 ? '' : 's'}`,
      };
    }

    if (isShort) {
      return {
        tone: 'warning',
        label: 'Short input · add more detail for better questions',
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
      label: 'Add text, voice, or .txt file',
    };
  }

  const smartStatus = getSmartStatus();

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Input
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            Describe your system
          </h2>
        </div>

        <span
          className={[
            'rounded-full px-3 py-1.5 text-xs font-bold',
            smartStatus.tone === 'success'
              ? 'bg-emerald-100 text-emerald-800'
              : smartStatus.tone === 'warning'
                ? 'bg-amber-100 text-amber-800'
                : smartStatus.tone === 'error'
                  ? 'bg-red-100 text-red-700'
                  : smartStatus.tone === 'recording'
                    ? 'bg-red-500 text-white'
                    : smartStatus.tone === 'working'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-600',
          ].join(' ')}
        >
          {smartStatus.label}
        </span>
      </div>

      <div className="p-5">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <textarea
            value={inputText}
            onChange={(event) => handleTextChange(event.target.value)}
            rows={8}
            placeholder="Describe the product, users, workflows, inputs, outputs, integrations, permissions, and rules..."
            className="min-h-[190px] w-full resize-y border-0 bg-white px-5 py-5 text-sm leading-7 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
          />

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">
                {sourceLabel}
              </span>

              <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">
                {inputSizeLabel}
              </span>

              <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">
                {characterCount.toLocaleString()} chars
              </span>

              <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">
                ~{estimatedTokens.toLocaleString()} tokens
              </span>

              {typeof chunkCount === 'number' ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
                  {chunkCount} chunk{chunkCount === 1 ? '' : 's'}
                </span>
              ) : null}

              {fileName ? (
                <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-800">
                  {fileName}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
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

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M12 18v-6" />
                  <path d="m9 15 3 3 3-3" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => void handleToggleRecording()}
                disabled={isTranscribing}
                className={[
                  'flex h-10 w-10 items-center justify-center rounded-full transition',
                  isRecording
                    ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                    : 'bg-slate-950 text-white hover:bg-slate-800',
                  isTranscribing
                    ? 'cursor-not-allowed bg-slate-300 text-slate-500 hover:bg-slate-300'
                    : '',
                ].join(' ')}
                title={isRecording ? 'Stop recording' : 'Start recording'}
              >
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
              </button>

              <button
                type="button"
                onClick={() => void handleProcessInput()}
                disabled={isEmpty || isRecording || isTranscribing}
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Process
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={isEmpty && !processingResult && !fileName}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {processingResult?.errors.length ? (
          <p className="mt-3 text-sm font-medium text-red-700">
            {processingResult.errors[0]}
          </p>
        ) : null}
      </div>
    </section>
  );
}