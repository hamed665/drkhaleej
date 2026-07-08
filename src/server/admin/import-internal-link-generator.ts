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
  if (candidate.quality_score < rule.min_quality_score) return false;
  if (rule.same_city_required && candidate.same_city !== true) return false;
  if (rule.same_specialty_required && candidate.same_specialty !== true) return false;
  if (rule.max_distance_km !== null && candidate.distance_km !== null && candidate.distance_km > rule.max_distance_km) return false;
  return true;
}

function scoreCandidate(rule: ImportEntityLinkRule, candidate: ImportInternalLinkCandidate): number {
  const areaBoost = rule.same_area_boost && candidate.same_area ? 15 : 0;
  const cityBoost = candidate.same_city ? 10 : 0;
  const specialtyBoost = candidate.same_specialty ? 20 : 0;
  const distancePenalty = candidate.distance_km === null ? 0 : Math.min(candidate.distance_km, 25);

  return rule.priority + candidate.quality_score + areaBoost + cityBoost + specialtyBoost - distancePenalty;
}

export function generateImportInternalLinks(input: ImportInternalLinkGenerationInput): readonly ImportGeneratedInternalLink[] {
  const generatedLinks: ImportGeneratedInternalLink[] = [];

  for (const candidate of input.candidates) {
    const decision = getImportLinkRuleDecision({
      source_type: input.source.entity_type,
      target_type: candidate.entity_type,
      source_domain: input.source.entity_domain,
      target_domain: candidate.entity_domain,
    });

    if (decision.decision !== "allowed" || decision.rule === null) continue;
    if (!candidatePassesRule(decision.rule, candidate)) continue;

    generatedLinks.push({
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
  }

  return generatedLinks
    .sort((left, right) => right.score - left.score || right.priority - left.priority)
    .slice(0, Math.max(0, generatedLinks[0]?.priority ? Number.POSITIVE_INFINITY : 0));
}

export function generateImportInternalLinksForRuleLimit(
  input: ImportInternalLinkGenerationInput,
): readonly ImportGeneratedInternalLink[] {
  const links = generateImportInternalLinks(input);
  const firstRule = links[0];
  if (!firstRule) return [];

  const matchingRule = getImportLinkRuleDecision({
    source_type: firstRule.source_type,
    target_type: firstRule.target_type,
    source_domain: firstRule.source_domain,
    target_domain: firstRule.target_domain,
  }).rule;

  return links.slice(0, matchingRule?.max_links ?? 0);
}
