"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { writeAdminAuditEvent } from "@/server/admin/audit-log";
import { requireAdminPermission } from "@/server/admin/permissions";
import { isReviewStatus, isUsageKind, isUuid, isVisibilityStatus } from "@/server/admin/media-library";

export type AdminMediaActionState = { ok: boolean; message: string };

const MAX_ALT_LENGTH = 180;
const MAX_CAPTION_LENGTH = 300;

export async function uploadAdminMediaAsset(): Promise<AdminMediaActionState> {
  await requireAdminPermission("media.upload");
  return { ok: false, message: "Media upload is planned and requires private storage configuration." };
}

export async function updateAdminMediaAssetMetadata(formData: FormData): Promise<void> {
  const admin = await requireAdminPermission("media.update");
  const mediaId = String(formData.get("mediaId") ?? "");
  if (!isUuid(mediaId)) return;

  const usageKind = clean(formData.get("usageKind"));
  const reviewStatus = clean(formData.get("reviewStatus"));
  const visibilityStatus = clean(formData.get("visibilityStatus"));
  const altTextEn = cleanNullable(formData.get("altTextEn"), MAX_ALT_LENGTH);
  const altTextAr = cleanNullable(formData.get("altTextAr"), MAX_ALT_LENGTH);
  const captionEn = cleanNullable(formData.get("captionEn"), MAX_CAPTION_LENGTH);
  const captionAr = cleanNullable(formData.get("captionAr"), MAX_CAPTION_LENGTH);

  if (!isUsageKind(usageKind) || !isReviewStatus(reviewStatus) || !isVisibilityStatus(visibilityStatus)) {
    return;
  }
  if ([altTextEn, altTextAr, captionEn, captionAr].includes(false as never)) return;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createSupabaseServiceRoleClient() as unknown as any;
  const { data: oldRow, error: readError } = await supabase
    .from("media_assets")
    .select("id, alt_text_en, alt_text_ar, caption_en, caption_ar, admin_usage_kind, status, admin_visibility_status")
    .eq("id", mediaId)
    .maybeSingle();
  if (readError || !oldRow) return;

  const next = { alt_text_en: altTextEn || null, alt_text_ar: altTextAr || null, caption_en: captionEn || null, caption_ar: captionAr || null, admin_usage_kind: usageKind, status: reviewStatus, admin_visibility_status: visibilityStatus, updated_by_profile_id: admin.profile.id };
  const { error } = await supabase.from("media_assets").update(next).eq("id", mediaId);
  if (error) return;

  const oldValues: Record<string, string | null> = {};
  const newValues: Record<string, string | null> = {};
  for (const [key, newValue] of Object.entries(next)) {
    if (key === "updated_by_profile_id") continue;
    const oldValue = oldRow[key as keyof typeof oldRow] as string | null;
    if (oldValue !== newValue) { oldValues[key] = oldValue; newValues[key] = newValue; }
  }
  await writeAdminAuditEvent({ admin, permissionKey: "media.update", action: "media_asset.metadata_updated", entityType: "media_asset", entityId: mediaId, targetTable: "media_assets", summary: "Media asset metadata updated.", oldValues, newValues });
  revalidateMedia(mediaId);
  return;
}

export async function archiveAdminMediaAsset(formData: FormData): Promise<void> {
  await setArchiveState(formData, true);
}

export async function restoreAdminMediaAsset(formData: FormData): Promise<void> {
  await setArchiveState(formData, false);
}

async function setArchiveState(formData: FormData, isArchived: boolean): Promise<void> {
  const admin = await requireAdminPermission("media.archive");
  const mediaId = String(formData.get("mediaId") ?? "");
  if (!isUuid(mediaId)) return;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createSupabaseServiceRoleClient() as unknown as any;
  const { error } = await supabase.from("media_assets").update({ is_archived: isArchived, updated_by_profile_id: admin.profile.id }).eq("id", mediaId);
  if (error) return;
  await writeAdminAuditEvent({ admin, permissionKey: "media.archive", action: isArchived ? "media_asset.archived" : "media_asset.restored", entityType: "media_asset", entityId: mediaId, targetTable: "media_assets", summary: isArchived ? "Media asset archived." : "Media asset restored.", newValues: { is_archived: isArchived } });
  revalidateMedia(mediaId);
}

function clean(value: FormDataEntryValue | null): string { return typeof value === "string" ? value.trim() : ""; }
function cleanNullable(value: FormDataEntryValue | null, maxLength: number): string | null | false { const next = clean(value); if (!next) return null; return next.length > maxLength ? false : next; }
function revalidateMedia(mediaId: string): void { revalidatePath("/admin/media"); revalidatePath(`/admin/media/${mediaId}`); }
