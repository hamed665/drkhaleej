import "server-only";

import type { ImportPublicProjectionManifest } from "./import-public-projection-layer";
import type { ImportSeoGeoLlmReadiness } from "./import-seo-geo-llm-readiness";

export type ImportLlmAnswerProjectionBlocker =
  | "llm_readiness_not_ready"
  | "llm_projection_record_missing"
  | "llm_projection_route_mismatch"
  | "llm_projection_stale"
  | "answer_en_missing"
  | "answer_ar_missing"
  | "citations_missing"
  | "evidence_ids_missing"
  | "medical_disclaimer_missing"
  | "unsafe_claim_present"
  | "answer_too_long"
  | "source_version_missing"
  | "projection_version_missing";

export type ImportLlmAnswerCitation = {
  citationId: string;
  sourceEvidenceId: string;
  label: string;
};

export type ImportLlmAnswerProjectionPayload = {
  routeId: string;
  answerEn: string;
  answerAr: string;
  citations: readonly ImportLlmAnswerCitation[];
  medicalDisclaimerEn: string;
  medicalDisclaimerAr: string;
  unsafeClaimPresent: boolean;
  sourceVersion: string;
  projectionVersion: string;
};

export type ImportLlmAnswerProjectionInput = {
  readiness: ImportSeoGeoLlmReadiness;
  publicProjection: ImportPublicProjectionManifest;
  payload: ImportLlmAnswerProjectionPayload;
  maximumAnswerCharactersPerLocale: number;
  publishReady: boolean;
  sitemapEligible: boolean;
};

export type ImportLlmAnswerProjectionResult = {
  llmAnswerProjectionReady: boolean;
  publishReady: boolean;
  sitemapEligible: boolean;
  blockers: readonly ImportLlmAnswerProjectionBlocker[];
};

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

export function getImportLlmAnswerProjectionReadiness(
  input: ImportLlmAnswerProjectionInput,
): ImportLlmAnswerProjectionResult {
  const blockers: ImportLlmAnswerProjectionBlocker[] = [];
  const llmRecord = input.publicProjection.records.find(
    (record) => record.kind === "llm_answer",
  );

  if (!input.readiness.llmReady) blockers.push("llm_readiness_not_ready");
  if (!llmRecord) blockers.push("llm_projection_record_missing");
  if (llmRecord && llmRecord.routeId !== input.publicProjection.routeId) {
    blockers.push("llm_projection_route_mismatch");
  }
  if (llmRecord && llmRecord.status !== "ready") {
    blockers.push("llm_projection_stale");
  }
  if (input.payload.routeId !== input.publicProjection.routeId) {
    blockers.push("llm_projection_route_mismatch");
  }
  if (!hasText(input.payload.answerEn)) blockers.push("answer_en_missing");
  if (!hasText(input.payload.answerAr)) blockers.push("answer_ar_missing");
  if (input.payload.citations.length === 0) blockers.push("citations_missing");
  if (
    input.payload.citations.some(
      (citation) =>
        !hasText(citation.citationId) ||
        !hasText(citation.sourceEvidenceId) ||
        !hasText(citation.label),
    )
  ) {
    blockers.push("evidence_ids_missing");
  }
  if (
    !hasText(input.payload.medicalDisclaimerEn) ||
    !hasText(input.payload.medicalDisclaimerAr)
  ) {
    blockers.push("medical_disclaimer_missing");
  }
  if (input.payload.unsafeClaimPresent) blockers.push("unsafe_claim_present");
  if (
    input.payload.answerEn.length > input.maximumAnswerCharactersPerLocale ||
    input.payload.answerAr.length > input.maximumAnswerCharactersPerLocale
  ) {
    blockers.push("answer_too_long");
  }
  if (!hasText(input.payload.sourceVersion)) blockers.push("source_version_missing");
  if (!hasText(input.payload.projectionVersion)) {
    blockers.push("projection_version_missing");
  }

  const uniqueBlockers = Array.from(new Set(blockers));

  return {
    llmAnswerProjectionReady: uniqueBlockers.length === 0,
    publishReady: input.publishReady,
    sitemapEligible: input.sitemapEligible,
    blockers: uniqueBlockers,
  };
}

export function isImportLlmAnswerProjectionReady(
  input: ImportLlmAnswerProjectionInput,
): boolean {
  return getImportLlmAnswerProjectionReadiness(input).llmAnswerProjectionReady;
}
