import { NextResponse } from 'next/server';

import { invokeLayer1Graph } from '@/features/system-design/graphs/layer1Graph';
import { layer1ApiRequestSchema } from '@/features/system-design/schemas/graph.schema';
import type { Layer1GraphState } from '@/features/system-design/types/graph.types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = layer1ApiRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid Layer 1 graph request.',
          issues: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await invokeLayer1Graph(
      parsedBody.data.event,
      parsedBody.data.state as Layer1GraphState | undefined,
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Layer 1 graph request failed.',
      },
      { status: 500 },
    );
  }
}
