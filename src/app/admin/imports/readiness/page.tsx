import { ImportGeoPerformanceReadOnlyPanel } from "@/components/admin/import-geo-performance-readonly-panel";
import { ImportPharmacyCompleteCanaryPanel } from "@/components/admin/import-pharmacy-complete-canary-panel";
import { ImportPharmacyExpiredReservationRecoveryPanel } from "@/components/admin/import-pharmacy-expired-reservation-recovery-panel";
import { ImportPharmacyPrivateAdminControlPanel } from "@/components/admin/import-pharmacy-private-admin-control-panel";
import { ImportReadinessReviewReadOnlyPanel } from "@/components/admin/import-readiness-review-readonly-panel";
import { requirePlatformAdmin } from "@/lib/permissions/admin";
import { getImportAdminGeoPerformanceReadOnlyModel } from "@/server/admin/import-admin-geo-performance-readonly";
import { getImportAdminReadinessReviewReadOnlyModel } from "@/server/admin/import-admin-readiness-review-readonly";
import {
  diagnosePharmacyAdminReadback,
  type PharmacyAdminReadbackDiagnostic,
} from "@/server/admin/import-pharmacy-admin-readback-diagnostic";
import { createPharmacyAdminStateMachineReaderFromEnvironment } from "@/server/admin/import-pharmacy-admin-state-machine-readback";
import { getPharmacyMinimalAdminUiModel } from "@/server/admin/import-pharmacy-minimal-admin-ui-model";

const diagnosticMessages: Record<PharmacyAdminReadbackDiagnostic, string> = {
  ready: "The Preview environment is readable, but the bounded state could not be constructed.",
  environment_not_preview: "This deployment is not running as a Vercel Preview.",
  supabase_url_missing: "The Preview Supabase URL is missing from this deployment.",
  service_role_key_missing: "The Preview service-role key is missing from this deployment.",
  actor_allowlist_invalid: "The Preview actor allowlist must contain exactly one entry.",
  entity_allowlist_invalid: "The Preview Pharmacy allowlist must contain exactly one entry.",
  actor_allowlist_mismatch: "The signed-in Admin does not match the configured Preview actor.",
  entity_allowlist_mismatch: "The selected Pharmacy does not match the configured Preview canary.",
  entity_not_found: "The configured Preview Pharmacy no longer exists.",
  centers_read_failed: "The Preview Pharmacy could not be read from the server.",
  read_states_read_failed: "The Preview dry-run and review state table could not be read.",
  authorizations_read_failed: "The Preview authorization state table could not be read.",
  reservations_read_failed: "The Preview Reservation state table could not be read.",
};

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
  const readbackDiagnostic = pharmacyUiModel.entityId && !initialStateMachine
    ? await diagnosePharmacyAdminReadback({
        actorId: admin.id,
        entityId: pharmacyUiModel.entityId,
      })
    : "ready";

  return (
    <div className="space-y-6">
      <ImportGeoPerformanceReadOnlyPanel model={geoPerformanceModel} />
      <ImportReadinessReviewReadOnlyPanel model={readinessReviewModel} />
      {!initialStateMachine ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
            Preview readback diagnosis
          </p>
          <p className="mt-2 text-sm font-semibold text-amber-950">
            {diagnosticMessages[readbackDiagnostic]}
          </p>
          <p className="mt-2 font-mono text-xs text-amber-800">
            Reference: {readbackDiagnostic}
          </p>
        </section>
      ) : null}
      <ImportPharmacyCompleteCanaryPanel
        entityId={pharmacyUiModel.entityId}
        activationEnabled={actorBoundActivation}
        initialStateMachine={initialStateMachine}
      />
      <ImportPharmacyExpiredReservationRecoveryPanel
        entityId={pharmacyUiModel.entityId}
        activationEnabled={actorBoundActivation}
        initialStateMachine={initialStateMachine}
      />
      <ImportPharmacyPrivateAdminControlPanel
        entityId={pharmacyUiModel.entityId}
        activationEnabled={actorBoundActivation}
        initialStateMachine={initialStateMachine}
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Controlled boundary</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
          Readiness data remains read-only. The Preview-only full-cycle control is available only to the single allowlisted Admin and Pharmacy and only after one exact entity-bound confirmation. It resumes from persisted truth, invokes each remaining operation at most once, and requires server readback before continuing. The manual and fail-closed recovery controls remain available as bounded fallback surfaces. Reservation, mutation, and rollback are never retried automatically. Public routing, indexing, sitemap inclusion, Production access, unattended execution, and bulk remain locked.
        </p>
      </section>
    </div>
  );
}
