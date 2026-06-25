import { NextResponse, type NextRequest } from "next/server";

const hospitalProfilePathPattern = /^\/(en|ar)\/om\/hospitals\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/;

export function middleware(request: NextRequest) {
  const match = request.nextUrl.pathname.match(hospitalProfilePathPattern);
  if (!match) return NextResponse.next();

  const [, locale, hospitalSlug] = match;
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/${locale}/om/hospitals`;
  rewriteUrl.searchParams.set("profileSlug", hospitalSlug);

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ["/:locale/om/hospitals/:path*"],
};
