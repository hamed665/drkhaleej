"use server";

import { redirect } from "next/navigation";

import { createSessionAwareSupabaseServerClient } from "@/lib/auth/server";

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
    typeof candidate.status === "number" &&
    Number.isInteger(candidate.status) &&
    candidate.status >= 400 &&
    candidate.status <= 599
  ) {
    return `http_${candidate.status}`;
  }

  if (
    typeof candidate.name === "string" &&
    candidate.name !== "Error" &&
    /^[a-z0-9_]{1,64}$/i.test(candidate.name)
  ) {
    return candidate.name.toLowerCase();
  }

  return "auth_request_failed";
}

function adminLoginFailureState(error: unknown): AdminLoginActionState {
  return {
    status: "error",
    message:
      "Admin sign-in failed. Confirm the Preview email and password, then try once. " +
      `Reference: ${readSafeAuthFailureReference(error)}.`,
  };
}

export async function signInAdminWithPassword(
  _previousState: AdminLoginActionState,
  formData: FormData,
): Promise<AdminLoginActionState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || email.trim().length === 0) {
    return {
      status: "error",
      message: "Enter the platform admin email address registered for DrMuscat.",
    };
  }

  if (typeof password !== "string" || password.length < 8) {
    return {
      status: "error",
      message: "Enter the Preview admin password. It must contain at least 8 characters.",
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
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) return adminLoginFailureState(error);
  } catch (error) {
    return adminLoginFailureState(error);
  }

  redirect("/admin/imports/readiness");
}
