"use client";

import { useActionState } from "react";

import { runPharmacyPrivateAdminActionState } from "@/app/admin/imports/readiness/actions";

type PharmacyAdminControlPanelProps = {
  entityId: string | null;
  activationEnabled: boolean;
};

const steps = [
  {
    operation: "dry_run",
    title: "Generate dry-run",
    description: "Build and persist the bounded private plan without writing to the Pharmacy entity.",
    readOnlyEnabled: true,
  },
  {
    operation: "review",
    title: "Review exact diff",
    description: "Persist the reviewed state and verify the exact entity-bound confirmation phrase.",
    readOnlyEnabled: true,
  },
  {
    operation: "reserve_private_publish",
    title: "Reserve private publish",
    description: "Atomically reserve, snapshot, audit, and consume the exact server-side authorization without mutating the Pharmacy.",
    readOnlyEnabled: true,
  },
  {
    operation: "private_publish",
    title: "Private publish",
    description: "Preview eligibility may be revealed after review, but mutation execution remains disabled.",
    readOnlyEnabled: false,
  },
  {
    operation: "rollback",
    title: "Rollback",
    description: "Restore the protected snapshot through the durable opaque publish reference.",
    readOnlyEnabled: false,
  },
] as const;

function renderValue(value: string | boolean | null): string {
  if (value === null) return "Null";
  if (typeof value === "boolean") return value ? "True" : "False";
  return value;
}

export function ImportPharmacyPrivateAdminControlPanel({
  entityId,
  activationEnabled,
}: PharmacyAdminControlPanelProps) {
  const [result, formAction, pending] = useActionState(runPharmacyPrivateAdminActionState, null);
  const controlsEnabled = activationEnabled && entityId !== null;
  const workflow = result && "workflow" in result ? result.workflow : null;
  const readState = result?.readState ?? null;
  const publishCapability = result?.publishCapability ?? null;
  const blockers = result && !result.ok ? result.blockers : [];
  const reservationState = result?.reservationState ?? null;

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
            Dry-run and review persist a bounded server-side state for the allowlisted Preview canary. A valid review and exact confirmation can reveal publish eligibility, while mutation, rollback, public routing, indexing, sitemap inclusion, and bulk execution remain unavailable.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${
            controlsEnabled
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-white/80 text-slate-700"
          }`}
        >
          {controlsEnabled ? "Preview read-only actions enabled" : "Execution locked"}
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
        {steps.map((step, index) => {
          const actionEnabled = controlsEnabled && step.readOnlyEnabled && (step.operation !== "reserve_private_publish" || result?.authorizationState?.authorizationReady === true);
          const publishPreviewVisible = step.operation === "private_publish" && publishCapability?.visible === true;
          return (
            <li key={step.operation} className="rounded-2xl border border-sky-200 bg-white/80 p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-900">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-950">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{step.description}</p>
                  {step.readOnlyEnabled ? (
                    <form action={formAction} className="mt-4 space-y-3">
                      <input type="hidden" name="operation" value={step.operation} />
                      <input type="hidden" name="entityId" value={entityId ?? ""} />
                      {step.operation === "review" || step.operation === "reserve_private_publish" ? (
                        <label className="block text-xs font-semibold text-slate-700">
                          Exact confirmation
                          <input
                            type="text"
                            name={step.operation === "review" ? "publishConfirmation" : "confirmation"}
                            autoComplete="off"
                            spellCheck={false}
                            placeholder={step.operation === "review" ? `PRIVATE PUBLISH ${entityId ?? "<entity-id>"}` : `RESERVE PRIVATE PUBLISH ${entityId ?? "<entity-id>"}`}
                            className="mt-2 min-h-10 w-full rounded-xl border border-sky-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 placeholder:text-slate-400"
                          />
                        </label>
                      ) : null}
                      <button
                        type="submit"
                        disabled={!actionEnabled || pending}
                        aria-disabled={!actionEnabled || pending}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-sky-300 bg-white px-4 py-2 text-sm font-semibold text-sky-900 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        {pending ? "Running…" : step.title}
                      </button>
                    </form>
                  ) : publishPreviewVisible ? (
                    <div className="mt-4 space-y-2">
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        title="Eligibility verified in Preview; mutation execution remains disabled."
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900"
                      >
                        Preview eligible · execution disabled
                      </button>
                      <p className="font-mono text-xs text-slate-600">{publishCapability.confirmationPhrase}</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      title="Mutation controls remain locked."
                      className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 opacity-80"
                    >
                      Locked
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {reservationState ? (
        <p className={`mt-4 rounded-xl border p-4 text-sm font-semibold ${reservationState.reserved ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"}`}>
          Reservation {reservationState.reserved ? (reservationState.replayed ? "replayed safely" : "created") : `blocked: ${reservationState.blocker ?? "unknown"}`} · Entity mutated: No · Route/index/sitemap: Disabled
        </p>
      ) : null}

      {publishCapability && !publishCapability.visible && publishCapability.blockers.length > 0 ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          Publish preview locked: {publishCapability.blockers.join(", ")}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
        <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white/80" aria-labelledby="pharmacy-diff-title">
          <div className="border-b border-sky-100 p-5">
            <h3 id="pharmacy-diff-title" className="font-bold text-slate-950">Persisted exact diff</h3>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Only the eight allowlisted fields can appear. Stored diff JSON is not trusted; the server rebuilds this view from persisted current and proposed state.
            </p>
          </div>
          {readState ? (
            <div>
              <dl className="grid gap-2 border-b border-sky-100 p-5 text-sm text-slate-700 sm:grid-cols-2">
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Operation</dt><dd className="mt-1 font-semibold text-slate-950">{readState.operation}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Expires</dt><dd className="mt-1 font-semibold text-slate-950">{readState.expiresAt}</dd></div>
              </dl>
              {readState.diff.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-sky-100 text-left text-sm">
                    <thead className="bg-sky-50/80 text-xs uppercase tracking-wide text-slate-600">
                      <tr><th className="px-5 py-3 font-semibold">Field</th><th className="px-5 py-3 font-semibold">Before</th><th className="px-5 py-3 font-semibold">After</th></tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100 text-slate-700">
                      {readState.diff.map((entry) => (
                        <tr key={entry.field}>
                          <th scope="row" className="whitespace-nowrap px-5 py-3 font-semibold text-slate-950">{entry.field}</th>
                          <td className="px-5 py-3 font-mono text-xs">{renderValue(entry.before)}</td>
                          <td className="px-5 py-3 font-mono text-xs">{renderValue(entry.after)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-5 text-sm leading-6 text-slate-700">No allowlisted field changes were proposed.</p>
              )}
            </div>
          ) : (
            <p className="p-5 text-sm leading-6 text-slate-700">
              No persisted read-only state has been verified. Raw snapshots and unrestricted payloads are never rendered here.
            </p>
          )}
          {blockers.length > 0 ? (
            <p className="border-t border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-800">Blocked: {blockers.join(", ")}</p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-sky-200 bg-white/80 p-5" aria-labelledby="pharmacy-audit-title">
          <h3 id="pharmacy-audit-title" className="font-bold text-slate-950">Read-state verification</h3>
          {workflow ? (
            <dl className="mt-3 grid gap-3 text-sm text-slate-700">
              <div className="flex justify-between gap-4"><dt>Status</dt><dd className="font-semibold text-slate-950">{workflow.status}</dd></div>
              <div className="flex justify-between gap-4"><dt>Visibility</dt><dd className="font-semibold text-slate-950">{workflow.publicVisibility}</dd></div>
              <div className="flex justify-between gap-4"><dt>Index eligible</dt><dd className="font-semibold text-slate-950">No</dd></div>
              <div className="flex justify-between gap-4"><dt>Sitemap eligible</dt><dd className="font-semibold text-slate-950">No</dd></div>
              <div className="flex justify-between gap-4"><dt>Route enabled</dt><dd className="font-semibold text-slate-950">No</dd></div>
            </dl>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-700">No verified read-only action has run.</p>
          )}
          {readState ? (
            <div className="mt-4 space-y-2 border-t border-sky-100 pt-4 font-mono text-xs text-slate-600">
              <p>Snapshot: {readState.snapshotHash.slice(0, 12)}…</p>
              <p>Fingerprint: {readState.entityFingerprint.slice(0, 12)}…</p>
              <p>Created: {readState.createdAt}</p>
              {readState.reviewedAt ? <p>Reviewed: {readState.reviewedAt}</p> : null}
            </div>
          ) : null}
        </section>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-sky-900">
        No bulk · no public promotion · no manual bypass · reservation does not mutate the entity
      </p>
    </section>
  );
}
