"use client";

import { useActionState, useMemo, useState } from "react";

import {
  upsertCenterSubscriptionAssignment,
  type CenterSubscriptionAssignmentState,
} from "@/server/admin/center-subscription-actions";
import type {
  AdminCenterSubscriptionAssignmentOptionsResult,
  AdminCenterSubscriptionPlanOption,
} from "@/server/admin/center-subscription-options";
import {
  initializeBaseSubscriptionPlanCatalog,
  type BaseSubscriptionPlanCatalogState,
} from "@/server/admin/subscription-plan-catalog-actions";

type CenterSubscriptionAssignmentFormProps = {
  options: AdminCenterSubscriptionAssignmentOptionsResult;
};

type PlanOption = AdminCenterSubscriptionPlanOption;
type PlanTierKey =
  | "free_listing"
  | "verified_starter"
  | "growth_partner"
  | "premium_partner";
type BillingTerm = "quarterly" | "semi_annual" | "annual";

const initialAssignmentState: CenterSubscriptionAssignmentState = {
  ok: false,
  message: null,
};

const initialCatalogState: BaseSubscriptionPlanCatalogState = {
  ok: false,
  message: null,
};

const statusOptions = ["pending", "active", "paused", "cancelled", "expired"];
const planTiers: Array<{ key: PlanTierKey; label: string }> = [
  { key: "free_listing", label: "Free Listing" },
  { key: "verified_starter", label: "Verified Starter" },
  { key: "growth_partner", label: "Growth Partner" },
  { key: "premium_partner", label: "Premium Partner" },
];

const billingTermsByTier: Record<PlanTierKey, BillingTerm[]> = {
  free_listing: ["annual"],
  verified_starter: ["quarterly", "semi_annual", "annual"],
  growth_partner: ["quarterly", "semi_annual", "annual"],
  premium_partner: ["quarterly", "semi_annual", "annual"],
};

const tierSlugPrefix: Record<PlanTierKey, string> = {
  free_listing: "free-listing",
  verified_starter: "verified-starter",
  growth_partner: "growth-partner",
  premium_partner: "premium-partner",
};

const tierLabelByKey = Object.fromEntries(
  planTiers.map((tier) => [tier.key, tier.label]),
) as Record<PlanTierKey, string>;

function formatLabel(value: string): string {
  return value
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPrice(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("en-OM", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 3,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("en-OM")} ${currencyCode}`;
  }
}

function tierKeyForPlan(plan: PlanOption): PlanTierKey | null {
  if (plan.slug === "free-listing" || plan.slug.startsWith("free-listing-")) {
    return "free_listing";
  }

  if (
    plan.slug === "verified-starter" ||
    plan.slug.startsWith("verified-starter-")
  ) {
    return "verified_starter";
  }

  if (plan.slug === "growth-partner" || plan.slug.startsWith("growth-partner-")) {
    return "growth_partner";
  }

  if (plan.slug === "premium-partner" || plan.slug.startsWith("premium-partner-")) {
    return "premium_partner";
  }

  return null;
}

function slugForTierTerm(tier: PlanTierKey, term: BillingTerm): string | null {
  if (tier === "free_listing") {
    return term === "annual" ? "free-listing" : null;
  }

  const prefix = tierSlugPrefix[tier];
  if (term === "annual") return prefix;
  if (term === "semi_annual") return `${prefix}-semi-annual`;

  return `${prefix}-${term}`;
}

function findExistingPlan(
  plans: PlanOption[],
  tier: PlanTierKey,
  term: BillingTerm,
): PlanOption | null {
  const expectedSlug = slugForTierTerm(tier, term);

  if (expectedSlug === null) return null;

  return plans.find((plan) => plan.slug === expectedSlug) ?? null;
}

function AssignmentHeader({
  centerCount,
  planCount,
}: {
  centerCount: number;
  planCount: number;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-800">
          MON-C2
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">
          Assign center subscription
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Creates or updates one center subscription record. This does not
          charge, invoice, publish badges, activate ads, activate offers, or
          unlock provider dashboard access.
        </p>
      </div>
      <div className="rounded-2xl border border-cyan-200 bg-white/80 px-4 py-3 text-sm font-medium text-cyan-900">
        {centerCount} centers · {planCount} plans
      </div>
    </div>
  );
}

export function CenterSubscriptionAssignmentForm({
  options,
}: CenterSubscriptionAssignmentFormProps) {
  const [selectedTier, setSelectedTier] = useState<PlanTierKey | "">("");
  const [selectedTerm, setSelectedTerm] = useState<BillingTerm | "">("");
  const [assignmentState, assignmentAction, isAssignmentPending] = useActionState(
    upsertCenterSubscriptionAssignment,
    initialAssignmentState,
  );
  const [catalogState, catalogAction, isCatalogPending] = useActionState(
    initializeBaseSubscriptionPlanCatalog,
    initialCatalogState,
  );

  const visibleTiers = useMemo(() => {
    if (!options.ok) return [];

    const tiersWithRows = new Set<PlanTierKey>();

    for (const plan of options.plans) {
      const tierKey = tierKeyForPlan(plan);
      if (tierKey !== null) tiersWithRows.add(tierKey);
    }

    return planTiers.filter((tier) => tiersWithRows.has(tier.key));
  }, [options]);

  if (!options.ok) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-xl font-bold">Assignment options unavailable</h2>
        <p className="mt-2 text-sm leading-6">
          Centers and plans could not be loaded right now. No raw database error
          is exposed here.
        </p>
      </section>
    );
  }

  const canSubmit = options.centers.length > 0 && options.plans.length > 0;
  const availableTerms =
    selectedTier === "" ? [] : billingTermsByTier[selectedTier];
  const selectedExistingPlan =
    selectedTier === "" || selectedTerm === ""
      ? null
      : findExistingPlan(options.plans, selectedTier, selectedTerm);
  const expectedVariantSlug =
    selectedTier === "" || selectedTerm === ""
      ? null
      : slugForTierTerm(selectedTier, selectedTerm);

  if (!canSubmit) {
    return (
      <section className="rounded-3xl border border-cyan-100 bg-cyan-50/70 p-5 shadow-sm">
        <AssignmentHeader
          centerCount={options.centers.length}
          planCount={options.plans.length}
        />
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <h3 className="text-base font-bold">Plan assignment is not ready yet</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6">
            This form needs at least one non-deleted center and one active or
            draft subscription plan before an assignment can be created. Create
            the base plan catalog and at least one center record first, then
            return here to assign the plan.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6">
            <li>Centers available: {options.centers.length}</li>
            <li>Plans available: {options.plans.length}</li>
          </ul>

          {options.plans.length > 0 ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-white/80 p-4 text-sm text-slate-800">
              <h4 className="font-bold text-emerald-900">
                Base plan catalog is initialized
              </h4>
              <p className="mt-1 leading-6 text-slate-600">
                The plan catalog is ready. A center record is still required
                before assignment can be saved. Homepage ads and Special Offer
                placements remain separate paid add-ons available across plans.
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {options.plans.map((plan) => (
                  <li
                    key={plan.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <span className="block font-semibold text-slate-950">
                      {plan.name_en}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-600">
                      {plan.slug} · {formatLabel(plan.status)} · {formatLabel(plan.interval)} · {formatPrice(
                        plan.price_amount,
                        plan.currency_code,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <form action={catalogAction} className="mt-4 space-y-2">
                <button
                  type="submit"
                  disabled={isCatalogPending}
                  className="inline-flex justify-center rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                >
                  {isCatalogPending ? "Syncing…" : "Sync base plan catalog"}
                </button>
                {catalogState.message !== null ? (
                  <p
                    className={`text-sm font-semibold ${
                      catalogState.ok ? "text-emerald-700" : "text-rose-700"
                    }`}
                    role="status"
                  >
                    {catalogState.message}
                  </p>
                ) : null}
              </form>
            </div>
          ) : null}

          {options.plans.length === 0 ? (
            <form action={catalogAction} className="mt-5 space-y-3">
              <p className="text-sm leading-6">
                The official DrMuscat base plan catalog can be initialized here
                by a platform admin. This does not create providers, centers,
                subscriptions, payments, invoices, ads, offers, or public badges.
              </p>
              <button
                type="submit"
                disabled={isCatalogPending}
                className="inline-flex justify-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isCatalogPending
                  ? "Initializing…"
                  : "Initialize base plan catalog"}
              </button>
              {catalogState.message !== null ? (
                <p
                  className={`text-sm font-semibold ${
                    catalogState.ok ? "text-emerald-700" : "text-rose-700"
                  }`}
                  role="status"
                >
                  {catalogState.message}
                </p>
              ) : null}
            </form>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-cyan-100 bg-cyan-50/70 p-5 shadow-sm">
      <AssignmentHeader
        centerCount={options.centers.length}
        planCount={options.plans.length}
      />

      <form action={assignmentAction} className="mt-5 space-y-5">
        <input type="hidden" name="planTier" value={selectedTier} />
        <input type="hidden" name="billingTerm" value={selectedTerm} />
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            Center
            <select
              name="centerId"
              defaultValue=""
              disabled={isAssignmentPending}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              required
            >
              <option value="" disabled>
                Select center
              </option>
              {options.centers.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name_en} · {center.slug} · {formatLabel(center.status)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            Plan
            <select
              value={selectedTier}
              disabled={isAssignmentPending}
              onChange={(event) => {
                const nextTier = event.target.value as PlanTierKey | "";
                setSelectedTier(nextTier);
                setSelectedTerm(nextTier === "free_listing" ? "annual" : "");
              }}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              required
            >
              <option value="" disabled>
                Select plan
              </option>
              {visibleTiers.map((tier) => (
                <option key={tier.key} value={tier.key}>
                  {tier.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block text-sm font-semibold text-slate-800">
            Billing term
            <select
              value={selectedTerm}
              disabled={isAssignmentPending || selectedTier === ""}
              onChange={(event) => setSelectedTerm(event.target.value as BillingTerm)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              required
            >
              <option value="" disabled>
                Select billing term
              </option>
              {availableTerms.map((term) => {
                const existingPlan =
                  selectedTier === "" ? null : findExistingPlan(options.plans, selectedTier, term);

                return (
                  <option key={term} value={term}>
                    {formatLabel(term)} · {formatPrice(
                      existingPlan?.price_amount ?? 0,
                      existingPlan?.currency_code ?? "OMR",
                    )}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            Status
            <select
              name="status"
              defaultValue="active"
              disabled={isAssignmentPending}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              required
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            Agreed price
            <input
              name="agreedPriceAmount"
              type="number"
              min="0"
              step="0.001"
              placeholder="Optional"
              disabled={isAssignmentPending}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-cyan-200 bg-white/80 p-4 text-sm leading-6 text-cyan-950">
          <p className="font-bold">Subscription plan variant</p>
          <p className="mt-1 text-cyan-900">
            {selectedTier === "" || selectedTerm === ""
              ? "Select a plan and billing term. Monthly stays hidden until approved for sale."
              : `${tierLabelByKey[selectedTier]} · ${expectedVariantSlug ?? "new variant"} · ${formatLabel(
                  selectedTerm,
                )}${selectedExistingPlan === null ? " · will be created on save" : ""}`}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-semibold text-slate-800">
            Starts at
            <input
              name="startsAt"
              type="date"
              disabled={isAssignmentPending}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Ends at
            <input
              name="endsAt"
              type="date"
              disabled={isAssignmentPending}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Trial ends at
            <input
              name="trialEndsAt"
              type="date"
              disabled={isAssignmentPending}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
        </div>

        <label className="block text-sm font-semibold text-slate-800">
          Private notes
          <textarea
            name="notes"
            rows={3}
            maxLength={2000}
            placeholder="Optional internal note"
            disabled={isAssignmentPending}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={
              isAssignmentPending || selectedTier === "" || selectedTerm === ""
            }
            className="inline-flex justify-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isAssignmentPending ? "Saving…" : "Save subscription assignment"}
          </button>

          {assignmentState.message !== null ? (
            <p
              className={`text-sm font-semibold ${
                assignmentState.ok ? "text-emerald-700" : "text-rose-700"
              }`}
              role="status"
            >
              {assignmentState.message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
