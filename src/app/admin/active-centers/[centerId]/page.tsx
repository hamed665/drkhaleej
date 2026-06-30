import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAdminActiveCenterPublicStateReadiness,
  type ActiveCenterPublicStateReadiness,
} from "@/server/admin/active-center-public-state-readiness";

type AdminActiveCenterPublicStateReadinessPageProps = {
  params: Promise<{
    centerId: string;
  }>;
};

function yesNo(value: boolean): string {
  return value ? "yes" : "no";
}

function formatDateTime(value: string | null): string {
  if (value === null) return "missing";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

function StatusList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm font-semibold leading-6 text-slate-600">{emptyLabel}</p>;
  }

  return (
    <ul className="grid gap-2" role="list">
      {items.map((item) => (
        <li key={item} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-700 shadow-sm">
          {item}
        </li>
      ))}
    </ul>
  );
}

function PublicPathCard({ href, label }: { href: string | null; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      {href ? (
        <Link href={href} className="mt-2 block break-all text-sm font-bold text-cyan-700 hover:text-cyan-900">
          {href}
        </Link>
      ) : (
        <p className="mt-2 text-sm font-semibold text-rose-700">missing</p>
      )}
    </div>
  );
}

function ReadinessSummary({ readiness }: { readiness: ActiveCenterPublicStateReadiness }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Can prepare</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{yesNo(readiness.canPreparePublicStateChange)}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Status</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{readiness.statusSummary.status}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Public active</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{yesNo(readiness.statusSummary.isActive)}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Activation audit</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{yesNo(readiness.statusSummary.hasRecentActivationAudit)}</p>
      </div>
    </div>
  );
}

function ActivationAuditEvidence({ readiness }: { readiness: ActiveCenterPublicStateReadiness }) {
  const audit = readiness.evidenceSummary.activationAudit;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-950">Activation audit evidence</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        Latest audit evidence for <code>draft_center.public_profile_activated</code>. This is display-only and does not mutate audit records.
      </p>
      <dl className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Found</dt>
          <dd className="mt-1 font-bold text-slate-800">{yesNo(audit.found)}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Created</dt>
          <dd className="mt-1 font-bold text-slate-800">{formatDateTime(audit.createdAt)}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Actor</dt>
          <dd className="mt-1 font-bold text-slate-800">{audit.actorEmail ?? "missing"}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Action</dt>
          <dd className="mt-1 break-all font-mono text-xs font-bold text-slate-800">{audit.action}</dd>
        </div>
      </dl>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        <span className="font-bold">Summary:</span> {audit.summary ?? "No activation audit summary is available for this center."}
      </div>
    </section>
  );
}

export default async function AdminActiveCenterPublicStateReadinessPage({
  params,
}: AdminActiveCenterPublicStateReadinessPageProps) {
  const { centerId } = await params;
  const result = await getAdminActiveCenterPublicStateReadiness(centerId);

  if (!result.ok) {
    if (result.reason === "not_found") {
      notFound();
    }

    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-xl font-bold">Active center readiness unavailable</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6">
          Active center public state readiness could not be loaded right now. No raw database error is exposed here.
        </p>
      </section>
    );
  }

  const { readiness } = result;
  const evidence = readiness.evidenceSummary;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-cyan-50/30 to-white p-6 shadow-sm ring-1 ring-white/80">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 shadow-sm">
              ACTIVE_CENTER_PUBLIC_STATE_READINESS
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-slate-950">Active center public state readiness</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
              Read-only public state readiness for an already-active center. This surface shows status, public paths, blockers, warnings, and activation audit evidence.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            <p className="font-bold text-slate-950">No action available here</p>
            <p className="mt-1 text-xs font-semibold leading-5">
              Future public removal or deactivation controls must live in a separate guarded server action PR.
            </p>
          </div>
        </div>
      </section>

      <ReadinessSummary readiness={readiness} />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Public paths</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          English and Arabic routes that a future state change would need to revalidate, along with sitemap revalidation.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <PublicPathCard href={readiness.publicPaths.en} label="English public path" />
          <PublicPathCard href={readiness.publicPaths.ar} label="Arabic public path" />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Preserved state contract</h3>
        <dl className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Contact visibility unchanged</dt>
            <dd className="mt-1 font-bold text-slate-800">{yesNo(evidence.contactVisibilityUnchanged)}</dd>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Commercial state unchanged</dt>
            <dd className="mt-1 font-bold text-slate-800">{yesNo(evidence.commercialStateUnchanged)}</dd>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Audit required</dt>
            <dd className="mt-1 font-bold text-slate-800">{yesNo(evidence.auditRequired)}</dd>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Sitemap revalidation</dt>
            <dd className="mt-1 font-bold text-slate-800">{yesNo(evidence.sitemapRevalidationRequired)}</dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-rose-100 bg-rose-50/70 p-5">
          <h3 className="text-lg font-bold text-rose-950">Blockers</h3>
          <div className="mt-3">
            <StatusList items={readiness.blockers} emptyLabel="No blockers found." />
          </div>
        </section>
        <section className="rounded-3xl border border-amber-100 bg-amber-50/70 p-5">
          <h3 className="text-lg font-bold text-amber-950">Warnings</h3>
          <div className="mt-3">
            <StatusList items={readiness.warnings} emptyLabel="No warnings found." />
          </div>
        </section>
      </div>

      <ActivationAuditEvidence readiness={readiness} />

      <div className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          Center ID: <span className="break-all font-mono text-xs font-bold text-slate-900">{centerId}</span>
        </p>
        <Link href="/admin/active-centers" className="font-bold text-cyan-700 hover:text-cyan-900">
          Back to active centers
        </Link>
      </div>
    </div>
  );
}
