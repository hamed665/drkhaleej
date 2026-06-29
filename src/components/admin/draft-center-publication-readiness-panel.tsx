import type { DraftCenterPublicationReadiness } from "@/server/admin/draft-center-publication-readiness";

type DraftCenterPublicationReadinessPanelProps = {
  readiness: DraftCenterPublicationReadiness;
};

function yesNo(value: boolean): string {
  return value ? "yes" : "no";
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

export function DraftCenterPublicationReadinessPanel({ readiness }: DraftCenterPublicationReadinessPanelProps) {
  const evidence = readiness.evidenceSummary;

  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-cyan-50/30 to-white p-5 shadow-sm ring-1 ring-white/80">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="inline-flex rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 shadow-sm">
            CENTER-PUBLICATION-A
          </p>
          <h3 className="mt-3 text-xl font-bold text-slate-950">Publication readiness</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            Read-only readiness evidence. This panel does not publish, activate, verify, claim, bill, sponsor, or revalidate public routes.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
          <p className="font-bold">Still not public</p>
          <p className="mt-1 text-xs font-semibold leading-5">
            A separate approved action is required before public activation.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Can publish</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{yesNo(readiness.canPublish)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Blockers</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{evidence.qualityBlockers}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Warnings</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{evidence.qualityWarnings}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Active locations</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{evidence.activeLocationCount}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
          <h4 className="font-bold text-rose-950">Blockers</h4>
          <div className="mt-3">
            <StatusList items={readiness.blockers} emptyLabel="No blockers found." />
          </div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <h4 className="font-bold text-amber-950">Warnings</h4>
          <div className="mt-3">
            <StatusList items={readiness.warnings} emptyLabel="No warnings found." />
          </div>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Status</dt>
          <dd className="mt-1 font-bold text-slate-800">{evidence.centerStatus}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Verification</dt>
          <dd className="mt-1 font-bold text-slate-800">{evidence.verificationStatus}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Taxonomy</dt>
          <dd className="mt-1 font-bold text-slate-800">{evidence.taxonomyReviewStatus ?? "missing"}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Public flags</dt>
          <dd className="mt-1 font-bold text-slate-800">Active {yesNo(evidence.publicActive)} · Claimable {yesNo(evidence.publicClaimable)}</dd>
        </div>
      </dl>
    </section>
  );
}
