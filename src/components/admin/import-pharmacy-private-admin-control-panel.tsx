type PharmacyAdminControlPanelProps = {
  entityId: string | null;
  activationEnabled: boolean;
};

const steps = [
  {
    operation: "dry_run",
    title: "Generate dry-run",
    description: "Build the deterministic plan and proposed field changes without writing to the entity.",
  },
  {
    operation: "review",
    title: "Review exact diff",
    description: "Review blockers, the proposed private state, and the rollback boundary before approval.",
  },
  {
    operation: "private_publish",
    title: "Private publish",
    description: "Apply the guarded single-Pharmacy mutation while keeping the record private and noindex.",
  },
  {
    operation: "rollback",
    title: "Rollback",
    description: "Restore the protected snapshot through the durable opaque publish reference.",
  },
] as const;

export function ImportPharmacyPrivateAdminControlPanel({
  entityId,
  activationEnabled,
}: PharmacyAdminControlPanelProps) {
  const controlsEnabled = activationEnabled && entityId !== null;

  return (
    <section
      className="rounded-3xl border border-sky-100 bg-sky-50/70 p-6 shadow-sm"
      aria-labelledby="pharmacy-private-admin-title"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-800">
            ADM-PHARMACY-PRIVATE
          </p>
          <h2 id="pharmacy-private-admin-title" className="mt-2 text-xl font-bold text-slate-950">
            Controlled Pharmacy workflow
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
            Single-entity Preview workflow for dry-run, review, private publish, and rollback. Public routing,
            indexing, sitemap inclusion, and bulk execution remain unavailable.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${
            controlsEnabled
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-white/80 text-slate-700"
          }`}
        >
          {controlsEnabled ? "Preview canary enabled" : "Execution locked"}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-sky-200 bg-white/80 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Selected entity</p>
            <p className="mt-1 font-semibold text-slate-950">{entityId ?? "No Preview canary configured"}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">Pharmacy only</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">Private</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">Noindex</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">No sitemap</span>
          </div>
        </div>
      </div>

      <ol className="mt-5 grid gap-4 lg:grid-cols-2" aria-label="Controlled Pharmacy operations">
        {steps.map((step, index) => (
          <li key={step.operation} className="rounded-2xl border border-sky-200 bg-white/80 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-900">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-950">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-700">{step.description}</p>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Server execution remains fail-closed until the final action runtime is enabled."
                  className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 opacity-80"
                >
                  {controlsEnabled ? "Runtime connection pending" : "Locked"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-sky-200 bg-white/80 p-5" aria-labelledby="pharmacy-diff-title">
          <h3 id="pharmacy-diff-title" className="font-bold text-slate-950">Exact diff</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            No reviewed dry-run is loaded. Raw snapshots and unrestricted payloads are never rendered in this panel.
          </p>
        </section>
        <section className="rounded-2xl border border-sky-200 bg-white/80 p-5" aria-labelledby="pharmacy-audit-title">
          <h3 id="pharmacy-audit-title" className="font-bold text-slate-950">Audit timeline</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            No verified operation is selected. The timeline will expose event state and timestamps, not secrets or snapshot bodies.
          </p>
        </section>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-sky-900">
        No bulk · no public promotion · no manual bypass
      </p>
    </section>
  );
}
