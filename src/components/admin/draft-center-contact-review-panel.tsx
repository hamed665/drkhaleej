import type { AdminDraftCenterLocation } from "@/server/admin/draft-center-locations";

type DraftCenterContactReviewPanelProps = {
  centerId: string;
  locations: AdminDraftCenterLocation[];
};

function yesNo(value: boolean): string {
  return value ? "yes" : "no";
}

function displayText(value: string | null): string {
  return value && value.trim().length > 0 ? value : "Location candidate";
}

export function DraftCenterContactReviewPanel({ centerId, locations }: DraftCenterContactReviewPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-cyan-50/30 to-white p-5 shadow-sm ring-1 ring-white/80">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="inline-flex rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 shadow-sm">
            CENTER-CONTACT-A
          </p>
          <h3 className="mt-3 text-xl font-bold text-slate-950">Draft location contact review</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            Read-only admin surface for reviewed location contact flags. Provider publication remains blocked by a separate workflow.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
          <p className="font-bold">Safety boundary</p>
          <p className="mt-1 text-xs font-semibold leading-5">This panel does not publish or revalidate public routes.</p>
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          No location candidates exist yet.
        </div>
      ) : (
        <ul className="mt-5 grid gap-3">
          {locations.map((location) => (
            <li key={location.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h4 className="font-bold text-slate-950">{displayText(location.nameEn ?? location.nameAr)}</h4>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Location id: {location.id}</p>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                    Active: {yesNo(location.isActive)}
                  </span>
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                    Review: {location.contactReviewStatus}
                  </span>
                </div>
              </div>
              <dl className="mt-3 grid gap-2 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Primary field</dt>
                  <dd className="mt-1 font-bold text-slate-800">{yesNo(location.publicPrimaryPhoneVisible)}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Messaging field</dt>
                  <dd className="mt-1 font-bold text-slate-800">{yesNo(location.publicWhatsappPhoneVisible)}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Mail field</dt>
                  <dd className="mt-1 font-bold text-slate-800">{yesNo(location.publicEmailVisible)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs font-semibold leading-5 text-slate-600">
                Prepared flags are stored for admin review only. Public profile display still depends on provider publication readiness.
              </p>
            </li>
          ))}
        </ul>
      )}
      <p className="sr-only">Draft center id: {centerId}</p>
    </section>
  );
}
