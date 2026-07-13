import "server-only";

import { createHash, randomBytes } from "node:crypto";

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const MAX_TTL_MS = 15 * 60 * 1000;

export type PharmacyPublishAuthorizationEnvelopeRecord = {
  tokenHash: string;
  nonceHash: string;
  actorId: string;
  entityId: string;
  reviewSnapshotHash: string;
  entityFingerprint: string;
  issuedAt: string;
  expiresAt: string;
  consumedAt: string | null;
};

export type PharmacyPublishAuthorizationEnvelopeStore = {
  create(record: PharmacyPublishAuthorizationEnvelopeRecord): Promise<boolean>;
  readByTokenHash(tokenHash: string): Promise<PharmacyPublishAuthorizationEnvelopeRecord | null>;
  consume(input: { tokenHash: string; nonceHash: string; consumedAt: string }): Promise<boolean>;
};

export type PharmacyPublishAuthorizationEnvelope = {
  token: string;
  nonce: string;
  expiresAt: string;
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
    }): Promise<PharmacyPublishAuthorizationEnvelope | null> {
      if (
        !isNonEmpty(input.actorId) ||
        !isNonEmpty(input.entityId) ||
        !isSha256(input.reviewSnapshotHash) ||
        !isSha256(input.entityFingerprint)
      ) return null;

      const token = randomBytes(32).toString("base64url");
      const nonce = randomBytes(24).toString("base64url");
      const issuedAt = now();
      const expiresAt = new Date(issuedAt.getTime() + ttlMs);
      const created = await store.create({
        tokenHash: sha256(token),
        nonceHash: sha256(nonce),
        actorId: input.actorId,
        entityId: input.entityId,
        reviewSnapshotHash: input.reviewSnapshotHash,
        entityFingerprint: input.entityFingerprint,
        issuedAt: issuedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        consumedAt: null,
      });
      return created ? { token, nonce, expiresAt: expiresAt.toISOString() } : null;
    },

    async verifyAndConsume(input: {
      token: string;
      nonce: string;
      actorId: string;
      entityId: string;
      reviewSnapshotHash: string;
      entityFingerprint: string;
    }): Promise<boolean> {
      if (
        !isNonEmpty(input.token) ||
        !isNonEmpty(input.nonce) ||
        !isNonEmpty(input.actorId) ||
        !isNonEmpty(input.entityId) ||
        !isSha256(input.reviewSnapshotHash) ||
        !isSha256(input.entityFingerprint)
      ) return false;

      const tokenHash = sha256(input.token);
      const nonceHash = sha256(input.nonce);
      const record = await store.readByTokenHash(tokenHash);
      if (!record) return false;
      const nowDate = now();
      if (
        record.tokenHash !== tokenHash ||
        record.nonceHash !== nonceHash ||
        record.actorId !== input.actorId ||
        record.entityId !== input.entityId ||
        record.reviewSnapshotHash !== input.reviewSnapshotHash ||
        record.entityFingerprint !== input.entityFingerprint ||
        record.consumedAt !== null ||
        Date.parse(record.expiresAt) <= nowDate.getTime()
      ) return false;

      return store.consume({ tokenHash, nonceHash, consumedAt: nowDate.toISOString() });
    },
  };
}
