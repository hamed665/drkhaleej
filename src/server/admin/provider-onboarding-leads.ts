import "server-only";

import { requirePlatformAdmin } from "@/lib/permissions/admin";
import { requireAdminPermission } from "@/server/admin/permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";

const allowedStatuses = [
  "new",
  "reviewing",
  "contacted",
  "qualified",
  "rejected",
  "converted",
  "closed",
] as const;

const allowedPriorities = ["low", "normal", "high"] as const;

const defaultLimit = 50;
const maxLimit = 100;
const messagePreviewMaxLength = 120;

export type ProviderOnboardingLeadStatus = (typeof allowedStatuses)[number];
export type ProviderOnboardingLeadPriority = (typeof allowedPriorities)[number];

type ProviderOnboardingLeadRow =
  Database["public"]["Tables"]["provider_onboarding_leads"]["Row"];
type ProviderOnboardingLeadEventRow =
  Database["public"]["Tables"]["provider_onboarding_lead_events"]["Row"];

type AdminProviderOnboardingLeadSelectedRow = Pick<
  ProviderOnboardingLeadRow,
  | "id"
  | "created_at"
  | "updated_at"
  | "center_name"
  | "contact_name"
  | "phone"
  | "email"
  | "whatsapp"
  | "provider_type"
  | "area_text"
  | "city_text"
  | "preferred_language"
  | "status"
  | "priority"
  | "message"
  | "request_source"
  | "consent_to_contact"
  | "handled_at"
  | "metadata"
>;

export type AdminProviderOnboardingLeadListItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  centerName: string;
  contactName: string;
  phone: string;
  email: string | null;
  whatsapp: string | null;
  providerType: string;
  areaText: string | null;
  cityText: string | null;
  preferredLanguage: string | null;
  status: ProviderOnboardingLeadStatus;
  priority: ProviderOnboardingLeadPriority;
  messagePreview: string | null;
  requestSource: string;
};

export type AdminProviderOnboardingLeadDetail =
  AdminProviderOnboardingLeadListItem & {
    message: string | null;
    consentToContact: boolean;
    handledAt: string | null;
    metadata: ProviderOnboardingLeadRow["metadata"];
  };

export type AdminProviderOnboardingLeadEvent = {
  id: string;
  actorProfileId: string | null;
  eventType: string;
  oldStatus: string | null;
  newStatus: string | null;
  oldPriority: string | null;
  newPriority: string | null;
  noteText: string | null;
  metadata: ProviderOnboardingLeadEventRow["metadata"];
  createdAt: string;
};

export type AdminProviderOnboardingLeadEventsResult =
  | {
      ok: true;
      events: AdminProviderOnboardingLeadEvent[];
    }
  | {
      ok: false;
      reason: "not_found" | "unavailable";
      events: [];
    };

export type AdminProviderOnboardingLeadListFilters = {
  status?: ProviderOnboardingLeadStatus | string | null;
  priority?: ProviderOnboardingLeadPriority | string | null;
  createdFrom?: string | null;
  createdTo?: string | null;
  limit?: number | null;
  offset?: number | null;
};

export type AdminProviderOnboardingLeadListResult =
  | {
      ok: true;
      items: AdminProviderOnboardingLeadListItem[];
      totalCount: number;
      limit: number;
      offset: number;
    }
  | {
      ok: false;
      reason: "unavailable";
      items: [];
      totalCount: 0;
      limit: number;
      offset: number;
    };

export type AdminProviderOnboardingLeadDetailResult =
  | {
      ok: true;
      lead: AdminProviderOnboardingLeadDetail;
    }
  | {
      ok: false;
      reason: "not_found" | "unavailable";
    };

const leadSelectColumns =
  "id, created_at, updated_at, center_name, contact_name, phone, email, whatsapp, provider_type, area_text, city_text, preferred_language, status, priority, message, request_source, consent_to_contact, handled_at, metadata";
const leadEventSelectColumns =
  "id, actor_profile_id, event_type, old_status, new_status, old_priority, new_priority, note_text, metadata, created_at";

function isAllowedStatus(
  status: string | null | undefined,
): status is ProviderOnboardingLeadStatus {
  return allowedStatuses.some((allowedStatus) => allowedStatus === status);
}

function isAllowedPriority(
  priority: string | null | undefined,
): priority is ProviderOnboardingLeadPriority {
  return allowedPriorities.some(
    (allowedPriority) => allowedPriority === priority,
  );
}

function normalizeStatus(status: string): ProviderOnboardingLeadStatus {
  return isAllowedStatus(status) ? status : "new";
}

function normalizePriority(priority: string): ProviderOnboardingLeadPriority {
  return isAllowedPriority(priority) ? priority : "normal";
}

function normalizeLimit(limit: number | null | undefined): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return defaultLimit;
  }

  return Math.min(Math.max(Math.trunc(limit), 1), maxLimit);
}

function normalizeOffset(offset: number | null | undefined): number {
  if (typeof offset !== "number" || !Number.isFinite(offset)) {
    return 0;
  }

  return Math.max(Math.trunc(offset), 0);
}

function normalizeIsoDate(value: string | null | undefined): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function createMessagePreview(message: string | null): string | null {
  if (message === null) return null;

  const normalizedMessage = message.replace(/\s+/g, " ").trim();
  if (normalizedMessage.length === 0) return null;

  return normalizedMessage.length > messagePreviewMaxLength
    ? normalizedMessage.slice(0, messagePreviewMaxLength)
    : normalizedMessage;
}

function mapLeadToListItem(
  row: AdminProviderOnboardingLeadSelectedRow,
): AdminProviderOnboardingLeadListItem {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    centerName: row.center_name,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email,
    whatsapp: row.whatsapp,
    providerType: row.provider_type,
    areaText: row.area_text,
    cityText: row.city_text,
    preferredLanguage: row.preferred_language,
    status: normalizeStatus(row.status),
    priority: normalizePriority(row.priority),
    messagePreview: createMessagePreview(row.message),
    requestSource: row.request_source,
  };
}

function mapLeadToDetail(
  row: AdminProviderOnboardingLeadSelectedRow,
): AdminProviderOnboardingLeadDetail {
  return {
    ...mapLeadToListItem(row),
    message: row.message,
    consentToContact: row.consent_to_contact,
    handledAt: row.handled_at,
    metadata: row.metadata,
  };
}

function mapLeadEvent(
  row: Pick<
    ProviderOnboardingLeadEventRow,
    | "id"
    | "actor_profile_id"
    | "event_type"
    | "old_status"
    | "new_status"
    | "old_priority"
    | "new_priority"
    | "note_text"
    | "metadata"
    | "created_at"
  >,
): AdminProviderOnboardingLeadEvent {
  return {
    id: row.id,
    actorProfileId: row.actor_profile_id,
    eventType: row.event_type,
    oldStatus: row.old_status,
    newStatus: row.new_status,
    oldPriority: row.old_priority,
    newPriority: row.new_priority,
    noteText: row.note_text,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function listAdminProviderOnboardingLeads(
  filters: AdminProviderOnboardingLeadListFilters = {},
): Promise<AdminProviderOnboardingLeadListResult> {
  await requirePlatformAdmin();
  await requireAdminPermission("provider_leads.read");

  const limit = normalizeLimit(filters.limit);
  const offset = normalizeOffset(filters.offset);
  const status = isAllowedStatus(filters.status) ? filters.status : null;
  const priority = isAllowedPriority(filters.priority)
    ? filters.priority
    : null;
  const createdFrom = normalizeIsoDate(filters.createdFrom);
  const createdTo = normalizeIsoDate(filters.createdTo);

  const supabase = createSupabaseServiceRoleClient();

  let query = supabase
    .from("provider_onboarding_leads")
    .select(leadSelectColumns, { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status !== null) {
    query = query.eq("status", status);
  }

  if (priority !== null) {
    query = query.eq("priority", priority);
  }

  if (createdFrom !== null) {
    query = query.gte("created_at", createdFrom);
  }

  if (createdTo !== null) {
    query = query.lte("created_at", createdTo);
  }

  const { data, error, count } = await query;

  if (error !== null || data === null) {
    return {
      ok: false,
      reason: "unavailable",
      items: [],
      totalCount: 0,
      limit,
      offset,
    };
  }

  return {
    ok: true,
    items: data.map(mapLeadToListItem),
    totalCount: count ?? 0,
    limit,
    offset,
  };
}

export async function getAdminProviderOnboardingLeadById(
  id: string,
): Promise<AdminProviderOnboardingLeadDetailResult> {
  await requireAdminPermission("provider_leads.read");

  if (!isUuid(id)) {
    return { ok: false, reason: "not_found" };
  }

  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("provider_onboarding_leads")
    .select(leadSelectColumns)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error !== null) {
    return { ok: false, reason: "unavailable" };
  }

  if (data === null) {
    return { ok: false, reason: "not_found" };
  }

  return {
    ok: true,
    lead: mapLeadToDetail(data),
  };
}

export async function listProviderOnboardingLeadEvents(
  leadId: string,
): Promise<AdminProviderOnboardingLeadEventsResult> {
  await requireAdminPermission("provider_leads.read");

  if (!isUuid(leadId)) {
    return { ok: false, reason: "not_found", events: [] };
  }

  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("provider_onboarding_lead_events")
    .select(leadEventSelectColumns)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error !== null || data === null) {
    return { ok: false, reason: "unavailable", events: [] };
  }

  return {
    ok: true,
    events: data.map(mapLeadEvent),
  };
}
