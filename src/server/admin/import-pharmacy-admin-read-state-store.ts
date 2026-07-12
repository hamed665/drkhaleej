import "server-only";

import {
  buildPharmacyAdminBoundedReadState,
  isPharmacyAdminBoundedReadStateFresh,
  type PharmacyAdminBoundedReadState,
  type PharmacyAdminBoundedValue,
  type PharmacyAdminDiffField,
} from "./import-pharmacy-admin-bounded-read-state";

type PharmacyAdminReadStateResponse = Promise<{
  data: Record<string, unknown> | null;
  error: { message?: string } | null;
}>;

type PharmacyAdminReadStateQuery = {
  eq(column: string, value: string): PharmacyAdminReadStateQuery;
  order(column: string, options: { ascending: boolean }): PharmacyAdminReadStateQuery;
  limit(count: number): PharmacyAdminReadStateQuery;
  maybeSingle(): PharmacyAdminReadStateResponse;
};

export type PharmacyAdminReadStateClient = {
  from(table: "import_pharmacy_admin_read_states"): {
    upsert(values: Readonly<Record<string, unknown>>, options: { onConflict: string }): {
      select(columns: string): { maybeSingle(): PharmacyAdminReadStateResponse };
    };
    select(columns: string): PharmacyAdminReadStateQuery;
  };
};

export type PersistPharmacyAdminReadStateInput = {
  state: PharmacyAdminBoundedReadState;
  current: Readonly<Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue>>;
  proposed: Readonly<Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue>>;
};

export type PharmacyAdminReadStateStore = {
  persist(input: PersistPharmacyAdminReadStateInput): Promise<{ id: string; state: PharmacyAdminBoundedReadState } | null>;
  readLatestFresh(input: {
    actorId: string;
    entityId: string;
    operation: "dry_run" | "review";
    now: string;
  }): Promise<PharmacyAdminBoundedReadState | null>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function asBoundedStateRecord(value: unknown): Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue> | null {
  if (!isRecord(value)) return null;
  const fields: PharmacyAdminDiffField[] = [
    "status",
    "is_active",
    "is_featured",
    "visibility",
    "index_policy",
    "sitemap_policy",
    "projection_version",
    "canonical_path",
  ];
  const result = {} as Record<PharmacyAdminDiffField, PharmacyAdminBoundedValue>;
  for (const field of fields) {
    const fieldValue = value[field];
    if (typeof fieldValue !== "string" && typeof fieldValue !== "boolean" && fieldValue !== null) return null;
    result[field] = fieldValue;
  }
  return result;
}

function readRow(row: Record<string, unknown>): PharmacyAdminBoundedReadState | null {
  const current = asBoundedStateRecord(row.current_state);
  const proposed = asBoundedStateRecord(row.proposed_state);
  if (
    !current ||
    !proposed ||
    (row.operation !== "dry_run" && row.operation !== "review") ||
    !isNonEmpty(row.actor_profile_id) ||
    !isNonEmpty(row.entity_id) ||
    !isNonEmpty(row.snapshot_hash) ||
    !isNonEmpty(row.entity_fingerprint) ||
    !isNonEmpty(row.created_at) ||
    !isNonEmpty(row.expires_at) ||
    (row.reviewed_at !== null && !isNonEmpty(row.reviewed_at))
  ) return null;

  try {
    return buildPharmacyAdminBoundedReadState({
      operation: row.operation,
      actorId: row.actor_profile_id,
      entityId: row.entity_id,
      snapshotHash: row.snapshot_hash,
      entityFingerprint: row.entity_fingerprint,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      reviewedAt: row.reviewed_at as string | null,
      current,
      proposed,
      blockerCodes: Array.isArray(row.blocker_codes)
        ? row.blocker_codes.filter((value): value is string => typeof value === "string")
        : [],
    });
  } catch {
    return null;
  }
}

export function createPharmacyAdminReadStateStore(
  client: PharmacyAdminReadStateClient,
): PharmacyAdminReadStateStore {
  const columns = "id,actor_profile_id,entity_id,operation,snapshot_hash,entity_fingerprint,current_state,proposed_state,blocker_codes,reviewed_at,expires_at,created_at";

  return {
    async persist(input) {
      if (!isPharmacyAdminBoundedReadStateFresh(input.state, input.state.createdAt)) return null;
      const response = await client
        .from("import_pharmacy_admin_read_states")
        .upsert(
          {
            actor_profile_id: input.state.actorId,
            entity_id: input.state.entityId,
            operation: input.state.operation,
            snapshot_hash: input.state.snapshotHash,
            entity_fingerprint: input.state.entityFingerprint,
            current_state: input.current,
            proposed_state: input.proposed,
            exact_diff: input.state.diff,
            blocker_codes: input.state.blockerCodes,
            reviewed_at: input.state.reviewedAt,
            expires_at: input.state.expiresAt,
            created_at: input.state.createdAt,
          },
          { onConflict: "actor_profile_id,entity_id,operation,snapshot_hash,entity_fingerprint" },
        )
        .select(columns)
        .maybeSingle();

      if (response.error || !response.data || !isNonEmpty(response.data.id)) return null;
      const state = readRow(response.data);
      return state ? { id: response.data.id, state } : null;
    },

    async readLatestFresh(input) {
      const response = await client
        .from("import_pharmacy_admin_read_states")
        .select(columns)
        .eq("actor_profile_id", input.actorId)
        .eq("entity_id", input.entityId)
        .eq("operation", input.operation)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (response.error || !response.data) return null;
      const state = readRow(response.data);
      return state && isPharmacyAdminBoundedReadStateFresh(state, input.now) ? state : null;
    },
  };
}
