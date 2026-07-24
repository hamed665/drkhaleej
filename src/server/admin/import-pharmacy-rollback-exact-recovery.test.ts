import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { comparePharmacyRollbackExactRecovery } from "./import-pharmacy-rollback-exact-recovery";

function snapshot(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: "drkhaleej.import.pharmacyRollbackSnapshot.v1",
    canonicalRoute: "/ar/om/pharmacies/example",
    center: {
      id: "pharmacy-1",
      nameEn: "Example Pharmacy",
      nameAr: "صيدلية المثال",
      defaultLocale: "ar",
      defaultCountry: "om",
      sortOrder: 4,
      metadata: {
        visibility: "private",
        publicRouteEnabled: false,
        indexable: false,
        sitemapEligible: false,
        protected: {
          licenseNumber: "OM-SECRET-123",
        },
      },
    },
    relations: [
      { type: "service", id: "service-b" },
      { type: "service", id: "service-a" },
    ],
    ...overrides,
  };
}

describe("comparePharmacyRollbackExactRecovery", () => {
  it("verifies logical equality with stable object and relation ordering", () => {
    const expected = snapshot();
    const actual = {
      relations: [
        { id: "service-a", type: "service" },
        { id: "service-b", type: "service" },
      ],
      center: {
        metadata: {
          protected: { licenseNumber: "OM-SECRET-123" },
          sitemapEligible: false,
          indexable: false,
          publicRouteEnabled: false,
          visibility: "private",
        },
        sortOrder: 4,
        defaultCountry: "om",
        defaultLocale: "ar",
        nameAr: "صيدلية المثال",
        nameEn: "Example Pharmacy",
        id: "pharmacy-1",
      },
      canonicalRoute: "/ar/om/pharmacies/example",
      schemaVersion: "drkhaleej.import.pharmacyRollbackSnapshot.v1",
    };

    const report = comparePharmacyRollbackExactRecovery({ expected, actual });

    expect(report.verified).toBe(true);
    expect(report.expectedHash).toBe(report.actualHash);
    expect(report.mismatchCount).toBe(0);
    expect(report.mismatches).toEqual([]);
    expect(report.rawValuesExposed).toBe(false);
  });

  it("returns only bounded paths and hashes for protected mismatches", () => {
    const expected = snapshot();
    const actual = snapshot({
      center: {
        ...(snapshot().center as Record<string, unknown>),
        metadata: {
          ...((snapshot().center as Record<string, unknown>).metadata as Record<string, unknown>),
          protected: { licenseNumber: "ACTUAL-SECRET-999" },
        },
      },
    });

    const report = comparePharmacyRollbackExactRecovery({ expected, actual });
    const serialized = JSON.stringify(report);

    expect(report.verified).toBe(false);
    expect(report.mismatchCount).toBe(1);
    expect(report.mismatches[0]?.path).toBe("center.metadata.protected.licenseNumber");
    expect(report.mismatches[0]?.expectedHash).toMatch(/^[a-f0-9]{64}$/);
    expect(report.mismatches[0]?.actualHash).toMatch(/^[a-f0-9]{64}$/);
    expect(serialized).not.toContain("OM-SECRET-123");
    expect(serialized).not.toContain("ACTUAL-SECRET-999");
    expect(report.rawValuesExposed).toBe(false);
  });

  it("permits only explicitly allowlisted operational differences", () => {
    const expected = {
      logical: snapshot(),
      operation: {
        entityVersion: "before",
        rollbackMetadata: null,
        authorityState: "unconsumed",
        auditHistoryCount: 0,
      },
    };
    const actual = {
      logical: snapshot(),
      operation: {
        entityVersion: "after",
        rollbackMetadata: { restoredAt: "2026-07-24T00:00:00.000Z" },
        authorityState: "consumed",
        auditHistoryCount: 1,
      },
    };

    const report = comparePharmacyRollbackExactRecovery({
      expected,
      actual,
      allowedDifferencePaths: [
        "operation.entityVersion",
        "operation.rollbackMetadata",
        "operation.authorityState",
        "operation.auditHistoryCount",
      ],
    });

    expect(report.verified).toBe(true);
    expect(report.mismatchCount).toBe(0);
  });

  it("caps mismatch diagnostics without losing total mismatch count", () => {
    const expected = Object.fromEntries(
      Array.from({ length: 30 }, (_, index) => [`field${index}`, `expected-${index}`]),
    );
    const actual = Object.fromEntries(
      Array.from({ length: 30 }, (_, index) => [`field${index}`, `actual-${index}`]),
    );

    const report = comparePharmacyRollbackExactRecovery({ expected, actual });

    expect(report.verified).toBe(false);
    expect(report.mismatchCount).toBe(30);
    expect(report.mismatches).toHaveLength(24);
    expect(report.diagnosticsTruncated).toBe(true);
  });
});
