import type { AdminDraftCenterLocation } from "@/server/admin/draft-center-locations";

type DraftCenterLocationPanelProps = {
  locations: AdminDraftCenterLocation[];
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

function LocationCard({ location }: { location: AdminDraftCenterLocation }) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-800">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h4 className="font-bold text-slate-950">
            {displayText(location.nameEn ?? location.nameAr)}
          </h4>
          <p className="mt-1 leading-6 text-slate-600">
            {displayText(location.addressLine1En ?? location.addressLine1Ar)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
            Active: {yesNo(location.isActive)}
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
            Primary: {yesNo(location.isPrimary)}
          </span>
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
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Contact review</dt>
          <dd className="mt-1 font-semibold">{location.contactReviewStatus}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Updated</dt>
          <dd className="mt-1 font-semibold">{formatDateTime(location.updatedAt)}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs font-semibold text-slate-500">
        Phone visible: {yesNo(location.publicPrimaryPhoneVisible)} · WhatsApp visible: {yesNo(location.publicWhatsappPhoneVisible)} · This panel is read-only.
      </p>
    </li>
  );
}

export function DraftCenterLocationPanel({ locations }: DraftCenterLocationPanelProps) {
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
            Read-only location candidates attached to this draft center. This panel does not activate, publish, verify, expose contact details, or create location records.
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
        <ul className="mt-5 grid gap-3">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </ul>
      )}
    </section>
  );
}
