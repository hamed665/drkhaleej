import "server-only";

import { requireAdminPermission } from "@/server/admin/permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";

type CenterRow = Database["public"]["Tables"]["centers"]["Row"];

type AdminCenterWorkflowStatus = Extract<CenterRow["status"], "draft" | "pending_review">;

const fixedLimit = 100;
const workflowStatuses: AdminCenterWorkflowStatus[] = ["draft", "pending_review"];
const listSelectColumns =
  "id, slug, name_en, name_ar, center_type, status, verification_status, primary_phone, whatsapp_phone, email, default_locale, default_country, is_active, is_claimable, metadata, created_at, updated_at";
const detailSelectColumns =
  "id, slug, name_en, name_ar, legal_name, center_type, status, verification_status, primary_phone, secondary_phone, whatsapp_phone, email, website_url, short_description_en, short_description_ar, description_en, description_ar, default_locale, default_country, is_active, is_claimable, metadata, created_at, updated_at";

type CenterListRow = Pick<
  CenterRow,
  | "id"
  | "slug"
  | "name_en"
  | "name_ar"
  | "center_type"
  | "status"
  | "verification_status"
  | "primary_phone"
  | "whatsapp_phone"
  | "email"
  | "default_locale"
  | "default_country"
  | "is_active"
  | "is_claimable"
  | "metadata"
  | "created_at"
  | "updated_at"
>;

type CenterDetailRow = Pick<
  CenterRow,
  | "id"
  | "slug"
  | "name_en"
  | "name_ar"
  | "legal_name"
  | "center_type"
  | "status"
  | "verification_status"
  | "primary_phone"
  | "secondary_phone"
  | "whatsapp_phone"
  | "email"
  | "website_url"
  | "short_description_en"
  | "short_description_ar"
  | "description_en"
  | "description_ar"
  | "default_locale"
  | "default_country"
  | "is_active"
  | "is_claimable"
  | "metadata"
  | "created_at"
  | "updated_at"
>;

export type AdminDraftCenterListItem = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string | null;
  centerType: CenterRow["center_type"];
  status: CenterRow["status"];
  verificationStatus: CenterRow["verification_status"];
  primaryPhone: string | null;
  whatsappPhone: string | null;
  email: string | null;
  defaultLocale: CenterRow["default_locale"];
  defaultCountry: CenterRow["default_country"];
  isActive: boolean;
  isClaimable: boolean;
  createdFrom: string | null;
  sourceLeadId: string | null;
  sourceProviderType: string | null;
  sourceRequest: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminDraftCenterDetail = AdminDraftCenterListItem & {
  legalName: string | null;
  secondaryPhone: string | null;
  websiteUrl: string | null;
  shortDescriptionEn: string | null;
  shortDescriptionAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
};

export type AdminDraftCentersListResult =
  | { ok: true; items: AdminDraftCenterListItem[]; limit: number }
  | { ok: false; reason: "unavailable"; items: []; limit: number };

export type AdminDraftCenterDetailResult =
  | { ok: true; center: AdminDraftCenterDetail }
  | { ok: false; reason: "not_found" | "unavailable" };

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function metadataRecord(value: CenterRow["metadata"]): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function metadataText(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function sourceFields(row: Pick<CenterRow, "metadata">) {
  const metadata = metadataRecord(row.metadata);

  return {
    createdFrom: metadataText(metadata, "created_from"),
    sourceLeadId: metadataText(metadata, "source_provider_onboarding_lead_id"),
    sourceProviderType: metadataText(metadata, "source_provider_type"),
    sourceRequest: metadataText(metadata, "source_request"),
  };
}

function mapCenter(row: CenterListRow): AdminDraftCenterListItem {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.name_en,
    nameAr: row.name_ar,
    centerType: row.center_type,
    status: row.status,
    verificationStatus: row.verification_status,
    primaryPhone: row.primary_phone,
    whatsappPhone: row.whatsapp_phone,
    email: row.email,
    defaultLocale: row.default_locale,
    defaultCountry: row.default_country,
    isActive: row.is_active,
    isClaimable: row.is_claimable,
    ...sourceFields(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCenterDetail(row: CenterDetailRow): AdminDraftCenterDetail {
  return {
    ...mapCenter(row),
    legalName: row.legal_name,
    secondaryPhone: row.secondary_phone,
    websiteUrl: row.website_url,
    shortDescriptionEn: row.short_description_en,
    shortDescriptionAr: row.short_description_ar,
    descriptionEn: row.description_en,
    descriptionAr: row.description_ar,
  };
}

export async function listAdminDraftCenters(): Promise<AdminDraftCentersListResult> {
  await requireAdminPermission("draft_centers.read");

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("centers")
    .select(listSelectColumns)
    .in("status", workflowStatuses)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(fixedLimit);

  if (error !== null || data === null) {
    return { ok: false, reason: "unavailable", items: [], limit: fixedLimit };
  }

  return { ok: true, items: data.map(mapCenter), limit: fixedLimit };
}

export async function getAdminDraftCenterById(
  centerId: string,
): Promise<AdminDraftCenterDetailResult> {
  await requireAdminPermission("draft_centers.read");

  if (!isUuid(centerId)) {
    return { ok: false, reason: "not_found" };
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("centers")
    .select(detailSelectColumns)
    .eq("id", centerId)
    .in("status", workflowStatuses)
    .is("deleted_at", null)
    .maybeSingle();

  if (error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  if (data === null) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, center: mapCenterDetail(data) };
}
