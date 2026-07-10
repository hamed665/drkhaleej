import "server-only";

import { getImportLinkRuleDecision, type ImportEntityLinkRule } from "./import-link-rule-matrix";
import type { ImportEntityDomain, ImportEntityType } from "./import-entity-domain";

export type ImportInternalLinkCandidate = {
  entity_id: string;
  entity_type: ImportEntityType;
  entity_domain: ImportEntityDomain;
  quality_score: number;
  distance_km: number | null;
  same_city: boolean;
  same_area: boolean;
  same_specialty: boolean;
  anchor_text_en: string;
  anchor_text_ar: string;
};

export type ImportInternalLinkSource = {
  entity_id: string;
  entity_type: ImportEntityType;
  entity_domain: ImportEntityDomain;
};

export type ImportGeneratedInternalLink = {
  source_entity_id: string;
  source_type: ImportEntityType;
  source_domain: ImportEntityDomain;
  target_entity_id: string;
  target_type: ImportEntityType;
  target_domain: ImportEntityDomain;
  link_group: string;
  score: number;
  priority: number;
  anchor_text_en: string;
  anchor_text_ar: string;
  generated_reason: string;
  rule_version: string;
  generator_version: string;
};

export type ImportInternalLinkGenerationInput = {
  source: ImportInternalLinkSource;
  candidates: readonly ImportInternalLinkCandidate[];
  link_group: string;
};

export const IMPORT_INTERNAL_LINK_GENERATOR_VERSION = "import-internal-link-generator-v1";
export const IMPORT_INTERNAL_LINK_RULE_VERSION = "import-link-rule-matrix-v1";

function candidatePassesRule(rule: ImportEntityLinkRule, candidate: ImportInternalLinkCandidate): boolean {
  const meetsQualityScore = candidate.quality_score >= rule.min_quality_score;
  const meetsCityRequirement = !rule.same_city_required || candidate.same_city === true;
  const meetsSpecialtyRequirement = !rule.same_specialty_required || candidate.same_specialty === true;
  const meetsDistanceRequirement =
    rule.max_distance_km === null ||
    candidate.distance_km === null ||
    candidate.distance_km <= rule.max_distance_km;

  return meetsQualityScore && meetsCityRequirement && meetsSpecialtyRequirement && meetsDistanceRequirement;
}

function scoreCandidate(rule: ImportEntityLinkRule, candidate: ImportInternalLinkCandidate): number {
  const areaBoost = rule.same_area_boost && candidate.same_area ? 15 : 0;
  const cityBoost = candidate.same_city ? 10 : 0;
  const specialtyBoost = candidate.same_specialty ? 20 : 0;
  const distancePenalty = candidate.distance_km === null ? 0 : Math.min(candidate.distance_km, 25);

  return rule.priority + candidate.quality_score + areaBoost + cityBoost + specialtyBoost - distancePenalty;
}

function ruleKey(rule: ImportEntityLinkRule): string {
  return [rule.source_type, rule.target_type, rule.source_domain, rule.target_domain].join(":");
}

export function generateImportInternalLinks(input: ImportInternalLinkGenerationInput): readonly ImportGeneratedInternalLink[] {
  const generatedLinksByRule = new Map<string, ImportGeneratedInternalLink[]>();
  const maxLinksByRule = new Map<string, number>();

  for (const candidate of input.candidates) {
    const decision = getImportLinkRuleDecision({
      source_type: input.source.entity_type,
      target_type: candidate.entity_type,
      source_domain: input.source.entity_domain,
      target_domain: candidate.entity_domain,
    });

    if (decision.decision !== "allowed" || decision.rule === null) continue;
    if (!candidatePassesRule(decision.rule, candidate)) continue;

    const key = ruleKey(decision.rule);
    const links = generatedLinksByRule.get(key) ?? [];
    maxLinksByRule.set(key, decision.rule.max_links);

    links.push({
      source_entity_id: input.source.entity_id,
      source_type: input.source.entity_type,
      source_domain: input.source.entity_domain,
      target_entity_id: candidate.entity_id,
      target_type: candidate.entity_type,
      target_domain: candidate.entity_domain,
      link_group: input.link_group,
      score: scoreCandidate(decision.rule, candidate),
      priority: decision.rule.priority,
      anchor_text_en: candidate.anchor_text_en,
      anchor_text_ar: candidate.anchor_text_ar,
      generated_reason: "allowed_rule_geo_quality_specialty_filter",
      rule_version: IMPORT_INTERNAL_LINK_RULE_VERSION,
      generator_version: IMPORT_INTERNAL_LINK_GENERATOR_VERSION,
    });

    generatedLinksByRule.set(key, links);
  }

  return [...generatedLinksByRule.entries()]
    .flatMap(([key, links]) =>
      links
        .sort((left, right) => right.score - left.score || right.priority - left.priority)
        .slice(0, maxLinksByRule.get(key) ?? 0),
    )
    .sort((left, right) => right.score - left.score || right.priority - left.priority);
}
