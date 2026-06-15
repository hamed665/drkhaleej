import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Platform admin sign in | DrMuscat",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid w-full overflow-hidden rounded-[2rem] border border-cyan-100 bg-white shadow-[0_24px_70px_rgba(21,80,107,0.14)] md:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-gradient-to-br from-cyan-950 via-cyan-800 to-cyan-600 p-8 text-white sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">
            DrMuscat admin
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            Platform admin sign in
          </h1>
          <p className="mt-4 text-base leading-7 text-cyan-50/90">
            Secure preview access for approved platform administrators only.
          </p>
        </div>

        <div className="p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Admin access
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-slate-950">
            Use the email already registered as a platform admin.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            A secure Supabase Auth magic link will establish your browser
            session. Admin routes still require a matching platform-admin
            profile before any protected content is shown.
          </p>
          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}
