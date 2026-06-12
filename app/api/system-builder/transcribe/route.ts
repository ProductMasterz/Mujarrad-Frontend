import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const transcriptionModel =
    process.env.SYSTEM_BUILDER_TRANSCRIPTION_MODEL ?? 'whisper-1';

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'Transcription provider is not configured. Add OPENAI_API_KEY to .env.local.',
      },
      { status: 503 },
    );
  }

  const incomingFormData = await request.formData();
  const audioFile = incomingFormData.get('audio');

  if (!(audioFile instanceof File)) {
    return NextResponse.json(
      { error: 'Missing audio file.' },
      { status: 400 },
    );
  }

  const providerFormData = new FormData();
  providerFormData.append('file', audioFile, audioFile.name || 'recording.webm');
  providerFormData.append('model', transcriptionModel);

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: providerFormData,
  });

  if (!response.ok) {
    const errorText = await response.text();

    return NextResponse.json(
      {
        error: 'Transcription request failed.',
        details: errorText,
      },
      { status: response.status },
    );
  }

  const data = (await response.json()) as { text?: string };

  return NextResponse.json({
    text: data.text ?? '',
  });
}
