"use server";

import { createSessionAwareSupabaseServerClient } from "@/lib/auth/server";
import { buildAdminLoginRedirectUrl, getRequestOrigin } from "@/lib/auth/admin-login";

export type AdminLoginActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function readSafeAuthFailureReference(error: unknown): string {
  if (!error || typeof error !== "object") return "auth_request_failed";

  const candidate = error as { code?: unknown; status?: unknown; name?: unknown };
  if (
    typeof candidate.code === "string" &&
    /^[a-z0-9_]{1,64}$/i.test(candidate.code)
  ) {
    return candidate.code.toLowerCase();
  }

  if (
    typeof candidate.name === "string" &&
    /^[a-z0-9_]{1,64}$/i.test(candidate.name)
  ) {
    return candidate.name.toLowerCase();
  }

  if (
    typeof candidate.status === "number" &&
    Number.isInteger(candidate.status) &&
    candidate.status >= 400 &&
    candidate.status <= 599
  ) {
    return `http_${candidate.status}`;
  }

  return "auth_request_failed";
}

function adminLoginFailureState(error: unknown): AdminLoginActionState {
  return {
    status: "error",
    message:
      "We could not send an admin sign-in link. Confirm the Preview Auth configuration and try again after the email cooldown. " +
      `Reference: ${readSafeAuthFailureReference(error)}.`,
  };
}

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

  try {
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

    if (error) return adminLoginFailureState(error);
  } catch (error) {
    return adminLoginFailureState(error);
  }

  return {
    status: "success",
    message:
      "If this email is registered for platform admin access, a secure sign-in link has been sent.",
  };
}
