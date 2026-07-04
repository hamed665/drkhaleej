import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminActiveCenterLocations } from "@/server/admin/active-center-locations";
import { updateActiveCenterPrimaryLocationDetails } from "@/server/admin/active-center-address-actions";

type PageProps = {
  params: Promise<{
    centerId: string;
  }>;
};

function inputClassName(): string {
  return "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100";
}

function textareaClassName(): string {
  return "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100";
}

export default async function AdminActivePrimaryLocationEditPage({ params }: PageProps) {
  const { centerId } = await params;
  const result = await getAdminActiveCenterLocations(centerId);

  if (!result.ok) {
    if (result.reason === "not_found") notFound();

    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-xl font-bold">Primary location edit unavailable</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6">
          The primary location edit surface could not be loaded right now. No raw database error is exposed here.
        </p>
      </section>
    );
  }

  const { center, locations } = result;
  const primaryLocation = locations.find((location) => location.isPrimary) ?? null;

  if (primaryLocation === null) {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-900 shadow-sm">
            ACTIVE_PRIMARY_LOCATION_EDIT
          </p>
          <h2 className="mt-3 text-xl font-bold">No primary active location</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6">
            This page only edits the current primary active location. No primary active location was found for this center.
          </p>
          <Link href={`/admin/active-centers/${center.id}/locations`} className="mt-4 inline-flex text-sm font-bold text-amber-900 hover:text-amber-950">
            Back to active locations
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-cyan-50/40 to-white p-6 shadow-sm ring-1 ring-white/80">
        <p className="inline-flex rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 shadow-sm">
          ACTIVE_PRIMARY_LOCATION_EDIT
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-slate-950">Edit primary location</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Controlled edit surface for the current primary active location. This page only updates the address lines and map URL.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
          <Link href="/admin/active-centers" className="text-cyan-700 hover:text-cyan-900">
            Back to active centers
          </Link>
          <Link href={`/admin/active-centers/${center.id}/locations`} className="text-cyan-700 hover:text-cyan-900">
            Back to active locations
          </Link>
          <Link href={center.publicPathEn} className="text-cyan-700 hover:text-cyan-900">
            English public profile
          </Link>
          <Link href={center.publicPathAr} className="text-cyan-700 hover:text-cyan-900">
            Arabic public profile
          </Link>
        </div>
      </section>

      <section className="grid gap-3 rounded-3xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm text-cyan-950 md:grid-cols-3">
        <div>
          <p className="font-bold">Center</p>
          <p className="mt-1">{center.nameEn}</p>
          {center.nameAr ? <p className="mt-1 text-xs font-semibold">{center.nameAr}</p> : null}
        </div>
        <div>
          <p className="font-bold">Primary location</p>
          <p className="mt-1 break-all">{primaryLocation.id}</p>
        </div>
        <div>
          <p className="font-bold">Scope</p>
          <p className="mt-1">Address EN, address AR, and map URL only.</p>
        </div>
      </section>

      <form action={updateActiveCenterPrimaryLocationDetails} className="space-y-6">
        <input type="hidden" name="centerId" value={center.id} />

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Primary active location details</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Save only provider-confirmed address and map details. This form does not create a new location or switch the primary location.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              3 fields only
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-800">
              Address EN
              <textarea
                name="addressLine1En"
                defaultValue={primaryLocation.addressEn ?? ""}
                rows={4}
                maxLength={300}
                className={textareaClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Address AR
              <textarea
                name="addressLine1Ar"
                defaultValue={primaryLocation.addressAr ?? ""}
                rows={4}
                maxLength={300}
                className={textareaClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800 md:col-span-2">
              Map URL
              <input
                name="mapUrl"
                type="url"
                defaultValue={primaryLocation.mapUrl ?? ""}
                maxLength={2048}
                placeholder="https://maps.google.com/..."
                className={inputClassName()}
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Use a verified public map URL. Do not guess it from the address.
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-100 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950">
          <h3 className="font-bold">Save behavior</h3>
          <p className="mt-2 max-w-3xl">
            Saving writes an audit event and revalidates English and Arabic public profiles. Other active center workflows remain separate.
          </p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            className="inline-flex justify-center rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            Save primary location details
          </button>
          <Link href={`/admin/active-centers/${center.id}/locations`} className="text-sm font-bold text-cyan-700 hover:text-cyan-900">
            Back to active locations
          </Link>
        </div>
      </form>
    </div>
  );
}
