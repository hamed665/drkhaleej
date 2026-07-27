"use client";

import { useActionState, useEffect } from "react";

import {
  runPharmacyCompleteCanaryActionState,
  type PharmacyCompleteCanaryActionStateResult,
} from "@/app/admin/imports/readiness/actions-complete-canary";
import type {
  PharmacyAdminStateMachineSnapshot,
  PharmacyAdminStateMachineStageId,
} from "@/server/admin/import-pharmacy-admin-state-machine";

type ImportPharmacyCompleteCanaryPanelProps = {
  entityId: string | null;
  activationEnabled: boolean;
  initialStateMachine: PharmacyAdminStateMachineSnapshot | null;
};

function stageComplete(
  state: PharmacyAdminStateMachineSnapshot | null,
  stageId: PharmacyAdminStateMachineStageId,
): boolean {
  return state?.stages.some((stage) => stage.id === stageId && stage.status === "complete") === true;
}

function canaryComplete(state: PharmacyAdminStateMachineSnapshot | null): boolean {
  return stageComplete(state, "exact_recovery_verified") &&
    stageComplete(state, "bounded_audit_history");
}

function initialActionState(
  stateMachine: PharmacyAdminStateMachineSnapshot | null,
): PharmacyCompleteCanaryActionStateResult {
  return {
    ok: stateMachine !== null,
    blockers: stateMachine ? [] : ["complete_canary_state_readback_unavailable"],
    stateMachine,
    steps: [],
    completed: canaryComplete(stateMachine),
    submitted: false,
  };
}

export function ImportPharmacyCompleteCanaryPanel({
  entityId,
  activationEnabled,
  initialStateMachine,
}: ImportPharmacyCompleteCanaryPanelProps) {
  const [result, formAction, pending] = useActionState(
    runPharmacyCompleteCanaryActionState,
    initialActionState(initialStateMachine),
  );
  const stateMachine = result.stateMachine ?? initialStateMachine;
  const completed = result.completed || canaryComplete(stateMachine);
  const controlsEnabled = activationEnabled && Boolean(entityId) && Boolean(stateMachine) && !completed && !pending;
  const confirmation = entityId ? `COMPLETE PRIVATE CANARY ${entityId}` : "";

  useEffect(() => {
    if (!result.submitted || !result.completed) return;
    const timer = window.setTimeout(() => window.location.reload(), 900);
    return () => window.clearTimeout(timer);
  }, [result.completed, result.submitted]);

  return (
    <section
      className="rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-6 shadow-sm"
      aria-labelledby="complete-preview-canary-title"
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
        P09 · one-click literal canary
      </p>
      <h2 id="complete-preview-canary-title" className="mt-2 text-xl font-bold text-emerald-950">
        Complete the full Preview cycle
      </h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-emerald-900">
        One authenticated click resumes from persisted server truth, executes each remaining operation at most once, verifies exact readback after every write, and stops immediately on the first mismatch. Production, public routing, indexing, sitemap inclusion, bulk execution, and automatic retries remain disabled.
      </p>

      {result.blockers.length > 0 && result.submitted ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900" role="alert">
          <p className="font-bold">Full canary stopped safely</p>
          <p className="mt-1 font-mono text-xs">{result.blockers.join(", ")}</p>
        </div>
      ) : null}

      {result.steps.length > 0 ? (
        <ol className="mt-4 grid gap-2 md:grid-cols-2" aria-label="Completed one-click canary operations">
          {result.steps.map((step, index) => (
            <li key={`${step.operation}:${step.recordedAt}`} className="rounded-xl border border-emerald-200 bg-white p-3 text-sm text-emerald-950">
              <span className="font-bold">{index + 1}. {step.operation}</span>
              <span className="ml-2 font-mono text-xs">{step.outcome}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {completed ? (
        <div className="mt-5 rounded-2xl border border-emerald-300 bg-white p-5 text-emerald-950">
          <p className="font-bold">All ten persisted stages are complete.</p>
          <p className="mt-2 text-sm">
            {result.submitted ? "Reloading the final verified server state…" : "The selected Preview canary is already complete."}
          </p>
        </div>
      ) : (
        <form action={formAction} className="mt-5 rounded-2xl border border-emerald-200 bg-white p-5">
          <input type="hidden" name="entityId" value={entityId ?? ""} />
          <input type="hidden" name="stateRevision" value={stateMachine?.revision ?? ""} />
          <label className="block text-xs font-semibold text-slate-700">
            Exact full-cycle confirmation, bound to this Preview Pharmacy
            <input
              type="text"
              name="completeCanaryConfirmation"
              value={confirmation}
              readOnly
              required
              autoComplete="off"
              spellCheck={false}
              className="mt-2 min-h-10 w-full rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 font-mono text-xs text-slate-950"
            />
          </label>
          <button
            type="submit"
            disabled={!controlsEnabled}
            aria-disabled={!controlsEnabled}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-emerald-500 bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
          >
            {pending ? "Running persisted stages…" : controlsEnabled ? "Complete full Preview canary" : "Locked by server state"}
          </button>
        </form>
      )}
    </section>
  );
}
