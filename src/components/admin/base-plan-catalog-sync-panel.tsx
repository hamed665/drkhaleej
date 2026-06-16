"use client";

import { useActionState } from "react";

import {
  initializeBaseSubscriptionPlanCatalog,
  type BaseSubscriptionPlanCatalogState,
} from "@/server/admin/subscription-plan-catalog-actions";

type BasePlanCatalogSyncPanelProps = {
  visiblePlanCount: number;
};

const initialState: BaseSubscriptionPlanCatalogState = {
  ok: false,
  message: null,
};

export function BasePlanCatalogSyncPanel({
  visiblePlanCount,
}: BasePlanCatalogSyncPanelProps) {
  const [state, formAction, isPending] = useActionState(
    initializeBaseSubscriptionPlanCatalog,
    initialState,
  );

  return (
    <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">
            PLAN-A2
          </p>
          <h2 className="mt-2 text-lg font-bold text-slate-950">
            Base plan catalog sync
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            Syncs the official plan tiers and billing-term variants. Monthly
            variants can stay hidden while quarterly, semi annual, and annual
            options remain available for admin assignment.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3 text-sm font-medium text-emerald-900">
          Visible plans: {visiblePlanCount}
        </div>
      </div>

      <form action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        >
          {isPending ? "Syncing…" : "Sync base plan catalog"}
        </button>
        {state.message !== null ? (
          <p
            className={`text-sm font-semibold ${
              state.ok ? "text-emerald-700" : "text-rose-700"
            }`}
            role="status"
          >
            {state.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
