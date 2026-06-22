"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { AdminPermissionKey } from "@/lib/admin/permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database, Json } from "@/lib/supabase/types";
import { writeAdminAuditEvent, type AdminAuditAction } from "@/server/admin/audit-log";
import { isCmsContentType, isValidUuid, type CmsStatus } from "@/server/admin/cms-content";
import { requireAdminPermission, type CurrentAdminContext } from "@/server/admin/permissions";

type ActionState = { ok: boolean; message: string };
type SupabaseServiceClient = ReturnType<typeof createSupabaseServiceRoleClient>;
type CmsEntryRow = Database["public"]["Tables"]["cms_content_entries"]["Row"];
type CmsEntryInsert = Database["public"]["Tables"]["cms_content_entries"]["Insert"];
type CmsEntryUpdate = Database["public"]["Tables"]["cms_content_entries"]["Update"];
type CmsRevisionRow = Database["public"]["Tables"]["cms_content_revisions"]["Row"];
type CmsRevisionInsert = Database["public"]["Tables"]["cms_content_revisions"]["Insert"];
type CmsRevisionUpdate = Database["public"]["Tables"]["cms_content_revisions"]["Update"];
type SafeAuditValues = {
  content_key?: string | null;
  content_type?: string | null;
  locale?: string | null;
  status?: string | null;
  revision_number?: number | null;
  title?: string | null;
};

type RevisionPayload = {
  title_en: string | null;
  title_ar: string | null;
  summary_en: string | null;
  summary_ar: string | null;
  seo_title_en: string | null;
  seo_title_ar: string | null;
  seo_description_en: string | null;
  seo_description_ar: string | null;
  body_en: Json;
  body_ar: Json;
  metadata: Json;
  review_note: string | null;
};

const max = {
  contentKey: 160,
  slug: 160,
  title: 220,
  summary: 500,
  seoTitle: 70,
  seoDescription: 170,
  reviewNote: 1000,
};

const entryTransitions: Record<CmsStatus, CmsStatus[]> = {
  draft: ["in_review", "archived"],
  in_review: ["approved", "rejected"],
  approved: ["archived"],
  rejected: [],
  published: [],
  archived: ["draft"],
};

const revisionTransitions: Record<CmsStatus, CmsStatus[]> = {
  draft: ["in_review"],
  in_review: ["approved", "rejected"],
  approved: ["archived"],
  rejected: [],
  published: [],
  archived: [],
};

function readText(formData: FormData, key: string, limit: number, required = false): string | null {
  const raw = String(formData.get(key) ?? "").trim();

  if (!raw) {
    if (required) throw new Error(`${key} is required.`);
    return null;
  }

  if (raw.length > limit) throw new Error(`${key} is too long.`);
  return raw;
}

function parseJsonObject(formData: FormData, key: string): Json {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return {};

  const parsed: unknown = JSON.parse(raw);
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error(`${key} must be a JSON object.`);
  }

  return parsed as Json;
}

function readLocale(formData: FormData): "en" | "ar" | null {
  const value = String(formData.get("locale") ?? "").trim();
  if (!value) return null;
  if (value === "en" || value === "ar") return value;
  throw new Error("Locale must be English, Arabic, or blank.");
}

function safeError(error: unknown): ActionState {
  if (error instanceof SyntaxError) {
    return { ok: false, message: "JSON fields must contain valid JSON objects." };
  }

  return {
    ok: false,
    message: error instanceof Error ? error.message : "CMS action could not be completed.",
  };
}

function buildRevisionPayload(formData: FormData): RevisionPayload {
  return {
    title_en: readText(formData, "titleEn", max.title),
    title_ar: readText(formData, "titleAr", max.title),
    summary_en: readText(formData, "summaryEn", max.summary),
    summary_ar: readText(formData, "summaryAr", max.summary),
    seo_title_en: readText(formData, "seoTitleEn", max.seoTitle),
    seo_title_ar: readText(formData, "seoTitleAr", max.seoTitle),
    seo_description_en: readText(formData, "seoDescriptionEn", max.seoDescription),
    seo_description_ar: readText(formData, "seoDescriptionAr", max.seoDescription),
    body_en: parseJsonObject(formData, "bodyEn"),
    body_ar: parseJsonObject(formData, "bodyAr"),
    metadata: parseJsonObject(formData, "metadata"),
    review_note: readText(formData, "reviewNote", max.reviewNote),
  };
}

function createAuditSummary(input: SafeAuditValues): SafeAuditValues {
  return {
    content_key: input.content_key ?? null,
    content_type: input.content_type ?? null,
    locale: input.locale ?? null,
    status: input.status ?? null,
    revision_number: input.revision_number ?? null,
    title: input.title ?? null,
  };
}

function revisionTitle(revision: Pick<CmsRevisionRow, "title_en" | "title_ar">): string | null {
  return revision.title_en ?? revision.title_ar;
}

function entryTitle(entry: Pick<CmsEntryRow, "title_en" | "title_ar">): string | null {
  return entry.title_en ?? entry.title_ar;
}

async function readEntry(supabase: SupabaseServiceClient, entryId: string): Promise<CmsEntryRow> {
  if (!isValidUuid(entryId)) throw new Error("Invalid CMS entry.");

  const { data, error } = await supabase
    .from("cms_content_entries")
    .select("*")
    .eq("id", entryId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) throw new Error("CMS entry could not be loaded.");
  return data;
}

async function readRevision(supabase: SupabaseServiceClient, revisionId: string): Promise<CmsRevisionRow> {
  if (!isValidUuid(revisionId)) throw new Error("Invalid CMS revision.");

  const { data, error } = await supabase
    .from("cms_content_revisions")
    .select("*")
    .eq("id", revisionId)
    .maybeSingle();

  if (error || !data) throw new Error("CMS revision could not be loaded.");
  return data;
}

async function readCurrentRevision(
  supabase: SupabaseServiceClient,
  entry: CmsEntryRow,
): Promise<CmsRevisionRow | null> {
  if (!entry.current_revision_id) return null;

  const revision = await readRevision(supabase, entry.current_revision_id);
  if (revision.entry_id !== entry.id) {
    throw new Error("Current CMS revision does not belong to this entry.");
  }

  return revision;
}

function validateEntryTransition(current: CmsStatus, next: CmsStatus): void {
  if (!entryTransitions[current]?.includes(next)) {
    throw new Error("CMS entry status transition is not allowed.");
  }
}

function validateRevisionTransition(current: CmsStatus, next: CmsStatus): void {
  if (!revisionTransitions[current]?.includes(next)) {
    throw new Error("CMS revision status transition is not allowed.");
  }
}

async function latestRevisionNumber(supabase: SupabaseServiceClient, entryId: string): Promise<number> {
  const { data } = await supabase
    .from("cms_content_revisions")
    .select("revision_number")
    .eq("entry_id", entryId)
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.revision_number ?? 0;
}

async function writeCmsAuditEvent(input: {
  admin: CurrentAdminContext;
  permissionKey: AdminPermissionKey;
  action: AdminAuditAction;
  entityType: "cms_content_entry" | "cms_content_revision";
  entityId: string;
  targetTable: "cms_content_entries" | "cms_content_revisions";
  summary: string;
  oldValues?: SafeAuditValues;
  newValues?: SafeAuditValues;
}): Promise<void> {
  const auditInput = {
    admin: input.admin,
    permissionKey: input.permissionKey,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    targetTable: input.targetTable,
    summary: input.summary,
  };

  await writeAdminAuditEvent({
    ...auditInput,
    ...(input.oldValues ? { oldValues: createAuditSummary(input.oldValues) } : {}),
    ...(input.newValues ? { newValues: createAuditSummary(input.newValues) } : {}),
  });
}

export async function createAdminCmsContentEntry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let newId: string | null = null;

  try {
    const admin = await requireAdminPermission("content.create");
    const contentKey = readText(formData, "contentKey", max.contentKey, true)!;
    const contentType = String(formData.get("contentType") ?? "");

    if (!isCmsContentType(contentType)) {
      throw new Error("Content type is not allowed.");
    }

    const supabase = createSupabaseServiceRoleClient();
    const revisionPayload = buildRevisionPayload(formData);
    const entryPayload: CmsEntryInsert = {
      created_by_profile_id: admin.profile.id,
      updated_by_profile_id: admin.profile.id,
      content_key: contentKey,
      content_type: contentType,
      locale: readLocale(formData),
      country: "om",
      title_en: revisionPayload.title_en,
      title_ar: revisionPayload.title_ar,
      slug: readText(formData, "slug", max.slug),
      metadata: revisionPayload.metadata,
      status: "draft",
    };

    const { data: entry, error: entryError } = await supabase
      .from("cms_content_entries")
      .insert(entryPayload)
      .select("*")
      .single();

    if (entryError) throw new Error("CMS entry could not be created.");

    const initialRevision: CmsRevisionInsert = {
      ...revisionPayload,
      entry_id: entry.id,
      created_by_profile_id: admin.profile.id,
      revision_number: 1,
      status: "draft",
    };

    const { data: revision, error: revisionError } = await supabase
      .from("cms_content_revisions")
      .insert(initialRevision)
      .select("*")
      .single();

    if (revisionError) throw new Error("CMS revision could not be created.");

    await supabase
      .from("cms_content_entries")
      .update({ current_revision_id: revision.id })
      .eq("id", entry.id);

    newId = entry.id;

    await writeCmsAuditEvent({
      admin,
      permissionKey: "content.create",
      action: "cms_content.entry_created",
      entityType: "cms_content_entry",
      entityId: entry.id,
      targetTable: "cms_content_entries",
      summary: "CMS content entry created as an internal draft.",
      newValues: {
        status: "draft",
        title: entryTitle(entry),
        content_type: contentType,
        locale: entry.locale,
        content_key: contentKey,
      },
    });

    await writeCmsAuditEvent({
      admin,
      permissionKey: "content.create",
      action: "cms_content.revision_created",
      entityType: "cms_content_revision",
      entityId: revision.id,
      targetTable: "cms_content_revisions",
      summary: "Initial CMS content revision created.",
      newValues: {
        status: "draft",
        title: revisionTitle(revision),
        revision_number: 1,
      },
    });
  } catch (error) {
    return safeError(error);
  }

  revalidatePath("/admin/content");
  redirect(`/admin/content/${newId}`);
}

export async function updateAdminCmsContentDraft(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const admin = await requireAdminPermission("content.update");
    const entryId = String(formData.get("entryId") ?? "");
    const supabase = createSupabaseServiceRoleClient();
    const entry = await readEntry(supabase, entryId);

    if (!["draft", "rejected"].includes(entry.status)) {
      throw new Error("Only draft or rejected CMS entries can be edited.");
    }

    const revisionPayload = buildRevisionPayload(formData);
    const entryPatch: CmsEntryUpdate = {
      updated_by_profile_id: admin.profile.id,
      title_en: revisionPayload.title_en,
      title_ar: revisionPayload.title_ar,
      slug: readText(formData, "slug", max.slug),
      metadata: revisionPayload.metadata,
      status: "draft",
      is_archived: false,
    };

    const { error: entryError } = await supabase
      .from("cms_content_entries")
      .update(entryPatch)
      .eq("id", entryId)
      .is("deleted_at", null);

    if (entryError) throw new Error("CMS entry could not be updated.");

    if (entry.current_revision_id) {
      const revisionPatch: CmsRevisionUpdate = {
        ...revisionPayload,
        status: "draft",
      };

      const { error: revisionError } = await supabase
        .from("cms_content_revisions")
        .update(revisionPatch)
        .eq("id", entry.current_revision_id)
        .eq("entry_id", entry.id);

      if (revisionError) throw new Error("CMS revision could not be updated.");

      await writeCmsAuditEvent({
        admin,
        permissionKey: "content.update",
        action: "cms_content.revision_updated",
        entityType: "cms_content_revision",
        entityId: entry.current_revision_id,
        targetTable: "cms_content_revisions",
        summary: "CMS draft revision updated.",
        newValues: {
          status: "draft",
          title: revisionPayload.title_en ?? revisionPayload.title_ar ?? null,
        },
      });
    }

    await writeCmsAuditEvent({
      admin,
      permissionKey: "content.update",
      action: "cms_content.entry_updated",
      entityType: "cms_content_entry",
      entityId: entryId,
      targetTable: "cms_content_entries",
      summary: "CMS content entry draft metadata updated.",
      oldValues: {
        status: entry.status,
        title: entryTitle(entry),
        content_key: entry.content_key,
        content_type: entry.content_type,
        locale: entry.locale,
      },
      newValues: {
        status: "draft",
        title: revisionPayload.title_en ?? revisionPayload.title_ar ?? null,
        content_key: entry.content_key,
        content_type: entry.content_type,
        locale: entry.locale,
      },
    });

    revalidatePath(`/admin/content/${entryId}`);
    return { ok: true, message: "CMS draft saved." };
  } catch (error) {
    return safeError(error);
  }
}

export async function createAdminCmsContentRevision(entryId: string): Promise<void> {
  const admin = await requireAdminPermission("content.update");
  const supabase = createSupabaseServiceRoleClient();
  const entry = await readEntry(supabase, entryId);
  const source = await readCurrentRevision(supabase, entry);
  const revisionNumber = (await latestRevisionNumber(supabase, entry.id)) + 1;

  if (source && source.entry_id !== entry.id) {
    throw new Error("Current CMS revision does not belong to this entry.");
  }

  const revisionPayload: CmsRevisionInsert = {
    entry_id: entry.id,
    created_by_profile_id: admin.profile.id,
    revision_number: revisionNumber,
    status: "draft",
    title_en: source?.title_en ?? entry.title_en,
    title_ar: source?.title_ar ?? entry.title_ar,
    summary_en: source?.summary_en ?? null,
    summary_ar: source?.summary_ar ?? null,
    body_en: source?.body_en ?? {},
    body_ar: source?.body_ar ?? {},
    seo_title_en: source?.seo_title_en ?? null,
    seo_title_ar: source?.seo_title_ar ?? null,
    seo_description_en: source?.seo_description_en ?? null,
    seo_description_ar: source?.seo_description_ar ?? null,
    metadata: source?.metadata ?? {},
  };

  const { data: revision, error: revisionError } = await supabase
    .from("cms_content_revisions")
    .insert(revisionPayload)
    .select("*")
    .single();

  if (revisionError) throw new Error("CMS revision could not be created.");

  const { error: entryError } = await supabase
    .from("cms_content_entries")
    .update({ current_revision_id: revision.id, status: "draft", is_archived: false })
    .eq("id", entry.id)
    .is("deleted_at", null);

  if (entryError) throw new Error("CMS entry could not be updated.");

  await writeCmsAuditEvent({
    admin,
    permissionKey: "content.update",
    action: "cms_content.revision_created",
    entityType: "cms_content_revision",
    entityId: revision.id,
    targetTable: "cms_content_revisions",
    summary: "New CMS draft revision created.",
    newValues: {
      status: "draft",
      revision_number: revisionNumber,
      title: revisionTitle(revision),
    },
  });

  revalidatePath(`/admin/content/${entry.id}`);
}

async function transitionRevision(input: {
  revisionId: string;
  nextStatus: CmsStatus;
  permissionKey: AdminPermissionKey;
  action: AdminAuditAction;
  note?: string | undefined;
}): Promise<void> {
  const admin = await requireAdminPermission(input.permissionKey);
  const supabase = createSupabaseServiceRoleClient();
  const revision = await readRevision(supabase, input.revisionId);
  const entry = await readEntry(supabase, revision.entry_id);

  if (revision.entry_id !== entry.id) {
    throw new Error("CMS revision does not belong to this entry.");
  }

  if (entry.current_revision_id !== revision.id) {
    throw new Error("Only the current CMS revision can update entry workflow status.");
  }

  validateRevisionTransition(revision.status as CmsStatus, input.nextStatus);
  validateEntryTransition(entry.status as CmsStatus, input.nextStatus);

  const revisionPatch: CmsRevisionUpdate = {
    status: input.nextStatus,
    review_note: input.note ?? revision.review_note,
  };

  if (input.nextStatus === "approved") {
    revisionPatch.approved_at = new Date().toISOString();
    revisionPatch.approved_by_profile_id = admin.profile.id;
  }

  if (input.nextStatus === "rejected") {
    revisionPatch.rejected_at = new Date().toISOString();
    revisionPatch.rejected_by_profile_id = admin.profile.id;
  }

  const { error: revisionError } = await supabase
    .from("cms_content_revisions")
    .update(revisionPatch)
    .eq("id", revision.id)
    .eq("entry_id", entry.id);

  if (revisionError) throw new Error("CMS revision workflow could not be updated.");

  const { error: entryError } = await supabase
    .from("cms_content_entries")
    .update({ status: input.nextStatus, updated_by_profile_id: admin.profile.id })
    .eq("id", entry.id)
    .eq("current_revision_id", revision.id)
    .is("deleted_at", null);

  if (entryError) throw new Error("CMS entry workflow could not be updated.");

  await writeCmsAuditEvent({
    admin,
    permissionKey: input.permissionKey,
    action: input.action,
    entityType: "cms_content_revision",
    entityId: revision.id,
    targetTable: "cms_content_revisions",
    summary: `CMS revision moved to ${input.nextStatus}.`,
    oldValues: {
      status: revision.status,
      revision_number: revision.revision_number,
      title: revisionTitle(revision),
      content_key: entry.content_key,
      content_type: entry.content_type,
      locale: entry.locale,
    },
    newValues: {
      status: input.nextStatus,
      revision_number: revision.revision_number,
      title: revisionTitle(revision),
      content_key: entry.content_key,
      content_type: entry.content_type,
      locale: entry.locale,
    },
  });

  revalidatePath(`/admin/content/${entry.id}`);
}

export async function submitAdminCmsRevisionForReview(formData: FormData): Promise<void> {
  await transitionRevision({
    revisionId: String(formData.get("revisionId") ?? ""),
    nextStatus: "in_review",
    permissionKey: "content.submit_review",
    action: "cms_content.submitted_for_review",
    note: readText(formData, "reviewNote", max.reviewNote) ?? undefined,
  });
}

export async function approveAdminCmsRevision(formData: FormData): Promise<void> {
  await transitionRevision({
    revisionId: String(formData.get("revisionId") ?? ""),
    nextStatus: "approved",
    permissionKey: "content.approve",
    action: "cms_content.revision_approved",
    note: readText(formData, "reviewNote", max.reviewNote) ?? undefined,
  });
}

export async function rejectAdminCmsRevision(formData: FormData): Promise<void> {
  await transitionRevision({
    revisionId: String(formData.get("revisionId") ?? ""),
    nextStatus: "rejected",
    permissionKey: "content.reject",
    action: "cms_content.revision_rejected",
    note: readText(formData, "reviewNote", max.reviewNote) ?? undefined,
  });
}

export async function archiveAdminCmsContentEntry(formData: FormData): Promise<void> {
  const admin = await requireAdminPermission("content.archive");
  const entryId = String(formData.get("entryId") ?? "");
  const supabase = createSupabaseServiceRoleClient();
  const entry = await readEntry(supabase, entryId);

  validateEntryTransition(entry.status as CmsStatus, "archived");

  const { error } = await supabase
    .from("cms_content_entries")
    .update({ status: "archived", is_archived: true, updated_by_profile_id: admin.profile.id })
    .eq("id", entry.id)
    .is("deleted_at", null);

  if (error) throw new Error("CMS entry could not be archived.");

  await writeCmsAuditEvent({
    admin,
    permissionKey: "content.archive",
    action: "cms_content.entry_archived",
    entityType: "cms_content_entry",
    entityId: entry.id,
    targetTable: "cms_content_entries",
    summary: "CMS content entry archived internally.",
    oldValues: {
      status: entry.status,
      content_key: entry.content_key,
      content_type: entry.content_type,
      locale: entry.locale,
      title: entryTitle(entry),
    },
    newValues: {
      status: "archived",
      content_key: entry.content_key,
      content_type: entry.content_type,
      locale: entry.locale,
      title: entryTitle(entry),
    },
  });

  revalidatePath(`/admin/content/${entry.id}`);
}

export async function restoreAdminCmsContentEntry(formData: FormData): Promise<void> {
  const admin = await requireAdminPermission("content.archive");
  const entryId = String(formData.get("entryId") ?? "");
  const supabase = createSupabaseServiceRoleClient();
  const entry = await readEntry(supabase, entryId);

  validateEntryTransition(entry.status as CmsStatus, "draft");

  const { error } = await supabase
    .from("cms_content_entries")
    .update({ status: "draft", is_archived: false, updated_by_profile_id: admin.profile.id })
    .eq("id", entry.id)
    .is("deleted_at", null);

  if (error) throw new Error("CMS entry could not be restored.");

  await writeCmsAuditEvent({
    admin,
    permissionKey: "content.archive",
    action: "cms_content.entry_restored",
    entityType: "cms_content_entry",
    entityId: entry.id,
    targetTable: "cms_content_entries",
    summary: "CMS content entry restored to draft internally.",
    oldValues: {
      status: entry.status,
      content_key: entry.content_key,
      content_type: entry.content_type,
      locale: entry.locale,
      title: entryTitle(entry),
    },
    newValues: {
      status: "draft",
      content_key: entry.content_key,
      content_type: entry.content_type,
      locale: entry.locale,
      title: entryTitle(entry),
    },
  });

  revalidatePath(`/admin/content/${entry.id}`);
}
