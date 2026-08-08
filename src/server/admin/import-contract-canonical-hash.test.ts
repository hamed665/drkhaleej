import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  IMPORT_CONTRACT_CANONICALIZATION_VERSION,
  IMPORT_CONTRACT_MAX_ARRAY_ITEMS,
  hashImportContractPayload,
} from "./import-contract-canonical-hash";

function digest(payload: unknown): string | undefined {
  return hashImportContractPayload("entity-draft", "1.2.2", payload).hash?.digest;
}

describe("import contract canonical hash", () => {
  it("is deterministic across object key order", () => {
    expect(digest({ name: "Clinic", nested: { city: "Muscat", active: true } }))
      .toBe(digest({ nested: { active: true, city: "Muscat" }, name: "Clinic" }));
  });

  it("normalizes Unicode strings and keys to NFC", () => {
    expect(digest({ "e\u0301": "Cafe\u0301" })).toBe(digest({ "é": "Café" }));
  });

  it("preserves null, empty-string and array-order semantics", () => {
    expect(digest({ value: null })).not.toBe(digest({ value: "" }));
    expect(digest({ values: ["a", "b"] })).not.toBe(digest({ values: ["b", "a"] }));
  });

  it("normalizes negative zero without an integer-only hash branch", () => {
    expect(digest({ score: -0 })).toBe(digest({ score: 0 }));
    expect(digest({ score: 1 })).toBe(digest({ score: 1.0 }));
  });

  it("domain-separates contract and schema versions", () => {
    const payload = { draftId: "draft-1" };
    expect(hashImportContractPayload("entity-draft", "1.2.2", payload).hash?.digest)
      .not.toBe(hashImportContractPayload("entity-review-decision", "1.2.2", payload).hash?.digest);
    expect(hashImportContractPayload("entity-draft", "1.2.2", payload).hash?.digest)
      .not.toBe(hashImportContractPayload("entity-draft", "2.0.0", payload).hash?.digest);
  });

  it("returns only bounded hash metadata and no canonical payload", () => {
    const result = hashImportContractPayload("entity-draft", "1.2.2", { protected: "value" });
    expect(result).toMatchObject({
      accepted: true,
      blockers: [],
      hash: {
        canonicalizationVersion: IMPORT_CONTRACT_CANONICALIZATION_VERSION,
        algorithm: "sha256",
      },
    });
    expect(result.hash?.digest).toMatch(/^[a-f0-9]{64}$/);
    expect(result).not.toHaveProperty("canonicalPayload");
  });

  it("fails closed on unsupported, non-finite and cyclic values", () => {
    expect(hashImportContractPayload("entity-draft", "1.2.2", { value: undefined }).blockers)
      .toEqual(["value_unsupported"]);
    expect(hashImportContractPayload("entity-draft", "1.2.2", { value: Number.NaN }).blockers)
      .toEqual(["number_invalid"]);
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(hashImportContractPayload("entity-draft", "1.2.2", cyclic).blockers)
      .toEqual(["cycle_detected"]);
  });

  it("rejects sparse arrays and non-JSON object properties", () => {
    const sparse = Array(2);
    sparse[1] = "value";
    expect(hashImportContractPayload("entity-draft", "1.2.2", sparse).blockers)
      .toEqual(["value_unsupported"]);

    const withAccessor = Object.defineProperty({}, "value", { enumerable: true, get: () => "secret" });
    expect(hashImportContractPayload("entity-draft", "1.2.2", withAccessor).blockers)
      .toEqual(["value_unsupported"]);

    const withSymbol = { [Symbol("hidden")]: true };
    expect(hashImportContractPayload("entity-draft", "1.2.2", withSymbol).blockers)
      .toEqual(["value_unsupported"]);
  });

  it("fails closed on normalized-key collisions and oversized collections", () => {
    expect(hashImportContractPayload("entity-draft", "1.2.2", { "e\u0301": 1, "é": 2 }).blockers)
      .toEqual(["key_normalization_collision"]);
    expect(hashImportContractPayload(
      "entity-draft",
      "1.2.2",
      { values: Array.from({ length: IMPORT_CONTRACT_MAX_ARRAY_ITEMS + 1 }, () => null) },
    ).blockers).toEqual(["array_length_exceeded"]);
  });

  it("fails closed on missing or unbounded contract identity", () => {
    expect(hashImportContractPayload("", "1.2.2", {}).blockers).toEqual(["contract_identity_invalid"]);
    expect(hashImportContractPayload("entity-draft", "x".repeat(161), {}).blockers)
      .toEqual(["contract_identity_invalid"]);
  });
});
