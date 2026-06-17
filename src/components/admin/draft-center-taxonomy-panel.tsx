"use client";

import { useActionState } from "react";

import {
  saveDraftCenterPrimaryCategory,
  type DraftCenterTaxonomyState,
} from "@/server/admin/draft-center-taxonomy-actions";
import type {
  AdminCenterCategoryAssignment,
  AdminCenterCategoryOption,
} from "@/server/admin/draft-center-taxonomy";
import type { AdminDraftCenterDetail } from "@/server/admin/draft-centers";

type DraftCenterTaxonomyPanelProps = {
  assignment: AdminCenterCategoryAssignment | null;
  categoryOptions: AdminCenterCategoryOption[];
  center: AdminDraftCenterDetail;
};

const initialState: DraftCenterTaxonomyState = {
  ok: false,
  message: null,
};

function formatCategoryLabel(option: AdminCenterCategoryOption): string {
  return `${option.categoryNameEn} / ${option.categoryNameAr} · ${option.verticalNameEn}`;
}

function currentCategoryLabel(
  assignment: AdminCenterCategoryAssignment | null,
  options: AdminCenterCategoryOption[],
): string {
  if (assignment === null) return "No primary category assigned yet";

  const option = options.find((candidate) => candidate.categoryId === assignment.categoryId);
  if (option === undefined) return "Assigned category is unavailable or inactive";

  return formatCategoryLabel(option);
}

export function DraftCenterTaxonomyPanel({
  assignment,
  categoryOptions,
  center,
}: DraftCenterTaxonomyPanelProps) {
  const [state, formAction, isPending] = useActionState(
    saveDraftCenterPrimaryCategory,
    initialState,
  );
  const defaultCategoryId = assignment?.categoryId ?? "";
  const hasOptions = categoryOptions.length > 0;

  return (
    <section className="rounded-3xl border border-violet-200 bg-violet-50/70 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-800">
            CENTER-TAX-A
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-950">
            Center category assignment
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            Assign one primary taxonomy category for admin review. This does not
            publish, activate, claim, bill, sponsor, or expose the center
            publicly.
          </p>
          <p className="mt-3 text-sm font-semibold text-violet-950">
            Current: {currentCategoryLabel(assignment, categoryOptions)}
          </p>
        </div>

        <form action={formAction} className="w-full max-w-xl space-y-3">
          <input type="hidden" name="centerId" value={center.id} />
          <label className="block text-sm font-semibold text-slate-800">
            Primary category
            <select
              name="categoryId"
              defaultValue={defaultCategoryId}
              disabled={isPending || !hasOptions}
              required
              className="mt-2 w-full rounded-2xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="" disabled>
                {hasOptions ? "Select a category" : "No active categories available"}
              </option>
              {categoryOptions.map((option) => (
                <option key={option.categoryId} value={option.categoryId}>
                  {formatCategoryLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={isPending || !hasOptions}
            className="inline-flex justify-center rounded-2xl bg-violet-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isPending ? "Saving category…" : "Save primary category"}
          </button>

          {state.message !== null ? (
            <p
              className={`text-sm font-semibold ${state.ok ? "text-emerald-700" : "text-rose-700"}`}
              role="status"
            >
              {state.message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
