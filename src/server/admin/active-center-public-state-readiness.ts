import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";
import { requireAdminPermission } from "@/server/admin/permissions";

type CenterRow = Database["public"]["Tables"]["centers"]["Row"];
type AdminAuditEventRow = Database["public"]["Tables"]["admin_audit_events"]["Row"];
type ProviderStatus = Database["public"]["Enums"]["provider_status"];

type ActiveCenterStateRow = Pick<
  CenterRow,
  | "id"
  | "slug"
  | "status"
  | "default_country"
  | "is_active"
  | "is_claimable"
  | "deleted_at"
>;

type ActivationAuditRow = Pick<
  AdminAuditEventRow,
  "action" | "actor_email" | "created_at" | "summary"
>;

type QueryError = { message?: string };
type QueryResponse<T> = { data: T | null; error: QueryError | null };

type QueryBuilder<T> = PromiseLike<QueryResponse<T>> & {
  eq(column: string, value: unknown): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  maybeSingle(): Promise<QueryResponse<T>>;
  order(column: string, options: { ascending?: boolean }): QueryBuilder<T>;
  select(columns: string): QueryBuilder<T>;
};

type UntypedSupabaseClient = {
  from<T>(table: string): QueryBuilder<T>;
};

export type ActiveCenterPublicStateActivationAuditEvidence = {
  action: "draft_center.public_profile_activated";
  actorEmail: string | null;
  createdAt: string | null;
  found: boolean;
  summary: string | null;
};

export type ActiveCenterPublicStateEvidenceSummary = {
  activationAudit: ActiveCenterPublicStateActivationAuditEvidence;
  auditRequired: true;
  centerStatus: ProviderStatus;
  commercialStateUnchanged: true;
  contactVisibilityUnchanged: true;
  deletedAt: string | null;
  publicActive: boolean;
  publicClaimable: boolean;
  publicPathAr: string | null;
  publicPathEn: string | null;
  sitemapRevalidationRequired: true;
  slug: string;
};

export type ActiveCenterPublicStateReadiness = {
  blockers: string[];
  canDeactivate: boolean;
  canPreparePublicStateChange: boolean;
  evidenceSummary: ActiveCenterPublicStateEvidenceSummary;
  futureMutationRequired: true;
  publicPaths: {
    ar: string | null;
    en: string | null;
  };
  statusSummary: {
    deletedAt: string | null;
    hasRecentActivationAudit: boolean;
    isActive: boolean;
    status: ProviderStatus;
  };
  warnings: string[];
};

export type ActiveCenterPublicStateReadinessResult =
  | { ok: true; readiness: ActiveCenterPublicStateReadiness }
  | { ok: false; reason: "not_found" | "unavailable" };

const missingActivationAudit: ActiveCenterPublicStateActivationAuditEvidence = {
  action: "draft_center.public_profile_activated",
  actorEmail: null,
  createdAt: null,
  found: false,
  summary: null,
};

function readinessClient(): UntypedSupabaseClient {
  return createSupabaseServiceRoleClient() as unknown as UntypedSupabaseClient;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function publicCenterPath(locale: "en" | "ar", country: string, slug: string): string {
  return `/${locale}/${country.toLowerCase()}/center/${slug}`;
}

function buildPublicPaths(center: ActiveCenterStateRow) {
  if (!hasText(center.slug) || !hasText(center.default_country)) {
    return { publicPathAr: null, publicPathEn: null };
  }

  return {
    publicPathAr: publicCenterPath("ar", center.default_country, center.slug),
    publicPathEn: publicCenterPath("en", center.default_country, center.slug),
  };
}

function mapActivationAudit(
  row: ActivationAuditRow | null,
): ActiveCenterPublicStateActivationAuditEvidence {
  if (row === null) return missingActivationAudit;

  return {
    action: "draft_center.public_profile_activated",
    actorEmail: row.actor_email,
    createdAt: row.created_at,
    found: true,
    summary: row.summary,
  };
}

async function getLatestActivationAuditEvidence(
  centerId: string,
): Promise<ActiveCenterPublicStateActivationAuditEvidence> {
  const { data, error } = await readinessClient()
    .from<ActivationAuditRow>("admin_audit_events")
    .select("action,actor_email,created_at,summary")
    .eq("entity_id", centerId)
    .eq("entity_type", "center")
    .eq("action", "draft_center.public_profile_activated")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error !== null) return missingActivationAudit;

  return mapActivationAudit(data);
}

function evaluateActiveCenterPublicState(
  center: ActiveCenterStateRow,
  activationAudit: ActiveCenterPublicStateActivationAuditEvidence,
): ActiveCenterPublicStateReadiness {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const paths = buildPublicPaths(center);

  if (center.status !== "active") {
    blockers.push("Center status must be active before public state readiness can pass.");
  }

  if (center.is_active !== true) {
    blockers.push("Center public active flag must be true before public state readiness can pass.");
  }

  if (center.deleted_at !== null) {
    blockers.push("Deleted center records cannot enter the public state workflow.");
  }

  if (!hasText(center.slug)) {
    blockers.push("Center slug is required to revalidate public paths.");
  }

  if (!hasText(center.default_country)) {
    blockers.push("Center default country is required to revalidate public paths.");
  }

  if (center.is_claimable) {
    warnings.push("Claimable state must be preserved by the future public state action.");
  }

  if (!activationAudit.found) {
    warnings.push("Activation audit evidence was not found for this center.");
  }

  const canPreparePublicStateChange = blockers.length === 0;

  return {
    blockers,
    canDeactivate: canPreparePublicStateChange,
    canPreparePublicStateChange,
    evidenceSummary: {
      activationAudit,
      auditRequired: true,
      centerStatus: center.status,
      commercialStateUnchanged: true,
      contactVisibilityUnchanged: true,
      deletedAt: center.deleted_at,
      publicActive: center.is_active,
      publicClaimable: center.is_claimable,
      publicPathAr: paths.publicPathAr,
      publicPathEn: paths.publicPathEn,
      sitemapRevalidationRequired: true,
      slug: center.slug,
    },
    futureMutationRequired: true,
    publicPaths: {
      ar: paths.publicPathAr,
      en: paths.publicPathEn,
    },
    statusSummary: {
      deletedAt: center.deleted_at,
      hasRecentActivationAudit: activationAudit.found,
      isActive: center.is_active,
      status: center.status,
    },
    warnings,
  };
}

export async function getAdminActiveCenterPublicStateReadiness(
  centerId: string,
): Promise<ActiveCenterPublicStateReadinessResult> {
  await requireAdminPermission("draft_centers.update");

  if (!isUuid(centerId)) {
    return { ok: false, reason: "not_found" };
  }

  const { data: center, error } = await readinessClient()
    .from<ActiveCenterStateRow>("centers")
    .select("id,slug,status,default_country,is_active,is_claimable,deleted_at")
    .eq("id", centerId)
    .maybeSingle();

  if (error !== null) return { ok: false, reason: "unavailable" };
  if (center === null) return { ok: false, reason: "not_found" };

  const activationAudit = await getLatestActivationAuditEvidence(centerId);

  return { ok: true, readiness: evaluateActiveCenterPublicState(center, activationAudit) };
}
