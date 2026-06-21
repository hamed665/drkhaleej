"use client";

import { useActionState } from "react";

import {
  signInAdminWithPassword,
  type AdminLoginActionState,
} from "@/app/admin/login/actions";

const initialAdminLoginActionState: AdminLoginActionState = {
  status: "idle",
  message: "",
};

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(
    signInAdminWithPassword,
    initialAdminLoginActionState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="admin-email"
          className="text-sm font-semibold text-slate-800"
        >
          Admin email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
          placeholder="owner@example.com"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="admin-password"
          className="text-sm font-semibold text-slate-800"
        >
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
          placeholder="Enter your password"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-700 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(14,116,144,0.24)] transition hover:bg-cyan-800 focus:outline-none focus:ring-4 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:bg-cyan-900/55 sm:w-auto"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>

      {state.message ? (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
