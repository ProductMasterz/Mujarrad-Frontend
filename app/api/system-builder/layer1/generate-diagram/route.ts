import { NextResponse } from 'next/server';

import { invokeLayer1Graph } from '@/features/system-design/graphs/layer1Graph';
import { layer1ApiRequestSchema } from '@/features/system-design/schemas/graph.schema';
import type { Layer1GraphState } from '@/features/system-design/types/graph.types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = layer1ApiRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid Layer 1 diagram request.',
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { event, state } = parsed.data;

    if (event.type !== 'generate_diagram') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid Layer 1 diagram event.',
        },
        { status: 400 },
      );
    }

    const result = await invokeLayer1Graph(event, state as Layer1GraphState | undefined);

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Layer 1 graph request failed.';

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
