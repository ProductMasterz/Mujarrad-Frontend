import { NextResponse } from 'next/server';

import { layer1ArtifactBundleSchema } from '@/features/system-design/schemas/layer1.schema';
import { buildLayer1ExportFiles, isLayer1BundleExportable } from '@/features/system-design/utils/exportLayer1';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBundle = layer1ArtifactBundleSchema.safeParse(body?.bundle);

    if (!parsedBundle.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid Layer 1 artifact bundle.',
          issues: parsedBundle.error.flatten(),
        },
        { status: 400 },
      );
    }

    if (!isLayer1BundleExportable(parsedBundle.data)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Layer 1 artifact bundle is missing required content. Approve the Markdown specification and diagram before exporting.',
        },
        { status: 422 },
      );
    }

    const files = buildLayer1ExportFiles(parsedBundle.data);

    return NextResponse.json({
      ok: true,
      files,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Layer 1 export request failed.',
      },
      { status: 500 },
    );
  }
}
