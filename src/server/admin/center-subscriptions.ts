import "server-only";

import { requirePlatformAdmin } from "@/lib/permissions/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";

type CenterSubscriptionRow =
  Database["public"]["Tables"]["center_subscriptions"]["Row"];
type CenterRow = Database["public"]["Tables"]["centers"]["Row"];
type SubscriptionPlanRow =
  Database["public"]["Tables"]["subscription_plans"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const fixedLimit = 100;

const centerSubscriptionSelectColumns =
  "id, center_id, subscription_plan_id, status, billing_interval, currency_code, agreed_price_amount, starts_at, ends_at, trial_ends_at, cancelled_at, notes, sales_profile_id, created_at, updated_at";
const centerSelectColumns =
  "id, name_en, slug, status, verification_status";
const subscriptionPlanSelectColumns =
  "id, name_en, slug, interval, price_amount, currency_code, status";
const salesProfileSelectColumns =
  "id, display_name, full_name, email";

type CenterSubscriptionSelectedRow = Pick<
  CenterSubscriptionRow,
  | "id"
  | "center_id"
  | "subscription_plan_id"
  | "status"
  | "billing_interval"
  | "currency_code"
  | "agreed_price_amount"
  | "starts_at"
  | "ends_at"
  | "trial_ends_at"
  | "cancelled_at"
  | "notes"
  | "sales_profile_id"
  | "created_at"
  | "updated_at"
>;

type CenterSelectedRow = Pick<
  CenterRow,
  "id" | "name_en" | "slug" | "status" | "verification_status"
>;

type SubscriptionPlanSelectedRow = Pick<
  SubscriptionPlanRow,
  "id" | "name_en" | "slug" | "interval" | "price_amount" | "currency_code" | "status"
>;

type SalesProfileSelectedRow = Pick<
  ProfileRow,
  "id" | "display_name" | "full_name" | "email"
>;

export type AdminCenterSubscriptionStatus =
  Database["public"]["Enums"]["center_subscription_status"];
export type AdminPlanInterval = Database["public"]["Enums"]["plan_interval"];
export type AdminSubscriptionPlanStatus =
  Database["public"]["Enums"]["subscription_plan_status"];

export type AdminCenterSubscriptionListItem = {
  id: string;
  status: AdminCenterSubscriptionStatus;
  billingInterval: AdminPlanInterval;
  currencyCode: string;
  agreedPriceAmount: number | null;
  startsAt: string | null;
  endsAt: string | null;
  trialEndsAt: string | null;
  cancelledAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  center: {
    id: string;
    name: string;
    slug: string;
    status: CenterRow["status"];
    verificationStatus: CenterRow["verification_status"];
  } | null;
  plan: {
    id: string;
    name: string;
    slug: string;
    interval: AdminPlanInterval;
    priceAmount: number;
    currencyCode: string;
    status: AdminSubscriptionPlanStatus;
  } | null;
  salesProfile: {
    id: string;
    label: string;
    email: string | null;
  } | null;
};

export type AdminCenterSubscriptionsListResult =
  | {
      ok: true;
      items: AdminCenterSubscriptionListItem[];
      limit: number;
    }
  | {
      ok: false;
      reason: "unavailable";
      items: [];
      limit: number;
    };

function uniqueNonNull(values: Array<string | null>): string[] {
  return Array.from(
    new Set(
      values.filter((value): value is string =>
        typeof value === "string" && value.length > 0,
      ),
    ),
  );
}

function mapRowsById<T extends { id: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((row) => [row.id, row]));
}

function salesProfileLabel(profile: SalesProfileSelectedRow): string {
  return profile.display_name ?? profile.full_name ?? profile.email ?? "Platform sales";
}

function mapCenterSubscription(
  row: CenterSubscriptionSelectedRow,
  centersById: Map<string, CenterSelectedRow>,
  plansById: Map<string, SubscriptionPlanSelectedRow>,
  salesProfilesById: Map<string, SalesProfileSelectedRow>,
): AdminCenterSubscriptionListItem {
  const center = centersById.get(row.center_id) ?? null;
  const plan = plansById.get(row.subscription_plan_id) ?? null;
  const salesProfile =
    row.sales_profile_id === null
      ? null
      : (salesProfilesById.get(row.sales_profile_id) ?? null);

  return {
    id: row.id,
    status: row.status,
    billingInterval: row.billing_interval,
    currencyCode: row.currency_code,
    agreedPriceAmount: row.agreed_price_amount,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    trialEndsAt: row.trial_ends_at,
    cancelledAt: row.cancelled_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    center:
      center === null
        ? null
        : {
            id: center.id,
            name: center.name_en,
            slug: center.slug,
            status: center.status,
            verificationStatus: center.verification_status,
          },
    plan:
      plan === null
        ? null
        : {
            id: plan.id,
            name: plan.name_en,
            slug: plan.slug,
            interval: plan.interval,
            priceAmount: plan.price_amount,
            currencyCode: plan.currency_code,
            status: plan.status,
          },
    salesProfile:
      salesProfile === null
        ? null
        : {
            id: salesProfile.id,
            label: salesProfileLabel(salesProfile),
            email: salesProfile.email,
          },
  };
}

export async function listAdminCenterSubscriptions(): Promise<AdminCenterSubscriptionsListResult> {
  await requirePlatformAdmin();

  const supabase = createSupabaseServiceRoleClient();

  const { data: subscriptionRows, error: subscriptionError } = await supabase
    .from("center_subscriptions")
    .select(centerSubscriptionSelectColumns)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(fixedLimit);

  if (subscriptionError !== null || subscriptionRows === null) {
    return { ok: false, reason: "unavailable", items: [], limit: fixedLimit };
  }

  const centerIds = uniqueNonNull(subscriptionRows.map((row) => row.center_id));
  const planIds = uniqueNonNull(
    subscriptionRows.map((row) => row.subscription_plan_id),
  );
  const salesProfileIds = uniqueNonNull(
    subscriptionRows.map((row) => row.sales_profile_id),
  );

  const centersResult = centerIds.length === 0
    ? { data: [] as CenterSelectedRow[], error: null }
    : await supabase
        .from("centers")
        .select(centerSelectColumns)
        .in("id", centerIds)
        .is("deleted_at", null);

  if (centersResult.error !== null || centersResult.data === null) {
    return { ok: false, reason: "unavailable", items: [], limit: fixedLimit };
  }

  const plansResult = planIds.length === 0
    ? { data: [] as SubscriptionPlanSelectedRow[], error: null }
    : await supabase
        .from("subscription_plans")
        .select(subscriptionPlanSelectColumns)
        .in("id", planIds)
        .is("deleted_at", null);

  if (plansResult.error !== null || plansResult.data === null) {
    return { ok: false, reason: "unavailable", items: [], limit: fixedLimit };
  }

  const salesProfilesResult = salesProfileIds.length === 0
    ? { data: [] as SalesProfileSelectedRow[], error: null }
    : await supabase
        .from("profiles")
        .select(salesProfileSelectColumns)
        .in("id", salesProfileIds)
        .is("deleted_at", null);

  if (salesProfilesResult.error !== null || salesProfilesResult.data === null) {
    return { ok: false, reason: "unavailable", items: [], limit: fixedLimit };
  }

  const centersById = mapRowsById(centersResult.data);
  const plansById = mapRowsById(plansResult.data);
  const salesProfilesById = mapRowsById(salesProfilesResult.data);

  return {
    ok: true,
    items: subscriptionRows.map((row) =>
      mapCenterSubscription(row, centersById, plansById, salesProfilesById),
    ),
    limit: fixedLimit,
  };
}
