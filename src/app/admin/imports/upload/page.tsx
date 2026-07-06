import Link from "next/link";

import { ImportUploadForm } from "@/components/admin/import-upload-form";
import { requireAdminPermission } from "@/server/admin/permissions";

const uploadGuardrails = [
  "Accepts approved spreadsheet templates only: Doctor Profile v3, Pharmacy v1, or Hospital v1.",
  "Parses rows into protected staging tables only; it does not publish profiles, index URLs, update sitemap output, or create public pages.",
  "Requires imports.upload permission before the form is shown and again inside the server action.",
  "Limits each upload to 5 MB and stages at most 500 parsed rows in this phase.",
  "Writes admin audit events for the batch and registered file after parsing succeeds.",
];

export const metadata = {
  title: "Upload Import Spreadsheet | DrKhaleej Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminImportUploadPage() {
  await requireAdminPermission("imports.upload");

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-cyan-100 bg-cyan-50/70 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-800">
              ADM-IMPORT-UPLOAD
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-slate-950">
              Import upload workspace
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
              Upload approved Excel, CSV, or TSV import templates into protected staging. This workspace is intentionally separated from public publishing so an uploaded spreadsheet cannot create live profile pages by accident, which is apparently a thing systems need to be told not to do.
            </p>
          </div>
          <Link
            href="/admin/imports"
            className="inline-flex w-fit rounded-2xl border border-cyan-200 bg-white px-4 py-2 text-sm font-bold text-cyan-800 transition hover:border-cyan-300 hover:text-cyan-950"
          >
            Back to import batches
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950">Upload guardrails</h3>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700 md:grid-cols-2">
          {uploadGuardrails.map((item) => (
            <li key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <ImportUploadForm />
    </div>
  );
}
