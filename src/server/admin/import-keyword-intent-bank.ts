import "server-only";

export type ImportKeywordLanguage = "en" | "ar";
export type ImportKeywordPriority = "P0" | "P1" | "P2" | "P3" | "BLOCKED";
export type ImportKeywordRisk = "Low" | "Medium" | "High";
export type ImportKeywordDecision = "DO_NOT_IMPORT_YET" | "blocked";
export type ImportKeywordRouteStatus = "planning_only";

export type ImportKeywordRouteFamily =
  | "specialty"
  | "specialty_area"
  | "service"
  | "service_area"
  | "area"
  | "condition"
  | "test"
  | "medicine"
  | "supplement"
  | "guide"
  | "pharmacy"
  | "vet"
  | "blocked";

export type ImportKeywordIntentType =
  | "Local provider discovery"
  | "Local area provider discovery"
  | "Service discovery"
  | "Service + area discovery"
  | "Area discovery"
  | "Pharmacy discovery"
  | "Condition to provider"
  | "Symptom triage to provider"
  | "Lab test discovery"
  | "Drug information"
  | "Supplement information"
  | "Educational guide"
  | "Question / answer"
  | "Veterinary discovery"
  | "Treatment/help/referral"
  | "Intent capture / comparison criteria"
  | "Blocked / unsafe intent";

export type ImportKeywordIntentRecord = {
  id: number;
  keyword: string;
  language: ImportKeywordLanguage;
  arabicPair: string;
  topicCluster: string;
  subcluster: string;
  intentType: ImportKeywordIntentType;
  pageType: string;
  routeFamily: ImportKeywordRouteFamily;
  urlCandidate: string;
  priority: ImportKeywordPriority;
  riskLevel: ImportKeywordRisk;
  medicalReviewRequired: boolean;
  legalReviewRequired: boolean;
  pharmacistReviewRequired: boolean;
  importDecision: ImportKeywordDecision;
  routeStatus: ImportKeywordRouteStatus;
  relatedSpecialtyOrService: string;
  relatedArea: string;
  safeTitlePattern: string;
  forbiddenUse: string;
  notes: string;
};

export type ImportKeywordIntentBankManifest = {
  schemaVersion: "drkhaleej.import.keywordIntentBank.v1";
  sourceFile: string;
  sourceSha256: string;
  totalRows: number;
  englishRows: number;
  arabicRows: number;
  exactDuplicateCount: number;
  missingLocaleParityCount: number;
  persianCharacterHitCount: number;
  records: readonly ImportKeywordIntentRecord[];
};

export type ImportKeywordIntentBankBlocker =
  | "schema_version_invalid"
  | "source_hash_invalid"
  | "row_count_invalid"
  | "language_balance_invalid"
  | "duplicate_keywords_present"
  | "locale_parity_missing"
  | "persian_content_present"
  | "record_invalid"
  | "runtime_import_enabled"
  | "runtime_route_enabled";

const sourceHashPattern = /^[a-f0-9]{64}$/;
const urlPattern = /^\/(en|ar)\/om\/(centers|services|areas|conditions|tests|medicines|supplements|guides|pharmacies|vets)(?:\/[a-z0-9-]+){0,3}$/;

function isRecordValid(record: ImportKeywordIntentRecord): boolean {
  if (!Number.isInteger(record.id) || record.id <= 0) return false;
  if (record.keyword.trim().length === 0) return false;
  if (record.arabicPair.trim().length === 0) return false;
  if (record.importDecision !== "DO_NOT_IMPORT_YET" && record.importDecision !== "blocked") return false;
  if (record.routeStatus !== "planning_only") return false;
  if (record.routeFamily === "blocked") return record.urlCandidate === "blocked";
  if (!urlPattern.test(record.urlCandidate)) return false;
  return record.urlCandidate.startsWith(`/${record.language}/`);
}

export function getImportKeywordIntentBankBlockers(
  manifest: ImportKeywordIntentBankManifest,
): readonly ImportKeywordIntentBankBlocker[] {
  const blockers: ImportKeywordIntentBankBlocker[] = [];

  if (manifest.schemaVersion !== "drkhaleej.import.keywordIntentBank.v1") blockers.push("schema_version_invalid");
  if (!sourceHashPattern.test(manifest.sourceSha256)) blockers.push("source_hash_invalid");
  if (manifest.totalRows <= 0 || manifest.totalRows !== manifest.englishRows + manifest.arabicRows) blockers.push("row_count_invalid");
  if (manifest.englishRows !== manifest.arabicRows) blockers.push("language_balance_invalid");
  if (manifest.exactDuplicateCount !== 0) blockers.push("duplicate_keywords_present");
  if (manifest.missingLocaleParityCount !== 0) blockers.push("locale_parity_missing");
  if (manifest.persianCharacterHitCount !== 0) blockers.push("persian_content_present");
  if (manifest.records.some((record) => !isRecordValid(record))) blockers.push("record_invalid");
  if (manifest.records.some((record) => record.importDecision !== "DO_NOT_IMPORT_YET" && record.importDecision !== "blocked")) blockers.push("runtime_import_enabled");
  if (manifest.records.some((record) => record.routeStatus !== "planning_only")) blockers.push("runtime_route_enabled");

  return Array.from(new Set(blockers));
}

export function isImportKeywordIntentBankReady(
  manifest: ImportKeywordIntentBankManifest,
): boolean {
  return getImportKeywordIntentBankBlockers(manifest).length === 0;
}
