"use client";

import { useActionState } from "react";

import {
  markDraftCenterReadyForReview,
  returnCenterToDraft,
  type DraftCenterWorkflowState,
} from "@/server/admin/draft-center-workflow-actions";
import type { AdminDraftCenterDetail } from "@/server/admin/draft-centers";

type DraftCenterWorkflowPanelProps = {
  center: AdminDraftCenterDetail;
};

const initialWorkflowState: DraftCenterWorkflowState = {
  ok: false,
  message: null,
};

function Message({ state }: { state: DraftCenterWorkflowState }) {
  if (state.message === null) return null;

  return (
    <p
      className={`text-sm font-semibold ${state.ok ? "text-emerald-700" : "text-rose-700"}`}
      role="status"
    >
      {state.message}
    </p>
  );
}

export function DraftCenterWorkflowPanel({ center }: DraftCenterWorkflowPanelProps) {
  const [readyState, readyAction, isReadyPending] = useActionState(
    markDraftCenterReadyForReview,
    initialWorkflowState,
  );
  const [draftState, draftAction, isDraftPending] = useActionState(
    returnCenterToDraft,
    initialWorkflowState,
  );

  if (center.status === "draft") {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
              CENTER-D1
            </p>
            <h3 className="mt-2 text-xl font-bold text-slate-950">
              Mark ready for review
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
              Moves this center from draft to pending review. This does not make
              it public, active, claimable, billable, sponsored, or visible as a
              published provider profile.
            </p>
          </div>
          <form action={readyAction} className="flex flex-col gap-2 sm:items-end">
            <input type="hidden" name="centerId" value={center.id} />
            <button
              type="submit"
              disabled={isReadyPending}
              className="inline-flex justify-center rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isReadyPending ? "Marking…" : "Mark ready for review"}
            </button>
            <Message state={readyState} />
          </form>
        </div>
      </section>
    );
  }

  if (center.status === "pending_review") {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
              CENTER-D1
            </p>
            <h3 className="mt-2 text-xl font-bold text-slate-950">
              Pending review
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
              This center is ready for admin review but is still not public or
              active. Public activation is intentionally deferred until the next
              approved publish phase.
            </p>
          </div>
          <form action={draftAction} className="flex flex-col gap-2 sm:items-end">
            <input type="hidden" name="centerId" value={center.id} />
            <button
              type="submit"
              disabled={isDraftPending}
              className="inline-flex justify-center rounded-2xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            >
              {isDraftPending ? "Returning…" : "Return to draft"}
            </button>
            <Message state={draftState} />
          </form>
        </div>
      </section>
    );
  }

  return null;
}
