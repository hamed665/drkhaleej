import "server-only";

import type { PharmacyAdminBoundedReadState } from "./import-pharmacy-admin-bounded-read-state";
import {
  createPharmacyPublishAuthorizationEnvelopeService,
  type PharmacyPublishAuthorizationEnvelope,
  type PharmacyPublishAuthorizationEnvelopeStore,
} from "./import-pharmacy-publish-authorization-envelope";
import type { PharmacyPreviewPublishCapability } from "./import-pharmacy-preview-publish-capability";

export type PharmacyPreviewPublishAuthorizationIssueResult = {
  capability: PharmacyPreviewPublishCapability;
  authorization: PharmacyPublishAuthorizationEnvelope | null;
};

function lockCapability(
  capability: PharmacyPreviewPublishCapability,
  blocker: "authorization_store_unavailable" | "authorization_issue_failed",
): PharmacyPreviewPublishCapability {
  return {
    ...capability,
    visible: false,
    mode: "locked",
    blockers: [...new Set([...capability.blockers, blocker])],
  };
}

export async function issuePharmacyPreviewPublishAuthorization(input: {
  capability: PharmacyPreviewPublishCapability;
  actorId: string;
  entityId: string;
  reviewState: PharmacyAdminBoundedReadState;
  store: PharmacyPublishAuthorizationEnvelopeStore | null;
}): Promise<PharmacyPreviewPublishAuthorizationIssueResult> {
  if (!input.capability.visible || input.capability.executable !== false) {
    return { capability: input.capability, authorization: null };
  }
  if (!input.store) {
    return {
      capability: lockCapability(input.capability, "authorization_store_unavailable"),
      authorization: null,
    };
  }

  const authorization = await createPharmacyPublishAuthorizationEnvelopeService(input.store).issue({
    actorId: input.actorId,
    entityId: input.entityId,
    reviewSnapshotHash: input.reviewState.snapshotHash,
    entityFingerprint: input.reviewState.entityFingerprint,
  });

  return authorization
    ? { capability: input.capability, authorization }
    : {
        capability: lockCapability(input.capability, "authorization_issue_failed"),
        authorization: null,
      };
}
