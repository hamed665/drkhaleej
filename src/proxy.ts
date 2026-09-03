import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = new Set(['en', 'ar']);

function canonicalRedirectUrl(request: NextRequest): URL | null {
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!configuredAppUrl) return null;

  let canonical: URL;
  try {
    canonical = new URL(configuredAppUrl);
  } catch {
    return null;
  }

  if (!canonical.hostname.startsWith('www.')) return null;
  const apexHostname = canonical.hostname.slice(4);
  if (request.nextUrl.hostname.toLowerCase() !== apexHostname.toLowerCase()) return null;

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.protocol = canonical.protocol;
  redirectUrl.hostname = canonical.hostname;
  redirectUrl.port = canonical.port;
  return redirectUrl;
}

export function proxy(request: NextRequest) {
  const redirectUrl = canonicalRedirectUrl(request);
  if (redirectUrl) {
    return NextResponse.redirect(redirectUrl, 308);
  }

  const requestHeaders = new Headers(request.headers);
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  const locale = segments[0];
  const country = segments[1];

  requestHeaders.set('x-drmuscat-request-path', request.nextUrl.pathname);

  if (locale && SUPPORTED_LOCALES.has(locale)) {
    requestHeaders.set('x-drmuscat-locale', locale);
  }

  if (country) {
    requestHeaders.set('x-drmuscat-country', country);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt).*)'
  ]
};