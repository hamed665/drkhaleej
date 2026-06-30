import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";
import { requireAdminPermission } from "@/server/admin/permissions";

type CenterRow = Database["public"]["Tables"]["centers"]["Row"];
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

type QueryError = { message?: string };
type QueryResponse<T> = { data: T | null; error: QueryError | null };

type QueryBuilder<T> = PromiseLike<QueryResponse<T>> & {
  eq(column: string, value: unknown): QueryBuilder<T>;
  maybeSingle(): Promise<QueryResponse<T>>;
  select(columns: string): QueryBuilder<T>;
};

type UntypedSupabaseClient = {
  from<T>(table: string): QueryBuilder<T>;
};

export type ActiveCenterPublicStateEvidenceSummary = {
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
  canPreparePublicStateChange: boolean;
  evidenceSummary: ActiveCenterPublicStateEvidenceSummary;
  futureMutationRequired: true;
  warnings: string[];
};

export type ActiveCenterPublicStateReadinessResult =
  | { ok: true; readiness: ActiveCenterPublicStateReadiness }
  | { ok: false; reason: "not_found" | "unavailable" };

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

function evaluateActiveCenterPublicState(center: ActiveCenterStateRow): ActiveCenterPublicStateReadiness {
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

  return {
    blockers,
    canPreparePublicStateChange: blockers.length === 0,
    evidenceSummary: {
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

  return { ok: true, readiness: evaluateActiveCenterPublicState(center) };
}
