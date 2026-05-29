import { NextResponse } from 'next/server';

import { createProviderOnboardingLead } from '@/lib/provider-onboarding/provider-onboarding-lead-insert';
import { validateProviderOnboardingLeadPayload } from '@/lib/provider-onboarding/provider-onboarding-lead-validation';

function isJsonContentType(contentType: string | null): boolean {
  if (contentType === null) return false;

  const mediaType = contentType.split(';', 1)[0]?.trim().toLowerCase();
  return mediaType === 'application/json' || Boolean(mediaType?.endsWith('+json'));
}

function acceptedResponse(): NextResponse<{ ok: true; message: 'provider_onboarding_request_received' }> {
  return NextResponse.json({ ok: true, message: 'provider_onboarding_request_received' }, { status: 202 });
}

function invalidRequestResponse(): NextResponse<{ ok: false; reason: 'invalid_request' }> {
  return NextResponse.json({ ok: false, reason: 'invalid_request' }, { status: 400 });
}

export async function POST(request: Request) {
  if (!isJsonContentType(request.headers.get('content-type'))) {
    return invalidRequestResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidRequestResponse();
  }

  const validation = validateProviderOnboardingLeadPayload(body);

  if (!validation.ok) {
    if (validation.reason === 'spam') {
      const result = await createProviderOnboardingLead({ spam: true }).catch(() => ({
        ok: false as const,
        reason: 'unavailable' as const
      }));

      if (result.ok) return acceptedResponse();
      return NextResponse.json({ ok: false, reason: 'unavailable' }, { status: 503 });
    }

    return invalidRequestResponse();
  }

  const result = await createProviderOnboardingLead(validation.value).catch(() => ({
    ok: false as const,
    reason: 'unavailable' as const
  }));

  if (result.ok) return acceptedResponse();

  return NextResponse.json({ ok: false, reason: 'unavailable' }, { status: 503 });
}
