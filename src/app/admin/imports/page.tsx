import Link from "next/link";

import { ImportUploadForm } from "@/components/admin/import-upload-form";
import { getAdminImportSitemapRuntimeQa } from "@/server/admin/import-sitemap-monitoring";
import { listAdminImportBatches } from "@/server/admin/imports";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatLabel(value: string): string {
  return value
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function AdminImportsPage() {
  const [result, sitemapQa] = await Promise.all([
    listAdminImportBatches(),
    getAdminImportSitemapRuntimeQa(),
  ]);

  if (!result.ok) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <p className="text-sm font-semibold uppercase tracking-[0.2em]">ADM-IMPORT-A</p>
        <h2 className="mt-2 text-2xl font-bold">Import batches unavailable</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6">
          Import staging records could not be loaded right now. No raw database error is exposed here.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-cyan-100 bg-cyan-50/70 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-800">ADM-IMPORT-A</p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-slate-950">
          Unified import staging
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
          Protected staging foundation for doctor, hospital, pharmacy, clinic, laboratory, and medical-center import batches. Uploads parse approved spreadsheets into staging rows; public sitemap entries are now gated by reviewed queue state.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-cyan-200 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Visible batches</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{result.items.length}</p>
          </div>
          <div className="rounded-2xl border border-cyan-200 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">List limit</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{result.limit}</p>
          </div>
          <div className="rounded-2xl border border-cyan-200 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Public state</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">Gated sitemap only</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-fuchsia-100 bg-fuchsia-50/70 p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-800">ADM-SITEMAP-C</p>
            <h3 className="mt-2 text-xl font-bold text-slate-950">Sitemap runtime QA</h3>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
              Runtime snapshot for import sitemap queue health. This monitor does not change public sitemap output; it only surfaces unsafe included rows, duplicate canonical paths, pending eligible rows, and noindex rows still excluded from sitemap.
            </p>
          </div>
          {sitemapQa.ok ? (
            <span className="w-fit rounded-full border border-fuchsia-200 bg-white/80 px-3 py-1 text-xs font-bold text-fuchsia-900">
              {sitemapQa.warnings.length === 0 ? "Clean" : `${sitemapQa.warnings.length} warnings`}
            </span>
          ) : (
            <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
              Unavailable
            </span>
          )}
        </div>

        {sitemapQa.ok ? (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700">Safe included</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{sitemapQa.safeIncludedRows}</p>
              </div>
              <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700">Unsafe included</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{sitemapQa.unsafeIncludedRows}</p>
              </div>
              <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700">Eligible pending</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{sitemapQa.eligibleRows}</p>
              </div>
              <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700">Noindex excluded</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{sitemapQa.noindexRows}</p>
              </div>
              <div className="rounded-2xl border border-fuchsia-200 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700">Duplicate canonicals</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{sitemapQa.duplicateCanonicalRows}</p>
              </div>
            </div>
            <dl className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
              <div>
                <dt className="font-semibold text-slate-950">Rows read</dt>
                <dd>{sitemapQa.rowsRead} / {sitemapQa.limit}{sitemapQa.truncated ? " (limit reached)" : ""}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-950">Missing canonical</dt>
                <dd>{sitemapQa.missingCanonicalRows}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-950">Latest included</dt>
                <dd>{sitemapQa.latestIncludedAt ? formatDate(sitemapQa.latestIncludedAt) : "None"}</dd>
              </div>
            </dl>
            {sitemapQa.warnings.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {sitemapQa.warnings.map((warning) => (
                  <span key={warning} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                    {formatLabel(warning)}
                  </span>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-sm leading-6 text-slate-700">
            Sitemap runtime QA could not be loaded right now. Public sitemap output is not changed by this card.
          </p>
        )}
      </section>

      <ImportUploadForm />

      {result.items.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-950">No import batches yet</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Upload an approved Doctor v3, Pharmacy v1, or Hospital v1 spreadsheet above. Parsed rows will appear here after they are stored in protected staging.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h3 className="text-xl font-bold text-slate-950">Recent import batches</h3>
            <p className="mt-1 text-sm text-slate-600">Read-only operational overview for staged imports.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Rows</th>
                  <th className="px-4 py-3">Issues</th>
                  <th className="px-4 py-3">Duplicates</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.items.map((batch) => (
                  <tr key={batch.id} className="align-top">
                    <td className="px-4 py-4">
                      <Link className="font-semibold text-cyan-800 hover:text-cyan-950" href={`/admin/imports/${batch.id}`}>
                        {batch.batchName}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">{batch.fileName ?? "No file registered"}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{formatLabel(batch.entityType)}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        {formatLabel(batch.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <div>{batch.totalRows} total</div>
                      <div className="text-xs text-slate-500">{batch.validRows} valid</div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{batch.invalidRows}</td>
                    <td className="px-4 py-4 text-slate-700">{batch.duplicateSuspectedRows}</td>
                    <td className="px-4 py-4 text-slate-700">{formatDate(batch.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
