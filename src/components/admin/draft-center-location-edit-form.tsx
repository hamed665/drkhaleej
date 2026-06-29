"use client";

import { useActionState } from "react";

import {
  updateDraftCenterLocationCandidate,
  type DraftCenterLocationEditState,
} from "@/server/admin/draft-center-location-actions";
import type { AdminDraftCenterLocation } from "@/server/admin/draft-center-locations";

type DraftCenterLocationEditFormProps = {
  centerId: string;
  location: AdminDraftCenterLocation;
};

const initialState: DraftCenterLocationEditState = {
  ok: false,
  message: null,
};

function inputClassName() {
  return "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
}

export function DraftCenterLocationEditForm({
  centerId,
  location,
}: DraftCenterLocationEditFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateDraftCenterLocationCandidate,
    initialState,
  );

  if (location.isActive) {
    return (
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm leading-6 text-slate-600 shadow-sm">
        This location is active. Editing active locations requires a separate review workflow.
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-4 rounded-[1.75rem] border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/40 to-white p-4 shadow-sm ring-1 ring-white/80"
    >
      <input type="hidden" name="centerId" value={centerId} />
      <input type="hidden" name="locationId" value={location.id} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-800 shadow-sm">
            Private candidate edit
          </span>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Update internal candidate fields only. This form keeps the record inactive and contact visibility disabled.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-950">
          No public visibility changes
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-800">
          Name EN
          <input
            name="nameEn"
            maxLength={160}
            defaultValue={location.nameEn ?? ""}
            disabled={isPending}
            className={inputClassName()}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Name AR
          <input
            name="nameAr"
            maxLength={160}
            defaultValue={location.nameAr ?? ""}
            disabled={isPending}
            className={inputClassName()}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Address EN
          <input
            name="addressLine1En"
            maxLength={240}
            defaultValue={location.addressLine1En ?? ""}
            disabled={isPending}
            className={inputClassName()}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Address AR
          <input
            name="addressLine1Ar"
            maxLength={240}
            defaultValue={location.addressLine1Ar ?? ""}
            disabled={isPending}
            className={inputClassName()}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-800 md:col-span-2">
          Map URL
          <input
            name="mapUrl"
            type="url"
            maxLength={500}
            defaultValue={location.mapUrl ?? ""}
            disabled={isPending}
            className={inputClassName()}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Internal phone candidate
          <input
            name="primaryPhone"
            maxLength={64}
            defaultValue={location.primaryPhone ?? ""}
            disabled={isPending}
            className={inputClassName()}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Internal WhatsApp candidate
          <input
            name="whatsappPhone"
            maxLength={64}
            defaultValue={location.whatsappPhone ?? ""}
            disabled={isPending}
            className={inputClassName()}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "Saving…" : "Save private edits"}
        </button>

        {state.message !== null ? (
          <p className={`text-sm font-bold ${state.ok ? "text-emerald-700" : "text-rose-700"}`} role="status">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
