import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminImportBatchDetail } from "@/server/admin/imports";

type AdminImportBatchDetailPageProps = {
  params: Promise<{ batchId: string }>;
};

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

export default async function AdminImportBatchDetailPage({
  params,
}: AdminImportBatchDetailPageProps) {
  const { batchId } = await params;
  const result = await getAdminImportBatchDetail(batchId);

  if (!result.ok) {
    if (result.reason === "not_found") notFound();

    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-2xl font-bold">Import batch unavailable</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6">
          This import batch could not be loaded right now. No raw database error is exposed here.
        </p>
      </section>
    );
  }

  const { batch } = result;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/imports" className="text-sm font-semibold text-cyan-800 hover:text-cyan-950">
          ← Back to imports
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">ADM-IMPORT-A</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-slate-950">{batch.batchName}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Read-only batch inspection. Review actions, Excel parsing, duplicate resolution, and public publishing are deferred to later phases.
            </p>
          </div>
          <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {formatLabel(batch.status)}
          </span>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Entity</p>
            <p className="mt-2 font-semibold text-slate-950">{formatLabel(batch.entityType)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total rows</p>
            <p className="mt-2 font-mono text-lg text-slate-950">{batch.totalRows}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Invalid rows</p>
            <p className="mt-2 font-mono text-lg text-slate-950">{batch.invalidRows}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duplicates</p>
            <p className="mt-2 font-mono text-lg text-slate-950">{batch.duplicateSuspectedRows}</p>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
          <div>
            <dt className="font-semibold text-slate-950">Source</dt>
            <dd>{batch.sourceName ?? batch.sourceType}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-950">File</dt>
            <dd>{batch.fileName ?? "Not registered"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-950">Updated</dt>
            <dd>{formatDate(batch.updatedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Validation issues</h3>
          {result.validationIssues.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-slate-600">No validation issues recorded yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {result.validationIssues.map((issue) => (
                <li key={issue.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-semibold text-slate-950">{formatLabel(issue.severity)} · {issue.issue_code}</p>
                  <p className="mt-1 text-slate-700">{issue.issue_message}</p>
                  {issue.field_name ? <p className="mt-1 text-xs text-slate-500">Field: {issue.field_name}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Duplicate candidates</h3>
          {result.duplicateCandidates.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-slate-600">No duplicate candidates recorded yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {result.duplicateCandidates.map((candidate) => (
                <li key={candidate.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-semibold text-slate-950">{candidate.match_score}% · {formatLabel(candidate.resolution_status)}</p>
                  <p className="mt-1 text-slate-700">{candidate.match_reason}</p>
                  <p className="mt-1 text-xs text-slate-500">Matched: {formatLabel(candidate.matched_entity_type)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Raw row preview</h3>
        {result.rawRows.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">No parsed rows are available yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">External ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Last checked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.rawRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-mono text-slate-700">{row.row_number}</td>
                    <td className="px-4 py-3 text-slate-700">{row.external_id ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{formatLabel(row.row_status)}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">{row.validation_score}</td>
                    <td className="px-4 py-3 text-slate-700">{row.last_checked_at ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Mapping results</h3>
          <p className="mt-2 text-sm text-slate-600">{result.mappingResults.length} mapping rows loaded for this read-only preview.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Publish queue</h3>
          <p className="mt-2 text-sm text-slate-600">{result.publishQueue.length} publish queue rows loaded. This phase does not publish or index any imported record.</p>
        </div>
      </section>
    </div>
  );
}
