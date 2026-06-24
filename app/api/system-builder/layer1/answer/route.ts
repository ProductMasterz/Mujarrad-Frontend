import { NextResponse } from 'next/server';

import { invokeLayer1Graph } from '@/features/system-design/graphs/layer1Graph';
import type { Layer1GraphState, Layer1GraphEvent } from '@/features/system-design/types/graph.types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = body.event as Layer1GraphEvent;
    const state = body.state as Layer1GraphState;

    if (!event || event.type !== 'submit_answer') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid Layer 1 answer request.',
        },
        { status: 400 },
      );
    }

    const result = await invokeLayer1Graph(event, state);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Layer 1 graph request failed.',
      },
      { status: 500 },
    );
  }
}
