"use client";

import { useActionState } from "react";

import { DraftCenterLocationEditForm } from "@/components/admin/draft-center-location-edit-form";
import {
  setPrimaryDraftCenterLocationCandidate,
  type DraftCenterLocationPrimaryState,
} from "@/server/admin/draft-center-location-actions";
import type { AdminDraftCenterLocation } from "@/server/admin/draft-center-locations";

type DraftCenterLocationPanelProps = {
  centerId: string;
  locations: AdminDraftCenterLocation[];
};

const primaryInitialState: DraftCenterLocationPrimaryState = {
  ok: false,
  message: null,
};

function yesNo(value: boolean): string {
  return value ? "yes" : "no";
}

function displayText(value: string | null): string {
  return value && value.trim().length > 0 ? value : "—";
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";

  return new Intl.DateTimeFormat("en-OM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Muscat",
  }).format(date);
}

function LocationPrimaryForm({
  centerId,
  location,
}: {
  centerId: string;
  location: AdminDraftCenterLocation;
}) {
  const [state, formAction, isPending] = useActionState(
    setPrimaryDraftCenterLocationCandidate,
    primaryInitialState,
  );

  if (location.isActive) return null;

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:items-end">
      <input type="hidden" name="centerId" value={centerId} />
      <input type="hidden" name="locationId" value={location.id} />
      <button
        type="submit"
        disabled={isPending || location.isPrimary}
        className="inline-flex justify-center rounded-2xl border border-cyan-100 bg-white px-4 py-2 text-xs font-bold text-cyan-900 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
      >
        {location.isPrimary ? "Selected candidate" : isPending ? "Saving…" : "Select candidate"}
      </button>
      <span className="max-w-xs text-right text-[11px] font-semibold leading-4 text-slate-500">
        Selection stays private and inactive.
      </span>
      {state.message !== null ? (
        <p className={`max-w-xs text-right text-xs font-bold ${state.ok ? "text-emerald-700" : "text-rose-700"}`} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function LocationCard({
  centerId,
  location,
}: {
  centerId: string;
  location: AdminDraftCenterLocation;
}) {
  return (
    <li className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50/40 p-4 text-sm text-slate-800 shadow-sm ring-1 ring-white/80">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-800 shadow-sm">
              Location candidate
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
              Contact review: {location.contactReviewStatus}
            </span>
          </div>
          <h4 className="mt-3 text-base font-bold text-slate-950">
            {displayText(location.nameEn ?? location.nameAr)}
          </h4>
          <p className="mt-1 leading-6 text-slate-600">
            {displayText(location.addressLine1En ?? location.addressLine1Ar)}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
              Active: {yesNo(location.isActive)}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
              Selected: {yesNo(location.isPrimary)}
            </span>
          </div>
          <LocationPrimaryForm centerId={centerId} location={location} />
        </div>
      </div>

      <dl className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">City ID</dt>
          <dd className="mt-1 break-all font-semibold">{location.cityId}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Area ID</dt>
          <dd className="mt-1 break-all font-semibold">{displayText(location.areaId)}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Updated</dt>
          <dd className="mt-1 font-semibold">{formatDateTime(location.updatedAt)}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Visibility</dt>
          <dd className="mt-1 font-semibold">
            Phone {yesNo(location.publicPrimaryPhoneVisible)} · WhatsApp {yesNo(location.publicWhatsappPhoneVisible)}
          </dd>
        </div>
      </dl>

      <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-950">
        Candidate edits and selection stay private. Activation, public visibility, and promotion require a separate review workflow.
      </p>

      <DraftCenterLocationEditForm centerId={centerId} location={location} />
    </li>
  );
}

export function DraftCenterLocationPanel({ centerId, locations }: DraftCenterLocationPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
            CENTER-LOCATION-A
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-950">
            Draft center locations
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            Private location candidates attached to this draft center. This panel does not activate, publish, verify, expose contact details, or promote records publicly.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
          <p className="font-bold">{locations.length} location candidate{locations.length === 1 ? "" : "s"}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Public activation remains blocked</p>
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          No center location candidates are attached yet. The quality gate will remain blocked until an active location candidate exists.
        </div>
      ) : (
        <ul className="mt-5 grid gap-4">
          {locations.map((location) => (
            <LocationCard centerId={centerId} key={location.id} location={location} />
          ))}
        </ul>
      )}
    </section>
  );
}
