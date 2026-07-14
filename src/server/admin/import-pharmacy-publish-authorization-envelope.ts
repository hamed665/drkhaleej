import "server-only";

import { createHash, randomBytes } from "node:crypto";

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const MAX_TTL_MS = 15 * 60 * 1000;

export type PharmacyPublishAuthorizationStatus = "issued" | "consumed" | "invalidated" | "expired";
export type PharmacyPublishAuthorizationUiStatus = "unavailable" | "ready" | "expired" | "invalidated" | "consumed";

export type PharmacyPublishAuthorizationEnvelopeRecord = {
  authorizationId: string;
  tokenHash: string;
  nonceHash: string;
  actorId: string;
  entityId: string;
  reviewStateId: string;
  reviewSnapshotHash: string;
  entityFingerprint: string;
  operationAttemptId: string;
  idempotencyKey: string;
  requestHash: string;
  patchHash: string;
  expectedEntityVersion: string;
  entityFamily: "pharmacy";
  operationScope: "reserve_private_publish";
  status: PharmacyPublishAuthorizationStatus;
  issuedAt: string;
  expiresAt: string;
  consumedAt: string | null;
  invalidatedAt: string | null;
  invalidationReason: string | null;
  consumedByReservationId: string | null;
};

export type PharmacyPublishAuthorizationCreateRecord = Omit<PharmacyPublishAuthorizationEnvelopeRecord, "authorizationId">;

export type PharmacyPublishAuthorizationEnvelopeStore = {
  resolveReviewStateId(operationAttemptId: string): Promise<string | null>;
  create(record: PharmacyPublishAuthorizationCreateRecord): Promise<string | null>;
  readByAuthorizationId(authorizationId: string): Promise<PharmacyPublishAuthorizationEnvelopeRecord | null>;
  readByTokenHash(tokenHash: string): Promise<PharmacyPublishAuthorizationEnvelopeRecord | null>;
  readByReviewStateId(reviewStateId: string): Promise<PharmacyPublishAuthorizationEnvelopeRecord | null>;
  invalidateActive(input: {
    actorId: string;
    entityId: string;
    operationScope: "reserve_private_publish";
    exceptReviewStateId: string;
    invalidatedAt: string;
    reason: string;
  }): Promise<number | null>;
  transition(input: {
    authorizationId: string;
    fromStatus: "issued";
    toStatus: "invalidated" | "expired";
    transitionedAt: string;
    reason: string | null;
  }): Promise<boolean>;
  consume(input: { tokenHash: string; nonceHash: string; consumedAt: string }): Promise<boolean>;
};

export type PharmacyPublishAuthorizationEnvelope = {
  authorizationId: string;
  expiresAt: string;
};

export type PharmacyPublishAuthorizationLegacySecret = {
  token: string;
  nonce: string;
};

export type PharmacyPublishAuthorizationIssued = {
  authorization: PharmacyPublishAuthorizationEnvelope;
  legacySecret: PharmacyPublishAuthorizationLegacySecret | null;
};

export type PharmacyPublishAuthorizationReadback = {
  authorizationReady: boolean;
  authorizationStatus: PharmacyPublishAuthorizationUiStatus;
  expiresAt: string | null;
};

type PharmacyPublishAuthorizationIdentity = {
  actorId: string;
  entityId: string;
  reviewSnapshotHash: string;
  entityFingerprint: string;
  operationAttemptId: string;
  idempotencyKey: string;
  requestHash: string;
  patchHash: string;
  expectedEntityVersion: string;
  entityFamily: "pharmacy";
  operationScope: "reserve_private_publish";
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}
function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}
function isUuid(value: string): boolean {
  return /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
}
function isIdentityValid(input: PharmacyPublishAuthorizationIdentity): boolean {
  return isNonEmpty(input.actorId) && isNonEmpty(input.entityId) && isUuid(input.operationAttemptId) &&
    isNonEmpty(input.idempotencyKey) && isSha256(input.reviewSnapshotHash) &&
    isSha256(input.entityFingerprint) && isSha256(input.requestHash) && isSha256(input.patchHash) &&
    isNonEmpty(input.expectedEntityVersion) && input.entityFamily === "pharmacy" &&
    input.operationScope === "reserve_private_publish";
}
function identityMatches(record: PharmacyPublishAuthorizationEnvelopeRecord, input: PharmacyPublishAuthorizationIdentity): boolean {
  return record.actorId === input.actorId && record.entityId === input.entityId &&
    record.reviewSnapshotHash === input.reviewSnapshotHash && record.entityFingerprint === input.entityFingerprint &&
    record.operationAttemptId === input.operationAttemptId && record.idempotencyKey === input.idempotencyKey &&
    record.requestHash === input.requestHash && record.patchHash === input.patchHash &&
    record.expectedEntityVersion === input.expectedEntityVersion && record.entityFamily === input.entityFamily &&
    record.operationScope === input.operationScope;
}
function toReadback(record: PharmacyPublishAuthorizationEnvelopeRecord): PharmacyPublishAuthorizationReadback {
  const status = record.status === "issued" ? "ready" : record.status;
  return {
    authorizationReady: status === "ready",
    authorizationStatus: status,
    expiresAt: record.expiresAt,
  };
}

export function createPharmacyPublishAuthorizationEnvelopeService(
  store: PharmacyPublishAuthorizationEnvelopeStore,
  options: { now?: () => Date; ttlMs?: number } = {},
) {
  const now = options.now ?? (() => new Date());
  const ttlMs = Math.min(Math.max(options.ttlMs ?? DEFAULT_TTL_MS, 60_000), MAX_TTL_MS);

  return {
    async issue(input: PharmacyPublishAuthorizationIdentity): Promise<PharmacyPublishAuthorizationIssued | null> {
      if (!isIdentityValid(input)) return null;

      const reviewStateId = await store.resolveReviewStateId(input.operationAttemptId);
      if (!reviewStateId || !isUuid(reviewStateId)) return null;

      const issuedAt = now();
      const existing = await store.readByReviewStateId(reviewStateId);
      if (existing) {
        if (!identityMatches(existing, input)) {
          if (existing.status === "issued") {
            await store.transition({
              authorizationId: existing.authorizationId,
              fromStatus: "issued",
              toStatus: "invalidated",
              transitionedAt: issuedAt.toISOString(),
              reason: "review_identity_changed",
            });
          }
          return null;
        }
        if (existing.status === "issued" && Date.parse(existing.expiresAt) > issuedAt.getTime()) {
          return {
            authorization: { authorizationId: existing.authorizationId, expiresAt: existing.expiresAt },
            legacySecret: null,
          };
        }
        if (existing.status === "issued") {
          await store.transition({
            authorizationId: existing.authorizationId,
            fromStatus: "issued",
            toStatus: "expired",
            transitionedAt: issuedAt.toISOString(),
            reason: null,
          });
        }
        return null;
      }

      const invalidatedCount = await store.invalidateActive({
        actorId: input.actorId,
        entityId: input.entityId,
        operationScope: "reserve_private_publish",
        exceptReviewStateId: reviewStateId,
        invalidatedAt: issuedAt.toISOString(),
        reason: "superseded_by_review",
      });
      if (invalidatedCount === null) return null;

      const token = randomBytes(32).toString("base64url");
      const nonce = randomBytes(24).toString("base64url");
      const expiresAt = new Date(issuedAt.getTime() + ttlMs);
      const authorizationId = await store.create({
        tokenHash: sha256(token), nonceHash: sha256(nonce), actorId: input.actorId, entityId: input.entityId,
        reviewStateId, reviewSnapshotHash: input.reviewSnapshotHash, entityFingerprint: input.entityFingerprint,
        operationAttemptId: input.operationAttemptId, idempotencyKey: input.idempotencyKey,
        requestHash: input.requestHash, patchHash: input.patchHash, expectedEntityVersion: input.expectedEntityVersion,
        entityFamily: "pharmacy", operationScope: "reserve_private_publish", status: "issued",
        issuedAt: issuedAt.toISOString(), expiresAt: expiresAt.toISOString(), consumedAt: null,
        invalidatedAt: null, invalidationReason: null, consumedByReservationId: null,
      });
      if (!authorizationId) return null;
      return {
        authorization: { authorizationId, expiresAt: expiresAt.toISOString() },
        legacySecret: { token, nonce },
      };
    },

    async readback(input: PharmacyPublishAuthorizationIdentity & { authorizationId: string }): Promise<PharmacyPublishAuthorizationReadback> {
      if (!isUuid(input.authorizationId) || !isIdentityValid(input)) {
        return { authorizationReady: false, authorizationStatus: "unavailable", expiresAt: null };
      }
      const record = await store.readByAuthorizationId(input.authorizationId);
      if (!record) return { authorizationReady: false, authorizationStatus: "unavailable", expiresAt: null };

      const nowDate = now();
      if (!identityMatches(record, input)) {
        if (record.status === "issued") {
          await store.transition({
            authorizationId: record.authorizationId,
            fromStatus: "issued",
            toStatus: "invalidated",
            transitionedAt: nowDate.toISOString(),
            reason: "authorization_identity_mismatch",
          });
        }
        return { authorizationReady: false, authorizationStatus: "invalidated", expiresAt: record.expiresAt };
      }
      if (record.status === "issued" && Date.parse(record.expiresAt) <= nowDate.getTime()) {
        await store.transition({
          authorizationId: record.authorizationId,
          fromStatus: "issued",
          toStatus: "expired",
          transitionedAt: nowDate.toISOString(),
          reason: null,
        });
        return { authorizationReady: false, authorizationStatus: "expired", expiresAt: record.expiresAt };
      }
      return toReadback(record);
    },

    async verifyAndConsume(input: PharmacyPublishAuthorizationLegacySecret & {
      actorId: string;
      entityId: string;
      reviewSnapshotHash: string;
      entityFingerprint: string;
    }): Promise<boolean> {
      if (!isNonEmpty(input.token) || !isNonEmpty(input.nonce) || !isNonEmpty(input.actorId) ||
          !isNonEmpty(input.entityId) || !isSha256(input.reviewSnapshotHash) || !isSha256(input.entityFingerprint)) {
        return false;
      }
      const tokenHash = sha256(input.token);
      const nonceHash = sha256(input.nonce);
      const record = await store.readByTokenHash(tokenHash);
      if (!record) return false;
      const nowDate = now();
      if (record.tokenHash !== tokenHash || record.nonceHash !== nonceHash || record.actorId !== input.actorId ||
          record.entityId !== input.entityId || record.reviewSnapshotHash !== input.reviewSnapshotHash ||
          record.entityFingerprint !== input.entityFingerprint || record.status !== "issued" ||
          record.consumedAt !== null || Date.parse(record.expiresAt) <= nowDate.getTime()) return false;
      return store.consume({ tokenHash, nonceHash, consumedAt: nowDate.toISOString() });
    },
  };
}
