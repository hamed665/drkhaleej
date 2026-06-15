"use server";

import { createSessionAwareSupabaseServerClient } from "@/lib/auth/server";
import { buildAdminLoginRedirectUrl, getRequestOrigin } from "@/lib/auth/admin-login";

export type AdminLoginActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function requestAdminLoginLink(
  _previousState: AdminLoginActionState,
  formData: FormData,
): Promise<AdminLoginActionState> {
  const email = formData.get("email");

  if (typeof email !== "string" || email.trim().length === 0) {
    return {
      status: "error",
      message: "Enter the platform admin email address registered for DrMuscat.",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return {
      status: "error",
      message: "Enter a valid platform admin email address.",
    };
  }

  const supabase = await createSessionAwareSupabaseServerClient();
  const origin = await getRequestOrigin();
  const emailRedirectTo = buildAdminLoginRedirectUrl(origin);

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: emailRedirectTo
      ? {
          emailRedirectTo,
          shouldCreateUser: false,
        }
      : {
          shouldCreateUser: false,
        },
  });

  if (error) {
    return {
      status: "error",
      message:
        "We could not send an admin sign-in link. Confirm the email is already registered for platform admin access.",
    };
  }

  return {
    status: "success",
    message:
      "If this email is registered for platform admin access, a secure sign-in link has been sent.",
  };
}
