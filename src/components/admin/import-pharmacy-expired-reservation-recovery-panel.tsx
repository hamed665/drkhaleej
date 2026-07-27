"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import {
  runPharmacyPrivateAdminActionState,
  type PharmacyPrivateAdminActionStateResult,
} from "@/app/admin/imports/readiness/actions";
import type {
  PharmacyAdminStateMachineSnapshot,
  PharmacyAdminStateMachineStageId,
} from "@/server/admin/import-pharmacy-admin-state-machine";

type RecoveryOperation =
  | "dry_run"
  | "review"
  | "reserve_private_publish"
  | "private_publish"
  | "rollback";

type RecoveryPhase = RecoveryOperation | "complete";

type RecoveryDefinition = Readonly<{
  operation: RecoveryOperation;
  title: string;
  confirmationName: "publishConfirmation" | "confirmation" | null;
  confirmationPrefix: string | null;
}>;

const recoveryDefinitions: Record<RecoveryOperation, RecoveryDefinition> = {
  dry_run: {
    operation: "dry_run",
    title: "1. Generate fresh dry-run",
    confirmationName: null,
    confirmationPrefix: null,
  },
  review: {
    operation: "review",
    title: "2. Review exact diff",
    confirmationName: "publishConfirmation",
    confirmationPrefix: "PRIVATE PUBLISH",
  },
  reserve_private_publish: {
    operation: "reserve_private_publish",
    title: "3. Create fresh Reservation",
    confirmationName: "confirmation",
    confirmationPrefix: "RESERVE PRIVATE PUBLISH",
  },
  private_publish: {
    operation: "private_publish",
    title: "4. Execute private publish",
    confirmationName: "confirmation",
    confirmationPrefix: "EXECUTE PRIVATE PUBLISH",
  },
  rollback: {
    operation: "rollback",
    title: "5. Verify exact rollback",
    confirmationName: "confirmation",
    confirmationPrefix: "ROLLBACK PRIVATE PUBLISH",
  },
};

function initialActionState(
  stateMachine: PharmacyAdminStateMachineSnapshot,
): PharmacyPrivateAdminActionStateResult {
  return {
    ok: true,
    blockers: [],
    workflow: null,
    readState: null,
    publishCapability: null,
    authorizationState: null,
    reservationState: null,
    stateMachine,
    receipt: null,
  };
}

function stageStatus(
  stateMachine: PharmacyAdminStateMachineSnapshot,
  stageId: PharmacyAdminStateMachineStageId,
) {
  return stateMachine.stages.find((stage) => stage.id === stageId)?.status;
}

function nextPhase(operation: RecoveryOperation): RecoveryPhase {
  if (operation === "dry_run") return "review";
  if (operation === "review") return "reserve_private_publish";
  if (operation === "reserve_private_publish") return "private_publish";
  if (operation === "private_publish") return "rollback";
  return "complete";
}

export function ImportPharmacyExpiredReservationRecoveryPanel({
  entityId,
  activationEnabled,
  initialStateMachine,
}: {
  entityId: string | null;
  activationEnabled: boolean;
  initialStateMachine: PharmacyAdminStateMachineSnapshot | null;
}) {
  const expiredBeforeMutation = Boolean(
    initialStateMachine &&
      stageStatus(initialStateMachine, "reservation") === "expired" &&
      stageStatus(initialStateMachine, "publish_verified") === "blocked",
  );

  if (!initialStateMachine || !expiredBeforeMutation) return null;

  return (
    <ExpiredReservationRecoveryWorkflow
      entityId={entityId}
      activationEnabled={activationEnabled}
      initialStateMachine={initialStateMachine}
    />
  );
}

function ExpiredReservationRecoveryWorkflow({
  entityId,
  activationEnabled,
  initialStateMachine,
}: {
  entityId: string | null;
  activationEnabled: boolean;
  initialStateMachine: PharmacyAdminStateMachineSnapshot;
}) {
  const [result, formAction, pending] = useActionState(
    runPharmacyPrivateAdminActionState,
    initialActionState(initialStateMachine),
  );
  const [phase, setPhase] = useState<RecoveryPhase>("dry_run");
  const stateMachine = result.stateMachine ?? initialStateMachine;

  useEffect(() => {
    if (!result.ok || !result.receipt || result.receipt.outcome === "blocked") return;
    if (result.receipt.operation === "refresh_state") return;
    setPhase(nextPhase(result.receipt.operation));
  }, [result]);

  const definition = useMemo(
    () => (phase === "complete" ? null : recoveryDefinitions[phase]),
    [phase],
  );
  const confirmation = definition?.confirmationPrefix && entityId
    ? `${definition.confirmationPrefix} ${entityId}`
    : null;
  const controlsEnabled = activationEnabled && Boolean(entityId) && !pending;

  return (
    <section className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-6 shadow-sm" aria-labelledby="expired-reservation-recovery-title">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
        Fail-closed recovery
      </p>
      <h2 id="expired-reservation-recovery-title" className="mt-2 text-xl font-bold text-amber-950">
        Expired Reservation before mutation
      </h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-amber-900">
        The previous Reservation expired without starting a mutation. This recovery remains manual: each step is persisted and server-read back before the next step becomes available. No automatic mutation retry is performed.
      </p>

      {result.blockers.length > 0 ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900" role="alert">
          <p className="font-bold">Recovery step blocked</p>
          <p className="mt-1 font-mono text-xs">{result.blockers.join(", ")}</p>
        </div>
      ) : null}

      {phase === "complete" ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
          <p className="font-bold">Recovery cycle completed.</p>
          <p className="mt-2 text-sm">Reload the page to view all ten persisted stages and bounded audit history.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold"
          >
            Reload verified state
          </button>
        </div>
      ) : definition ? (
        <form action={formAction} className="mt-5 rounded-2xl border border-amber-200 bg-white p-5">
          <input type="hidden" name="operation" value={definition.operation} />
          <input type="hidden" name="entityId" value={entityId ?? ""} />
          <input type="hidden" name="stateRevision" value={stateMachine.revision} />
          <h3 className="font-bold text-slate-950">{definition.title}</h3>
          {definition.confirmationName && confirmation ? (
            <label className="mt-4 block text-xs font-semibold text-slate-700">
              Exact confirmation
              <input
                type="text"
                name={definition.confirmationName}
                autoComplete="off"
                spellCheck={false}
                placeholder={confirmation}
                className="mt-2 min-h-10 w-full rounded-xl border border-amber-300 bg-white px-3 py-2 font-mono text-xs text-slate-950 placeholder:text-slate-400"
              />
            </label>
          ) : null}
          <button
            type="submit"
            disabled={!controlsEnabled}
            aria-disabled={!controlsEnabled}
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-amber-400 bg-amber-100 px-4 py-2 text-sm font-bold text-amber-950 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
          >
            {pending ? "Waiting for persisted readback…" : definition.title}
          </button>
        </form>
      ) : null}
    </section>
  );
}
