"use server";

import { requirePlatformAdmin } from "@/lib/permissions/admin";
import {
  createPharmacyAdminStateMachineReaderFromEnvironment,
} from "@/server/admin/import-pharmacy-admin-state-machine-readback";
import type {
  PharmacyAdminStateMachineSnapshot,
} from "@/server/admin/import-pharmacy-admin-state-machine";
import {
  isPharmacyCompleteCanaryFinished,
  resolvePharmacyCompleteCanaryPlan,
  type PharmacyCompleteCanaryOperation,
} from "@/server/admin/import-pharmacy-complete-canary-plan";
import {
  runExpiredReservationRecoverySafeActionState,
} from "./actions-expired-reservation-recovery-safe";
import {
  runPharmacyPrivateAdminActionState,
  type PharmacyPrivateAdminActionStateResult,
} from "./actions";

const MAX_ONE_CLICK_OPERATIONS = 5;
const FULL_CANARY_CONFIRMATION_PREFIX = "COMPLETE PRIVATE CANARY";

export type PharmacyCompleteCanaryStep = Readonly<{
  operation: PharmacyCompleteCanaryOperation;
  outcome: "fresh" | "replayed";
  recordedAt: string;
}>;

export type PharmacyCompleteCanaryActionStateResult = Readonly<{
  ok: boolean;
  blockers: readonly string[];
  stateMachine: PharmacyAdminStateMachineSnapshot | null;
  steps: readonly PharmacyCompleteCanaryStep[];
  completed: boolean;
  submitted: boolean;
}>;

function parseAllowlist(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

function normalizeExactConfirmation(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\s\u00a0\u2007\u202f]+/gu, " ")
    .trim();
}

function fullCanaryConfirmation(entityId: string): string {
  return `${FULL_CANARY_CONFIRMATION_PREFIX} ${entityId}`;
}

function blockedResult(input: {
  blocker: string;
  stateMachine: PharmacyAdminStateMachineSnapshot | null;
  steps?: readonly PharmacyCompleteCanaryStep[];
  extraBlockers?: readonly string[];
}): PharmacyCompleteCanaryActionStateResult {
  return {
    ok: false,
    blockers: [input.blocker, ...(input.extraBlockers ?? [])],
    stateMachine: input.stateMachine,
    steps: input.steps ?? [],
    completed: false,
    submitted: true,
  };
}

function delegateState(
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

function operationConfirmation(operation: PharmacyCompleteCanaryOperation, entityId: string): string | null {
  if (operation === "review") return `PRIVATE PUBLISH ${entityId}`;
  if (operation === "reserve_private_publish") return `RESERVE PRIVATE PUBLISH ${entityId}`;
  if (operation === "private_publish") return `EXECUTE PRIVATE PUBLISH ${entityId}`;
  if (operation === "rollback") return `ROLLBACK PRIVATE PUBLISH ${entityId}`;
  return null;
}

function buildOperationForm(
  operation: PharmacyCompleteCanaryOperation,
  entityId: string,
  revision: string,
): FormData {
  const formData = new FormData();
  formData.set("operation", operation);
  formData.set("entityId", entityId);
  formData.set("stateRevision", revision);
  const confirmation = operationConfirmation(operation, entityId);
  if (operation === "review" && confirmation) {
    formData.set("publishConfirmation", confirmation);
  } else if (confirmation) {
    formData.set("confirmation", confirmation);
  }
  return formData;
}

export async function runPharmacyCompleteCanaryActionState(
  previousState: PharmacyCompleteCanaryActionStateResult,
  formData: FormData,
): Promise<PharmacyCompleteCanaryActionStateResult> {
  const admin = await requirePlatformAdmin();
  const entityId = String(formData.get("entityId") ?? "").trim();
  const submittedRevision = String(formData.get("stateRevision") ?? "").trim();
  const submittedConfirmation = normalizeExactConfirmation(
    String(formData.get("completeCanaryConfirmation") ?? ""),
  );
  const allowedActorIds = parseAllowlist(process.env.IMPORT_PREVIEW_ALLOWED_ACTOR_IDS);
  const allowedEntityIds = parseAllowlist(process.env.IMPORT_PREVIEW_CANARY_ENTITY_IDS);
  const stateReader = createPharmacyAdminStateMachineReaderFromEnvironment();
  let currentState = stateReader && entityId
    ? await stateReader({ actorId: admin.id, entityId, now: new Date().toISOString() })
    : null;

  if (!currentState) {
    return blockedResult({
      blocker: "complete_canary_state_readback_unavailable",
      stateMachine: previousState.stateMachine,
    });
  }
  if (
    process.env.VERCEL_ENV !== "preview" ||
    allowedActorIds.length !== 1 ||
    allowedEntityIds.length !== 1 ||
    allowedActorIds[0] !== admin.id ||
    allowedEntityIds[0] !== entityId ||
    currentState.automaticMutationRetryAllowed !== false
  ) {
    return blockedResult({
      blocker: "complete_canary_boundary_blocked",
      stateMachine: currentState,
    });
  }
  if (!submittedRevision || submittedRevision !== currentState.revision) {
    return blockedResult({
      blocker: "complete_canary_state_revision_mismatch",
      stateMachine: currentState,
    });
  }
  if (submittedConfirmation !== fullCanaryConfirmation(entityId)) {
    return blockedResult({
      blocker: "complete_canary_confirmation_mismatch",
      stateMachine: currentState,
    });
  }
  if (isPharmacyCompleteCanaryFinished(currentState)) {
    return {
      ok: true,
      blockers: [],
      stateMachine: currentState,
      steps: [],
      completed: true,
      submitted: true,
    };
  }

  const steps: PharmacyCompleteCanaryStep[] = [];
  const executedOperations = new Set<PharmacyCompleteCanaryOperation>();

  for (let index = 0; index < MAX_ONE_CLICK_OPERATIONS; index += 1) {
    const plan = resolvePharmacyCompleteCanaryPlan(currentState);
    if (!plan) {
      return blockedResult({
        blocker: "complete_canary_no_available_operation",
        stateMachine: currentState,
        steps,
      });
    }
    if (executedOperations.has(plan.operation)) {
      return blockedResult({
        blocker: "complete_canary_no_progress",
        stateMachine: currentState,
        steps,
      });
    }
    executedOperations.add(plan.operation);

    const operationForm = buildOperationForm(plan.operation, entityId, currentState.revision);
    const result = plan.recovery
      ? await runExpiredReservationRecoverySafeActionState(delegateState(currentState), operationForm)
      : await runPharmacyPrivateAdminActionState(delegateState(currentState), operationForm);

    if (!result.ok || !result.stateMachine) {
      return blockedResult({
        blocker: `complete_canary_${plan.operation}_failed`,
        stateMachine: result.stateMachine ?? currentState,
        steps,
        extraBlockers: result.blockers,
      });
    }
    if (
      !result.receipt ||
      result.receipt.operation !== plan.operation ||
      (result.receipt.outcome !== "fresh" && result.receipt.outcome !== "replayed")
    ) {
      return blockedResult({
        blocker: "complete_canary_receipt_unverified",
        stateMachine: result.stateMachine,
        steps,
      });
    }

    steps.push({
      operation: plan.operation,
      outcome: result.receipt.outcome,
      recordedAt: result.receipt.recordedAt,
    });

    const readback = await stateReader({
      actorId: admin.id,
      entityId,
      now: new Date().toISOString(),
    });
    if (!readback) {
      return blockedResult({
        blocker: "complete_canary_post_step_readback_unavailable",
        stateMachine: result.stateMachine,
        steps,
      });
    }
    if (readback.revision === currentState.revision && !isPharmacyCompleteCanaryFinished(readback)) {
      return blockedResult({
        blocker: "complete_canary_post_step_no_progress",
        stateMachine: readback,
        steps,
      });
    }

    currentState = readback;
    if (isPharmacyCompleteCanaryFinished(currentState)) {
      return {
        ok: true,
        blockers: [],
        stateMachine: currentState,
        steps,
        completed: true,
        submitted: true,
      };
    }
  }

  return blockedResult({
    blocker: "complete_canary_operation_limit_reached",
    stateMachine: currentState,
    steps,
  });
}
