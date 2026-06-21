import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getCurrentPlatformAdmin } from "@/lib/permissions/admin";

export const metadata: Metadata = {
  title: "DrMuscat Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const admin = await getCurrentPlatformAdmin();

  if (admin) {
    redirect("/admin/provider-leads");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full overflow-hidden rounded-[2rem] border border-cyan-100 bg-white shadow-[0_24px_70px_rgba(21,80,107,0.14)]">
        <div className="bg-gradient-to-br from-cyan-950 via-cyan-800 to-cyan-600 p-8 text-white sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">
            Internal access
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            DrMuscat Admin
          </h1>
          <p className="mt-4 text-base leading-7 text-cyan-50/90">
            Sign in to review internal provider onboarding requests.
          </p>
        </div>

        <div className="p-8 sm:p-10">
          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}
