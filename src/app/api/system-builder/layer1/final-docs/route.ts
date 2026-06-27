import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('received:', body);

    return NextResponse.json({
      ok: true,
      artifacts: {
        markdownSpec: '# Test Documentation',
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        error: 'route failed',
      },
      {
        status: 500,
      },
    );
  }
}