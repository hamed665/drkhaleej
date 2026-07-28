"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import type { Database } from "@/lib/supabase/types";

function readSafeAuthFailureReference(error: unknown): string {
  if (!error || typeof error !== "object") return "auth_request_failed";
  const candidate = error as { code?: unknown; status?: unknown };

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

  return "auth_request_failed";
}

export function AdminLoginForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    return createBrowserClient<Database>(url, anonKey);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      setMessage("Enter the Preview admin email and password.");
      return;
    }

    if (!supabase) {
      setMessage("Preview Auth is not configured for this deployment. Reference: preview_auth_env_missing.");
      return;
    }

    setIsPending(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setMessage(
          `Admin sign-in failed. Reference: ${readSafeAuthFailureReference(error)}.`,
        );
        return;
      }

      router.replace("/admin/imports/readiness");
      router.refresh();
    } catch (error) {
      setMessage(
        `Admin sign-in failed. Reference: ${readSafeAuthFailureReference(error)}.`,
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="admin-email"
          className="text-sm font-semibold text-slate-800"
        >
          Platform admin email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
          placeholder="admin@example.com"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="admin-password"
          className="text-sm font-semibold text-slate-800"
        >
          Preview admin password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
          placeholder="Enter your Preview password"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-700 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(14,116,144,0.24)] transition hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-cyan-900/55 sm:w-auto"
      >
        {isPending ? "Signing in…" : "Sign in securely"}
      </button>

      {message ? (
        <p
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
