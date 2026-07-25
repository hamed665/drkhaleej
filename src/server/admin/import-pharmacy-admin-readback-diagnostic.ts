import "server-only";

import { createClient } from "@supabase/supabase-js";

export type PharmacyAdminReadbackDiagnostic =
  | "ready"
  | "environment_not_preview"
  | "supabase_url_missing"
  | "service_role_key_missing"
  | "actor_allowlist_invalid"
  | "entity_allowlist_invalid"
  | "actor_allowlist_mismatch"
  | "entity_allowlist_mismatch"
  | "service_role_rejected"
  | "service_role_forbidden"
  | "entity_not_found"
  | "centers_read_failed"
  | "read_states_read_failed"
  | "authorizations_read_failed"
  | "reservations_read_failed";

function parseSingle(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

function mapProbeError(
  status: number | undefined,
  fallback: Exclude<
    PharmacyAdminReadbackDiagnostic,
    | "ready"
    | "environment_not_preview"
    | "supabase_url_missing"
    | "service_role_key_missing"
    | "actor_allowlist_invalid"
    | "entity_allowlist_invalid"
    | "actor_allowlist_mismatch"
    | "entity_allowlist_mismatch"
    | "service_role_rejected"
    | "service_role_forbidden"
    | "entity_not_found"
  >,
): PharmacyAdminReadbackDiagnostic {
  if (status === 401) return "service_role_rejected";
  if (status === 403) return "service_role_forbidden";
  return fallback;
}

export async function diagnosePharmacyAdminReadback(input: {
  actorId: string;
  actorAliases?: readonly string[];
  entityId: string;
  environment?: Record<string, string | undefined>;
}): Promise<PharmacyAdminReadbackDiagnostic> {
  const environment = input.environment ?? process.env;
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const actorIds = parseSingle(environment.IMPORT_PREVIEW_ALLOWED_ACTOR_IDS);
  const entityIds = parseSingle(environment.IMPORT_PREVIEW_CANARY_ENTITY_IDS);

  if (environment.VERCEL_ENV !== "preview") return "environment_not_preview";
  if (!url) return "supabase_url_missing";
  if (!key) return "service_role_key_missing";
  if (actorIds.length !== 1) return "actor_allowlist_invalid";
  if (entityIds.length !== 1) return "entity_allowlist_invalid";

  const actorMatches = actorIds[0] === input.actorId ||
    (input.actorAliases ?? []).includes(actorIds[0]!);
  if (!actorMatches) return "actor_allowlist_mismatch";
  if (entityIds[0] !== input.entityId) return "entity_allowlist_mismatch";

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });

  const center = await client
    .from("centers")
    .select("id")
    .eq("id", input.entityId)
    .maybeSingle();
  if (center.error) return mapProbeError(center.status, "centers_read_failed");
  if (!center.data) return "entity_not_found";

  const readStates = await client
    .from("import_pharmacy_admin_read_states")
    .select("operation_attempt_id")
    .eq("actor_profile_id", input.actorId)
    .eq("entity_id", input.entityId)
    .limit(1);
  if (readStates.error) {
    return mapProbeError(readStates.status, "read_states_read_failed");
  }

  const authorizations = await client
    .from("import_pharmacy_publish_authorizations")
    .select("id")
    .eq("actor_profile_id", input.actorId)
    .eq("entity_id", input.entityId)
    .limit(1);
  if (authorizations.error) {
    return mapProbeError(authorizations.status, "authorizations_read_failed");
  }

  const reservations = await client
    .from("import_publish_idempotency_records")
    .select("id")
    .eq("actor_profile_id", input.actorId)
    .eq("entity_id", input.entityId)
    .limit(1);
  if (reservations.error) {
    return mapProbeError(reservations.status, "reservations_read_failed");
  }

  return "ready";
}
