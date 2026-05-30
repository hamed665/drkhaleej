import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getSupabasePublicEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

export type SessionAwareSupabaseServerClient = SupabaseClient<Database>;

export async function createSessionAwareSupabaseServerClient(): Promise<SessionAwareSupabaseServerClient> {
  const { url, anonKey } = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        for (const cookieToSet of cookiesToSet) {
          cookieStore.set(
            cookieToSet.name,
            cookieToSet.value,
            cookieToSet.options,
          );
        }
      },
    },
  });
}
