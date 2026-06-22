import "server-only";

import {
  cmsContentTypes,
  cmsStatuses,
  isCmsContentType,
  isCmsStatus,
  type CmsContentType,
  type CmsStatus,
} from "@/lib/admin/cms-content-options";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database, Json } from "@/lib/supabase/types";
import { requireAdminPermission } from "@/server/admin/permissions";

export {
  cmsContentTypes,
  cmsStatuses,
  isCmsContentType,
  isCmsStatus,
  type CmsContentType,
  type CmsStatus,
};

export type CmsLocale = "en" | "ar" | null;
type CmsEntryRow = Database["public"]["Tables"]["cms_content_entries"]["Row"];
type CmsRevisionRow = Database["public"]["Tables"]["cms_content_revisions"]["Row"];
type CmsEntryWithCurrentRevision = CmsEntryRow & {
  cms_content_revisions?: Pick<CmsRevisionRow, "revision_number"> | Pick<CmsRevisionRow, "revision_number">[] | null;
};

export type CmsContentEntry = {
  id: string;
  createdAt: string;
  updatedAt: string;
  contentKey: string;
  contentType: CmsContentType;
  locale: CmsLocale;
  country: "om";
  titleEn: string | null;
  titleAr: string | null;
  slug: string | null;
  status: CmsStatus;
  currentRevisionId: string | null;
  publishedRevisionId: string | null;
  metadata: Json;
  isArchived: boolean;
  deletedAt: string | null;
  currentRevisionNumber: number | null;
};

export type CmsContentRevision = {
  id: string;
  entryId: string;
  createdAt: string;
  createdByProfileId: string | null;
  revisionNumber: number;
  status: CmsStatus;
  titleEn: string | null;
  titleAr: string | null;
  summaryEn: string | null;
  summaryAr: string | null;
  bodyEn: Json;
  bodyAr: Json;
  seoTitleEn: string | null;
  seoTitleAr: string | null;
  seoDescriptionEn: string | null;
  seoDescriptionAr: string | null;
  metadata: Json;
  reviewNote: string | null;
  approvedAt: string | null;
  approvedByProfileId: string | null;
  rejectedAt: string | null;
  rejectedByProfileId: string | null;
};

export type CmsEntryFilters = {
  contentType?: string;
  status?: string;
  locale?: string;
  archived?: string;
  search?: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return uuidPattern.test(value);
}

function safeSearch(value: string): string {
  return value.replaceAll("%", "\\%").replaceAll(",", " ").trim().slice(0, 160);
}

function mapRevision(row: CmsRevisionRow): CmsContentRevision {
  return {
    id: row.id,
    entryId: row.entry_id,
    createdAt: row.created_at,
    createdByProfileId: row.created_by_profile_id,
    revisionNumber: row.revision_number,
    status: row.status as CmsStatus,
    titleEn: row.title_en,
    titleAr: row.title_ar,
    summaryEn: row.summary_en,
    summaryAr: row.summary_ar,
    bodyEn: row.body_en,
    bodyAr: row.body_ar,
    seoTitleEn: row.seo_title_en,
    seoTitleAr: row.seo_title_ar,
    seoDescriptionEn: row.seo_description_en,
    seoDescriptionAr: row.seo_description_ar,
    metadata: row.metadata,
    reviewNote: row.review_note,
    approvedAt: row.approved_at,
    approvedByProfileId: row.approved_by_profile_id,
    rejectedAt: row.rejected_at,
    rejectedByProfileId: row.rejected_by_profile_id,
  };
}

function mapEntry(row: CmsEntryWithCurrentRevision): CmsContentEntry {
  const revision = Array.isArray(row.cms_content_revisions)
    ? row.cms_content_revisions[0]
    : row.cms_content_revisions;

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contentKey: row.content_key,
    contentType: row.content_type as CmsContentType,
    locale: row.locale,
    country: row.country,
    titleEn: row.title_en,
    titleAr: row.title_ar,
    slug: row.slug,
    status: row.status as CmsStatus,
    currentRevisionId: row.current_revision_id,
    publishedRevisionId: row.published_revision_id,
    metadata: row.metadata,
    isArchived: row.is_archived,
    deletedAt: row.deleted_at,
    currentRevisionNumber: revision?.revision_number ?? null,
  };
}

export async function listAdminCmsContentEntries(
  filters: CmsEntryFilters = {},
): Promise<{ ok: true; items: CmsContentEntry[] } | { ok: false }> {
  await requireAdminPermission("content.read");

  try {
    const supabase = createSupabaseServiceRoleClient();
    let query = supabase
      .from("cms_content_entries")
      .select("*, cms_content_revisions!cms_content_entries_current_revision_id_fkey(revision_number)")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(100);

    if (filters.contentType && isCmsContentType(filters.contentType)) {
      query = query.eq("content_type", filters.contentType);
    }

    if (filters.status && isCmsStatus(filters.status)) {
      query = query.eq("status", filters.status);
    }

    if (filters.locale === "en" || filters.locale === "ar") {
      query = query.eq("locale", filters.locale);
    }

    if (filters.archived === "active") {
      query = query.eq("is_archived", false);
    } else if (filters.archived === "archived") {
      query = query.eq("is_archived", true);
    }

    const search = filters.search ? safeSearch(filters.search) : "";
    if (search) {
      query = query.or(`content_key.ilike.%${search}%,title_en.ilike.%${search}%,title_ar.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) return { ok: false };

    return { ok: true, items: (data ?? []).map((row) => mapEntry(row as CmsEntryWithCurrentRevision)) };
  } catch {
    return { ok: false };
  }
}

export async function getAdminCmsContentEntry(
  entryId: string,
): Promise<{ ok: true; item: CmsContentEntry } | { ok: false }> {
  await requireAdminPermission("content.read");
  if (!isValidUuid(entryId)) return { ok: false };

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("cms_content_entries")
      .select("*, cms_content_revisions!cms_content_entries_current_revision_id_fkey(revision_number)")
      .eq("id", entryId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !data) return { ok: false };
    return { ok: true, item: mapEntry(data as CmsEntryWithCurrentRevision) };
  } catch {
    return { ok: false };
  }
}

async function activeEntryExists(entryId: string): Promise<boolean> {
  if (!isValidUuid(entryId)) return false;
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("cms_content_entries")
    .select("id")
    .eq("id", entryId)
    .is("deleted_at", null)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function listAdminCmsContentRevisions(
  entryId: string,
): Promise<{ ok: true; items: CmsContentRevision[] } | { ok: false }> {
  await requireAdminPermission("content.revisions.read");
  if (!(await activeEntryExists(entryId))) return { ok: false };

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("cms_content_revisions")
      .select("*")
      .eq("entry_id", entryId)
      .order("revision_number", { ascending: false });

    if (error) return { ok: false };
    return { ok: true, items: (data ?? []).map(mapRevision) };
  } catch {
    return { ok: false };
  }
}

export async function getAdminCmsContentRevision(
  revisionId: string,
): Promise<{ ok: true; item: CmsContentRevision } | { ok: false }> {
  await requireAdminPermission("content.revisions.read");
  if (!isValidUuid(revisionId)) return { ok: false };

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("cms_content_revisions")
      .select("*")
      .eq("id", revisionId)
      .maybeSingle();

    if (error || !data || !(await activeEntryExists(data.entry_id))) {
      return { ok: false };
    }

    return { ok: true, item: mapRevision(data) };
  } catch {
    return { ok: false };
  }
}
