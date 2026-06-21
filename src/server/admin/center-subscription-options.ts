import "server-only";

import { requireAdminPermission } from "@/server/admin/permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";

type CenterRow = Database["public"]["Tables"]["centers"]["Row"];
type SubscriptionPlanRow =
  Database["public"]["Tables"]["subscription_plans"]["Row"];

export type AdminCenterSubscriptionCenterOption = Pick<
  CenterRow,
  "id" | "name_en" | "slug" | "status" | "verification_status"
>;

export type AdminCenterSubscriptionPlanOption = Pick<
  SubscriptionPlanRow,
  | "id"
  | "name_en"
  | "slug"
  | "interval"
  | "price_amount"
  | "currency_code"
  | "status"
>;

export type AdminCenterSubscriptionAssignmentOptionsResult =
  | {
      ok: true;
      centers: AdminCenterSubscriptionCenterOption[];
      plans: AdminCenterSubscriptionPlanOption[];
      limit: number;
    }
  | {
      ok: false;
      reason: "unavailable";
      centers: [];
      plans: [];
      limit: number;
    };

const fixedLimit = 100;
const centerSelectColumns =
  "id, name_en, slug, status, verification_status";
const subscriptionPlanSelectColumns =
  "id, name_en, slug, interval, price_amount, currency_code, status";

export async function listAdminCenterSubscriptionAssignmentOptions(): Promise<AdminCenterSubscriptionAssignmentOptionsResult> {
  await requireAdminPermission("subscriptions.read");

  const supabase = createSupabaseServiceRoleClient();

  const [centersResult, plansResult] = await Promise.all([
    supabase
      .from("centers")
      .select(centerSelectColumns)
      .is("deleted_at", null)
      .order("name_en", { ascending: true })
      .limit(fixedLimit),
    supabase
      .from("subscription_plans")
      .select(subscriptionPlanSelectColumns)
      .is("deleted_at", null)
      .in("status", ["active", "draft"])
      .order("sort_order", { ascending: true })
      .limit(fixedLimit),
  ]);

  if (
    centersResult.error !== null ||
    centersResult.data === null ||
    plansResult.error !== null ||
    plansResult.data === null
  ) {
    return {
      ok: false,
      reason: "unavailable",
      centers: [],
      plans: [],
      limit: fixedLimit,
    };
  }

  return {
    ok: true,
    centers: centersResult.data,
    plans: plansResult.data,
    limit: fixedLimit,
  };
}
