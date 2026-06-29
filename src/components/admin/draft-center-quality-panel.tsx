import type {
  DraftCenterQualityCheck,
  DraftCenterQualityReport,
  DraftCenterQualityStatus,
} from "@/server/admin/draft-center-quality";

type DraftCenterQualityPanelProps = {
  report: DraftCenterQualityReport;
};

function statusStyles(status: DraftCenterQualityStatus): string {
  if (status === "pass") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (status === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-950";
  }

  return "border-rose-200 bg-rose-50 text-rose-950";
}

function statusLabel(status: DraftCenterQualityStatus): string {
  if (status === "pass") return "Pass";
  if (status === "warning") return "Warning";
  return "Blocker";
}

function QualityCheckCard({ check }: { check: DraftCenterQualityCheck }) {
  return (
    <li className={`rounded-2xl border p-4 shadow-sm ${statusStyles(check.status)}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold">{check.title}</h4>
          <p className="mt-1 text-sm leading-6 opacity-85">{check.detail}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/75 px-3 py-1 text-xs font-bold shadow-sm">
          {statusLabel(check.status)}
        </span>
      </div>
    </li>
  );
}

export function DraftCenterQualityPanel({ report }: DraftCenterQualityPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-cyan-50/30 to-white p-5 shadow-sm ring-1 ring-white/80">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="inline-flex rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 shadow-sm">
            CENTER-QUALITY-A
          </p>
          <h3 className="mt-3 text-xl font-bold text-slate-950">
            Draft center internal quality gate
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            Read-only admin checks for internal readiness only. Passing this panel does not publish, verify, activate publicly, claim, bill, sponsor, expose contact details, or touch sitemap eligibility.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
          <p className="font-bold">{report.readinessLabel}</p>
          <p className="mt-1">
            {report.passed}/{report.total} passed · {report.warnings} warning
            {report.warnings === 1 ? "" : "s"} · {report.blockers} blocker
            {report.blockers === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-xs font-semibold text-amber-800">
            Public activation: still blocked by design
          </p>
        </div>
      </div>

      <ul className="mt-5 grid gap-3 lg:grid-cols-2">
        {report.checks.map((check) => (
          <QualityCheckCard check={check} key={check.id} />
        ))}
      </ul>
    </section>
  );
}
