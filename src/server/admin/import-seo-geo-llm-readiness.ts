import "server-only";

import type { ImportKeywordIntentBankBlocker } from "./import-keyword-intent-bank";
import type { OmanGeoAuthorityRegistryBlocker } from "./import-oman-geo-authority-registry";
import type {
  ImportPublicProjectionKind,
  ImportPublicProjectionManifest,
} from "./import-public-projection-layer";
import type { ImportSeoProfileReadiness } from "./import-seo-profile-contract";

export type ImportSeoGeoLlmReadinessBlocker =
  | "seo_profile_not_ready"
  | "keyword_intent_bank_not_ready"
  | "geo_authority_not_ready"
  | "geo_projection_not_ready"
  | "llm_projection_not_ready"
  | "llm_answer_target_missing"
  | "llm_evidence_missing"
  | "llm_safety_review_missing"
  | "blocked_or_unsafe_intent";

export type ImportSeoGeoLlmReadinessInput = {
  seoProfile: ImportSeoProfileReadiness;
  keywordBankBlockers: readonly ImportKeywordIntentBankBlocker[];
  geoAuthorityBlockers: readonly OmanGeoAuthorityRegistryBlocker[];
  publicProjection: ImportPublicProjectionManifest;
  hasBilingualLlmAnswerTarget: boolean;
  hasEvidenceCitations: boolean;
  hasRequiredMedicalSafetyReview: boolean;
  blockedOrUnsafeIntent: boolean;
  publishReady: boolean;
  sitemapEligible: boolean;
};

export type ImportSeoGeoLlmReadiness = {
  seoReady: boolean;
  geoReady: boolean;
  llmReady: boolean;
  compositionReady: boolean;
  publishReady: boolean;
  sitemapEligible: boolean;
  blockers: readonly ImportSeoGeoLlmReadinessBlocker[];
  keywordBankBlockers: readonly ImportKeywordIntentBankBlocker[];
  geoAuthorityBlockers: readonly OmanGeoAuthorityRegistryBlocker[];
  missingProjectionKinds: readonly ImportPublicProjectionKind[];
};

export const IMPORT_SEO_GEO_LLM_REQUIRED_PROJECTION_KINDS = [
  "geo",
  "llm_answer",
] as const satisfies readonly ImportPublicProjectionKind[];

function hasReadyProjection(
  manifest: ImportPublicProjectionManifest,
  kind: ImportPublicProjectionKind,
): boolean {
  return manifest.records.some(
    (record) =>
      record.kind === kind &&
      record.status === "ready" &&
      record.routeId === manifest.routeId &&
      record.buildSources.length > 0,
  );
}

export function getImportSeoGeoLlmReadiness(
  input: ImportSeoGeoLlmReadinessInput,
): ImportSeoGeoLlmReadiness {
  const blockers: ImportSeoGeoLlmReadinessBlocker[] = [];
  const missingProjectionKinds = IMPORT_SEO_GEO_LLM_REQUIRED_PROJECTION_KINDS.filter(
    (kind) => !hasReadyProjection(input.publicProjection, kind),
  );

  const seoReady =
    input.seoProfile.seoProfileReady &&
    input.keywordBankBlockers.length === 0;
  const geoReady =
    input.geoAuthorityBlockers.length === 0 &&
    !missingProjectionKinds.includes("geo");
  const llmReady =
    seoReady &&
    geoReady &&
    !missingProjectionKinds.includes("llm_answer") &&
    input.hasBilingualLlmAnswerTarget &&
    input.hasEvidenceCitations &&
    input.hasRequiredMedicalSafetyReview &&
    !input.blockedOrUnsafeIntent;

  if (!input.seoProfile.seoProfileReady) blockers.push("seo_profile_not_ready");
  if (input.keywordBankBlockers.length > 0) blockers.push("keyword_intent_bank_not_ready");
  if (input.geoAuthorityBlockers.length > 0) blockers.push("geo_authority_not_ready");
  if (missingProjectionKinds.includes("geo")) blockers.push("geo_projection_not_ready");
  if (missingProjectionKinds.includes("llm_answer")) blockers.push("llm_projection_not_ready");
  if (!input.hasBilingualLlmAnswerTarget) blockers.push("llm_answer_target_missing");
  if (!input.hasEvidenceCitations) blockers.push("llm_evidence_missing");
  if (!input.hasRequiredMedicalSafetyReview) blockers.push("llm_safety_review_missing");
  if (input.blockedOrUnsafeIntent) blockers.push("blocked_or_unsafe_intent");

  const uniqueBlockers = Array.from(new Set(blockers));

  return {
    seoReady,
    geoReady,
    llmReady,
    compositionReady: seoReady && geoReady && llmReady,
    publishReady: input.publishReady,
    sitemapEligible: input.sitemapEligible,
    blockers: uniqueBlockers,
    keywordBankBlockers: input.keywordBankBlockers,
    geoAuthorityBlockers: input.geoAuthorityBlockers,
    missingProjectionKinds,
  };
}

export function isImportSeoGeoLlmCompositionReady(
  input: ImportSeoGeoLlmReadinessInput,
): boolean {
  return getImportSeoGeoLlmReadiness(input).compositionReady;
}
