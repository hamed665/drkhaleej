import "server-only";

export type ImportVisibilityPolicy = "private" | "public";
export type ImportIndexPolicy = "noindex" | "index";
export type ImportSitemapPolicy = "excluded" | "included";
export type ImportPublishStatus = "imported" | "validation_failed" | "validated" | "index_eligible" | "published";

export type ImportPublishLockDefaults = {
  visibility: "private";
  index_policy: "noindex";
  sitemap_policy: "excluded";
  manual_approved: false;
  publish_status: "imported";
};

export type ImportPublishLockableRow = {
  visibility?: ImportVisibilityPolicy | null;
  index_policy?: ImportIndexPolicy | null;
  sitemap_policy?: ImportSitemapPolicy | null;
  manual_approved?: boolean | null;
  publish_status?: ImportPublishStatus | string | null;
  public_ready?: boolean | null;
  metadata?: Record<string, unknown> | null;
};

export type ImportPublishLockViolation =
  | "visibility_not_private"
  | "index_policy_not_noindex"
  | "sitemap_policy_not_excluded"
  | "manual_approved_not_false"
  | "public_ready_not_false"
  | "metadata_sitemap_included_true"
  | "metadata_robots_policy_index";

export const IMPORT_PUBLISH_LOCK_DEFAULTS = {
  visibility: "private",
  index_policy: "noindex",
  sitemap_policy: "excluded",
  manual_approved: false,
  publish_status: "imported",
} as const satisfies ImportPublishLockDefaults;

export function withImportPublishLockDefaults<T extends ImportPublishLockableRow>(row: T): T & ImportPublishLockDefaults {
  return {
    ...row,
    ...IMPORT_PUBLISH_LOCK_DEFAULTS,
    public_ready: false,
    metadata: sanitizeImportPublishLockMetadata(row.metadata),
  };
}

export function sanitizeImportPublishLockMetadata(metadata: ImportPublishLockableRow["metadata"]): Record<string, unknown> {
  return {
    ...(metadata ?? {}),
    robots_policy: "noindex",
    sitemap_included: false,
  };
}

export function getImportPublishLockViolations(row: ImportPublishLockableRow): readonly ImportPublishLockViolation[] {
  const violations: ImportPublishLockViolation[] = [];

  if (row.visibility !== undefined && row.visibility !== null && row.visibility !== "private") {
    violations.push("visibility_not_private");
  }

  if (row.index_policy !== undefined && row.index_policy !== null && row.index_policy !== "noindex") {
    violations.push("index_policy_not_noindex");
  }

  if (row.sitemap_policy !== undefined && row.sitemap_policy !== null && row.sitemap_policy !== "excluded") {
    violations.push("sitemap_policy_not_excluded");
  }

  if (row.manual_approved !== undefined && row.manual_approved !== null && row.manual_approved !== false) {
    violations.push("manual_approved_not_false");
  }

  if (row.public_ready !== undefined && row.public_ready !== null && row.public_ready !== false) {
    violations.push("public_ready_not_false");
  }

  if (row.metadata?.sitemap_included === true) {
    violations.push("metadata_sitemap_included_true");
  }

  if (row.metadata?.robots_policy === "index") {
    violations.push("metadata_robots_policy_index");
  }

  return violations;
}

export function isImportPublishLocked(row: ImportPublishLockableRow): boolean {
  return getImportPublishLockViolations(row).length === 0;
}
