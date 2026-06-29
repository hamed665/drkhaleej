"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  updateDraftCenterDetailsPreservingVerification,
  type DraftCenterUpdateState,
} from "@/server/admin/draft-center-safe-actions";
import type { AdminDraftCenterDetail } from "@/server/admin/draft-centers";

type DraftCenterEditFormProps = {
  center: AdminDraftCenterDetail;
};

const initialState: DraftCenterUpdateState = {
  ok: false,
  message: null,
};

const centerTypes = [
  "clinic",
  "hospital",
  "dental_clinic",
  "beauty_clinic",
  "laboratory",
  "imaging_center",
  "pharmacy",
  "wellness_center",
  "physiotherapy_center",
  "other",
] as const;

function formatLabel(value: string): string {
  return value
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function inputClassName() {
  return "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
}

function textareaClassName() {
  return "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
}

export function DraftCenterEditForm({ center }: DraftCenterEditFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateDraftCenterDetailsPreservingVerification,
    initialState,
  );

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              CENTER-C
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-slate-950">
              Edit draft center
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Update basic draft center profile data before any publish workflow
              exists. This form does not publish, activate, claim, bill, upload
              media, create offers, change verification, or display anything publicly.
            </p>
          </div>
          <Link
            href="/admin/draft-centers"
            className="inline-flex justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            Back to draft centers
          </Link>
        </div>

        <section className="grid gap-3 rounded-3xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm text-cyan-950 md:grid-cols-3">
          <div>
            <p className="font-bold">Current status</p>
            <p className="mt-1">{formatLabel(center.status)}</p>
          </div>
          <div>
            <p className="font-bold">Public flags</p>
            <p className="mt-1">
              Active: {center.isActive ? "yes" : "no"} · Claimable: {center.isClaimable ? "yes" : "no"}
            </p>
          </div>
          <div>
            <p className="font-bold">Source</p>
            <p className="mt-1">{formatLabel(center.createdFrom ?? "unavailable")}</p>
          </div>
        </section>
      </header>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="centerId" value={center.id} />
        <input type="hidden" name="verificationStatus" value={center.verificationStatus} />

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Identity</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-800">
              English name
              <input
                name="nameEn"
                defaultValue={center.nameEn}
                maxLength={160}
                disabled={isPending}
                className={inputClassName()}
                required
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Arabic name
              <input
                name="nameAr"
                defaultValue={center.nameAr ?? ""}
                maxLength={160}
                disabled={isPending}
                className={inputClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Legal name
              <input
                name="legalName"
                defaultValue={center.legalName ?? ""}
                maxLength={240}
                disabled={isPending}
                className={inputClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Slug
              <input
                name="slug"
                defaultValue={center.slug}
                maxLength={72}
                disabled={isPending}
                className={inputClassName()}
                required
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Saved as lowercase URL-safe text.
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Classification</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="block text-sm font-semibold text-slate-800">
              Center type
              <select
                name="centerType"
                defaultValue={center.centerType}
                disabled={isPending}
                className={inputClassName()}
                required
              >
                {centerTypes.map((centerType) => (
                  <option key={centerType} value={centerType}>
                    {formatLabel(centerType)}
                  </option>
                ))}
              </select>
            </label>
            <div className="block text-sm font-semibold text-slate-800">
              Verification status
              <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                {formatLabel(center.verificationStatus)}
              </div>
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Verification changes require a separate evidence-based workflow.
              </span>
            </div>
            <label className="block text-sm font-semibold text-slate-800">
              Default locale
              <select
                name="defaultLocale"
                defaultValue={center.defaultLocale}
                disabled={isPending}
                className={inputClassName()}
                required
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Default country
              <select
                name="defaultCountry"
                defaultValue={center.defaultCountry}
                disabled={isPending}
                className={inputClassName()}
                required
              >
                <option value="om">Oman</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Contact</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="block text-sm font-semibold text-slate-800">
              Primary phone
              <input
                name="primaryPhone"
                defaultValue={center.primaryPhone ?? ""}
                maxLength={64}
                disabled={isPending}
                className={inputClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Secondary phone
              <input
                name="secondaryPhone"
                defaultValue={center.secondaryPhone ?? ""}
                maxLength={64}
                disabled={isPending}
                className={inputClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              WhatsApp phone
              <input
                name="whatsappPhone"
                defaultValue={center.whatsappPhone ?? ""}
                maxLength={64}
                disabled={isPending}
                className={inputClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Email
              <input
                name="email"
                type="email"
                defaultValue={center.email ?? ""}
                maxLength={240}
                disabled={isPending}
                className={inputClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800 md:col-span-2">
              Website URL
              <input
                name="websiteUrl"
                type="url"
                defaultValue={center.websiteUrl ?? ""}
                maxLength={500}
                placeholder="https://example.com"
                disabled={isPending}
                className={inputClassName()}
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Descriptions</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-800">
              Short description EN
              <textarea
                name="shortDescriptionEn"
                defaultValue={center.shortDescriptionEn ?? ""}
                rows={3}
                maxLength={240}
                disabled={isPending}
                className={textareaClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Short description AR
              <textarea
                name="shortDescriptionAr"
                defaultValue={center.shortDescriptionAr ?? ""}
                rows={3}
                maxLength={240}
                disabled={isPending}
                className={textareaClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Description EN
              <textarea
                name="descriptionEn"
                defaultValue={center.descriptionEn ?? ""}
                rows={7}
                maxLength={4000}
                disabled={isPending}
                className={textareaClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Description AR
              <textarea
                name="descriptionAr"
                defaultValue={center.descriptionAr ?? ""}
                rows={7}
                maxLength={4000}
                disabled={isPending}
                className={textareaClassName()}
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 text-sm leading-6 text-slate-700">
          <p>
            Source lead: <strong>{center.sourceLeadId ?? "—"}</strong> · Provider type:{" "}
            <strong>{formatLabel(center.sourceProviderType ?? "unavailable")}</strong> · Request:{" "}
            <strong>{formatLabel(center.sourceRequest ?? "unavailable")}</strong>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Created {formatDateTime(center.createdAt)} · Last updated {formatDateTime(center.updatedAt)}
          </p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex justify-center rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isPending ? "Saving…" : "Save draft center details"}
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
    </div>
  );
}
