import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  buildPharmacyAdminStateMachineSnapshot,
  type PharmacyAdminStateMachineAuditEvent,
  type PharmacyAdminStateMachineEvidence,
  type PharmacyAdminStateMachineReadStateEvidence,
  type PharmacyAdminStateMachineSnapshot,
} from "./import-pharmacy-admin-state-machine";
import type { PharmacyRollbackLogicalSnapshot } from "./import-pharmacy-rollback-exact-recovery";

type AuthorizationStatus = "issued" | "consumed" | "invalidated" | "expired";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Readonly<Record<string, unknown>>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readNullableString(record: Readonly<Record<string, unknown>>, key: string): string | null {
  return record[key] === null ? null : readString(record, key);
}

function readAuthorizationStatus(value: unknown): AuthorizationStatus | null {
  return value === "issued" || value === "consumed" || value === "invalidated" || value === "expired"
    ? value
    : null;
}

function parseSingle(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

function readState(row: Record<string, unknown> | null): PharmacyAdminStateMachineReadStateEvidence | null {
  if (!row) return null;
  const operationAttemptId = readString(row, "operation_attempt_id");
  const snapshotHash = readString(row, "snapshot_hash");
  const entityFingerprint = readString(row, "entity_fingerprint");
  const expectedEntityVersion = readString(row, "expected_entity_version");
  const createdAt = readString(row, "created_at");
  const expiresAt = readString(row, "expires_at");
  const reviewedAt = readNullableString(row, "reviewed_at");
  if (
    !operationAttemptId ||
    !snapshotHash ||
    !entityFingerprint ||
    !expectedEntityVersion ||
    !createdAt ||
    !expiresAt
  ) return null;
  return {
    operationAttemptId,
    snapshotHash,
    entityFingerprint,
    expectedEntityVersion,
    createdAt,
    expiresAt,
    reviewedAt,
  };
}

function eventPhase(row: Readonly<Record<string, unknown>>): string | null {
  return isRecord(row.event_payload) ? readString(row.event_payload, "phase") : null;
}

function boundedAudit(row: Readonly<Record<string, unknown>>): PharmacyAdminStateMachineAuditEvent | null {
  const eventType = readString(row, "event_type");
  const outcome = readString(row, "outcome");
  const schemaVersion = readString(row, "schema_version");
  const createdAt = readString(row, "created_at");
  if (!eventType || !outcome || !schemaVersion || !createdAt) return null;
  return { eventType, outcome, schemaVersion, phase: eventPhase(row), createdAt };
}

function terminalKind(row: Readonly<Record<string, unknown>>): string | null {
  return isRecord(row.terminal_result) ? readString(row.terminal_result, "kind") : null;
}

function canonicalPath(snapshot: PharmacyRollbackLogicalSnapshot | null): string | null {
  return snapshot ? readString(snapshot, "canonicalRoute") : null;
}

async function latestReadState(
  client: SupabaseClient,
  input: { actorId: string; entityId: string; operation: "dry_run" | "review" },
): Promise<Record<string, unknown> | null> {
  const response = await client
    .from("import_pharmacy_admin_read_states")
    .select("operation_attempt_id,snapshot_hash,entity_fingerprint,expected_entity_version,created_at,expires_at,reviewed_at")
    .eq("actor_profile_id", input.actorId)
    .eq("entity_id", input.entityId)
    .eq("operation", input.operation)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (response.error || !response.data) return null;
  return response.data as Record<string, unknown>;
}

export async function readPharmacyAdminStateMachineSnapshot(input: {
  client: SupabaseClient;
  actorId: string;
  entityId: string;
  now: string;
}): Promise<PharmacyAdminStateMachineSnapshot | null> {
  try {
    const [dryRunResponse, reviewResponse, entityResponse] = await Promise.all([
      latestReadState(input.client, { actorId: input.actorId, entityId: input.entityId, operation: "dry_run" }),
      latestReadState(input.client, { actorId: input.actorId, entityId: input.entityId, operation: "review" }),
      input.client
        .from("centers")
        .select("id,center_type,slug,name_en,name_ar,legal_name,status,verification_status,primary_phone,secondary_phone,whatsapp_phone,email,website_url,logo_url,cover_image_url,short_description_en,short_description_ar,description_en,description_ar,default_locale,default_country,is_active,is_claimable,is_featured,sort_order,metadata,deleted_at,updated_at")
        .eq("id", input.entityId)
        .maybeSingle(),
    ]);
    if (entityResponse.error) return null;

    const dryRun = readState(dryRunResponse);
    const review = readState(reviewResponse);
    const authorizationBase = input.client
      .from("import_pharmacy_publish_authorizations")
      .select("status,issued_at,expires_at,consumed_at,operation_attempt_id")
      .eq("actor_profile_id", input.actorId)
      .eq("entity_id", input.entityId);
    const authorizationQuery = review
      ? authorizationBase.eq("operation_attempt_id", review.operationAttemptId)
      : authorizationBase;
    const [authorizationResponse, reservationResponse] = await Promise.all([
      authorizationQuery.order("issued_at", { ascending: false }).limit(1).maybeSingle(),
      input.client
        .from("import_publish_idempotency_records")
        .select("id,status,expires_at,terminal_result,created_at")
        .eq("actor_profile_id", input.actorId)
        .eq("entity_id", input.entityId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (authorizationResponse.error || reservationResponse.error) return null;

    const authorizationRow = authorizationResponse.data as Record<string, unknown> | null;
    const reservationRow = reservationResponse.data as Record<string, unknown> | null;
    const reservationId = reservationRow ? readString(reservationRow, "id") : null;

    let snapshotRow: Record<string, unknown> | null = null;
    let auditRows: Record<string, unknown>[] = [];
    let referenceRows: Record<string, unknown>[] = [];
    if (reservationId) {
      const [snapshotResponse, auditsResponse, referenceResponse] = await Promise.all([
        input.client
          .from("import_publish_rollback_snapshots")
          .select("snapshot_hash,snapshot_payload,restored_at,created_at")
          .eq("idempotency_record_id", reservationId)
          .eq("actor_profile_id", input.actorId)
          .eq("entity_id", input.entityId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        input.client
          .from("import_publish_audit_events")
          .select("event_type,outcome,schema_version,event_payload,created_at")
          .eq("idempotency_record_id", reservationId)
          .eq("actor_profile_id", input.actorId)
          .eq("entity_id", input.entityId)
          .order("created_at", { ascending: true })
          .limit(50),
        input.client
          .from("import_pharmacy_publish_references")
          .select("consumed_at,created_at")
          .eq("idempotency_record_id", reservationId)
          .eq("actor_profile_id", input.actorId)
          .eq("entity_id", input.entityId)
          .order("created_at", { ascending: false })
          .limit(2),
      ]);
      if (snapshotResponse.error || auditsResponse.error || referenceResponse.error) return null;
      snapshotRow = snapshotResponse.data as Record<string, unknown> | null;
      auditRows = (auditsResponse.data ?? []) as Record<string, unknown>[];
      referenceRows = (referenceResponse.data ?? []) as Record<string, unknown>[];
      if (referenceRows.length > 1) return null;
    }

    const snapshotPayload = snapshotRow && isRecord(snapshotRow.snapshot_payload)
      ? snapshotRow.snapshot_payload as PharmacyRollbackLogicalSnapshot
      : null;
    const path = canonicalPath(snapshotPayload);
    let publicExposureCount = 0;
    if (path) {
      const publicQueue = await input.client
        .from("import_publish_queue")
        .select("metadata")
        .eq("target_entity_type", "pharmacy")
        .eq("publish_status", "index_eligible")
        .eq("index_policy", "index")
        .eq("sitemap_policy", "included")
        .limit(1000);
      if (publicQueue.error) return null;
      publicExposureCount = ((publicQueue.data ?? []) as Record<string, unknown>[]).filter(
        (row) => isRecord(row.metadata) && readString(row.metadata, "canonical_path") === path,
      ).length;
    }

    const reservationAuditCount = auditRows.filter((row) => {
      const type = readString(row, "event_type");
      const phase = eventPhase(row);
      return (type === "reservation_created" && phase === "reservation") ||
        (type === "execution_started" && phase === "reservation");
    }).length;
    const mutationStartedAuditCount = auditRows.filter(
      (row) => readString(row, "event_type") === "execution_started" && eventPhase(row) === "mutation",
    ).length;
    const publishSucceededAuditCount = auditRows.filter(
      (row) => readString(row, "event_type") === "execution_succeeded" && readString(row, "outcome") === "succeeded",
    ).length;
    const rollbackSucceededAuditCount = auditRows.filter(
      (row) => readString(row, "event_type") === "rollback_succeeded" && readString(row, "outcome") === "rolled_back",
    ).length;

    const authorizationStatus = authorizationRow
      ? readAuthorizationStatus(authorizationRow.status)
      : null;
    const issuedAt = authorizationRow ? readString(authorizationRow, "issued_at") : null;
    const authorizationExpiresAt = authorizationRow ? readString(authorizationRow, "expires_at") : null;
    const authorization: PharmacyAdminStateMachineEvidence["authorization"] =
      authorizationStatus && issuedAt && authorizationExpiresAt
        ? {
            status: authorizationStatus,
            issuedAt,
            expiresAt: authorizationExpiresAt,
            consumedAt: readNullableString(authorizationRow!, "consumed_at"),
          }
        : null;
    const reservationStatus = reservationRow ? readString(reservationRow, "status") : null;
    const reservationExpiresAt = reservationRow ? readString(reservationRow, "expires_at") : null;
    const evidence: PharmacyAdminStateMachineEvidence = {
      entityId: input.entityId,
      generatedAt: input.now,
      dryRun,
      review,
      authorization,
      reservation: reservationStatus && reservationExpiresAt
        ? { status: reservationStatus, expiresAt: reservationExpiresAt, terminalKind: terminalKind(reservationRow!) }
        : null,
      rollbackSnapshot: snapshotRow && snapshotPayload && readString(snapshotRow, "snapshot_hash")
        ? {
            snapshotHash: readString(snapshotRow, "snapshot_hash")!,
            snapshotPayload,
            restoredAt: readNullableString(snapshotRow, "restored_at"),
          }
        : null,
      publishReference: reservationId
        ? {
            count: referenceRows.length,
            consumedAt: referenceRows[0] ? readNullableString(referenceRows[0], "consumed_at") : null,
          }
        : null,
      reservationAuditCount,
      mutationStartedAuditCount,
      publishSucceededAuditCount,
      rollbackSucceededAuditCount,
      publicExposureCount,
      entity: entityResponse.data ? entityResponse.data as Record<string, unknown> : null,
      auditHistory: auditRows.map(boundedAudit).filter((value): value is PharmacyAdminStateMachineAuditEvent => value !== null),
    };
    return buildPharmacyAdminStateMachineSnapshot(evidence);
  } catch {
    return null;
  }
}

export function createPharmacyAdminStateMachineReaderFromEnvironment(
  environment: Record<string, string | undefined> = process.env,
): ((input: { actorId: string; entityId: string; now: string }) => Promise<PharmacyAdminStateMachineSnapshot | null>) | null {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const actorIds = parseSingle(environment.IMPORT_PREVIEW_ALLOWED_ACTOR_IDS);
  const entityIds = parseSingle(environment.IMPORT_PREVIEW_CANARY_ENTITY_IDS);
  if (
    environment.VERCEL_ENV !== "preview" ||
    !url ||
    !key ||
    actorIds.length !== 1 ||
    entityIds.length !== 1
  ) return null;
  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  return (input) => {
    if (input.actorId !== actorIds[0] || input.entityId !== entityIds[0]) {
      return Promise.resolve(null);
    }
    return readPharmacyAdminStateMachineSnapshot({ client, ...input });
  };
}
