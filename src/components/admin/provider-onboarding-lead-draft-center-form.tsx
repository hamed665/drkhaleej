"use client";

import { useActionState } from "react";

import {
  createDraftCenterFromLead,
  type DraftCenterCreationState,
} from "@/server/admin/provider-onboarding-lead-center-actions";

type ProviderOnboardingLeadDraftCenterFormProps = {
  leadId: string;
};

const initialState: DraftCenterCreationState = {
  ok: false,
  message: null,
};

export function ProviderOnboardingLeadDraftCenterForm({
  leadId,
}: ProviderOnboardingLeadDraftCenterFormProps) {
  const [state, formAction, isPending] = useActionState(
    createDraftCenterFromLead,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="leadId" value={leadId} />
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        This creates an internal draft center from the lead details only. It does
        not publish the center, verify it, create a claim, assign a subscription,
        charge money, or create public badges.
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex justify-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isPending ? "Creating draft center…" : "Create draft center"}
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
  );
}
