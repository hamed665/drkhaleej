import "server-only";

import { getImportPublishLockViolations, type ImportPublishLockableRow } from "./import-publish-lock";

export type ImportEntityLifecycleState =
  | "draft"
  | "imported"
  | "validation_failed"
  | "validated"
  | "approved"
  | "published"
  | "unpublished"
  | "archived";

export type ImportPublishBlockerReason =
  | "not_validated"
  | "not_approved"
  | "already_published"
  | "archived"
  | "visibility_not_private"
  | "index_policy_not_noindex"
  | "sitemap_policy_not_excluded"
  | "manual_approval_missing"
  | "public_ready_not_false"
  | "metadata_sitemap_included_true"
  | "metadata_robots_policy_index"
  | "seo_not_validated"
  | "geo_not_validated"
  | "content_not_validated"
  | "relations_not_validated"
  | "schema_not_validated"
  | "duplicate_check_missing";

export type ImportPublishEligibilityEntity = ImportPublishLockableRow & {
  lifecycle_state?: ImportEntityLifecycleState | string | null;
  seo_validated?: boolean | null;
  geo_validated?: boolean | null;
  content_validated?: boolean | null;
  relations_validated?: boolean | null;
  schema_validated?: boolean | null;
  duplicate_check_passed?: boolean | null;
  manual_approved?: boolean | null;
};

export type ImportReadinessStatus = {
  lifecycleState: ImportEntityLifecycleState | "unknown";
  canPublish: boolean;
  blockers: readonly ImportPublishBlockerReason[];
};

const publishableLifecycleStates = new Set<ImportEntityLifecycleState>(["validated", "approved", "unpublished"]);

export function normalizeImportLifecycleState(value: string | null | undefined): ImportEntityLifecycleState | "unknown" {
  switch (value) {
    case "draft":
    case "imported":
    case "validation_failed":
    case "validated":
    case "approved":
    case "published":
    case "unpublished":
    case "archived":
      return value;
    default:
      return "unknown";
  }
}

export function getPublishBlockers(entity: ImportPublishEligibilityEntity): readonly ImportPublishBlockerReason[] {
  const blockers: ImportPublishBlockerReason[] = [];
  const lifecycleState = normalizeImportLifecycleState(entity.lifecycle_state);

  if (lifecycleState === "published") blockers.push("already_published");
  else if (lifecycleState === "archived") blockers.push("archived");
  else if (!publishableLifecycleStates.has(lifecycleState as ImportEntityLifecycleState)) blockers.push("not_validated");

  if (entity.manual_approved !== true) blockers.push("manual_approval_missing");
  if (entity.seo_validated !== true) blockers.push("seo_not_validated");
  if (entity.geo_validated !== true) blockers.push("geo_not_validated");
  if (entity.content_validated !== true) blockers.push("content_not_validated");
  if (entity.relations_validated !== true) blockers.push("relations_not_validated");
  if (entity.schema_validated !== true) blockers.push("schema_not_validated");
  if (entity.duplicate_check_passed !== true) blockers.push("duplicate_check_missing");

  for (const violation of getImportPublishLockViolations(entity)) {
    switch (violation) {
      case "visibility_not_private":
        blockers.push("visibility_not_private");
        break;
      case "index_policy_not_noindex":
        blockers.push("index_policy_not_noindex");
        break;
      case "sitemap_policy_not_excluded":
        blockers.push("sitemap_policy_not_excluded");
        break;
      case "manual_approved_not_false":
        if (entity.manual_approved !== true) blockers.push("not_approved");
        break;
      case "public_ready_not_false":
        blockers.push("public_ready_not_false");
        break;
      case "metadata_sitemap_included_true":
        blockers.push("metadata_sitemap_included_true");
        break;
      case "metadata_robots_policy_index":
        blockers.push("metadata_robots_policy_index");
        break;
    }
  }

  return [...new Set(blockers)];
}

export function canPublishEntity(entity: ImportPublishEligibilityEntity): boolean {
  return getPublishBlockers(entity).length === 0;
}

export function getReadinessStatus(entity: ImportPublishEligibilityEntity): ImportReadinessStatus {
  const lifecycleState = normalizeImportLifecycleState(entity.lifecycle_state);
  const blockers = getPublishBlockers(entity);

  return {
    lifecycleState,
    canPublish: blockers.length === 0,
    blockers,
  };
}
