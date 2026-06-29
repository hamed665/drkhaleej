"use client";

import { useActionState } from "react";

import {
  createDraftCenterLocationCandidate,
  type DraftCenterLocationCreateState,
} from "@/server/admin/draft-center-location-actions";
import type { DraftLocationOptions } from "@/server/admin/draft-center-location-options";

type DraftCenterLocationCreateFormProps = {
  centerId: string;
  options: DraftLocationOptions;
};

const initialState: DraftCenterLocationCreateState = {
  ok: false,
  message: null,
};

function inputClassName() {
  return "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
}

function optionLabel(en: string, ar: string): string {
  return ar ? `${en} / ${ar}` : en;
}

export function DraftCenterLocationCreateForm({
  centerId,
  options,
}: DraftCenterLocationCreateFormProps) {
  const [state, formAction, isPending] = useActionState(
    createDraftCenterLocationCandidate,
    initialState,
  );

  const defaultCountryId = options.countries[0]?.id ?? "";
  const defaultRegionId = options.regions[0]?.id ?? "";
  const defaultCityId = options.cities[0]?.id ?? "";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
            CENTER-LOCATION-B
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-950">
            Add location candidate
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            Creates a private draft location candidate only. It does not activate, publish, verify, claim, bill, sponsor, or expose contact details.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-950">
          Saved locations stay inactive and private until a later review workflow.
        </div>
      </div>

      <form action={formAction} className="mt-5 space-y-5">
        <input type="hidden" name="centerId" value={centerId} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block text-sm font-semibold text-slate-800">
            Country
            <select
              name="countryId"
              defaultValue={defaultCountryId}
              disabled={isPending}
              required
              className={inputClassName()}
            >
              {options.countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {optionLabel(country.nameEn, country.nameAr)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Governorate / region
            <select
              name="regionId"
              defaultValue={defaultRegionId}
              disabled={isPending}
              required
              className={inputClassName()}
            >
              {options.regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {optionLabel(region.nameEn, region.nameAr)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Wilayat / city
            <select
              name="cityId"
              defaultValue={defaultCityId}
              disabled={isPending}
              required
              className={inputClassName()}
            >
              {options.cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {optionLabel(city.nameEn, city.nameAr)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Area / neighborhood
            <select name="areaId" defaultValue="" disabled={isPending} className={inputClassName()}>
              <option value="">No area selected</option>
              {options.areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {optionLabel(area.nameEn, area.nameAr)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            Location name EN
            <input name="nameEn" maxLength={160} disabled={isPending} className={inputClassName()} />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Location name AR
            <input name="nameAr" maxLength={160} disabled={isPending} className={inputClassName()} />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Address line EN
            <input name="addressLine1En" maxLength={240} disabled={isPending} className={inputClassName()} />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Address line AR
            <input name="addressLine1Ar" maxLength={240} disabled={isPending} className={inputClassName()} />
          </label>
          <label className="block text-sm font-semibold text-slate-800 md:col-span-2">
            Map URL
            <input name="mapUrl" type="url" maxLength={500} disabled={isPending} className={inputClassName()} />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Internal phone candidate
            <input name="primaryPhone" maxLength={64} disabled={isPending} className={inputClassName()} />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Internal WhatsApp candidate
            <input name="whatsappPhone" maxLength={64} disabled={isPending} className={inputClassName()} />
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isPending || defaultCountryId.length === 0 || defaultRegionId.length === 0 || defaultCityId.length === 0}
            className="inline-flex justify-center rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isPending ? "Saving…" : "Save private location candidate"}
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
