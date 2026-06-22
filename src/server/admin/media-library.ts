import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";
import { requireAdminPermission } from "@/server/admin/permissions";

export const mediaUsageKinds = [
  "general",
  "logo",
  "cover",
  "gallery",
  "profile",
  "thumbnail",
  "article_image",
  "offer_image",
  "homepage_image",
] as const;
export const mediaReviewStatuses = ["draft", "reviewing", "approved", "rejected"] as const;
export const mediaVisibilityStatuses = ["private", "public_candidate"] as const;

const MEDIA_ASSET_LIST_SELECT =
  "id, original_filename, storage_bucket, storage_path, mime_type, file_size_bytes, width, height, alt_text_en, alt_text_ar, caption_en, caption_ar, admin_usage_kind, admin_review_status, status, admin_visibility_status, is_archived, created_at, updated_at, entity_media(count)";

type MediaUsageKind = (typeof mediaUsageKinds)[number];
type MediaReviewStatus = (typeof mediaReviewStatuses)[number];
type MediaVisibilityStatus = (typeof mediaVisibilityStatuses)[number];

export type AdminMediaFilters = {
  usageKind?: string | undefined;
  reviewStatus?: string | undefined;
  visibilityStatus?: string | undefined;
  archived?: string | undefined;
  search?: string | undefined;
};

export type AdminMediaAsset = {
  id: string;
  originalFilename: string | null;
  storageBucket: string | null;
  storagePath: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  altTextEn: string | null;
  altTextAr: string | null;
  captionEn: string | null;
  captionAr: string | null;
  usageKind: string;
  reviewStatus: string;
  publicStatus: Database["public"]["Enums"]["media_asset_status"];
  visibilityStatus: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  assignmentCount: number;
};

type MediaAssetRow = Pick<
  Database["public"]["Tables"]["media_assets"]["Row"],
  | "id"
  | "original_filename"
  | "storage_bucket"
  | "storage_path"
  | "mime_type"
  | "file_size_bytes"
  | "width"
  | "height"
  | "alt_text_en"
  | "alt_text_ar"
  | "caption_en"
  | "caption_ar"
  | "admin_usage_kind"
  | "admin_review_status"
  | "status"
  | "admin_visibility_status"
  | "is_archived"
  | "created_at"
  | "updated_at"
> & {
  entity_media: { count: number }[] | null;
};

export type AdminMediaAssignment = {
  id: string;
  entityType: string;
  entityId: string;
  usageKind: string;
  publicMediaVisible: boolean;
  mediaReviewStatus: string;
  isPrimary: boolean;
  isFeatured: boolean;
};

export async function listAdminMediaAssets(
  filters: AdminMediaFilters,
): Promise<{ ok: true; items: AdminMediaAsset[] } | { ok: false }> {
  await requireAdminPermission("media.read");
  try {
    const supabase = createSupabaseServiceRoleClient();
    let query = supabase
      .from("media_assets")
      .select(MEDIA_ASSET_LIST_SELECT)
      .order("created_at", { ascending: false })
      .limit(100)
      .is("deleted_at", null);

    if (isUsageKind(filters.usageKind)) query = query.eq("admin_usage_kind", filters.usageKind);
    if (isReviewStatus(filters.reviewStatus)) query = query.eq("admin_review_status", filters.reviewStatus);
    if (isVisibilityStatus(filters.visibilityStatus)) query = query.eq("admin_visibility_status", filters.visibilityStatus);
    if (filters.archived === "active") query = query.eq("is_archived", false);
    if (filters.archived === "archived") query = query.eq("is_archived", true);
    if (filters.search) query = query.ilike("original_filename", `%${filters.search.trim()}%`);

    const { data, error } = await query;
    if (error || !data) return { ok: false };
    return { ok: true, items: (data as unknown as MediaAssetRow[]).map(mapMediaAsset) };
  } catch {
    return { ok: false };
  }
}

export async function getAdminMediaAsset(
  mediaId: string,
): Promise<{ ok: true; item: AdminMediaAsset; assignments: AdminMediaAssignment[] } | { ok: false }> {
  await requireAdminPermission("media.read");
  if (!isUuid(mediaId)) return { ok: false };
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("media_assets")
      .select(MEDIA_ASSET_LIST_SELECT)
      .eq("id", mediaId)
      .is("deleted_at", null)
      .maybeSingle();
    if (error || !data) return { ok: false };

    const { data: assignments } = await supabase
      .from("entity_media")
      .select("id, entity_type, entity_id, usage_kind, public_media_visible, media_review_status, is_primary, is_featured")
      .eq("media_asset_id", mediaId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    return {
      ok: true,
      item: mapMediaAsset(data as unknown as MediaAssetRow),
      assignments: (assignments ?? []).map((row) => ({
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        usageKind: row.usage_kind,
        publicMediaVisible: row.public_media_visible,
        mediaReviewStatus: row.media_review_status,
        isPrimary: row.is_primary,
        isFeatured: row.is_featured,
      })),
    };
  } catch {
    return { ok: false };
  }
}

function mapMediaAsset(row: MediaAssetRow): AdminMediaAsset {
  return {
    id: row.id,
    originalFilename: row.original_filename,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    sizeBytes: row.file_size_bytes,
    width: row.width,
    height: row.height,
    altTextEn: row.alt_text_en,
    altTextAr: row.alt_text_ar,
    captionEn: row.caption_en,
    captionAr: row.caption_ar,
    usageKind: row.admin_usage_kind,
    reviewStatus: row.admin_review_status,
    publicStatus: row.status,
    visibilityStatus: row.admin_visibility_status,
    isArchived: row.is_archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assignmentCount: row.entity_media?.[0]?.count ?? 0,
  };
}

export function isUsageKind(value: unknown): value is MediaUsageKind {
  return typeof value === "string" && (mediaUsageKinds as readonly string[]).includes(value);
}

export function isReviewStatus(value: unknown): value is MediaReviewStatus {
  return typeof value === "string" && (mediaReviewStatuses as readonly string[]).includes(value);
}

export function isVisibilityStatus(value: unknown): value is MediaVisibilityStatus {
  return typeof value === "string" && (mediaVisibilityStatuses as readonly string[]).includes(value);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
