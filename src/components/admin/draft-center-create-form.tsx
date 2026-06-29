"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createManualDraftCenter,
  type ManualDraftCenterCreateState,
} from "@/server/admin/draft-center-create-actions";

const initialState: ManualDraftCenterCreateState = {
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

function inputClassName(): string {
  return "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
}

function textareaClassName(): string {
  return "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
}

export function DraftCenterCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createManualDraftCenter,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 text-sm leading-6 text-amber-950">
        <p className="font-bold">Manual draft only</p>
        <p className="mt-1">
          This creates an internal draft center only. It does not publish,
          activate, claim, verify, sponsor, bill, expose contact details, create
          media, or add sitemap/index entries.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Identity</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            English name
            <input
              name="nameEn"
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
              maxLength={160}
              disabled={isPending}
              className={inputClassName()}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800 md:col-span-2">
            Slug
            <input
              name="slug"
              maxLength={72}
              disabled={isPending}
              className={inputClassName()}
              placeholder="leave blank to generate from English name"
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Saved as lowercase URL-safe text. Public profile access remains blocked until later publish gates.
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Classification</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-semibold text-slate-800">
            Center type
            <select
              name="centerType"
              defaultValue="clinic"
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
          <label className="block text-sm font-semibold text-slate-800">
            Default locale
            <select
              name="defaultLocale"
              defaultValue="en"
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
              defaultValue="om"
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
        <h3 className="text-lg font-bold text-slate-950">Location hint</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          This is stored as a draft hint only. Structured branch/location records
          still need the location workflow before public launch.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            City / wilayat text
            <input
              name="cityText"
              maxLength={120}
              disabled={isPending}
              className={inputClassName()}
              placeholder="Muscat, Seeb, Bawshar..."
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Area / neighborhood text
            <input
              name="areaText"
              maxLength={120}
              disabled={isPending}
              className={inputClassName()}
              placeholder="Al Khuwair, Qurum, Azaiba..."
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Contact candidates</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Contact values are saved as private candidates. Public visibility stays
          off until reviewed separately.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block text-sm font-semibold text-slate-800">
            Primary phone
            <input
              name="primaryPhone"
              maxLength={64}
              disabled={isPending}
              className={inputClassName()}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            WhatsApp phone
            <input
              name="whatsappPhone"
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
              maxLength={240}
              disabled={isPending}
              className={inputClassName()}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Website URL
            <input
              name="websiteUrl"
              type="url"
              maxLength={500}
              placeholder="https://example.com"
              disabled={isPending}
              className={inputClassName()}
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Short descriptions</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            Short description EN
            <textarea
              name="shortDescriptionEn"
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
              rows={3}
              maxLength={240}
              disabled={isPending}
              className={textareaClassName()}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "Creating draft center…" : "Create manual draft center"}
        </button>

        {state.message !== null ? (
          <div className="space-y-2">
            <p
              className={`text-sm font-semibold ${state.ok ? "text-emerald-700" : "text-rose-700"}`}
              role="status"
            >
              {state.message}
            </p>
            {state.ok && state.centerId ? (
              <Link
                href={`/admin/draft-centers/${state.centerId}`}
                className="inline-flex rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100"
              >
                Review created draft center {state.slug ? `(${state.slug})` : ""}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </form>
  );
}
