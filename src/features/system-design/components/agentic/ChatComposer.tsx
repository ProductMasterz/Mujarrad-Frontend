'use client';

import { useRef, useState } from 'react';

import { transcribeAudioLocally } from '../../utils/localWhisperTranscription';

interface ChatComposerProps {
  onSend: (text: string) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'lg' | 'md';
  enableVoice?: boolean;
  enableAttach?: boolean;
  initialText?: string;
  /** Drop the composer's own border/ring so a parent frame can provide it. */
  frameless?: boolean;
}

function getSupportedAudioMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') {
    return undefined;
  }

  const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}

export function ChatComposer({
  onSend,
  disabled = false,
  loading = false,
  placeholder = 'Type a message…',
  autoFocus = false,
  size = 'md',
  enableVoice = true,
  enableAttach = true,
  initialText = '',
  frameless = false,
}: ChatComposerProps) {
  const [text, setText] = useState(initialText);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const busy = disabled || loading;
  const canSend = text.trim().length > 0 && !busy;

  async function handleSend() {
    if (!canSend) {
      return;
    }

    const value = text.trim();
    setText('');
    setHint(null);
    await onSend(value);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  async function transcribeRecordedAudio(audioBlob: Blob) {
    setIsTranscribing(true);
    setHint('Transcribing…');

    try {
      const transcript = await transcribeAudioLocally(audioBlob);

      if (!transcript) {
        setHint('No speech detected.');
        return;
      }

      setText((current) => `${current}${current ? ' ' : ''}${transcript}`);
      setHint(null);
    } catch {
      setHint('Voice transcription failed. Try typing instead.');
    } finally {
      setIsTranscribing(false);
    }
  }

  async function handleToggleRecording() {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setHint('Recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

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
          setHint('Recording was empty.');
          return;
        }

        void transcribeRecordedAudio(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setHint('Recording… click the mic to stop.');
    } catch {
      setHint('Microphone permission is blocked.');
      setIsRecording(false);
    }
  }

  async function handleFileSelected(file: File) {
    const isTxtFile =
      file.name.toLowerCase().endsWith('.txt') || file.type === 'text/plain';

    if (!isTxtFile) {
      setHint('Only .txt files are accepted.');
      return;
    }

    try {
      const fileText = await file.text();
      setText((current) => `${current}${current ? '\n\n' : ''}${fileText}`);
      setHint(`Loaded ${file.name}`);
    } catch {
      setHint('Could not read text file.');
    }
  }

  const isLarge = size === 'lg';

  return (
    <div className="w-full">
      <div
        className={[
          'group flex items-end gap-2 p-2 transition',
          frameless
            ? 'rounded-[22px] bg-transparent'
            : [
                'rounded-3xl border bg-card shadow-sm',
                isRecording
                  ? 'border-red-400 ring-2 ring-red-500/20'
                  : 'border-border focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10',
              ].join(' '),
        ].join(' ')}
      >
        {enableAttach ? (
          <>
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
              disabled={busy}
              title="Attach .txt file"
              className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
          </>
        ) : null}

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={isLarge ? 3 : 1}
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={placeholder}
          className={[
            'flex-1 resize-none border-0 bg-transparent px-2 py-2 text-foreground outline-none placeholder:text-muted-foreground focus:ring-0',
            isLarge ? 'min-h-[72px] text-base leading-7' : 'max-h-40 text-sm leading-6',
          ].join(' ')}
        />

        {enableVoice ? (
          <button
            type="button"
            onClick={() => void handleToggleRecording()}
            disabled={busy || isTranscribing}
            title={isRecording ? 'Stop recording' : 'Record voice'}
            className={[
              'mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition disabled:opacity-40',
              isRecording
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            ].join(' ')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <path d="M12 19v3" />
            </svg>
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!canSend}
          title="Send"
          className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-primary/30 transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:from-muted disabled:to-muted disabled:text-muted-foreground disabled:shadow-none"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
            </svg>
          )}
        </button>
      </div>

      <div className="mt-1.5 flex items-center justify-between px-2">
        <span className="text-xs text-muted-foreground">
          {hint ?? 'Press Enter to send · Shift + Enter for a new line'}
        </span>
        {isTranscribing ? (
          <span className="text-xs font-medium text-primary">Transcribing…</span>
        ) : null}
      </div>
    </div>
  );
}
