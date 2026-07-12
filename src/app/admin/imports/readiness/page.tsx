import { ImportGeoPerformanceReadOnlyPanel } from "@/components/admin/import-geo-performance-readonly-panel";
import { ImportPharmacyPrivateAdminControlPanel } from "@/components/admin/import-pharmacy-private-admin-control-panel";
import { ImportReadinessReviewReadOnlyPanel } from "@/components/admin/import-readiness-review-readonly-panel";
import { getImportAdminGeoPerformanceReadOnlyModel } from "@/server/admin/import-admin-geo-performance-readonly";
import { getImportAdminReadinessReviewReadOnlyModel } from "@/server/admin/import-admin-readiness-review-readonly";
import { getPharmacyMinimalAdminUiModel } from "@/server/admin/import-pharmacy-minimal-admin-ui-model";

export default function AdminImportReadinessPage() {
  const geoPerformanceModel = getImportAdminGeoPerformanceReadOnlyModel();
  const readinessReviewModel = getImportAdminReadinessReviewReadOnlyModel();
  const pharmacyUiModel = getPharmacyMinimalAdminUiModel();

  return (
    <div className="space-y-6">
      <ImportGeoPerformanceReadOnlyPanel model={geoPerformanceModel} />
      <ImportReadinessReviewReadOnlyPanel model={readinessReviewModel} />
      <ImportPharmacyPrivateAdminControlPanel
        entityId={pharmacyUiModel.entityId}
        activationEnabled={pharmacyUiModel.activationEnabled}
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Controlled boundary</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
          Readiness data remains read-only. For the single allowlisted Preview Pharmacy, dry-run and review may execute through the authenticated Server Action. Private publish, rollback, public routing, indexing, sitemap inclusion, and bulk execution remain locked.
        </p>
      </section>
    </div>
  );
}
