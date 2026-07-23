import "server-only";

import { createHash } from "node:crypto";

import { buildPharmacyCanonicalMutationPatch } from "./import-pharmacy-canonical-mutation-patch";
import type { PharmacyDurablePublishReferenceStore } from "./import-pharmacy-durable-publish-reference";
import {
  runImportPharmacyPrivateMutation,
  type ImportPharmacyPrivateMutationRequest,
  type ImportPharmacyPrivateMutationWriter,
} from "./import-pharmacy-private-mutation-adapter";
import {
  verifyPharmacyPrivatePublishReadback,
  type PharmacyPrivatePublishReadbackResult,
} from "./import-pharmacy-private-publish-readback";
import type { PharmacyVerifiedReservationExecutorPort } from "./import-pharmacy-verified-reservation-handoff";
import type { PharmacyPrivatePublishReadbackClient } from "./import-supabase-pharmacy-private-publish-readback";

export type PharmacyPrivateAdminPublishExecutionResult = {
  ok: boolean;
  reference: string | null;
  readback: PharmacyPrivatePublishReadbackResult | null;
};

export type PharmacyPrivateAdminPublishExecutorDependencies = {
  mutationWriter: ImportPharmacyPrivateMutationWriter;
  publishReferenceStore: PharmacyDurablePublishReferenceStore;
  readbackClient: PharmacyPrivatePublishReadbackClient;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

function sha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function readExecutionBoundary(request: ImportPharmacyPrivateMutationRequest): {
  expectedSnapshotHash: string;
  canonicalPath: string;
  canonicalGeo: unknown;
  projectionVersion: string;
} | null {
  const rollback = request.rollbackState;
  const center = isRecord(rollback.center) ? rollback.center : null;
  const metadata = center && isRecord(center.metadata) ? center.metadata : null;
  const canonicalPath = typeof rollback.canonicalRoute === "string" ? rollback.canonicalRoute : null;
  const projectionVersion = metadata && typeof metadata.projectionVersion === "string"
    ? metadata.projectionVersion
    : null;

  if (!center || !metadata || !canonicalPath || !projectionVersion || !isRecord(metadata.canonicalGeo)) {
    return null;
  }

  return {
    expectedSnapshotHash: sha256(rollback),
    canonicalPath,
    canonicalGeo: metadata.canonicalGeo,
    projectionVersion,
  };
}

export function createPharmacyPrivateAdminPublishExecutor(
  dependencies: PharmacyPrivateAdminPublishExecutorDependencies,
): PharmacyVerifiedReservationExecutorPort & {
  execute(request: ImportPharmacyPrivateMutationRequest): Promise<PharmacyPrivateAdminPublishExecutionResult>;
} {
  async function execute(
    request: ImportPharmacyPrivateMutationRequest,
  ): Promise<PharmacyPrivateAdminPublishExecutionResult> {
    if (request.reservationResult.kind !== "reserved") {
      return { ok: false, reference: null, readback: null };
    }

    const boundary = readExecutionBoundary(request);
    if (!boundary) return { ok: false, reference: null, readback: null };

    const mutation = await runImportPharmacyPrivateMutation(request, dependencies.mutationWriter);
    if (mutation.kind !== "mutated") {
      return { ok: false, reference: null, readback: null };
    }
    const entityId = mutation.entityId;

    const reference = await dependencies.publishReferenceStore.create({
      actorId: request.actorId,
      entityId,
      reservationId: request.reservationResult.reservationId,
      rollbackSnapshotId: request.reservationResult.rollbackSnapshotId,
      actualVersion: mutation.actualVersion,
      expectedSnapshotHash: boundary.expectedSnapshotHash,
    });
    if (!reference) return { ok: false, reference: null, readback: null };

    const read = await dependencies.readbackClient.read({
      actorId: request.actorId,
      entityId,
      reservationId: request.reservationResult.reservationId,
      rollbackSnapshotId: request.reservationResult.rollbackSnapshotId,
      reservationAuditId: request.reservationResult.auditEventId,
      publishReference: reference,
      canonicalPath: boundary.canonicalPath,
    });
    if (read.error || !read.data) return { ok: false, reference: null, readback: null };

    const readback = verifyPharmacyPrivatePublishReadback({
      expected: {
        actorId: request.actorId,
        entityId,
        reservationId: request.reservationResult.reservationId,
        rollbackSnapshotId: request.reservationResult.rollbackSnapshotId,
        reservationAuditId: request.reservationResult.auditEventId,
        expectedVersion: request.expectedVersion,
        expectedSnapshotHash: boundary.expectedSnapshotHash,
        actualVersion: mutation.actualVersion,
        patch: buildPharmacyCanonicalMutationPatch(request.draft),
        protectedMetadata: {
          canonicalGeo: boundary.canonicalGeo,
          projectionVersion: boundary.projectionVersion,
        },
      },
      evidence: read.data,
    });

    return readback.verified
      ? { ok: true, reference, readback }
      : { ok: false, reference: null, readback };
  }

  return {
    execute,
    async acceptVerifiedReservation(request) {
      const result = await execute(request);
      return { ok: result.ok, reference: result.reference };
    },
  };
}
