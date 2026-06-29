import "server-only";

import { requireAdminPermission } from "@/server/admin/permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminCenterCategoryAssignment } from "@/server/admin/draft-center-taxonomy";
import type { AdminDraftCenterDetail } from "@/server/admin/draft-centers";

type QueryError = { message?: string };
type QueryResponse<T> = { data: T | null; error: QueryError | null };

type QueryBuilder<T> = PromiseLike<QueryResponse<T>> & {
  eq(column: string, value: unknown): QueryBuilder<T>;
  is(column: string, value: boolean | null): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T>;
  select(columns: string): QueryBuilder<T>;
};

type UntypedSupabaseClient = {
  from<T>(table: string): QueryBuilder<T>;
};

type CenterLocationQualityRow = {
  address_line1_ar: string | null;
  address_line1_en: string | null;
  id: string;
  is_active: boolean;
  is_primary: boolean;
  name_ar: string | null;
  name_en: string | null;
  primary_phone: string | null;
  whatsapp_phone: string | null;
};

export type DraftCenterQualityStatus = "pass" | "warning" | "fail";

export type DraftCenterQualityCheck = {
  detail: string;
  id: string;
  status: DraftCenterQualityStatus;
  title: string;
};

export type DraftCenterQualityReport = {
  blockers: number;
  checks: DraftCenterQualityCheck[];
  passed: number;
  publicActivationBlocked: true;
  readinessLabel: string;
  total: number;
  warnings: number;
};

export type DraftCenterQualityResult =
  | { ok: true; report: DraftCenterQualityReport }
  | { ok: false; reason: "unavailable" };

function qualityClient(): UntypedSupabaseClient {
  return createSupabaseServiceRoleClient() as unknown as UntypedSupabaseClient;
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function check(
  id: string,
  title: string,
  status: DraftCenterQualityStatus,
  detail: string,
): DraftCenterQualityCheck {
  return { id, title, status, detail };
}

function contactAvailable(center: AdminDraftCenterDetail): boolean {
  return hasText(center.primaryPhone) || hasText(center.whatsappPhone) || hasText(center.email);
}

function descriptionAvailable(center: AdminDraftCenterDetail): boolean {
  return (
    hasText(center.shortDescriptionEn) ||
    hasText(center.shortDescriptionAr) ||
    hasText(center.descriptionEn) ||
    hasText(center.descriptionAr)
  );
}

function internallyActiveLocationCount(locations: CenterLocationQualityRow[]): number {
  return locations.filter((location) => location.is_active).length;
}

function buildChecks(
  center: AdminDraftCenterDetail,
  taxonomyAssignment: AdminCenterCategoryAssignment | null,
  taxonomyAvailable: boolean,
  locations: CenterLocationQualityRow[],
): DraftCenterQualityCheck[] {
  const internallyActiveLocationsCount = internallyActiveLocationCount(locations);

  return [
    check(
      "name-en",
      "English name",
      hasText(center.nameEn) ? "pass" : "fail",
      hasText(center.nameEn)
        ? "English center name is present."
        : "English center name is required before review can be considered complete.",
    ),
    check(
      "name-ar",
      "Arabic name or fallback",
      hasText(center.nameAr) ? "pass" : "warning",
      hasText(center.nameAr)
        ? "Arabic center name is present."
        : "Arabic name is missing. A reviewed fallback policy is needed before public launch.",
    ),
    check(
      "primary-category",
      "Primary taxonomy category",
      taxonomyAssignment !== null ? "pass" : "fail",
      taxonomyAssignment !== null
        ? "A primary category is assigned for admin review."
        : taxonomyAvailable
          ? "No primary category is assigned yet."
          : "Taxonomy data could not be loaded, so category readiness cannot pass.",
    ),
    check(
      "contact",
      "Private contact candidate",
      contactAvailable(center) ? "pass" : "fail",
      contactAvailable(center)
        ? "At least one internal contact candidate exists. Public contact visibility still requires a later workflow."
        : "At least one phone, WhatsApp number, or email is needed before public review.",
    ),
    check(
      "location",
      "Internal location readiness",
      internallyActiveLocationsCount > 0 ? "pass" : "fail",
      internallyActiveLocationsCount > 0
        ? `${internallyActiveLocationsCount} internally active location candidate${internallyActiveLocationsCount === 1 ? "" : "s"} found for admin quality checks only.`
        : "No internally active location candidate is ready for the admin quality gate yet.",
    ),
    check(
      "description",
      "Description content",
      descriptionAvailable(center) ? "pass" : "warning",
      descriptionAvailable(center)
        ? "Description or short description content exists."
        : "Description content is missing. This should be completed before public launch.",
    ),
    check(
      "verification",
      "Verification status",
      center.verificationStatus === "rejected" || center.verificationStatus === "suspended"
        ? "fail"
        : center.verificationStatus === "verified" || center.verificationStatus === "pending"
          ? "pass"
          : "warning",
      center.verificationStatus === "verified"
        ? "Center verification is marked verified."
        : center.verificationStatus === "pending"
          ? "Center verification is pending review."
          : center.verificationStatus === "rejected" || center.verificationStatus === "suspended"
            ? "Center verification is blocked by rejected or suspended status."
            : "Center is still unverified and needs later verification review.",
    ),
    check(
      "public-flags",
      "Public flags remain locked",
      !center.isActive && !center.isClaimable ? "pass" : "fail",
      !center.isActive && !center.isClaimable
        ? "Center remains not active and not claimable. Internal quality readiness is not public activation."
        : "Unexpected public flags are enabled. Public activation is not allowed in this phase.",
    ),
  ];
}

function buildReport(checks: DraftCenterQualityCheck[]): DraftCenterQualityReport {
  const blockers = checks.filter((item) => item.status === "fail").length;
  const warnings = checks.filter((item) => item.status === "warning").length;
  const passed = checks.filter((item) => item.status === "pass").length;

  return {
    blockers,
    checks,
    passed,
    publicActivationBlocked: true,
    readinessLabel:
      blockers === 0
        ? "Ready for the next internal admin review step, still not public"
        : "Not ready for internal review workflow",
    total: checks.length,
    warnings,
  };
}

export async function getAdminDraftCenterQuality(
  centerId: string,
  center: AdminDraftCenterDetail,
  taxonomyAssignment: AdminCenterCategoryAssignment | null,
  taxonomyAvailable: boolean,
): Promise<DraftCenterQualityResult> {
  await requireAdminPermission("draft_centers.read");

  const supabase = qualityClient();
  const { data: locations, error: locationsError } = await supabase
    .from<CenterLocationQualityRow[]>("center_locations")
    .select("id, name_en, name_ar, address_line1_en, address_line1_ar, primary_phone, whatsapp_phone, is_active, is_primary")
    .eq("center_id", centerId)
    .is("deleted_at", null)
    .order("is_primary", { ascending: false })
    .limit(20);

  if (locationsError !== null || locations === null) {
    return { ok: false, reason: "unavailable" };
  }

  const checks = buildChecks(center, taxonomyAssignment, taxonomyAvailable, locations);

  return { ok: true, report: buildReport(checks) };
}
