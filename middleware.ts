import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const importedHospitalDetailPattern = /^\/(en|ar)\/om\/hospitals\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/;

export function middleware(request: NextRequest) {
  if (importedHospitalDetailPattern.test(request.nextUrl.pathname)) {
    return new NextResponse(null, {
      status: 404,
      headers: {
        "x-drkhaleej-public-hold": "imported-hospital-detail",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:locale/om/hospitals/:slug*"],
};
