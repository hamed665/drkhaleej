import type { ImportAdminGeoPerformanceReadOnlyModel } from "@/server/admin/import-admin-geo-performance-readonly";

export function ImportGeoPerformanceReadOnlyPanel({
  model,
}: {
  model: ImportAdminGeoPerformanceReadOnlyModel;
}) {
  return (
    <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800">ADM-GEO-PERF-READONLY</p>
          <h3 className="mt-2 text-xl font-bold text-slate-950">Geo and performance readiness</h3>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
            Read-only contract snapshot for Oman geo coverage and public performance budgets. This panel cannot write geo data, publish entities, change index policy, or include anything in sitemap output.
          </p>
        </div>
        <span className="w-fit rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-bold text-emerald-900">
          {model.mode.replace("_", " ")}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-white/80 p-5">
          <h4 className="font-bold text-slate-950">Oman geo authority target</h4>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
            <div><dt className="font-semibold text-slate-950">Country</dt><dd>{model.geo.countryCode.toUpperCase()}</dd></div>
            <div><dt className="font-semibold text-slate-950">Governorates</dt><dd>{model.geo.expectedGovernorates}</dd></div>
            <div><dt className="font-semibold text-slate-950">Wilayats</dt><dd>{model.geo.expectedWilayats}</dd></div>
            <div><dt className="font-semibold text-slate-950">Muscat areas</dt><dd>{model.geo.expectedMuscatAreas}</dd></div>
            <div><dt className="font-semibold text-slate-950">DB write ready</dt><dd>{model.geo.databaseWriteReady ? "Yes" : "No"}</dd></div>
            <div><dt className="font-semibold text-slate-950">Public geo ready</dt><dd>{model.geo.publicGeoReady ? "Yes" : "No"}</dd></div>
          </dl>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white/80 p-5">
          <h4 className="font-bold text-slate-950">Public performance budget</h4>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
            <div><dt className="font-semibold text-slate-950">Queries</dt><dd>≤ {model.performance.maxPublicRenderQueries}</dd></div>
            <div><dt className="font-semibold text-slate-950">TTFB max</dt><dd>{model.performance.maxPublicRenderTtfbMs} ms</dd></div>
            <div><dt className="font-semibold text-slate-950">TTFB target</dt><dd>{model.performance.targetPublicRenderTtfbMs} ms</dd></div>
            <div><dt className="font-semibold text-slate-950">LCP max</dt><dd>{model.performance.maxLargestContentfulPaintMs} ms</dd></div>
            <div><dt className="font-semibold text-slate-950">INP max</dt><dd>{model.performance.maxInteractionToNextPaintMs} ms</dd></div>
            <div><dt className="font-semibold text-slate-950">CLS max</dt><dd>{model.performance.maxCumulativeLayoutShift}</dd></div>
            <div><dt className="font-semibold text-slate-950">HTML payload</dt><dd>≤ {model.performance.maxHtmlPayloadKb} KB</dd></div>
            <div><dt className="font-semibold text-slate-950">Route JS</dt><dd>≤ {model.performance.maxRouteJsPayloadKb} KB</dd></div>
          </dl>
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-emerald-900">
        Allowed actions: none
      </p>
    </section>
  );
}
