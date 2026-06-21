import "server-only";

import { redirect } from "next/navigation";

import { createSessionAwareSupabaseServerClient } from "@/lib/auth/server";
import type { Database } from "@/lib/supabase/types";

export type PlatformAdminProfile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  | "id"
  | "auth_user_id"
  | "email"
  | "display_name"
  | "full_name"
  | "is_platform_admin"
>;

export async function getCurrentPlatformAdmin(): Promise<PlatformAdminProfile | null> {
  const supabase = await createSessionAwareSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, auth_user_id, email, display_name, full_name, is_platform_admin",
    )
    .eq("auth_user_id", user.id)
    .eq("is_platform_admin", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  return profile;
}

export async function requirePlatformAdmin(): Promise<PlatformAdminProfile> {
  const admin = await getCurrentPlatformAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
