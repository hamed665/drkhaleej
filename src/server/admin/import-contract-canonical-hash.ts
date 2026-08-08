import "server-only";

import { createHash } from "node:crypto";

export const IMPORT_CONTRACT_CANONICALIZATION_VERSION =
  "drkhaleej.import.canonicalJson.v1" as const;
export const IMPORT_CONTRACT_HASH_ALGORITHM = "sha256" as const;
export const IMPORT_CONTRACT_MAX_DEPTH = 16;
export const IMPORT_CONTRACT_MAX_NODES = 4_096;
export const IMPORT_CONTRACT_MAX_ARRAY_ITEMS = 256;
export const IMPORT_CONTRACT_MAX_OBJECT_PROPERTIES = 128;
export const IMPORT_CONTRACT_MAX_STRING_LENGTH = 16_384;
export const IMPORT_CONTRACT_MAX_KEY_LENGTH = 160;
export const IMPORT_CONTRACT_MAX_CANONICAL_BYTES = 262_144;

export type ImportContractCanonicalHashBlocker =
  | "contract_identity_invalid"
  | "value_unsupported"
  | "number_invalid"
  | "depth_exceeded"
  | "node_count_exceeded"
  | "array_length_exceeded"
  | "object_size_exceeded"
  | "string_length_exceeded"
  | "key_length_exceeded"
  | "key_normalization_collision"
  | "cycle_detected"
  | "serialized_size_exceeded";

export type ImportContractCanonicalHash = {
  canonicalizationVersion: typeof IMPORT_CONTRACT_CANONICALIZATION_VERSION;
  algorithm: typeof IMPORT_CONTRACT_HASH_ALGORITHM;
  digest: string;
  byteLength: number;
};

export type ImportContractCanonicalHashResult = {
  hash: ImportContractCanonicalHash | null;
  blockers: readonly ImportContractCanonicalHashBlocker[];
  accepted: boolean;
};

type CanonicalJson = null | boolean | number | string | CanonicalJson[] | { [key: string]: CanonicalJson };

class CanonicalizationError extends Error {
  constructor(readonly blocker: ImportContractCanonicalHashBlocker) {
    super(blocker);
  }
}

type CanonicalizationState = {
  activeObjects: Set<object>;
  nodes: number;
};

function fail(blocker: ImportContractCanonicalHashBlocker): never {
  throw new CanonicalizationError(blocker);
}

function incrementNodes(state: CanonicalizationState): void {
  state.nodes += 1;
  if (state.nodes > IMPORT_CONTRACT_MAX_NODES) fail("node_count_exceeded");
}

function normalizeValue(value: unknown, depth: number, state: CanonicalizationState): CanonicalJson {
  if (depth > IMPORT_CONTRACT_MAX_DEPTH) fail("depth_exceeded");
  incrementNodes(state);

  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.length > IMPORT_CONTRACT_MAX_STRING_LENGTH) fail("string_length_exceeded");
    return value.normalize("NFC");
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail("number_invalid");
    return Object.is(value, -0) ? 0 : value;
  }
  if (typeof value !== "object") fail("value_unsupported");
  if (state.activeObjects.has(value)) fail("cycle_detected");

  state.activeObjects.add(value);
  try {
    if (Array.isArray(value)) {
      if (value.length > IMPORT_CONTRACT_MAX_ARRAY_ITEMS) fail("array_length_exceeded");
      if (Object.getOwnPropertySymbols(value).length > 0) fail("value_unsupported");
      const arrayDescriptors = Object.entries(Object.getOwnPropertyDescriptors(value))
        .filter(([key]) => key !== "length")
        .map(([, descriptor]) => descriptor);
      if (arrayDescriptors.some((descriptor) => !descriptor.enumerable || !("value" in descriptor))) {
        fail("value_unsupported");
      }
      if (
        Object.keys(value).length !== value.length ||
        Object.keys(value).some((key, index) => key !== String(index))
      ) fail("value_unsupported");
      return value.map((item) => normalizeValue(item, depth + 1, state));
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) fail("value_unsupported");
    if (Object.getOwnPropertySymbols(value).length > 0) fail("value_unsupported");
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (Object.values(descriptors).some((descriptor) => !descriptor.enumerable || !("value" in descriptor))) {
      fail("value_unsupported");
    }
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length > IMPORT_CONTRACT_MAX_OBJECT_PROPERTIES) fail("object_size_exceeded");

    const normalized = new Map<string, unknown>();
    for (const [rawKey, item] of entries) {
      if (rawKey.length > IMPORT_CONTRACT_MAX_KEY_LENGTH) fail("key_length_exceeded");
      const key = rawKey.normalize("NFC");
      if (normalized.has(key)) fail("key_normalization_collision");
      normalized.set(key, item);
    }

    const output: { [key: string]: CanonicalJson } = {};
    for (const key of [...normalized.keys()].sort()) {
      output[key] = normalizeValue(normalized.get(key), depth + 1, state);
    }
    return output;
  } finally {
    state.activeObjects.delete(value);
  }
}

function boundedIdentity(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= IMPORT_CONTRACT_MAX_KEY_LENGTH;
}

function blocked(blocker: ImportContractCanonicalHashBlocker): ImportContractCanonicalHashResult {
  return { hash: null, blockers: [blocker], accepted: false };
}

export function hashImportContractPayload(
  contractId: unknown,
  schemaVersion: unknown,
  payload: unknown,
): ImportContractCanonicalHashResult {
  if (!boundedIdentity(contractId) || !boundedIdentity(schemaVersion)) {
    return blocked("contract_identity_invalid");
  }

  try {
    const canonical = normalizeValue({
      canonicalizationVersion: IMPORT_CONTRACT_CANONICALIZATION_VERSION,
      contractId: contractId.trim().normalize("NFC"),
      payload,
      schemaVersion: schemaVersion.trim().normalize("NFC"),
    }, 0, { activeObjects: new Set(), nodes: 0 });
    const serialized = JSON.stringify(canonical);
    const byteLength = Buffer.byteLength(serialized, "utf8");
    if (byteLength > IMPORT_CONTRACT_MAX_CANONICAL_BYTES) return blocked("serialized_size_exceeded");

    return {
      hash: {
        canonicalizationVersion: IMPORT_CONTRACT_CANONICALIZATION_VERSION,
        algorithm: IMPORT_CONTRACT_HASH_ALGORITHM,
        digest: createHash(IMPORT_CONTRACT_HASH_ALGORITHM).update(serialized, "utf8").digest("hex"),
        byteLength,
      },
      blockers: [],
      accepted: true,
    };
  } catch (error) {
    if (error instanceof CanonicalizationError) return blocked(error.blocker);
    return blocked("value_unsupported");
  }
}
