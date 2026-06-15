import { NextResponse, type NextRequest } from "next/server";

import { createSessionAwareSupabaseServerClient } from "@/lib/auth/server";
import { normalizeInternalNextPath } from "@/lib/auth/admin-login";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = normalizeInternalNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createSessionAwareSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
