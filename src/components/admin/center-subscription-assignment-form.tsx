"use client";

import { useActionState } from "react";

import {
  upsertCenterSubscriptionAssignment,
  type CenterSubscriptionAssignmentState,
} from "@/server/admin/center-subscription-actions";
import type { AdminCenterSubscriptionAssignmentOptionsResult } from "@/server/admin/center-subscription-options";

type CenterSubscriptionAssignmentFormProps = {
  options: AdminCenterSubscriptionAssignmentOptionsResult;
};

const initialState: CenterSubscriptionAssignmentState = {
  ok: false,
  message: null,
};

const statusOptions = ["pending", "active", "paused", "cancelled", "expired"];
const intervalOptions = ["monthly", "quarterly", "semi_annual", "annual"];

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

export function CenterSubscriptionAssignmentForm({
  options,
}: CenterSubscriptionAssignmentFormProps) {
  const [state, formAction, isPending] = useActionState(
    upsertCenterSubscriptionAssignment,
    initialState,
  );

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
  const defaultInterval = options.plans.at(0)?.interval ?? "monthly";

  return (
    <section className="rounded-3xl border border-cyan-100 bg-cyan-50/70 p-5 shadow-sm">
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
          {options.centers.length} centers · {options.plans.length} plans
        </div>
      </div>

      {!canSubmit ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Add at least one non-deleted center and one active or draft plan before
          creating assignments.
        </div>
      ) : null}

      <form action={formAction} className="mt-5 space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            Center
            <select
              name="centerId"
              defaultValue=""
              disabled={isPending || !canSubmit}
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
            Subscription plan
            <select
              name="subscriptionPlanId"
              defaultValue=""
              disabled={isPending || !canSubmit}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              required
            >
              <option value="" disabled>
                Select plan
              </option>
              {options.plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name_en} · {plan.slug} · {formatLabel(plan.interval)} · {formatPrice(plan.price_amount, plan.currency_code)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block text-sm font-semibold text-slate-800">
            Status
            <select
              name="status"
              defaultValue="active"
              disabled={isPending || !canSubmit}
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
            Billing interval
            <select
              name="billingInterval"
              defaultValue={defaultInterval}
              disabled={isPending || !canSubmit}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              required
            >
              {intervalOptions.map((interval) => (
                <option key={interval} value={interval}>
                  {formatLabel(interval)}
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
              disabled={isPending || !canSubmit}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-semibold text-slate-800">
            Starts at
            <input
              name="startsAt"
              type="date"
              disabled={isPending || !canSubmit}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Ends at
            <input
              name="endsAt"
              type="date"
              disabled={isPending || !canSubmit}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Trial ends at
            <input
              name="trialEndsAt"
              type="date"
              disabled={isPending || !canSubmit}
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
            disabled={isPending || !canSubmit}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isPending || !canSubmit}
            className="inline-flex justify-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isPending ? "Saving…" : "Save subscription assignment"}
          </button>

          {state.message !== null ? (
            <p
              className={`text-sm font-semibold ${state.ok ? "text-emerald-700" : "text-rose-700"}`}
              role="status"
            >
              {state.message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
