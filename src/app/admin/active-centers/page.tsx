import Link from "next/link";

import { listAdminActiveCenters } from "@/server/admin/active-centers";

function formatNeutralLabel(value: string): string {
  return value
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

export default async function AdminActiveCentersPage() {
  const result = await listAdminActiveCenters();

  if (!result.ok) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-xl font-bold">Active centers unavailable</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6">
          Active center records could not be loaded right now. No database error details are exposed here.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">READ_ONLY_ACTIVE_PROVIDER_VIEW</p>
        <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-slate-950">Active Centers</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Read-only view for centers that have left the draft workflow. Editing, verification changes, contact visibility changes, billing, claim, and commercial controls are intentionally not available here.
        </p>
      </section>

      <section className="rounded-3xl border border-cyan-100 bg-cyan-50/60 p-5 text-cyan-950">
        <h3 className="text-lg font-bold">Review path</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6">
          Use this page for read-only operational visibility. Activation evidence remains in the audit log under the action <code>draft_center.public_profile_activated</code>.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-950">Active center records</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Showing up to {result.limit} active records. These records are not part of the draft list.
            </p>
          </div>
          <Link href="/admin/draft-centers" className="text-sm font-semibold text-cyan-700 hover:text-cyan-900">
            Back to draft centers
          </Link>
        </div>

        {result.items.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            No active centers were found.
          </p>
        ) : (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Center</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Public flags</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3">Public routes</th>
                  <th className="px-4 py-3">Readiness</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {result.items.map((center) => (
                  <tr key={center.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-950">{center.nameEn}</p>
                      {center.nameAr ? <p className="mt-1 text-xs font-semibold text-slate-500">{center.nameAr}</p> : null}
                      <p className="mt-2 break-all text-xs text-slate-500">{center.id}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-600">/{center.slug}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatNeutralLabel(center.centerType)}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-700">{center.status}</td>
                    <td className="px-4 py-4 text-slate-700">
                      <p>Active: {center.isActive ? "yes" : "no"}</p>
                      <p className="mt-1">Claimable: {center.isClaimable ? "yes" : "no"}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-700">{center.verificationStatus}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <Link href={center.publicPathEn} className="font-semibold text-cyan-700 hover:text-cyan-900">
                          English public profile
                        </Link>
                        <Link href={center.publicPathAr} className="font-semibold text-cyan-700 hover:text-cyan-900">
                          Arabic public profile
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <Link href={`/admin/active-centers/${center.id}`} className="font-semibold text-cyan-700 hover:text-cyan-900">
                          View public state readiness
                        </Link>
                        <Link href={`/admin/active-centers/${center.id}/gates`} className="font-semibold text-cyan-700 hover:text-cyan-900">
                          View public action gates
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(center.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
