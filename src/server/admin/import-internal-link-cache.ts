import "server-only";

import type { ImportEntityDomain, ImportEntityType } from "./import-entity-domain";
import type { ImportGeneratedInternalLink } from "./import-internal-link-generator";

export type ImportInternalLinkCacheRow = {
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
  rule_id: string;
  rule_version: string;
  generator_version: string;
  generated_reason: string;
  generated_at: string;
  expires_at: string;
  is_active: boolean;
};

export type ImportInternalLinkCacheWriteInput = {
  generated_link: ImportGeneratedInternalLink;
  rule_id: string;
  generated_at: string;
  expires_at: string;
};

export type ImportInternalLinkCacheReadFilter = {
  source_entity_id: string;
  source_type: ImportEntityType;
  link_group?: string;
  now: string;
};

export const IMPORT_INTERNAL_LINK_CACHE_TABLE = "entity_internal_links_cache";

export const IMPORT_INTERNAL_LINK_CACHE_REQUIRED_COLUMNS = [
  "source_entity_id",
  "source_type",
  "source_domain",
  "target_entity_id",
  "target_type",
  "target_domain",
  "link_group",
  "score",
  "priority",
  "anchor_text_en",
  "anchor_text_ar",
  "rule_id",
  "rule_version",
  "generator_version",
  "generated_reason",
  "generated_at",
  "expires_at",
  "is_active",
] as const;

export function toImportInternalLinkCacheRow(input: ImportInternalLinkCacheWriteInput): ImportInternalLinkCacheRow {
  return {
    source_entity_id: input.generated_link.source_entity_id,
    source_type: input.generated_link.source_type,
    source_domain: input.generated_link.source_domain,
    target_entity_id: input.generated_link.target_entity_id,
    target_type: input.generated_link.target_type,
    target_domain: input.generated_link.target_domain,
    link_group: input.generated_link.link_group,
    score: input.generated_link.score,
    priority: input.generated_link.priority,
    anchor_text_en: input.generated_link.anchor_text_en,
    anchor_text_ar: input.generated_link.anchor_text_ar,
    rule_id: input.rule_id,
    rule_version: input.generated_link.rule_version,
    generator_version: input.generated_link.generator_version,
    generated_reason: input.generated_link.generated_reason,
    generated_at: input.generated_at,
    expires_at: input.expires_at,
    is_active: true,
  };
}

export function isImportInternalLinkCacheRowActive(row: ImportInternalLinkCacheRow, now: string): boolean {
  return row.is_active === true && row.expires_at > now;
}

export function filterImportInternalLinkCacheRows(
  rows: readonly ImportInternalLinkCacheRow[],
  filter: ImportInternalLinkCacheReadFilter,
): readonly ImportInternalLinkCacheRow[] {
  return rows
    .filter((row) => row.source_entity_id === filter.source_entity_id)
    .filter((row) => row.source_type === filter.source_type)
    .filter((row) => (filter.link_group ? row.link_group === filter.link_group : true))
    .filter((row) => isImportInternalLinkCacheRowActive(row, filter.now))
    .sort((left, right) => right.score - left.score || right.priority - left.priority);
}
