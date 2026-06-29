import Link from "next/link";

import type {
  AdminDraftCenterListItem,
  AdminDraftCentersListResult,
} from "@/server/admin/draft-centers";

type DraftCentersListProps = {
  result: AdminDraftCentersListResult;
};

function formatLabel(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim().length === 0) {
    return "—";
  }

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

function contactSummary(center: AdminDraftCenterListItem): string {
  return center.whatsappPhone ?? center.primaryPhone ?? center.email ?? "—";
}

function SourceSummary({ center }: { center: AdminDraftCenterListItem }) {
  const hasSource =
    center.createdFrom !== null ||
    center.sourceLeadId !== null ||
    center.sourceProviderType !== null ||
    center.sourceRequest !== null;

  if (!hasSource) {
    return <span className="text-slate-500">Manual or unavailable source</span>;
  }

  return (
    <div className="space-y-1 text-xs text-slate-600">
      <div>From: {formatLabel(center.createdFrom)}</div>
      <div>Provider type: {formatLabel(center.sourceProviderType)}</div>
      <div>Request: {formatLabel(center.sourceRequest)}</div>
      <div>Lead ID: {center.sourceLeadId ?? "—"}</div>
    </div>
  );
}

export function DraftCentersList({ result }: DraftCentersListProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          CENTER-B/D1
        </p>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-slate-950">
              Draft and review centers
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Review list for centers in draft or pending review status. This
              page does not publish, verify, bill, claim, or activate public
              center profiles. Draft detail editing and review readiness are
              handled in guarded admin forms.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
            <Link
              href="/admin/draft-centers/new"
              className="inline-flex justify-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Create draft center
            </Link>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-sm font-medium text-cyan-900">
              Fixed page size: {result.limit} centers
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm leading-6 text-slate-700">
          This list reads existing <strong>centers</strong> rows where status is
          draft or pending review. Manual creations, provider-lead conversions,
          and future import conversions all stay private until a separate public
          activation workflow allows them.
        </p>
      </section>

      {!result.ok ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h3 className="text-lg font-bold">Center workflow list unavailable</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6">
            Draft and pending-review centers could not be loaded right now. No
            raw database error is exposed here.
          </p>
        </section>
      ) : result.items.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <h3 className="text-xl font-bold text-slate-950">
            No draft or pending-review centers found
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Draft centers created manually, from provider onboarding leads, or
            from future reviewed imports will appear here before any public
            activation workflow is added.
          </p>
          <Link
            href="/admin/draft-centers/new"
            className="mt-4 inline-flex justify-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            Create first draft center
          </Link>
        </section>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[1220px] divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Center</th>
                <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                <th scope="col" className="px-4 py-3 font-semibold">State</th>
                <th scope="col" className="px-4 py-3 font-semibold">Contact</th>
                <th scope="col" className="px-4 py-3 font-semibold">Source</th>
                <th scope="col" className="px-4 py-3 font-semibold">Updated</th>
                <th scope="col" className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {result.items.map((center) => (
                <tr key={center.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-950">
                      {center.nameEn}
                    </div>
                    <div className="mt-1 text-slate-600">{center.slug}</div>
                    <div className="mt-2 text-xs text-slate-500">
                      Arabic: {center.nameAr ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-900">
                      {formatLabel(center.centerType)}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {center.defaultLocale.toUpperCase()} · {center.defaultCountry.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {formatLabel(center.status)}
                      </span>
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        {formatLabel(center.verificationStatus)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Active: {center.isActive ? "yes" : "no"} · Claimable: {center.isClaimable ? "yes" : "no"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {contactSummary(center)}
                  </td>
                  <td className="px-4 py-4">
                    <SourceSummary center={center} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    <div>{formatDateTime(center.updatedAt)}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Created: {formatDateTime(center.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/draft-centers/${center.id}`}
                      className="inline-flex rounded-2xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-900 transition hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                    >
                      Review details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
