import "server-only";

import { createHash, randomBytes } from "node:crypto";

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const MAX_TTL_MS = 15 * 60 * 1000;

export type PharmacyPublishAuthorizationStatus = "issued" | "consumed" | "invalidated" | "expired";

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
  legacySecret: PharmacyPublishAuthorizationLegacySecret;
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

export function createPharmacyPublishAuthorizationEnvelopeService(
  store: PharmacyPublishAuthorizationEnvelopeStore,
  options: { now?: () => Date; ttlMs?: number } = {},
) {
  const now = options.now ?? (() => new Date());
  const ttlMs = Math.min(Math.max(options.ttlMs ?? DEFAULT_TTL_MS, 60_000), MAX_TTL_MS);

  return {
    async issue(input: {
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
    }): Promise<PharmacyPublishAuthorizationIssued | null> {
      if (
        !isNonEmpty(input.actorId) || !isNonEmpty(input.entityId) || !isUuid(input.operationAttemptId) ||
        !isNonEmpty(input.idempotencyKey) || !isSha256(input.reviewSnapshotHash) ||
        !isSha256(input.entityFingerprint) || !isSha256(input.requestHash) || !isSha256(input.patchHash) ||
        !isNonEmpty(input.expectedEntityVersion) || input.entityFamily !== "pharmacy" ||
        input.operationScope !== "reserve_private_publish"
      ) return null;

      const reviewStateId = await store.resolveReviewStateId(input.operationAttemptId);
      if (!reviewStateId || !isUuid(reviewStateId)) return null;

      const token = randomBytes(32).toString("base64url");
      const nonce = randomBytes(24).toString("base64url");
      const issuedAt = now();
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
