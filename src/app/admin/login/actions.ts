"use server";

import { redirect } from "next/navigation";

import { createSessionAwareSupabaseServerClient } from "@/lib/auth/server";

export type AdminLoginActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function signInAdminWithPassword(
  _previousState: AdminLoginActionState,
  formData: FormData,
): Promise<AdminLoginActionState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { status: "error", message: "Enter your admin email and password." };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || password.length === 0) {
    return { status: "error", message: "Enter a valid admin email and password." };
  }

  const supabase = await createSessionAwareSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    return { status: "error", message: "Admin sign in failed. Check the email and password." };
  }

  redirect("/admin/provider-leads");
}

export async function signOutAdmin() {
  const supabase = await createSessionAwareSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
