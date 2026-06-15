import { NextResponse } from 'next/server';

import { createProviderOnboardingLead } from '@/lib/provider-onboarding/provider-onboarding-lead-insert';
import { validateProviderOnboardingLeadPayload } from '@/lib/provider-onboarding/provider-onboarding-lead-validation';

function isJsonContentType(contentType: string | null): boolean {
  if (contentType === null) return false;

  const mediaType = contentType.split(';', 1)[0]?.trim().toLowerCase();
  return mediaType === 'application/json' || Boolean(mediaType?.endsWith('+json'));
}

function acceptedResponse(): NextResponse<{ ok: true; message: string }> {
  return NextResponse.json({ ok: true, message: 'Your request has been received.' }, { status: 201 });
}

function invalidRequestResponse(): NextResponse<{ ok: false; message: string }> {
  return NextResponse.json({ ok: false, message: 'Please check the fields and try again.' }, { status: 400 });
}

function unavailableResponse(): NextResponse<{ ok: false; message: string }> {
  return NextResponse.json({ ok: false, message: 'We could not send the request. Please try again later.' }, { status: 500 });
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
      return unavailableResponse();
    }

    return invalidRequestResponse();
  }

  const result = await createProviderOnboardingLead(validation.value).catch(() => ({
    ok: false as const,
    reason: 'unavailable' as const
  }));

  if (result.ok) return acceptedResponse();

  return unavailableResponse();
}
