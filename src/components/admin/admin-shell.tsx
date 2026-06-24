import Link from "next/link";
import type { ReactNode } from "react";

import type { PlatformAdminProfile } from "@/lib/permissions/admin";

type AdminShellProps = {
  admin: PlatformAdminProfile;
  children: ReactNode;
};

const adminNavigationGroups = [
  {
    label: "Operations",
    links: [
      { href: "/admin", label: "Control Center" },
      { href: "/admin/provider-onboarding-leads", label: "Provider Leads" },
      { href: "/admin/draft-centers", label: "Draft Centers" },
      { href: "/admin/imports", label: "Imports" },
    ],
  },
  {
    label: "Content",
    links: [
      { href: "/admin/content", label: "Content Inventory" },
      { href: "/admin/content/faqs", label: "FAQs" },
      { href: "/admin/content/articles", label: "Articles / Wiki" },
      { href: "/admin/content/seo", label: "SEO Metadata" },
      { href: "/admin/content/navigation", label: "Navigation" },
    ],
  },
  {
    label: "Commercial",
    links: [
      { href: "/admin/center-subscriptions", label: "Center Subscriptions" },
      { href: "/admin/commercial-addons", label: "Commercial Add-ons" },
    ],
  },
  {
    label: "Governance",
    links: [
      { href: "/admin/media", label: "Media Library" },
      { href: "/admin/audit-log", label: "Audit Log" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
] as const;

export function AdminShell({ admin, children }: AdminShellProps) {
  const adminLabel =
    admin.display_name ?? admin.full_name ?? admin.email ?? "Platform admin";

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_18px_48px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              DrMuscat Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] md:text-4xl">
              Internal Control Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Protected operational workspace for approved platform
              administration. Public site controls, CMS editing, uploads, and
              publishing remain phase-gated.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200">
            <span className="block text-xs uppercase tracking-[0.16em] text-cyan-100">
              Signed in admin
            </span>
            <strong className="mt-1 block font-semibold text-white">
              {adminLabel}
            </strong>
          </div>
        </div>

        <nav
          aria-label="Admin module navigation"
          className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        >
          {adminNavigationGroups.map((group) => (
            <div
              key={group.label}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                {group.label}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </header>

      <main className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_14px_36px_rgba(21,80,107,0.08)] sm:p-6">
        {children}
      </main>
    </section>
  );
}
