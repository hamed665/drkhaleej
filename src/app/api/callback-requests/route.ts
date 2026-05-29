import { NextResponse } from 'next/server';

import { createCallbackRequest } from '@/lib/callback/callback-request-insert';

function isJsonContentType(contentType: string | null): boolean {
  if (contentType === null) return true;

  const mediaType = contentType.split(';', 1)[0]?.trim().toLowerCase();
  return mediaType === 'application/json' || Boolean(mediaType?.endsWith('+json'));
}

export async function POST(request: Request) {
  if (!isJsonContentType(request.headers.get('content-type'))) {
    return NextResponse.json({ ok: false, message: 'invalid_callback_request' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'invalid_callback_request' }, { status: 400 });
  }

  const result = await createCallbackRequest(body).catch(() => ({ ok: false as const, reason: 'unavailable' as const }));

  if (result.ok) {
    return NextResponse.json({ ok: true, message: 'callback_request_received' }, { status: 202 });
  }

  if (result.reason === 'invalid_request') {
    return NextResponse.json({ ok: false, message: 'invalid_callback_request' }, { status: 400 });
  }

  return NextResponse.json({ ok: false, message: 'callback_request_unavailable' }, { status: 500 });
}
