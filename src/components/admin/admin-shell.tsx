import Link from "next/link";
import type { ReactNode } from "react";

import type { PlatformAdminProfile } from "@/lib/permissions/admin";

type AdminShellProps = {
  admin: PlatformAdminProfile;
  children: ReactNode;
};

const adminNavigationLinks = [
  {
    href: "/admin/provider-onboarding-leads",
    label: "Provider leads",
    description: "Review onboarding requests",
  },
  {
    href: "/admin/center-subscriptions",
    label: "Center subscriptions",
    description: "Plan assignments",
  },
  {
    href: "/admin/commercial-addons",
    label: "Commercial add-ons",
    description: "Ads and offer placements",
  },
] as const;

export function AdminShell({ admin, children }: AdminShellProps) {
  const adminLabel =
    admin.display_name ?? admin.full_name ?? admin.email ?? "Platform admin";

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-cyan-100 bg-white/85 p-6 shadow-[0_18px_48px_rgba(21,80,107,0.10)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
          DrMuscat admin
        </p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.03em] text-slate-950 md:text-4xl">
              Platform operations
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              Protected internal workspace baseline for approved platform
              administrators.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-sm text-slate-700">
            Signed in as{" "}
            <strong className="font-semibold text-slate-950">
              {adminLabel}
            </strong>
          </div>
        </div>
        <nav
          aria-label="Admin quick navigation"
          className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {adminNavigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm transition hover:border-cyan-200 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              <span className="block font-semibold text-slate-950">
                {link.label}
              </span>
              <span className="mt-1 block text-xs text-slate-600">
                {link.description}
              </span>
            </Link>
          ))}
        </nav>
      </header>
      <main className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_14px_36px_rgba(21,80,107,0.08)]">
        {children}
      </main>
    </section>
  );
}
