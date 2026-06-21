"use server";

import { revalidatePath } from "next/cache";

import { requireAdminPermission } from "@/server/admin/permissions";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";

type CenterType = Database["public"]["Enums"]["center_type"];
type VerificationStatus = Database["public"]["Enums"]["verification_status"];
type AppLocale = Database["public"]["Enums"]["app_locale"];
type CountryCode = Database["public"]["Enums"]["country_code"];
type CenterStatus = Database["public"]["Enums"]["provider_status"];
type CenterUpdate = Database["public"]["Tables"]["centers"]["Update"];

export type DraftCenterUpdateState = {
  ok: boolean;
  message: string | null;
};

const allowedWorkflowStatuses = ["draft", "pending_review"] as const satisfies readonly CenterStatus[];
const allowedCenterTypes = [
  "clinic",
  "hospital",
  "dental_clinic",
  "beauty_clinic",
  "laboratory",
  "imaging_center",
  "pharmacy",
  "wellness_center",
  "physiotherapy_center",
  "other",
] as const satisfies readonly CenterType[];

const allowedVerificationStatuses = [
  "unverified",
  "pending",
  "verified",
  "rejected",
  "suspended",
] as const satisfies readonly VerificationStatus[];

const allowedLocales = ["en", "ar"] as const satisfies readonly AppLocale[];
const allowedCountries = ["om"] as const satisfies readonly CountryCode[];

function failure(message: string): DraftCenterUpdateState {
  return { ok: false, message };
}

function readFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readOptionalText(
  formData: FormData,
  key: string,
  maxLength: number,
): string | null | undefined {
  const value = readFormString(formData, key);
  if (value === null) return null;
  if (value.length > maxLength) return undefined;

  return value;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function isCenterType(value: string): value is CenterType {
  return allowedCenterTypes.some((centerType) => centerType === value);
}

function isVerificationStatus(value: string): value is VerificationStatus {
  return allowedVerificationStatuses.some((status) => status === value);
}

function isLocale(value: string): value is AppLocale {
  return allowedLocales.some((locale) => locale === value);
}

function isCountryCode(value: string): value is CountryCode {
  return allowedCountries.some((country) => country === value);
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isWebsiteUrl(value: string): boolean {
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(value);
}

export async function updateDraftCenterDetails(
  _previousState: DraftCenterUpdateState,
  formData: FormData,
): Promise<DraftCenterUpdateState> {
  const admin = await requireAdminPermission("draft_centers.update");

  const centerId = readFormString(formData, "centerId");
  const nameEn = readOptionalText(formData, "nameEn", 160);
  const nameAr = readOptionalText(formData, "nameAr", 160);
  const legalName = readOptionalText(formData, "legalName", 240);
  const rawSlug = readFormString(formData, "slug");
  const centerType = readFormString(formData, "centerType");
  const verificationStatus = readFormString(formData, "verificationStatus");
  const primaryPhone = readOptionalText(formData, "primaryPhone", 64);
  const secondaryPhone = readOptionalText(formData, "secondaryPhone", 64);
  const whatsappPhone = readOptionalText(formData, "whatsappPhone", 64);
  const email = readOptionalText(formData, "email", 240);
  const websiteUrl = readOptionalText(formData, "websiteUrl", 500);
  const shortDescriptionEn = readOptionalText(formData, "shortDescriptionEn", 240);
  const shortDescriptionAr = readOptionalText(formData, "shortDescriptionAr", 240);
  const descriptionEn = readOptionalText(formData, "descriptionEn", 4000);
  const descriptionAr = readOptionalText(formData, "descriptionAr", 4000);
  const defaultLocale = readFormString(formData, "defaultLocale");
  const defaultCountry = readFormString(formData, "defaultCountry");

  if (centerId === null || !isUuid(centerId)) {
    return failure("Draft center could not be identified.");
  }

  if (nameEn === null || nameEn === undefined) {
    return failure("English center name is required and must be under 160 characters.");
  }

  if (
    nameAr === undefined ||
    legalName === undefined ||
    primaryPhone === undefined ||
    secondaryPhone === undefined ||
    whatsappPhone === undefined ||
    email === undefined ||
    websiteUrl === undefined ||
    shortDescriptionEn === undefined ||
    shortDescriptionAr === undefined ||
    descriptionEn === undefined ||
    descriptionAr === undefined
  ) {
    return failure("One or more text fields are longer than allowed.");
  }

  if (rawSlug === null) {
    return failure("Slug is required.");
  }

  const slug = normalizeSlug(rawSlug);
  if (slug.length === 0) {
    return failure("Slug must contain at least one letter or number.");
  }

  if (centerType === null || !isCenterType(centerType)) {
    return failure("Center type is not valid.");
  }

  if (verificationStatus === null || !isVerificationStatus(verificationStatus)) {
    return failure("Verification status is not valid.");
  }

  if (defaultLocale === null || !isLocale(defaultLocale)) {
    return failure("Default locale is not valid.");
  }

  if (defaultCountry === null || !isCountryCode(defaultCountry)) {
    return failure("Default country is not valid.");
  }

  if (email !== null && !isEmail(email)) {
    return failure("Email format is not valid.");
  }

  if (websiteUrl !== null && !isWebsiteUrl(websiteUrl)) {
    return failure("Website URL must start with http:// or https://.");
  }

  const supabase = createSupabaseServiceRoleClient();

  const { data: existingCenter, error: existingCenterError } = await supabase
    .from("centers")
    .select("id, slug")
    .eq("id", centerId)
    .in("status", allowedWorkflowStatuses)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingCenterError !== null) {
    return failure("Draft center could not be loaded.");
  }

  if (existingCenter === null) {
    return failure("Draft center was not found or is no longer in the review workflow.");
  }

  if (existingCenter.slug !== slug) {
    const { data: slugOwner, error: slugError } = await supabase
      .from("centers")
      .select("id")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (slugError !== null) {
      return failure("Slug availability could not be checked.");
    }

    if (slugOwner !== null && slugOwner.id !== centerId) {
      return failure("Slug is already used by another center.");
    }
  }

  const updatePayload: CenterUpdate = {
    center_type: centerType,
    default_country: defaultCountry,
    default_locale: defaultLocale,
    description_ar: descriptionAr,
    description_en: descriptionEn,
    email,
    legal_name: legalName,
    name_ar: nameAr,
    name_en: nameEn,
    primary_phone: primaryPhone,
    secondary_phone: secondaryPhone,
    short_description_ar: shortDescriptionAr,
    short_description_en: shortDescriptionEn,
    slug,
    updated_at: new Date().toISOString(),
    verification_status: verificationStatus,
    website_url: websiteUrl,
    whatsapp_phone: whatsappPhone,
  };

  const { data: updatedCenter, error: updateError } = await supabase
    .from("centers")
    .update(updatePayload)
    .eq("id", centerId)
    .in("status", allowedWorkflowStatuses)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (updateError !== null || updatedCenter === null) {
    return failure("Draft center details could not be saved.");
  }

  revalidatePath("/admin/draft-centers");
  revalidatePath(`/admin/draft-centers/${centerId}`);
  revalidatePath("/admin/center-subscriptions");

  await writeAdminAuditEvent({
    admin,
    permissionKey: "draft_centers.update",
    action: "draft_center.details_updated",
    entityType: "draft_center",
    entityId: centerId,
    targetTable: "centers",
    summary: "Draft center details updated.",
    newValues: { fields: Object.keys(updatePayload) },
  });

  return {
    ok: true,
    message: "Draft center details were saved. This did not publish or activate the center.",
  };
}
