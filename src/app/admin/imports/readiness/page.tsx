import { ImportGeoPerformanceReadOnlyPanel } from "@/components/admin/import-geo-performance-readonly-panel";
import { getImportAdminGeoPerformanceReadOnlyModel } from "@/server/admin/import-admin-geo-performance-readonly";

export default function AdminImportReadinessPage() {
  const model = getImportAdminGeoPerformanceReadOnlyModel();

  return (
    <div className="space-y-6">
      <ImportGeoPerformanceReadOnlyPanel model={model} />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Read-only boundary</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
          This workspace reports contract targets only. It has no forms, buttons, server actions, database mutations, publish controls, sitemap controls, index toggles, or manual bypasses.
        </p>
      </section>
    </div>
  );
}
