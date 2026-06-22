import Link from "next/link";

import { listAdminMediaAssets, mediaReviewStatuses, mediaUsageKinds, mediaVisibilityStatuses } from "@/server/admin/media-library";

export default async function AdminMediaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filters = {
    usageKind: first(params.usageKind),
    reviewStatus: first(params.reviewStatus),
    visibilityStatus: first(params.visibilityStatus),
    archived: first(params.archived),
    search: first(params.search),
  };
  const result = await listAdminMediaAssets(filters);

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Media</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Media Library</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Protected admin catalog for private media asset metadata, review state, assignment visibility, and archive controls. Upload is disabled until private storage bucket configuration is approved.
        </p>
      </header>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <strong>Private foundation only.</strong> This page does not publish media, create public URLs, or change public rendering.
      </section>

      <form className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-5">
        <input name="search" defaultValue={filters.search ?? ""} placeholder="Search filename" className="rounded-2xl border border-slate-200 px-3 py-2 text-sm" />
        <Select name="usageKind" value={filters.usageKind} options={mediaUsageKinds} label="All usage" />
        <Select name="reviewStatus" value={filters.reviewStatus} options={mediaReviewStatuses} label="All review" />
        <Select name="visibilityStatus" value={filters.visibilityStatus} options={mediaVisibilityStatuses} label="All visibility" />
        <select name="archived" defaultValue={filters.archived ?? "active"} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm">
          <option value="active">Active</option><option value="archived">Archived</option><option value="all">All</option>
        </select>
        <button className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white md:col-span-5">Apply filters</button>
      </form>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-950">Assets</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Upload disabled: private storage configuration required</span>
        </div>
        {!result.ok ? <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">Media library could not be loaded.</p> : result.items.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No media assets yet.</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500"><tr><th className="p-3">Preview</th><th className="p-3">Filename</th><th className="p-3">Usage</th><th className="p-3">MIME</th><th className="p-3">Size</th><th className="p-3">Admin review</th><th className="p-3">Public status</th><th className="p-3">Visibility</th><th className="p-3">Archived</th><th className="p-3">Assignments</th><th className="p-3">Created</th><th className="p-3">Updated</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{result.items.map((asset) => <tr key={asset.id}><td className="p-3"><div className="grid h-12 w-16 place-items-center rounded-xl bg-slate-100 text-xs text-slate-500">Private</div></td><td className="p-3 font-medium"><Link href={`/admin/media/${asset.id}`} className="text-blue-700 hover:underline">{asset.originalFilename ?? asset.id}</Link></td><td className="p-3">{asset.usageKind}</td><td className="p-3">{asset.mimeType ?? "—"}</td><td className="p-3">{formatBytes(asset.sizeBytes)}</td><td className="p-3">{asset.reviewStatus}</td><td className="p-3">{asset.publicStatus}</td><td className="p-3">{asset.visibilityStatus}</td><td className="p-3">{asset.isArchived ? "Archived" : "Active"}</td><td className="p-3">{asset.assignmentCount}</td><td className="p-3">{formatDate(asset.createdAt)}</td><td className="p-3">{formatDate(asset.updatedAt)}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Select({ name, value, options, label }: { name: string; value: string | undefined; options: readonly string[]; label: string }) { return <select name={name} defaultValue={value ?? ""} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"><option value="">{label}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>; }
function first(value: string | string[] | undefined): string | undefined { return Array.isArray(value) ? value[0] : value; }
function formatDate(value: string): string { return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value)); }
function formatBytes(value: number | null): string { if (value === null) return "—"; if (value < 1024) return `${value} B`; if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`; return `${(value / 1024 / 1024).toFixed(1)} MB`; }
