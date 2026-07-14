import "server-only";

import {
  createPharmacyPublishAuthorizationEnvelopeService,
  type PharmacyPublishAuthorizationEnvelopeStore,
  type PharmacyPublishAuthorizationLegacySecret,
} from "./import-pharmacy-publish-authorization-envelope";

export type PharmacyPreviewPublishAuthorizationConsumeBlocker =
  | "preview_environment_required"
  | "actor_not_allowlisted"
  | "entity_not_allowlisted"
  | "authorization_required"
  | "authorization_store_unavailable"
  | "authorization_identity_invalid"
  | "authorization_invalid_or_consumed";

export type PharmacyPreviewPublishAuthorizationConsumeResult = {
  authorized: boolean;
  executionEnabled: false;
  reservationAllowed: false;
  mutationAllowed: false;
  blockers: readonly PharmacyPreviewPublishAuthorizationConsumeBlocker[];
  publicVisibility: "private";
  indexEligible: false;
  sitemapEligible: false;
  routeEnabled: false;
  bulkAllowed: false;
};

function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

export async function consumePharmacyPreviewPublishAuthorization(input: {
  environment: string | undefined;
  actorId: string;
  entityId: string;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
  reviewSnapshotHash: string;
  entityFingerprint: string;
  authorization: PharmacyPublishAuthorizationLegacySecret | null;
  store: PharmacyPublishAuthorizationEnvelopeStore | null;
}): Promise<PharmacyPreviewPublishAuthorizationConsumeResult> {
  const blockers: PharmacyPreviewPublishAuthorizationConsumeBlocker[] = [];

  if (input.environment !== "preview") blockers.push("preview_environment_required");
  if (!input.allowedActorIds.includes(input.actorId)) blockers.push("actor_not_allowlisted");
  if (!input.allowedEntityIds.includes(input.entityId)) blockers.push("entity_not_allowlisted");
  if (!input.authorization) blockers.push("authorization_required");
  if (!input.store) blockers.push("authorization_store_unavailable");
  if (
    input.actorId.trim().length === 0 ||
    input.entityId.trim().length === 0 ||
    !isSha256(input.reviewSnapshotHash) ||
    !isSha256(input.entityFingerprint)
  ) blockers.push("authorization_identity_invalid");

  let authorized = false;
  if (blockers.length === 0 && input.authorization && input.store) {
    authorized = await createPharmacyPublishAuthorizationEnvelopeService(input.store).verifyAndConsume({
      token: input.authorization.token,
      nonce: input.authorization.nonce,
      actorId: input.actorId,
      entityId: input.entityId,
      reviewSnapshotHash: input.reviewSnapshotHash,
      entityFingerprint: input.entityFingerprint,
    });
    if (!authorized) blockers.push("authorization_invalid_or_consumed");
  }

  return {
    authorized,
    executionEnabled: false,
    reservationAllowed: false,
    mutationAllowed: false,
    blockers: [...new Set(blockers)],
    publicVisibility: "private",
    indexEligible: false,
    sitemapEligible: false,
    routeEnabled: false,
    bulkAllowed: false,
  };
}
