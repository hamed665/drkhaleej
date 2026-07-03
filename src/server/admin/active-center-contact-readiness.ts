import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";
import { requireAdminPermission } from "@/server/admin/permissions";

type CenterRow = Database["public"]["Tables"]["centers"]["Row"];
type CenterLocationRow = Database["public"]["Tables"]["center_locations"]["Row"];

type CenterContactRow = Pick<
  CenterRow,
  | "id"
  | "primary_phone"
  | "secondary_phone"
  | "whatsapp_phone"
  | "email"
  | "website_url"
  | "public_primary_phone_visible"
  | "public_secondary_phone_visible"
  | "public_whatsapp_phone_visible"
  | "public_email_visible"
  | "contact_review_status"
>;

type LocationRow = Pick<CenterLocationRow, "id" | "map_url" | "is_active" | "is_primary" | "sort_order">;

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

export type ActiveCenterContactReadiness = {
  contactReviewStatus: string | null;
  hasPrimaryPhone: boolean;
  hasSecondaryPhone: boolean;
  hasWhatsappPhone: boolean;
  hasEmail: boolean;
  hasWebsite: boolean;
  publicPrimaryPhoneVisible: boolean;
  publicSecondaryPhoneVisible: boolean;
  publicWhatsappPhoneVisible: boolean;
  publicEmailVisible: boolean;
  centerRenderableActionCount: number;
  primaryLocationId: string | null;
  hasPrimaryLocationMapUrl: boolean;
};

export type ActiveCenterContactReadinessResult =
  | { ok: true; readiness: ActiveCenterContactReadiness }
  | { ok: false; reason: "not_found" | "unavailable" };

function client(): UntypedSupabaseClient {
  return createSupabaseServiceRoleClient() as unknown as UntypedSupabaseClient;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function countRenderableCenterActions(center: CenterContactRow): number {
  const approved = center.contact_review_status === "approved";
  if (!approved) return 0;

  return [
    center.public_primary_phone_visible === true && hasText(center.primary_phone),
    center.public_secondary_phone_visible === true && hasText(center.secondary_phone),
    center.public_whatsapp_phone_visible === true && hasText(center.whatsapp_phone),
    center.public_email_visible === true && hasText(center.email),
    hasText(center.website_url),
  ].filter(Boolean).length;
}

async function getPrimaryLocation(centerId: string): Promise<LocationRow | null> {
  const { data, error } = await client()
    .from<LocationRow>("center_locations")
    .select("id,map_url,is_active,is_primary,sort_order")
    .eq("center_id", centerId)
    .eq("is_active", true)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error !== null) return null;
  return data;
}

export async function getActiveCenterContactReadiness(centerId: string): Promise<ActiveCenterContactReadinessResult> {
  await requireAdminPermission("active_centers.public_state.update");

  if (!isUuid(centerId)) return { ok: false, reason: "not_found" };

  const { data: center, error } = await client()
    .from<CenterContactRow>("centers")
    .select("id,primary_phone,secondary_phone,whatsapp_phone,email,website_url,public_primary_phone_visible,public_secondary_phone_visible,public_whatsapp_phone_visible,public_email_visible,contact_review_status")
    .eq("id", centerId)
    .maybeSingle();

  if (error !== null) return { ok: false, reason: "unavailable" };
  if (center === null) return { ok: false, reason: "not_found" };

  const location = await getPrimaryLocation(centerId);

  return {
    ok: true,
    readiness: {
      contactReviewStatus: center.contact_review_status,
      hasPrimaryPhone: hasText(center.primary_phone),
      hasSecondaryPhone: hasText(center.secondary_phone),
      hasWhatsappPhone: hasText(center.whatsapp_phone),
      hasEmail: hasText(center.email),
      hasWebsite: hasText(center.website_url),
      publicPrimaryPhoneVisible: center.public_primary_phone_visible === true,
      publicSecondaryPhoneVisible: center.public_secondary_phone_visible === true,
      publicWhatsappPhoneVisible: center.public_whatsapp_phone_visible === true,
      publicEmailVisible: center.public_email_visible === true,
      centerRenderableActionCount: countRenderableCenterActions(center),
      primaryLocationId: location?.id ?? null,
      hasPrimaryLocationMapUrl: hasText(location?.map_url),
    },
  };
}
