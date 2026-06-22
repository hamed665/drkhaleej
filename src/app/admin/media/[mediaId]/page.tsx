import { notFound } from "next/navigation";

import {
  archiveAdminMediaAsset,
  restoreAdminMediaAsset,
  updateAdminMediaAssetMetadata,
} from "@/server/admin/media-library-actions";
import {
  getAdminMediaAsset,
  mediaReviewStatuses,
  mediaUsageKinds,
  mediaVisibilityStatuses,
} from "@/server/admin/media-library";

export default async function AdminMediaDetailPage({ params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const result = await getAdminMediaAsset(mediaId);
  if (!result.ok) notFound();
  const { item, assignments } = result;

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Media asset</p>
        <h1 className="mt-2 break-words text-3xl font-bold text-slate-950">{item.originalFilename ?? item.id}</h1>
        <p className="mt-3 text-sm text-slate-600">
          Public rendering is not controlled here. This admin foundation does not publish assets or create public URLs.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid h-64 place-items-center rounded-3xl bg-slate-100 text-sm font-semibold text-slate-500">
            Private preview unavailable
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            <Row label="ID" value={item.id} />
            <Row label="Bucket" value={item.storageBucket ?? "—"} />
            <Row label="Path" value={item.storagePath ?? "—"} />
            <Row label="MIME" value={item.mimeType ?? "—"} />
            <Row label="Size" value={formatBytes(item.sizeBytes)} />
            <Row label="Dimensions" value={item.width && item.height ? `${item.width}×${item.height}` : "—"} />
            <Row label="Created" value={formatDate(item.createdAt)} />
            <Row label="Updated" value={formatDate(item.updatedAt)} />
            <Row label="Archived" value={item.isArchived ? "Archived" : "Active"} />
          </dl>
          <form action={item.isArchived ? restoreAdminMediaAsset : archiveAdminMediaAsset} className="mt-5">
            <input type="hidden" name="mediaId" value={item.id} />
            <button className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              {item.isArchived ? "Restore asset" : "Archive asset"}
            </button>
          </form>
        </div>

        <form action={updateAdminMediaAssetMetadata} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <input type="hidden" name="mediaId" value={item.id} />
          <h2 className="text-lg font-bold text-slate-950">Admin-safe metadata</h2>
          <div className="mt-4 grid gap-4">
            <Field name="altTextEn" label="Alt text EN" value={item.altTextEn} maxLength={180} />
            <Field name="altTextAr" label="Alt text AR" value={item.altTextAr} maxLength={180} />
            <Field name="captionEn" label="Caption EN" value={item.captionEn} maxLength={300} textarea />
            <Field name="captionAr" label="Caption AR" value={item.captionAr} maxLength={300} textarea />
            <Select name="usageKind" label="Usage kind" value={item.usageKind} options={mediaUsageKinds} />
            <Select name="reviewStatus" label="Review status" value={item.reviewStatus} options={mediaReviewStatuses} />
            <Select name="visibilityStatus" label="Visibility status" value={item.visibilityStatus} options={mediaVisibilityStatuses} />
          </div>
          <button className="mt-5 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            Save metadata
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Current assignments</h2>
        {assignments.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No active entity assignments.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Usage</th>
                  <th className="p-3">Review</th>
                  <th className="p-3">Public visible</th>
                  <th className="p-3">Primary</th>
                  <th className="p-3">Featured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="p-3">{assignment.entityType}: {assignment.entityId}</td>
                    <td className="p-3">{assignment.usageKind}</td>
                    <td className="p-3">{assignment.mediaReviewStatus}</td>
                    <td className="p-3">{assignment.publicMediaVisible ? "Yes" : "No"}</td>
                    <td className="p-3">{assignment.isPrimary ? "Yes" : "No"}</td>
                    <td className="p-3">{assignment.isFeatured ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 pb-2">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="break-words text-slate-800">{value}</dd>
    </div>
  );
}

function Field({ name, label, value, maxLength, textarea }: { name: string; label: string; value: string | null; maxLength: number; textarea?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      {textarea ? (
        <textarea name={name} defaultValue={value ?? ""} maxLength={maxLength} className="min-h-24 rounded-2xl border border-slate-200 px-3 py-2 font-normal" />
      ) : (
        <input name={name} defaultValue={value ?? ""} maxLength={maxLength} className="rounded-2xl border border-slate-200 px-3 py-2 font-normal" />
      )}
    </label>
  );
}

function Select({ name, label, value, options }: { name: string; label: string; value: string; options: readonly string[] }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <select name={name} defaultValue={value} className="rounded-2xl border border-slate-200 px-3 py-2 font-normal">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatBytes(value: number | null): string {
  if (value === null) return "—";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
