import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminActiveCenterLocations } from "@/server/admin/active-center-locations";
import type { AdminActiveLocation } from "@/server/admin/active-center-locations";

type PageProps = {
  params: Promise<{
    centerId: string;
  }>;
};

function displayText(value: string | null): string {
  return value && value.trim().length > 0 ? value : "—";
}

function yesNo(value: boolean): string {
  return value ? "yes" : "no";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return new Intl.DateTimeFormat("en-OM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Muscat",
  }).format(date);
}

function LocationCard({ location }: { location: AdminActiveLocation }) {
  return (
    <li className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50/40 p-4 text-sm text-slate-800 shadow-sm ring-1 ring-white/80">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-800 shadow-sm">
              Active location
            </span>
            {location.isPrimary ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                Primary
              </span>
            ) : null}
          </div>
          <h4 className="mt-3 text-base font-bold text-slate-950">
            {displayText(location.nameEn ?? location.nameAr)}
          </h4>
          <p className="mt-1 leading-6 text-slate-600">
            {displayText(location.addressEn ?? location.addressAr)}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
            Primary: {yesNo(location.isPrimary)}
          </span>
          {location.mapUrl ? (
            <Link href={location.mapUrl} className="text-xs font-bold text-cyan-700 hover:text-cyan-900">
              Open map URL
            </Link>
          ) : (
            <span className="text-xs font-semibold text-slate-500">No map URL</span>
          )}
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
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Sort order</dt>
          <dd className="mt-1 font-semibold">{location.sortOrder}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Updated</dt>
          <dd className="mt-1 font-semibold">{formatDate(location.updatedAt)}</dd>
        </div>
      </dl>

      <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-600">
        Read-only preview. Location editing must use a separate guarded route.
      </p>
    </li>
  );
}

export default async function AdminActiveCenterLocationsPage({ params }: PageProps) {
  const { centerId } = await params;
  const result = await getAdminActiveCenterLocations(centerId);

  if (!result.ok) {
    if (result.reason === "not_found") notFound();

    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-xl font-bold">Active center locations unavailable</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6">
          Active center locations could not be loaded right now. No raw database error is exposed here.
        </p>
      </section>
    );
  }

  const { center, locations } = result;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-cyan-50/40 to-white p-6 shadow-sm ring-1 ring-white/80">
        <p className="inline-flex rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 shadow-sm">
          ACTIVE_CENTER_LOCATIONS_READONLY
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-slate-950">Active center locations</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Read-only view for active center location records. This page does not edit addresses, map URLs, primary status, contact values, or public profile state.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
          <Link href="/admin/active-centers" className="text-cyan-700 hover:text-cyan-900">
            Back to active centers
          </Link>
          <Link href={`/admin/active-centers/${center.id}`} className="text-cyan-700 hover:text-cyan-900">
            Public state readiness
          </Link>
          <Link href={`/admin/active-centers/${center.id}/locations/edit-primary`} className="text-cyan-700 hover:text-cyan-900">
            Edit primary location
          </Link>
          <Link href={`/admin/active-centers/${center.id}/edit-contact`} className="text-cyan-700 hover:text-cyan-900">
            Edit public contact info
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
          <p className="font-bold">Public routes</p>
          <div className="mt-1 flex flex-col gap-1">
            <Link href={center.publicPathEn} className="break-all font-semibold text-cyan-800 hover:text-cyan-950">
              {center.publicPathEn}
            </Link>
            <Link href={center.publicPathAr} className="break-all font-semibold text-cyan-800 hover:text-cyan-950">
              {center.publicPathAr}
            </Link>
          </div>
        </div>
        <div>
          <p className="font-bold">Active locations</p>
          <p className="mt-1">{locations.length} record{locations.length === 1 ? "" : "s"}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        {locations.length === 0 ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            No active locations were found for this center.
          </p>
        ) : (
          <ul className="grid gap-4">
            {locations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
