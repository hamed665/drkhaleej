import "server-only";

import type { ImportEntityDomain, ImportEntityType } from "./import-entity-domain";
import type { ImportPublicPageDataSource, ImportPublicRenderPlan } from "./import-performance-guard";

export type ImportPublicProjectionKind =
  | "entity"
  | "geo"
  | "seo"
  | "schema"
  | "internal_links"
  | "nearby_entities"
  | "llm_answer"
  | "area_page";

export type ImportPublicProjectionTable =
  | "public_entity_projection"
  | "public_geo_projection"
  | "public_seo_projection"
  | "public_schema_projection"
  | "public_internal_links_projection"
  | "public_nearby_entities_projection"
  | "public_llm_answer_projection"
  | "public_area_page_projection";

export type ImportPublicProjectionBuildSource =
  | "validated_draft_entity"
  | "canonical_geo_registry"
  | "seo_profile"
  | "schema_generator"
  | "internal_link_cache"
  | "nearby_entity_cache"
  | "llm_answer_generator"
  | "area_page_matrix";

export type ImportPublicProjectionStatus = "missing" | "stale" | "ready" | "blocked";

export type ImportPublicProjectionRecord = {
  projectionId: string;
  entityId: string | null;
  routeId: string;
  kind: ImportPublicProjectionKind;
  table: ImportPublicProjectionTable;
  status: ImportPublicProjectionStatus;
  entityType: ImportEntityType | null;
  entityDomain: ImportEntityDomain | null;
  sourceVersion: string;
  projectionVersion: string;
  generatedAt: string | null;
  expiresAt: string | null;
  payloadHash: string | null;
  payloadSizeKb: number;
  buildSources: readonly ImportPublicProjectionBuildSource[];
};

export type ImportPublicProjectionManifest = {
  routeId: string;
  records: readonly ImportPublicProjectionRecord[];
  renderPlan: ImportPublicRenderPlan;
};

export type ImportPublicProjectionBlocker =
  | "entity_projection_missing"
  | "geo_projection_missing"
  | "seo_projection_missing"
  | "schema_projection_missing"
  | "internal_links_projection_missing"
  | "nearby_entities_projection_missing"
  | "llm_answer_projection_missing"
  | "projection_stale"
  | "projection_blocked"
  | "projection_payload_too_large"
  | "projection_route_mismatch"
  | "projection_source_missing"
  | "raw_import_source_in_public_render";

export const IMPORT_PUBLIC_PROJECTION_TABLES = [
  "public_entity_projection",
  "public_geo_projection",
  "public_seo_projection",
  "public_schema_projection",
  "public_internal_links_projection",
  "public_nearby_entities_projection",
  "public_llm_answer_projection",
  "public_area_page_projection",
] as const satisfies readonly ImportPublicProjectionTable[];

export const IMPORT_PUBLIC_REQUIRED_ENTITY_PROJECTION_KINDS = [
  "entity",
  "geo",
  "seo",
  "schema",
  "internal_links",
  "nearby_entities",
  "llm_answer",
] as const satisfies readonly ImportPublicProjectionKind[];

export const IMPORT_PUBLIC_PROJECTION_DATA_SOURCE_BY_KIND = {
  entity: "public_indexable_entities",
  geo: "canonical_geo_projection",
  seo: "public_seo_projection",
  schema: "schema_projection",
  internal_links: "entity_internal_links_cache",
  nearby_entities: "public_nearby_entities_projection",
  llm_answer: "public_llm_answer_projection",
  area_page: "public_content_projection",
} as const satisfies Record<ImportPublicProjectionKind, ImportPublicPageDataSource>;

export const IMPORT_PUBLIC_PROJECTION_MAX_RECORD_PAYLOAD_KB = 96;

function hasRequiredKind(records: readonly ImportPublicProjectionRecord[], kind: ImportPublicProjectionKind): boolean {
  return records.some((record) => record.kind === kind && record.status === "ready");
}

export function getPublicProjectionDataSources(records: readonly ImportPublicProjectionRecord[]): readonly ImportPublicPageDataSource[] {
  return [
    ...new Set(
      records
        .filter((record) => record.status === "ready")
        .map((record) => IMPORT_PUBLIC_PROJECTION_DATA_SOURCE_BY_KIND[record.kind]),
    ),
  ];
}

export function getImportPublicProjectionBlockers(manifest: ImportPublicProjectionManifest): readonly ImportPublicProjectionBlocker[] {
  const blockers: ImportPublicProjectionBlocker[] = [];
  const records = manifest.records;

  for (const kind of IMPORT_PUBLIC_REQUIRED_ENTITY_PROJECTION_KINDS) {
    if (!hasRequiredKind(records, kind)) {
      const blocker = `${kind}_projection_missing` as ImportPublicProjectionBlocker;
      blockers.push(blocker);
    }
  }

  for (const record of records) {
    if (record.status === "stale") blockers.push("projection_stale");
    if (record.status === "blocked") blockers.push("projection_blocked");
    if (record.payloadSizeKb > IMPORT_PUBLIC_PROJECTION_MAX_RECORD_PAYLOAD_KB) blockers.push("projection_payload_too_large");
    if (record.routeId !== manifest.routeId) blockers.push("projection_route_mismatch");
    if (record.buildSources.length === 0) blockers.push("projection_source_missing");
  }

  for (const dataSource of manifest.renderPlan.dataSources) {
    if (dataSource === "public_indexable_entities") continue;
    if (dataSource === "entity_internal_links_cache") continue;
    if (dataSource === "schema_projection") continue;
    if (dataSource === "canonical_geo_projection") continue;
    if (dataSource === "public_content_projection") continue;
    if (dataSource === "public_seo_projection") continue;
    if (dataSource === "public_nearby_entities_projection") continue;
    if (dataSource === "public_llm_answer_projection") continue;

    blockers.push("raw_import_source_in_public_render");
  }

  return [...new Set(blockers)];
}

export function isImportPublicProjectionManifestReady(manifest: ImportPublicProjectionManifest): boolean {
  return getImportPublicProjectionBlockers(manifest).length === 0;
}
