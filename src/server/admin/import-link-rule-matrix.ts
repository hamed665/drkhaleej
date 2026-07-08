import "server-only";

import {
  getDomainSeparationViolations,
  type ImportEntityDomain,
  type ImportEntityType,
} from "./import-entity-domain";

export type ImportLinkRuleDecision = "allowed" | "blocked";

export type ImportEntityLinkRule = {
  source_type: ImportEntityType;
  target_type: ImportEntityType;
  source_domain: ImportEntityDomain;
  target_domain: ImportEntityDomain;
  allowed: boolean;
  priority: number;
  max_links: number;
  max_distance_km: number | null;
  same_city_required: boolean;
  same_area_boost: boolean;
  same_specialty_required: boolean;
  min_quality_score: number;
};

export type ImportLinkRuleMatchInput = {
  source_type: ImportEntityType;
  target_type: ImportEntityType;
  source_domain: ImportEntityDomain;
  target_domain: ImportEntityDomain;
};

export type ImportLinkRuleBlocker =
  | "blocked_by_explicit_rule"
  | "blocked_by_domain_separation"
  | "missing_allow_rule";

export type ImportLinkRuleDecisionResult = {
  decision: ImportLinkRuleDecision;
  rule: ImportEntityLinkRule | null;
  blockers: readonly ImportLinkRuleBlocker[];
};

export const IMPORT_ENTITY_LINK_RULES = [
  {
    source_type: "hospital",
    target_type: "doctor",
    source_domain: "human_healthcare",
    target_domain: "human_healthcare",
    allowed: true,
    priority: 100,
    max_links: 30,
    max_distance_km: null,
    same_city_required: false,
    same_area_boost: true,
    same_specialty_required: false,
    min_quality_score: 70,
  },
  {
    source_type: "hospital",
    target_type: "pharmacy",
    source_domain: "human_healthcare",
    target_domain: "human_healthcare",
    allowed: true,
    priority: 80,
    max_links: 8,
    max_distance_km: 5,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: false,
    min_quality_score: 70,
  },
  {
    source_type: "hospital",
    target_type: "lab",
    source_domain: "human_healthcare",
    target_domain: "human_healthcare",
    allowed: true,
    priority: 70,
    max_links: 6,
    max_distance_km: 8,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: false,
    min_quality_score: 70,
  },
  {
    source_type: "hospital",
    target_type: "imaging_center",
    source_domain: "human_healthcare",
    target_domain: "human_healthcare",
    allowed: true,
    priority: 65,
    max_links: 6,
    max_distance_km: 8,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: false,
    min_quality_score: 70,
  },
  {
    source_type: "hospital",
    target_type: "pet_shop",
    source_domain: "human_healthcare",
    target_domain: "pet_healthcare",
    allowed: false,
    priority: 1000,
    max_links: 0,
    max_distance_km: null,
    same_city_required: false,
    same_area_boost: false,
    same_specialty_required: false,
    min_quality_score: 100,
  },
  {
    source_type: "pet_clinic",
    target_type: "pet_shop",
    source_domain: "pet_healthcare",
    target_domain: "pet_healthcare",
    allowed: true,
    priority: 90,
    max_links: 8,
    max_distance_km: 8,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: false,
    min_quality_score: 70,
  },
  {
    source_type: "pet_clinic",
    target_type: "pet_pharmacy",
    source_domain: "pet_healthcare",
    target_domain: "pet_healthcare",
    allowed: true,
    priority: 95,
    max_links: 6,
    max_distance_km: 8,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: false,
    min_quality_score: 70,
  },
  {
    source_type: "pet_clinic",
    target_type: "human_pharmacy" as ImportEntityType,
    source_domain: "pet_healthcare",
    target_domain: "human_healthcare",
    allowed: false,
    priority: 1000,
    max_links: 0,
    max_distance_km: null,
    same_city_required: false,
    same_area_boost: false,
    same_specialty_required: false,
    min_quality_score: 100,
  },
  {
    source_type: "medical_beauty_clinic",
    target_type: "dermatologist",
    source_domain: "medical_beauty",
    target_domain: "human_healthcare",
    allowed: true,
    priority: 75,
    max_links: 8,
    max_distance_km: 10,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: false,
    min_quality_score: 75,
  },
  {
    source_type: "dental_clinic",
    target_type: "dentist",
    source_domain: "human_healthcare",
    target_domain: "human_healthcare",
    allowed: true,
    priority: 95,
    max_links: 20,
    max_distance_km: null,
    same_city_required: false,
    same_area_boost: true,
    same_specialty_required: true,
    min_quality_score: 70,
  },
] as const satisfies readonly ImportEntityLinkRule[];

function ruleMatches(rule: ImportEntityLinkRule, input: ImportLinkRuleMatchInput): boolean {
  return (
    rule.source_type === input.source_type &&
    rule.target_type === input.target_type &&
    rule.source_domain === input.source_domain &&
    rule.target_domain === input.target_domain
  );
}

export function findImportEntityLinkRule(input: ImportLinkRuleMatchInput): ImportEntityLinkRule | null {
  const matchingRules = IMPORT_ENTITY_LINK_RULES.filter((rule) => ruleMatches(rule, input));
  return matchingRules.sort((left, right) => right.priority - left.priority)[0] ?? null;
}

export function getImportLinkRuleDecision(input: ImportLinkRuleMatchInput): ImportLinkRuleDecisionResult {
  const domainViolations = getDomainSeparationViolations(input.source_domain, input.target_domain);
  const rule = findImportEntityLinkRule(input);

  if (rule?.allowed === false) {
    return { decision: "blocked", rule, blockers: ["blocked_by_explicit_rule"] };
  }

  if (domainViolations.length > 0) {
    return { decision: "blocked", rule, blockers: ["blocked_by_domain_separation"] };
  }

  if (rule === null) {
    return { decision: "blocked", rule: null, blockers: ["missing_allow_rule"] };
  }

  return { decision: "allowed", rule, blockers: [] };
}

export function isImportEntityLinkAllowed(input: ImportLinkRuleMatchInput): boolean {
  return getImportLinkRuleDecision(input).decision === "allowed";
}
