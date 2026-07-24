import { ImportGeoPerformanceReadOnlyPanel } from "@/components/admin/import-geo-performance-readonly-panel";
import { ImportPharmacyPrivateAdminControlPanel } from "@/components/admin/import-pharmacy-private-admin-control-panel";
import { ImportReadinessReviewReadOnlyPanel } from "@/components/admin/import-readiness-review-readonly-panel";
import { requirePlatformAdmin } from "@/lib/permissions/admin";
import { getImportAdminGeoPerformanceReadOnlyModel } from "@/server/admin/import-admin-geo-performance-readonly";
import { getImportAdminReadinessReviewReadOnlyModel } from "@/server/admin/import-admin-readiness-review-readonly";
import { createPharmacyAdminStateMachineReaderFromEnvironment } from "@/server/admin/import-pharmacy-admin-state-machine-readback";
import { getPharmacyMinimalAdminUiModel } from "@/server/admin/import-pharmacy-minimal-admin-ui-model";

export default async function AdminImportReadinessPage() {
  const admin = await requirePlatformAdmin();
  const geoPerformanceModel = getImportAdminGeoPerformanceReadOnlyModel();
  const readinessReviewModel = getImportAdminReadinessReviewReadOnlyModel();
  const pharmacyUiModel = getPharmacyMinimalAdminUiModel();
  const stateReader = createPharmacyAdminStateMachineReaderFromEnvironment();
  const actorBoundActivation =
    pharmacyUiModel.activationEnabled && pharmacyUiModel.actorId === admin.id;
  const initialStateMachine = actorBoundActivation && pharmacyUiModel.entityId && stateReader
    ? await stateReader({
        actorId: admin.id,
        entityId: pharmacyUiModel.entityId,
        now: new Date().toISOString(),
      })
    : null;

  return (
    <div className="space-y-6">
      <ImportGeoPerformanceReadOnlyPanel model={geoPerformanceModel} />
      <ImportReadinessReviewReadOnlyPanel model={readinessReviewModel} />
      <ImportPharmacyPrivateAdminControlPanel
        entityId={pharmacyUiModel.entityId}
        activationEnabled={actorBoundActivation}
        initialStateMachine={initialStateMachine}
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Controlled boundary</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
          Readiness data remains read-only. The separate Preview-only Pharmacy control panel exposes manual dry-run, exact review, Reservation, private publish, and rollback only to the single allowlisted admin and only when bounded server readback makes the next stage available. Refresh is readback-only. Reservation, mutation, and rollback are never retried automatically. Public routing, indexing, sitemap inclusion, Production access, P09 automatic canary execution, and bulk remain locked.
        </p>
      </section>
    </div>
  );
}
