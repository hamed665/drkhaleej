"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformAdmin } from "@/lib/permissions/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";

const allowedStatuses = [
  "pending",
  "active",
  "paused",
  "cancelled",
  "expired",
] as const;
const allowedIntervals = [
  "monthly",
  "quarterly",
  "semi_annual",
  "annual",
] as const;
const maxNotesLength = 2000;

export type CenterSubscriptionAssignmentState = {
  ok: boolean;
  message: string | null;
};

type CenterSubscriptionStatus = (typeof allowedStatuses)[number];
type PlanInterval = (typeof allowedIntervals)[number];
type CenterSubscriptionInsert =
  Database["public"]["Tables"]["center_subscriptions"]["Insert"];
type CenterSubscriptionUpdate =
  Database["public"]["Tables"]["center_subscriptions"]["Update"];

const genericFailureState: CenterSubscriptionAssignmentState = {
  ok: false,
  message: "Center subscription assignment could not be saved.",
};

function readFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isAllowedStatus(value: string): value is CenterSubscriptionStatus {
  return allowedStatuses.some((status) => status === value);
}

function isAllowedInterval(value: string): value is PlanInterval {
  return allowedIntervals.some((interval) => interval === value);
}

function parseOptionalAmount(value: string | null): number | null | undefined {
  if (value === null) {
    return null;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    return undefined;
  }

  return amount;
}

function parseOptionalDate(value: string | null): string | null | undefined {
  if (value === null) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return undefined;
  }

  return date.toISOString();
}

function parseOptionalNotes(value: string | null): string | null | undefined {
  if (value === null) {
    return null;
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    return null;
  }

  if (trimmedValue.length > maxNotesLength) {
    return undefined;
  }

  return trimmedValue;
}

export async function upsertCenterSubscriptionAssignment(
  _previousState: CenterSubscriptionAssignmentState,
  formData: FormData,
): Promise<CenterSubscriptionAssignmentState> {
  const platformAdmin = await requirePlatformAdmin();

  const centerId = readFormString(formData, "centerId");
  const subscriptionPlanId = readFormString(formData, "subscriptionPlanId");
  const status = readFormString(formData, "status");
  const billingInterval = readFormString(formData, "billingInterval");
  const agreedPriceAmount = parseOptionalAmount(
    readFormString(formData, "agreedPriceAmount"),
  );
  const startsAt = parseOptionalDate(readFormString(formData, "startsAt"));
  const endsAt = parseOptionalDate(readFormString(formData, "endsAt"));
  const trialEndsAt = parseOptionalDate(readFormString(formData, "trialEndsAt"));
  const notes = parseOptionalNotes(readFormString(formData, "notes"));

  if (
    centerId === null ||
    subscriptionPlanId === null ||
    status === null ||
    billingInterval === null ||
    !isUuid(centerId) ||
    !isUuid(subscriptionPlanId) ||
    !isAllowedStatus(status) ||
    !isAllowedInterval(billingInterval) ||
    agreedPriceAmount === undefined ||
    startsAt === undefined ||
    endsAt === undefined ||
    trialEndsAt === undefined ||
    notes === undefined
  ) {
    return genericFailureState;
  }

  const supabase = createSupabaseServiceRoleClient();

  const { data: center, error: centerError } = await supabase
    .from("centers")
    .select("id")
    .eq("id", centerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (centerError !== null || center === null) {
    return genericFailureState;
  }

  const { data: plan, error: planError } = await supabase
    .from("subscription_plans")
    .select("id, currency_code")
    .eq("id", subscriptionPlanId)
    .is("deleted_at", null)
    .maybeSingle();

  if (planError !== null || plan === null) {
    return genericFailureState;
  }

  const { data: existingSubscriptions, error: existingError } = await supabase
    .from("center_subscriptions")
    .select("id")
    .eq("center_id", centerId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (existingError !== null || existingSubscriptions === null) {
    return genericFailureState;
  }

  const updatedAt = new Date().toISOString();
  const existingSubscriptionId = existingSubscriptions.at(0)?.id ?? null;
  const writePayload: CenterSubscriptionInsert & CenterSubscriptionUpdate = {
    agreed_price_amount: agreedPriceAmount,
    billing_interval: billingInterval,
    center_id: centerId,
    currency_code: plan.currency_code,
    ends_at: endsAt,
    metadata: {},
    notes,
    sales_profile_id: platformAdmin.id,
    starts_at: startsAt,
    status,
    subscription_plan_id: subscriptionPlanId,
    trial_ends_at: trialEndsAt,
    updated_at: updatedAt,
  };

  if (existingSubscriptionId === null) {
    const { data: insertedSubscription, error: insertError } = await supabase
      .from("center_subscriptions")
      .insert(writePayload)
      .select("id")
      .maybeSingle();

    if (insertError !== null || insertedSubscription === null) {
      return genericFailureState;
    }

    revalidatePath("/admin/center-subscriptions");

    return {
      ok: true,
      message: "Center subscription assignment was created.",
    };
  }

  const { data: updatedSubscription, error: updateError } = await supabase
    .from("center_subscriptions")
    .update(writePayload)
    .eq("id", existingSubscriptionId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (updateError !== null || updatedSubscription === null) {
    return genericFailureState;
  }

  revalidatePath("/admin/center-subscriptions");

  return {
    ok: true,
    message: "Center subscription assignment was updated.",
  };
}
