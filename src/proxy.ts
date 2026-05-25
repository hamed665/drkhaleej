import { NextRequest, NextResponse } from 'next/server';

const localeCountryPattern = /^\/(en|ar)\/(.+?)(?:\/)?$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);

  const match = pathname.match(localeCountryPattern);
  if (match) {
    const [, locale, country] = match;

    const isAllowedCountry = country === 'om';
    if (!isAllowedCountry) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }

    requestHeaders.set('x-drmuscat-locale', locale);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
