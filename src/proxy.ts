import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = new Set(['en', 'ar']);

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  const locale = segments[0];
  const country = segments[1];

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
