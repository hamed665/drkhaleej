import "server-only";

import type { AdminImportEntityType } from "@/server/admin/imports";
import type { ImportJsonValue } from "@/server/admin/import-row-normalizer";

export type DuplicateDetectionRow = {
  id: string;
  rowNumber: number;
  entityType: AdminImportEntityType;
  rowStatus: string;
  externalId: string | null;
  normalizedPayload: ImportJsonValue;
};

export type DuplicateCandidateDraft = {
  rawRowId: string;
  matchedRawRowId: string;
  matchedRowNumber: number;
  matchedEntityType: string;
  matchScore: number;
  matchReason: string;
  signals: string[];
};

type DuplicateSignals = {
  rowId: string;
  rowNumber: number;
  entityType: AdminImportEntityType;
  rowStatus: string;
  externalId: string | null;
  primaryName: string | null;
  nameEn: string | null;
  nameAr: string | null;
  slugCandidate: string | null;
  phoneE164: string | null;
  whatsappE164: string | null;
  websiteUrl: string | null;
  googleMapsUrl: string | null;
  directionUrl: string | null;
  sourceUrl: string | null;
  area: string | null;
  wilayat: string | null;
  latitude: number | null;
  longitude: number | null;
};

type ExistingDuplicatePair = {
  rawRowId: string;
  matchedRawRowId: string | null;
};

const maxCandidatesPerRun = 250;
const duplicateThreshold = 70;

export function detectStagedDuplicateCandidates(
  rows: DuplicateDetectionRow[],
  existingPairs: ExistingDuplicatePair[],
): DuplicateCandidateDraft[] {
  const existingKeys = new Set(existingPairs.map((pair) => pairKey(pair.rawRowId, pair.matchedRawRowId)));
  const signals = rows.map(toDuplicateSignals).filter(isDuplicateEligibleRow);
  const candidates: DuplicateCandidateDraft[] = [];
  const emittedKeys = new Set<string>();

  for (let leftIndex = 0; leftIndex < signals.length; leftIndex += 1) {
    const left = signals[leftIndex];
    if (left === undefined) continue;

    for (let rightIndex = leftIndex + 1; rightIndex < signals.length; rightIndex += 1) {
      const right = signals[rightIndex];
      if (right === undefined) continue;

      const key = pairKey(left.rowId, right.rowId);
      if (existingKeys.has(key) || emittedKeys.has(key)) continue;

      const result = scoreDuplicatePair(left, right);
      if (result.score < duplicateThreshold) continue;

      emittedKeys.add(key);
      candidates.push({
        rawRowId: left.rowId,
        matchedRawRowId: right.rowId,
        matchedRowNumber: right.rowNumber,
        matchedEntityType: right.entityType,
        matchScore: result.score,
        matchReason: result.reason,
        signals: result.signals,
      });

      if (candidates.length >= maxCandidatesPerRun) return candidates;
    }
  }

  return candidates;
}

export function normalizeExistingDuplicatePair(rawRowId: string, metadata: ImportJsonValue): ExistingDuplicatePair {
  return {
    rawRowId,
    matchedRawRowId: readString(metadata, ["matched_raw_row_id"]),
  };
}

export function duplicateMatchedRawRowIds(candidates: DuplicateCandidateDraft[]): string[] {
  const ids = new Set<string>();
  for (const candidate of candidates) {
    ids.add(candidate.rawRowId);
    ids.add(candidate.matchedRawRowId);
  }
  return [...ids];
}

function isDuplicateEligibleRow(row: DuplicateSignals): boolean {
  if (row.rowStatus === "rejected" || row.rowStatus === "published_noindex" || row.rowStatus === "index_eligible") {
    return false;
  }

  return (
    row.externalId !== null ||
    row.primaryName !== null ||
    row.nameEn !== null ||
    row.nameAr !== null ||
    row.phoneE164 !== null ||
    row.whatsappE164 !== null ||
    row.googleMapsUrl !== null
  );
}

function toDuplicateSignals(row: DuplicateDetectionRow): DuplicateSignals {
  return {
    rowId: row.id,
    rowNumber: row.rowNumber,
    entityType: row.entityType,
    rowStatus: row.rowStatus,
    externalId: normalizeKeyText(readString(row.normalizedPayload, ["identity", "externalId"]) ?? row.externalId),
    primaryName: readString(row.normalizedPayload, ["identity", "primaryName"]),
    nameEn: readString(row.normalizedPayload, ["identity", "nameEn"]),
    nameAr: readString(row.normalizedPayload, ["identity", "nameAr"]),
    slugCandidate: readString(row.normalizedPayload, ["identity", "slugCandidate"]),
    phoneE164: readString(row.normalizedPayload, ["contact", "phoneE164"]),
    whatsappE164: readString(row.normalizedPayload, ["contact", "whatsappE164"]),
    websiteUrl: normalizeUrlForCompare(readString(row.normalizedPayload, ["contact", "websiteUrl"])),
    googleMapsUrl: normalizeUrlForCompare(readString(row.normalizedPayload, ["contact", "googleMapsUrl"])),
    directionUrl: normalizeUrlForCompare(readString(row.normalizedPayload, ["contact", "directionUrl"])),
    sourceUrl: normalizeUrlForCompare(readString(row.normalizedPayload, ["source", "sourceUrl"])),
    area: normalizeKeyText(readString(row.normalizedPayload, ["geo", "area"])),
    wilayat: normalizeKeyText(readString(row.normalizedPayload, ["geo", "wilayat"])),
    latitude: readNumber(row.normalizedPayload, ["geo", "latitude"]),
    longitude: readNumber(row.normalizedPayload, ["geo", "longitude"]),
  };
}

function scoreDuplicatePair(left: DuplicateSignals, right: DuplicateSignals): { score: number; reason: string; signals: string[] } {
  let score = 0;
  const signals: string[] = [];

  if (sameNonEmpty(left.externalId, right.externalId)) addSignal("external_id_exact", 100);
  if (sameNonEmpty(left.phoneE164, right.phoneE164)) addSignal("phone_exact", 45);
  if (sameNonEmpty(left.whatsappE164, right.whatsappE164)) addSignal("whatsapp_exact", 45);
  if (sameNonEmpty(left.googleMapsUrl, right.googleMapsUrl)) addSignal("google_maps_exact", 40);
  if (sameNonEmpty(left.directionUrl, right.directionUrl)) addSignal("direction_exact", 25);
  if (sameNonEmpty(left.websiteUrl, right.websiteUrl)) addSignal("website_exact", 25);
  if (sameNonEmpty(left.sourceUrl, right.sourceUrl)) addSignal("source_url_exact", 20);

  const nameSimilarity = maxNameSimilarity(left, right);
  if (nameSimilarity >= 0.95) addSignal("name_very_high", 35);
  else if (nameSimilarity >= 0.85) addSignal("name_high", 25);
  else if (nameSimilarity >= 0.75) addSignal("name_medium", 15);

  const distanceMeters = coordinateDistanceMeters(left, right);
  if (distanceMeters !== null && distanceMeters <= 30) addSignal("coordinates_within_30m", 25);
  else if (distanceMeters !== null && distanceMeters <= 100) addSignal("coordinates_within_100m", 15);

  if (sameNonEmpty(left.area, right.area)) addSignal("same_area", 5);
  if (sameNonEmpty(left.wilayat, right.wilayat)) addSignal("same_wilayat", 5);

  const cappedScore = Math.min(score, 100);
  return {
    score: cappedScore,
    reason: buildReason(cappedScore, signals, left, right),
    signals,
  };

  function addSignal(signal: string, points: number): void {
    signals.push(signal);
    score += points;
  }
}

function buildReason(score: number, signals: string[], left: DuplicateSignals, right: DuplicateSignals): string {
  const signalText = signals.length > 0 ? signals.join(", ") : "weak_match";
  return `Rows ${left.rowNumber} and ${right.rowNumber} scored ${score} using ${signalText}.`;
}

function maxNameSimilarity(left: DuplicateSignals, right: DuplicateSignals): number {
  const leftNames = [left.primaryName, left.nameEn, left.nameAr, left.slugCandidate]
    .map(normalizeName)
    .filter((name): name is string => name !== null);
  const rightNames = [right.primaryName, right.nameEn, right.nameAr, right.slugCandidate]
    .map(normalizeName)
    .filter((name): name is string => name !== null);

  let best = 0;
  for (const leftName of leftNames) {
    for (const rightName of rightNames) {
      best = Math.max(best, similarity(leftName, rightName));
    }
  }
  return best;
}

function similarity(left: string, right: string): number {
  if (left === right) return 1;
  const leftTokens = new Set(left.split(" ").filter(Boolean));
  const rightTokens = new Set(right.split(" ").filter(Boolean));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) intersection += 1;
  }

  const tokenScore = (2 * intersection) / (leftTokens.size + rightTokens.size);
  const lengthRatio = Math.min(left.length, right.length) / Math.max(left.length, right.length);
  return Math.max(tokenScore, left.includes(right) || right.includes(left) ? 0.9 * lengthRatio : 0);
}

function coordinateDistanceMeters(left: DuplicateSignals, right: DuplicateSignals): number | null {
  if (left.latitude === null || left.longitude === null || right.latitude === null || right.longitude === null) return null;
  const earthRadiusMeters = 6_371_000;
  const leftLat = toRadians(left.latitude);
  const rightLat = toRadians(right.latitude);
  const latDelta = toRadians(right.latitude - left.latitude);
  const lngDelta = toRadians(right.longitude - left.longitude);
  const a = Math.sin(latDelta / 2) ** 2 + Math.cos(leftLat) * Math.cos(rightLat) * Math.sin(lngDelta / 2) ** 2;
  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function sameNonEmpty(left: string | null, right: string | null): boolean {
  return left !== null && right !== null && left.length > 0 && left === right;
}

function pairKey(left: string, right: string | null): string {
  if (right === null) return `${left}|missing`;
  return [left, right].sort().join("|");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readValue(value: unknown, path: readonly string[]): unknown {
  let cursor: unknown = value;
  for (const key of path) {
    if (!isRecord(cursor)) return null;
    cursor = cursor[key];
  }
  return cursor;
}

function readString(value: unknown, path: readonly string[]): string | null {
  const result = readValue(value, path);
  if (typeof result !== "string") return null;
  const trimmed = result.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readNumber(value: unknown, path: readonly string[]): number | null {
  const result = readValue(value, path);
  if (typeof result === "number" && Number.isFinite(result)) return result;
  if (typeof result !== "string") return null;
  const parsed = Number(result);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeKeyText(value: string | null): string | null {
  if (value === null) return null;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  return normalized.length > 0 ? normalized : null;
}

function normalizeName(value: string | null): string | null {
  if (value === null) return null;
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeUrlForCompare(value: string | null): string | null {
  if (value === null) return null;
  try {
    const url = new URL(value);
    url.hash = "";
    if (url.pathname === "/") url.pathname = "";
    return url.toString().toLowerCase();
  } catch {
    return normalizeKeyText(value);
  }
}
