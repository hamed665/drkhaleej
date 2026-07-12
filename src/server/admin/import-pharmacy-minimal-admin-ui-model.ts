import "server-only";

import { resolvePharmacyPreviewCanaryActivation } from "./import-pharmacy-preview-canary-activation";

export type PharmacyMinimalAdminUiModel = {
  activationEnabled: boolean;
  entityId: string | null;
  mode: "preview_canary" | "locked";
  publicVisibility: "private";
  indexEligible: false;
  sitemapEligible: false;
  bulkAllowed: false;
};

export function getPharmacyMinimalAdminUiModel(
  environment: Record<string, string | undefined> = process.env,
): PharmacyMinimalAdminUiModel {
  const activation = resolvePharmacyPreviewCanaryActivation(environment);

  return {
    activationEnabled: activation.enabled,
    entityId: activation.enabled ? activation.entityId : null,
    mode: activation.enabled ? "preview_canary" : "locked",
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    bulkAllowed: false,
  };
}
