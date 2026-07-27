import { setTimeout as wait } from "node:timers/promises";

import type {
  PharmacyAdminStateMachineSnapshot,
  PharmacyAdminStateMachineStageId,
} from "./import-pharmacy-admin-state-machine";
import type { PharmacyCompleteCanaryOperation } from "./import-pharmacy-complete-canary-plan";

const DEFAULT_READBACK_ATTEMPTS = 6;
const MAX_READBACK_ATTEMPTS = 8;
const DEFAULT_READBACK_DELAY_MS = 250;

type PharmacyCompleteCanaryStateReader = (input: {
  actorId: string;
  entityId: string;
  now: string;
}) => Promise<PharmacyAdminStateMachineSnapshot | null>;

type PharmacyCompleteCanaryWait = (milliseconds: number) => Promise<void>;

function expectedStage(
  operation: PharmacyCompleteCanaryOperation,
): PharmacyAdminStateMachineStageId {
  if (operation === "dry_run") return "dry_run";
  if (operation === "review") return "authorization_ready";
  if (operation === "reserve_private_publish") return "reservation_verified";
  if (operation === "private_publish") return "publish_verified";
  return "exact_recovery_verified";
}

export function isPharmacyCompleteCanaryOperationReadbackVerified(input: {
  state: PharmacyAdminStateMachineSnapshot;
  operation: PharmacyCompleteCanaryOperation;
  beforeRevision: string;
}): boolean {
  return input.state.revision !== input.beforeRevision &&
    input.state.stages.some(
      (stage) => stage.id === expectedStage(input.operation) && stage.status === "complete",
    );
}

async function defaultWait(milliseconds: number): Promise<void> {
  await wait(milliseconds);
}

export async function readPharmacyCompleteCanaryOperationReadback(input: {
  reader: PharmacyCompleteCanaryStateReader;
  actorId: string;
  entityId: string;
  operation: PharmacyCompleteCanaryOperation;
  beforeRevision: string;
  attempts?: number;
  delayMs?: number;
  waitForNextRead?: PharmacyCompleteCanaryWait;
}): Promise<PharmacyAdminStateMachineSnapshot | null> {
  const requestedAttempts = Number.isInteger(input.attempts)
    ? input.attempts!
    : DEFAULT_READBACK_ATTEMPTS;
  const attempts = Math.max(1, Math.min(requestedAttempts, MAX_READBACK_ATTEMPTS));
  const delayMs = Math.max(0, input.delayMs ?? DEFAULT_READBACK_DELAY_MS);
  const waitForNextRead = input.waitForNextRead ?? defaultWait;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const state = await input.reader({
      actorId: input.actorId,
      entityId: input.entityId,
      now: new Date().toISOString(),
    });
    if (
      state &&
      isPharmacyCompleteCanaryOperationReadbackVerified({
        state,
        operation: input.operation,
        beforeRevision: input.beforeRevision,
      })
    ) {
      return state;
    }

    if (attempt < attempts - 1) {
      await waitForNextRead(delayMs);
    }
  }

  return null;
}
