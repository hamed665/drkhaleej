import "server-only";

import { createHash } from "node:crypto";

export type PharmacyRollbackLogicalSnapshot = Readonly<Record<string, unknown>>;

export type PharmacyRollbackRecoveryMismatch = Readonly<{
  path: string;
  expectedHash: string;
  actualHash: string;
}>;

export type PharmacyRollbackExactRecoveryReport = Readonly<{
  verified: boolean;
  expectedHash: string;
  actualHash: string;
  mismatchCount: number;
  mismatches: readonly PharmacyRollbackRecoveryMismatch[];
  diagnosticsTruncated: boolean;
  rawValuesExposed: false;
}>;

const MAX_MISMATCH_DIAGNOSTICS = 24;
const ROOT_PATH = "$";
const MISSING_VALUE = Object.freeze({ __drkhaleejMissingValue: true });
const ALLOWED_DIFFERENCE = Object.freeze({ __drkhaleejAllowedDifference: true });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    const normalized = value.map(canonicalize);
    return normalized.sort((left, right) =>
      JSON.stringify(left).localeCompare(JSON.stringify(right)),
    );
  }
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function serialized(value: unknown): string {
  return JSON.stringify(canonicalize(value === undefined ? MISSING_VALUE : value));
}

function sha256(value: unknown): string {
  return createHash("sha256").update(serialized(value)).digest("hex");
}

function valuesEqual(expected: unknown, actual: unknown): boolean {
  return serialized(expected) === serialized(actual);
}

function pathAllowed(path: string, allowedPaths: readonly string[]): boolean {
  return allowedPaths.some(
    (allowed) => path === allowed || path.startsWith(`${allowed}.`) || path.startsWith(`${allowed}[`),
  );
}

function childPath(parent: string, key: string): string {
  return parent === ROOT_PATH ? key : `${parent}.${key}`;
}

function maskAllowedDifferences(
  value: unknown,
  path: string,
  allowedDifferencePaths: readonly string[],
): unknown {
  if (pathAllowed(path, allowedDifferencePaths)) return ALLOWED_DIFFERENCE;
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      maskAllowedDifferences(item, `${path}[${index}]`, allowedDifferencePaths),
    );
  }
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value).map((key) => [
      key,
      maskAllowedDifferences(value[key], childPath(path, key), allowedDifferencePaths),
    ]),
  );
}

function compareValues(input: {
  expected: unknown;
  actual: unknown;
  path: string;
  allowedDifferencePaths: readonly string[];
  mismatchState: { count: number; diagnostics: PharmacyRollbackRecoveryMismatch[] };
}): void {
  const { expected, actual, path, allowedDifferencePaths, mismatchState } = input;
  if (pathAllowed(path, allowedDifferencePaths) || valuesEqual(expected, actual)) return;

  if (isRecord(expected) && isRecord(actual)) {
    const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort();
    for (const key of keys) {
      compareValues({
        expected: expected[key],
        actual: actual[key],
        path: childPath(path, key),
        allowedDifferencePaths,
        mismatchState,
      });
    }
    return;
  }

  if (Array.isArray(expected) && Array.isArray(actual)) {
    const normalizedExpected = canonicalize(expected) as unknown[];
    const normalizedActual = canonicalize(actual) as unknown[];
    const length = Math.max(normalizedExpected.length, normalizedActual.length);
    for (let index = 0; index < length; index += 1) {
      compareValues({
        expected: normalizedExpected[index],
        actual: normalizedActual[index],
        path: `${path}[${index}]`,
        allowedDifferencePaths,
        mismatchState,
      });
    }
    return;
  }

  mismatchState.count += 1;
  if (mismatchState.diagnostics.length < MAX_MISMATCH_DIAGNOSTICS) {
    mismatchState.diagnostics.push({
      path: path.slice(0, 180),
      expectedHash: sha256(expected),
      actualHash: sha256(actual),
    });
  }
}

export function hashPharmacyRollbackLogicalSnapshot(
  snapshot: PharmacyRollbackLogicalSnapshot,
): string {
  return sha256(snapshot);
}

export function comparePharmacyRollbackExactRecovery(input: {
  expected: PharmacyRollbackLogicalSnapshot;
  actual: PharmacyRollbackLogicalSnapshot;
  allowedDifferencePaths?: readonly string[];
}): PharmacyRollbackExactRecoveryReport {
  const allowedDifferencePaths = input.allowedDifferencePaths ?? [];
  const mismatchState: {
    count: number;
    diagnostics: PharmacyRollbackRecoveryMismatch[];
  } = { count: 0, diagnostics: [] };

  compareValues({
    expected: input.expected,
    actual: input.actual,
    path: ROOT_PATH,
    allowedDifferencePaths,
    mismatchState,
  });

  const expectedHash = sha256(
    maskAllowedDifferences(input.expected, ROOT_PATH, allowedDifferencePaths),
  );
  const actualHash = sha256(
    maskAllowedDifferences(input.actual, ROOT_PATH, allowedDifferencePaths),
  );
  return {
    verified: mismatchState.count === 0,
    expectedHash,
    actualHash,
    mismatchCount: mismatchState.count,
    mismatches: mismatchState.diagnostics,
    diagnosticsTruncated: mismatchState.count > mismatchState.diagnostics.length,
    rawValuesExposed: false,
  };
}
