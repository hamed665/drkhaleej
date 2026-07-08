import "server-only";

export type ImportPublicationValidationBlocker =
  | "slug_missing"
  | "slug_invalid"
  | "title_missing"
  | "title_too_short"
  | "meta_description_missing"
  | "meta_description_too_short"
  | "canonical_missing"
  | "canonical_invalid"
  | "domain_missing"
  | "domain_invalid"
  | "entity_type_missing"
  | "entity_type_invalid"
  | "canonical_geo_missing"
  | "canonical_geo_invalid"
  | "minimum_content_incomplete"
  | "duplicate_check_missing"
  | "duplicate_check_failed"
  | "schema_missing"
  | "schema_invalid"
  | "internal_links_missing"
  | "manual_approval_missing";

export type ImportPublicationValidationInput = {
  slug: string | null;
  title: string | null;
  meta_description: string | null;
  canonical_path: string | null;
  domain_validated: boolean;
  entity_type_validated: boolean;
  canonical_geo_validated: boolean;
  minimum_content_complete: boolean;
  duplicate_check_passed: boolean | null;
  schema_generated: boolean;
  schema_validated: boolean;
  internal_links_generated: boolean;
  manual_approved: boolean;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const canonicalPathPattern = /^\/(en|ar)\/om\/[a-z0-9-]+\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const minimumTitleLength = 10;
const minimumMetaDescriptionLength = 40;

export function isValidImportSlug(slug: string | null): boolean {
  return typeof slug === "string" && slugPattern.test(slug);
}

export function isValidImportCanonicalPath(canonicalPath: string | null): boolean {
  return typeof canonicalPath === "string" && canonicalPathPattern.test(canonicalPath);
}

export function getImportPublicationValidationBlockers(
  input: ImportPublicationValidationInput,
): readonly ImportPublicationValidationBlocker[] {
  const blockers: ImportPublicationValidationBlocker[] = [];

  if (input.slug === null) blockers.push("slug_missing");
  else if (!isValidImportSlug(input.slug)) blockers.push("slug_invalid");

  if (input.title === null) blockers.push("title_missing");
  else if (input.title.trim().length < minimumTitleLength) blockers.push("title_too_short");

  if (input.meta_description === null) blockers.push("meta_description_missing");
  else if (input.meta_description.trim().length < minimumMetaDescriptionLength) blockers.push("meta_description_too_short");

  if (input.canonical_path === null) blockers.push("canonical_missing");
  else if (!isValidImportCanonicalPath(input.canonical_path)) blockers.push("canonical_invalid");

  if (input.domain_validated !== true) blockers.push("domain_invalid");
  if (input.entity_type_validated !== true) blockers.push("entity_type_invalid");
  if (input.canonical_geo_validated !== true) blockers.push("canonical_geo_invalid");
  if (input.minimum_content_complete !== true) blockers.push("minimum_content_incomplete");

  if (input.duplicate_check_passed === null) blockers.push("duplicate_check_missing");
  else if (input.duplicate_check_passed !== true) blockers.push("duplicate_check_failed");

  if (input.schema_generated !== true) blockers.push("schema_missing");
  else if (input.schema_validated !== true) blockers.push("schema_invalid");

  if (input.internal_links_generated !== true) blockers.push("internal_links_missing");
  if (input.manual_approved !== true) blockers.push("manual_approval_missing");

  return [...new Set(blockers)];
}

export function isImportPublicationValidationReady(input: ImportPublicationValidationInput): boolean {
  return getImportPublicationValidationBlockers(input).length === 0;
}
