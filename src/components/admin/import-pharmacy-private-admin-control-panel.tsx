"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import {
  runPharmacyPrivateAdminActionState,
  type PharmacyPrivateAdminActionStateResult,
} from "@/app/admin/imports/readiness/actions";
import type {
  PharmacyAdminStateMachineSnapshot,
  PharmacyAdminStateMachineStageId,
  PharmacyAdminStateMachineStageStatus,
} from "@/server/admin/import-pharmacy-admin-state-machine";

type PharmacyAdminControlPanelProps = {
  entityId: string | null;
  activationEnabled: boolean;
  initialStateMachine: PharmacyAdminStateMachineSnapshot | null;
};

type OperationDefinition = Readonly<{
  operation: "dry_run" | "review" | "reserve_private_publish" | "private_publish" | "rollback";
  stageId: PharmacyAdminStateMachineStageId;
  title: string;
  description: string;
  confirmationName: "publishConfirmation" | "confirmation" | null;
  confirmationPrefix: string | null;
}>;

const operations: readonly OperationDefinition[] = [
  {
    operation: "dry_run",
    stageId: "dry_run",
    title: "Generate dry-run",
    description: "Persist one bounded plan without mutating the Pharmacy entity.",
    confirmationName: null,
    confirmationPrefix: null,
  },
  {
    operation: "review",
    stageId: "exact_review",
    title: "Review exact diff",
    description: "Persist the exact reviewed state and issue a short-lived server authorization.",
    confirmationName: "publishConfirmation",
    confirmationPrefix: "PRIVATE PUBLISH",
  },
  {
    operation: "reserve_private_publish",
    stageId: "reservation",
    title: "Reserve private publish",
    description: "Atomically consume authorization, create one Reservation, one snapshot, and one reservation audit.",
    confirmationName: "confirmation",
    confirmationPrefix: "RESERVE PRIVATE PUBLISH",
  },
  {
    operation: "private_publish",
    stageId: "private_publish",
    title: "Private publish",
    description: "Execute the verified Reservation once and require post-mutation server readback.",
    confirmationName: "confirmation",
    confirmationPrefix: "EXECUTE PRIVATE PUBLISH",
  },
  {
    operation: "rollback",
    stageId: "rollback",
    title: "Rollback",
    description: "Consume the existing server-selected rollback authority and verify exact recovery.",
    confirmationName: "confirmation",
    confirmationPrefix: "ROLLBACK PRIVATE PUBLISH",
  },
];

function initialActionState(
  stateMachine: PharmacyAdminStateMachineSnapshot | null,
): PharmacyPrivateAdminActionStateResult {
  return {
    ok: stateMachine !== null,
    blockers: stateMachine ? [] : ["state_readback_unavailable"],
    workflow: null,
    readState: null,
    publishCapability: null,
    authorizationState: null,
    reservationState: null,
    stateMachine,
    receipt: null,
  };
}

function statusClasses(status: PharmacyAdminStateMachineStageStatus): string {
  if (status === "complete") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (status === "available") return "border-sky-200 bg-sky-50 text-sky-900";
  if (status === "expired" || status === "stale") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-slate-200 bg-slate-100 text-slate-600";
}

function operationAvailable(input: {
  operation: OperationDefinition["operation"];
  stageById: ReadonlyMap<PharmacyAdminStateMachineStageId, { status: PharmacyAdminStateMachineStageStatus }>;
}): boolean {
  const { operation, stageById } = input;
  const status = (stageId: PharmacyAdminStateMachineStageId) => stageById.get(stageId)?.status;
  if (operation === "dry_run") {
    return status("dry_run") === "available" || status("dry_run") === "expired" || status("exact_review") === "stale";
  }
  if (operation === "review") {
    return status("exact_review") === "available" ||
      status("exact_review") === "expired" ||
      status("exact_review") === "stale" ||
      status("authorization_ready") === "expired" ||
      status("authorization_ready") === "stale";
  }
  if (operation === "reserve_private_publish") return status("reservation") === "available";
  if (operation === "private_publish") return status("private_publish") === "available";
  return status("rollback") === "available";
}

function remainingLabel(expiresAt: string | null, now: number): string {
  if (!expiresAt) return "No active expiry";
  const remaining = Date.parse(expiresAt) - now;
  if (!Number.isFinite(remaining) || remaining <= 0) return "Expired · refresh server state";
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s remaining`;
}

export function ImportPharmacyPrivateAdminControlPanel({
  entityId,
  activationEnabled,
  initialStateMachine,
}: PharmacyAdminControlPanelProps) {
  const [result, formAction, pending] = useActionState(
    runPharmacyPrivateAdminActionState,
    initialActionState(initialStateMachine),
  );
  const [clock, setClock] = useState(() => Date.now());
  const stateMachine = result.stateMachine ?? initialStateMachine;
  const controlsEnabled = activationEnabled && entityId !== null && stateMachine !== null;
  const stageById = useMemo(
    () => new Map(stateMachine?.stages.map((stage) => [stage.id, stage]) ?? []),
    [stateMachine],
  );

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      className="rounded-3xl border border-sky-100 bg-sky-50/70 p-6 shadow-sm"
      aria-labelledby="pharmacy-private-admin-title"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-800">
            P08 · ADMIN-STATE-MACHINE
          </p>
          <h2 id="pharmacy-private-admin-title" className="mt-2 text-xl font-bold text-slate-950">
            Server-authoritative Pharmacy workflow
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
            Every stage below is rebuilt from persisted server readback. Submitting a form never creates an optimistic success state. Reservation, mutation, and rollback are never retried automatically.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 xl:items-end">
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${controlsEnabled ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white/80 text-slate-700"}`}>
            {controlsEnabled ? "Preview manual controls enabled" : "Execution locked"}
          </span>
          <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
            {remainingLabel(stateMachine?.nextExpiryAt ?? null, clock)}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 rounded-2xl border border-sky-200 bg-white/80 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Selected entity</p>
          <p className="mt-1 font-semibold text-slate-950">{entityId ?? "No Preview canary configured"}</p>
          <p className="mt-2 font-mono text-xs text-slate-500">
            State revision: {stateMachine ? `${stateMachine.revision.slice(0, 12)}…` : "unavailable"}
          </p>
        </div>
        <form action={formAction}>
          <input type="hidden" name="operation" value="refresh_state" />
          <input type="hidden" name="entityId" value={entityId ?? ""} />
          <input type="hidden" name="stateRevision" value={stateMachine?.revision ?? ""} />
          <button
            type="submit"
            disabled={!activationEnabled || !entityId || pending}
            aria-disabled={!activationEnabled || !entityId || pending}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-sky-300 bg-white px-4 py-2 text-sm font-semibold text-sky-900 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
          >
            {pending ? "Waiting for server readback…" : "Refresh server state"}
          </button>
        </form>
      </div>

      {result.receipt ? (
        <p className={`mt-4 rounded-xl border p-4 text-sm font-semibold ${result.receipt.outcome === "blocked" ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
          {result.receipt.operation} · {result.receipt.outcome} · verified at {result.receipt.recordedAt}
        </p>
      ) : null}

      {result.blockers.length > 0 ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900" role="alert">
          <p className="font-bold">Server blocked this action</p>
          <p className="mt-1 font-mono text-xs">{result.blockers.join(", ")}</p>
          {result.blockers.includes("state_revision_mismatch") ? (
            <p className="mt-2">Another tab or a newer action changed the persisted state. Refresh only; do not retry the mutation.</p>
          ) : null}
        </div>
      ) : null}

      <ol className="mt-5 grid gap-3 lg:grid-cols-2" aria-label="Ten server-authoritative Pharmacy stages">
        {stateMachine?.stages.map((stage, index) => (
          <li key={stage.id} className="rounded-2xl border border-sky-200 bg-white/80 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-900">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-950">{stage.label}</h3>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusClasses(stage.status)}`}>
                    {stage.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{stage.detail}</p>
              </div>
            </div>
          </li>
        )) ?? (
          <li className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
            Server state is unavailable. Mutation controls remain locked.
          </li>
        )}
      </ol>

      <div className="mt-5 grid gap-4 xl:grid-cols-5" aria-label="Manual Pharmacy operations">
        {operations.map((operation) => {
          const actionEnabled = controlsEnabled && operationAvailable({ operation: operation.operation, stageById }) && !pending;
          const confirmation = operation.confirmationPrefix && entityId
            ? `${operation.confirmationPrefix} ${entityId}`
            : null;
          return (
            <form key={operation.operation} action={formAction} className="rounded-2xl border border-sky-200 bg-white/80 p-4">
              <input type="hidden" name="operation" value={operation.operation} />
              <input type="hidden" name="entityId" value={entityId ?? ""} />
              <input type="hidden" name="stateRevision" value={stateMachine?.revision ?? ""} />
              <h3 className="font-bold text-slate-950">{operation.title}</h3>
              <p className="mt-2 min-h-20 text-sm leading-6 text-slate-700">{operation.description}</p>
              {operation.confirmationName && confirmation ? (
                <label className="mt-3 block text-xs font-semibold text-slate-700">
                  Exact confirmation
                  <input
                    type="text"
                    name={operation.confirmationName}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={confirmation}
                    className="mt-2 min-h-10 w-full rounded-xl border border-sky-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 placeholder:text-slate-400"
                  />
                </label>
              ) : null}
              <button
                type="submit"
                disabled={!actionEnabled}
                aria-disabled={!actionEnabled}
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-sky-300 bg-white px-3 py-2 text-sm font-semibold text-sky-900 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
              >
                {pending ? "Pending readback…" : actionEnabled ? operation.title : "Locked by server state"}
              </button>
            </form>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-sky-200 bg-white/80 p-5" aria-labelledby="pharmacy-recovery-title">
          <h3 id="pharmacy-recovery-title" className="font-bold text-slate-950">Exact recovery readback</h3>
          {stateMachine?.exactRecovery ? (
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>Verified: <strong>{stateMachine.exactRecovery.verified ? "Yes" : "No"}</strong></p>
              <p>Mismatch count: <strong>{stateMachine.exactRecovery.mismatchCount}</strong></p>
              <p className="font-mono text-xs">Expected: {stateMachine.exactRecovery.expectedHash.slice(0, 16)}…</p>
              <p className="font-mono text-xs">Actual: {stateMachine.exactRecovery.actualHash.slice(0, 16)}…</p>
              {stateMachine.exactRecovery.mismatches.map((mismatch) => (
                <div key={`${mismatch.path}:${mismatch.actualHash}`} className="rounded-xl border border-rose-100 bg-rose-50 p-3 font-mono text-xs text-rose-900">
                  <p>{mismatch.path}</p>
                  <p>expected {mismatch.expectedHash.slice(0, 16)}…</p>
                  <p>actual {mismatch.actualHash.slice(0, 16)}…</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-700">Exact recovery appears only after persisted rollback readback. Raw snapshot values are never rendered.</p>
          )}
        </section>

        <section className="rounded-2xl border border-sky-200 bg-white/80 p-5" aria-labelledby="pharmacy-audit-title">
          <h3 id="pharmacy-audit-title" className="font-bold text-slate-950">Bounded audit history</h3>
          {stateMachine?.auditHistory.length ? (
            <ol className="mt-3 space-y-3">
              {stateMachine.auditHistory.map((event, index) => (
                <li key={`${event.createdAt}:${event.eventType}:${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                  <p className="font-bold text-slate-950">{event.eventType} · {event.outcome}</p>
                  <p className="mt-1">{event.phase ?? "no phase"} · {event.createdAt}</p>
                  <p className="mt-1 font-mono">{event.schemaVersion}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-700">No bounded audit events are available yet.</p>
          )}
        </section>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Pharmacy only</span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Private</span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Noindex</span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">No route</span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">No sitemap</span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">No bulk</span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">No automatic mutation retry</span>
      </div>
    </section>
  );
}
