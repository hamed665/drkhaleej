"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  uploadImportSpreadsheet,
  type ImportUploadState,
} from "@/server/admin/import-upload-actions";

const initialState: ImportUploadState = {
  ok: false,
  message: null,
};

function inputClassName(): string {
  return "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
}

export function ImportUploadForm() {
  const [state, formAction, isPending] = useActionState(
    uploadImportSpreadsheet,
    initialState,
  );

  return (
    <section className="rounded-3xl border border-cyan-100 bg-cyan-50/70 p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-800">
            ADM-IMPORT-B
          </p>
          <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-slate-950">
            Upload spreadsheet into staging
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            Upload Doctor v3, Pharmacy v1, or Hospital v1 spreadsheets. This stores parsed rows only in protected staging tables. It does not create public profiles, publish pages, index URLs, upload media, or change the sitemap.
          </p>
        </div>
        <span className="w-fit rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-bold text-cyan-800">
          staging only
        </span>
      </div>

      <form action={formAction} className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-800">
          Template
          <select name="templateKey" className={inputClassName()} disabled={isPending} required>
            <option value="doctor_profile_v3">Doctor Profile v3</option>
            <option value="pharmacy_v1">Pharmacy v1</option>
            <option value="hospital_v1">Hospital v1</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          Batch name
          <input
            name="batchName"
            className={inputClassName()}
            maxLength={180}
            placeholder="Example: MOH doctors batch 2026-06-24"
            disabled={isPending}
            required
          />
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          Source name
          <input
            name="sourceName"
            className={inputClassName()}
            maxLength={180}
            placeholder="Example: Oman MOH"
            disabled={isPending}
          />
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          File
          <input
            name="importFile"
            type="file"
            accept=".xlsx,.csv,.tsv"
            className={inputClassName()}
            disabled={isPending}
            required
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">
            Maximum 5 MB. Up to 500 parsed rows are staged per upload in this phase.
          </span>
        </label>

        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex rounded-2xl bg-cyan-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isPending ? "Parsing into staging…" : "Upload to staging"}
          </button>
        </div>
      </form>

      {state.message ? (
        <div
          className={`mt-5 rounded-2xl border p-4 text-sm ${
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
        >
          <p className="font-semibold">{state.ok ? "Upload parsed" : "Upload blocked"}</p>
          <p className="mt-1">{state.message}</p>
          {state.ok && state.batchId ? (
            <p className="mt-2">
              <Link className="font-bold underline" href={`/admin/imports/${state.batchId}`}>
                Open staged batch
              </Link>
              {typeof state.totalRows === "number" ? (
                <span className="ml-2 text-xs">
                  {state.totalRows} rows · {state.validRows ?? 0} valid · {state.invalidRows ?? 0} invalid
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
