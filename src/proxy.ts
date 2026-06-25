import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LOCALES = new Set(["en", "ar"]);
const HOSPITAL_PROFILE_PATH = /^\/(en|ar)\/om\/hospitals\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/;

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const locale = segments[0];
  const country = segments[1];

  if (locale && SUPPORTED_LOCALES.has(locale)) {
    requestHeaders.set("x-drmuscat-locale", locale);
  }

  if (country) {
    requestHeaders.set("x-drmuscat-country", country);
  }

  const hospitalProfileMatch = request.nextUrl.pathname.match(HOSPITAL_PROFILE_PATH);
  if (hospitalProfileMatch) {
    const matchedLocale = hospitalProfileMatch[1];
    const hospitalSlug = hospitalProfileMatch[2];
    if ((matchedLocale === "en" || matchedLocale === "ar") && typeof hospitalSlug === "string") {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/${matchedLocale}/om/hospitals`;
      rewriteUrl.searchParams.set("profileSlug", hospitalSlug);
      return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt).*)"
  ]
};
