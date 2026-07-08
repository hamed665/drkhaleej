import "server-only";

import { normalizeOmanGeoAlias, type OmanGeoAuthorityEntry, type OmanGeoAuthorityRegistry } from "./import-oman-geo-authority-registry";

export type OmanGeoAliasDuplicateGuardIssue = {
  reason: OmanGeoAliasDuplicateGuardReason;
  primaryEntryId: string | null;
  duplicateEntryId: string | null;
  normalizedValue: string | null;
};

export type OmanGeoAliasDuplicateGuardReason =
  | "canonical_slug_duplicate"
  | "alias_collides_with_canonical_slug"
  | "alias_collides_with_other_alias"
  | "alias_points_to_multiple_entries"
  | "deprecated_entry_missing_replacement"
  | "non_canonical_slug_variant"
  | "empty_alias_value"
  | "empty_normalized_alias";

export type OmanGeoAliasDuplicateGuardResult = {
  ready: boolean;
  issues: readonly OmanGeoAliasDuplicateGuardIssue[];
};

export type OmanGeoDeprecatedEntryResolution = {
  deprecatedEntryId: string;
  replacementEntryId: string | null;
};

function makeIssue(
  reason: OmanGeoAliasDuplicateGuardReason,
  primaryEntryId: string | null,
  duplicateEntryId: string | null,
  normalizedValue: string | null,
): OmanGeoAliasDuplicateGuardIssue {
  return { reason, primaryEntryId, duplicateEntryId, normalizedValue };
}

function addUniqueIssue(issues: OmanGeoAliasDuplicateGuardIssue[], issue: OmanGeoAliasDuplicateGuardIssue): void {
  const issueKey = `${issue.reason}:${issue.primaryEntryId ?? ""}:${issue.duplicateEntryId ?? ""}:${issue.normalizedValue ?? ""}`;
  const exists = issues.some(
    (candidate) => `${candidate.reason}:${candidate.primaryEntryId ?? ""}:${candidate.duplicateEntryId ?? ""}:${candidate.normalizedValue ?? ""}` === issueKey,
  );

  if (!exists) issues.push(issue);
}

export function getCanonicalSlugCollisionIssues(entries: readonly OmanGeoAuthorityEntry[]): readonly OmanGeoAliasDuplicateGuardIssue[] {
  const issues: OmanGeoAliasDuplicateGuardIssue[] = [];
  const entryBySlug = new Map<string, OmanGeoAuthorityEntry>();

  for (const entry of entries) {
    const normalizedSlug = normalizeOmanGeoAlias(entry.slug);
    const existing = entryBySlug.get(normalizedSlug);

    if (existing) {
      addUniqueIssue(issues, makeIssue("canonical_slug_duplicate", existing.id, entry.id, normalizedSlug));
    } else {
      entryBySlug.set(normalizedSlug, entry);
    }
  }

  return issues;
}

export function getAliasCollisionIssues(entries: readonly OmanGeoAuthorityEntry[]): readonly OmanGeoAliasDuplicateGuardIssue[] {
  const issues: OmanGeoAliasDuplicateGuardIssue[] = [];
  const entryBySlug = new Map(entries.map((entry) => [normalizeOmanGeoAlias(entry.slug), entry]));
  const entryByAlias = new Map<string, OmanGeoAuthorityEntry>();

  for (const entry of entries) {
    for (const alias of entry.aliases) {
      if (alias.value.trim().length === 0) addUniqueIssue(issues, makeIssue("empty_alias_value", entry.id, null, null));

      const normalizedAlias = alias.normalizedValue || normalizeOmanGeoAlias(alias.value);
      if (normalizedAlias.trim().length === 0) addUniqueIssue(issues, makeIssue("empty_normalized_alias", entry.id, null, null));

      const canonicalCollision = entryBySlug.get(normalizedAlias);
      if (canonicalCollision && canonicalCollision.id !== entry.id) {
        addUniqueIssue(issues, makeIssue("alias_collides_with_canonical_slug", entry.id, canonicalCollision.id, normalizedAlias));
      }

      const existingAliasOwner = entryByAlias.get(normalizedAlias);
      if (existingAliasOwner && existingAliasOwner.id !== entry.id) {
        addUniqueIssue(issues, makeIssue("alias_collides_with_other_alias", existingAliasOwner.id, entry.id, normalizedAlias));
        addUniqueIssue(issues, makeIssue("alias_points_to_multiple_entries", existingAliasOwner.id, entry.id, normalizedAlias));
      } else {
        entryByAlias.set(normalizedAlias, entry);
      }
    }
  }

  return issues;
}

export function getDeprecatedGeoEntryIssues(
  entries: readonly OmanGeoAuthorityEntry[],
  deprecatedResolutions: readonly OmanGeoDeprecatedEntryResolution[],
): readonly OmanGeoAliasDuplicateGuardIssue[] {
  const issues: OmanGeoAliasDuplicateGuardIssue[] = [];
  const activeEntryIds = new Set(entries.filter((entry) => entry.status !== "deprecated").map((entry) => entry.id));
  const replacementByDeprecatedId = new Map(deprecatedResolutions.map((resolution) => [resolution.deprecatedEntryId, resolution.replacementEntryId]));

  for (const entry of entries) {
    if (entry.status !== "deprecated") continue;

    const replacementEntryId = replacementByDeprecatedId.get(entry.id);
    if (!replacementEntryId || !activeEntryIds.has(replacementEntryId)) {
      addUniqueIssue(issues, makeIssue("deprecated_entry_missing_replacement", entry.id, replacementEntryId ?? null, null));
    }
  }

  return issues;
}

export function getNonCanonicalSlugVariantIssues(entries: readonly OmanGeoAuthorityEntry[]): readonly OmanGeoAliasDuplicateGuardIssue[] {
  const issues: OmanGeoAliasDuplicateGuardIssue[] = [];

  for (const entry of entries) {
    const normalizedSlug = normalizeOmanGeoAlias(entry.slug);
    if (entry.slug !== normalizedSlug) addUniqueIssue(issues, makeIssue("non_canonical_slug_variant", entry.id, null, normalizedSlug));
  }

  return issues;
}

export function getOmanGeoAliasDuplicateGuardIssues(
  registry: OmanGeoAuthorityRegistry,
  deprecatedResolutions: readonly OmanGeoDeprecatedEntryResolution[] = [],
): readonly OmanGeoAliasDuplicateGuardIssue[] {
  return [
    ...getCanonicalSlugCollisionIssues(registry.entries),
    ...getAliasCollisionIssues(registry.entries),
    ...getDeprecatedGeoEntryIssues(registry.entries, deprecatedResolutions),
    ...getNonCanonicalSlugVariantIssues(registry.entries),
  ];
}

export function getOmanGeoAliasDuplicateGuardResult(
  registry: OmanGeoAuthorityRegistry,
  deprecatedResolutions: readonly OmanGeoDeprecatedEntryResolution[] = [],
): OmanGeoAliasDuplicateGuardResult {
  const issues = getOmanGeoAliasDuplicateGuardIssues(registry, deprecatedResolutions);

  return {
    ready: issues.length === 0,
    issues,
  };
}

export function isOmanGeoAliasDuplicateGuardReady(
  registry: OmanGeoAuthorityRegistry,
  deprecatedResolutions: readonly OmanGeoDeprecatedEntryResolution[] = [],
): boolean {
  return getOmanGeoAliasDuplicateGuardResult(registry, deprecatedResolutions).ready;
}
