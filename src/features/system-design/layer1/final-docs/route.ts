import { NextResponse } from 'next/server';

import { generateFinalDocsNode } from '@/features/system-design/nodes/generateFinalDocsNode';
import { createArtifactBundleNode } from '@/features/system-design/nodes/createArtifactBundleNode';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const markdown = await generateFinalDocsNode(body);

    const artifacts = await createArtifactBundleNode({
      ...body,
      markdownSpec: markdown,
    });

    return NextResponse.json({
      ok: true,
      markdown,
      artifacts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate final documentation.',
      },
      { status: 500 },
    );
  }
}