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
    source_type: "ivf_center",
    target_type: "gynecologist",
    source_domain: "human_healthcare",
    target_domain: "human_healthcare",
    allowed: true,
    priority: 96,
    max_links: 12,
    max_distance_km: 15,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: true,
    min_quality_score: 75,
  },
  {
    source_type: "fertility_clinic",
    target_type: "reproductive_medicine_doctor",
    source_domain: "human_healthcare",
    target_domain: "human_healthcare",
    allowed: true,
    priority: 98,
    max_links: 12,
    max_distance_km: 15,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: true,
    min_quality_score: 75,
  },
  {
    source_type: "ivf_center",
    target_type: "embryology_lab",
    source_domain: "human_healthcare",
    target_domain: "human_healthcare",
    allowed: true,
    priority: 88,
    max_links: 4,
    max_distance_km: 20,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: false,
    min_quality_score: 75,
  },
  {
    source_type: "ivf_center",
    target_type: "andrology_lab",
    source_domain: "human_healthcare",
    target_domain: "human_healthcare",
    allowed: true,
    priority: 86,
    max_links: 4,
    max_distance_km: 20,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: false,
    min_quality_score: 75,
  },
  {
    source_type: "hair_transplant_clinic",
    target_type: "hair_transplant_doctor",
    source_domain: "medical_beauty",
    target_domain: "medical_beauty",
    allowed: true,
    priority: 98,
    max_links: 12,
    max_distance_km: 15,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: true,
    min_quality_score: 75,
  },
  {
    source_type: "hair_transplant_clinic",
    target_type: "dermatologist",
    source_domain: "medical_beauty",
    target_domain: "human_healthcare",
    allowed: true,
    priority: 82,
    max_links: 8,
    max_distance_km: 15,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: false,
    min_quality_score: 75,
  },
  {
    source_type: "hair_transplant_clinic",
    target_type: "salon",
    source_domain: "medical_beauty",
    target_domain: "non_medical_beauty",
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
    source_type: "gym",
    target_type: "sports_medicine_doctor",
    source_domain: "fitness",
    target_domain: "human_healthcare",
    allowed: true,
    priority: 50,
    max_links: 4,
    max_distance_km: 10,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: false,
    min_quality_score: 80,
  },
  {
    source_type: "fitness_center",
    target_type: "physiotherapy",
    source_domain: "fitness",
    target_domain: "human_healthcare",
    allowed: true,
    priority: 45,
    max_links: 4,
    max_distance_km: 10,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: false,
    min_quality_score: 80,
  },
  {
    source_type: "personal_trainer",
    target_type: "sports_medicine_doctor",
    source_domain: "fitness",
    target_domain: "human_healthcare",
    allowed: true,
    priority: 40,
    max_links: 3,
    max_distance_km: 10,
    same_city_required: true,
    same_area_boost: true,
    same_specialty_required: false,
    min_quality_score: 80,
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

  if (domainViolations.length > 0 && rule?.allowed !== true) {
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
