import "server-only";

import {
  buildUnifiedDraftEntity,
  type ImportUnifiedDraftEntity,
  type ImportUnifiedDraftEntityInput,
} from "./import-unified-draft-entity";

export const PHARMACY_CANONICAL_MUTATION_REVIEW_FIELDS = [
  "name_en",
  "legal_name",
  "slug",
  "description_en",
  "primary_phone",
  "whatsapp_phone",
  "email",
  "website_url",
  "default_country",
  "default_locale",
  "metadata_source",
  "metadata_source_evidence",
  "metadata_raw_payload_hash",
  "metadata_visibility",
  "metadata_public_route_enabled",
  "metadata_indexable",
  "metadata_sitemap_eligible",
] as const;

export type PharmacyCanonicalMutationReviewField =
  (typeof PHARMACY_CANONICAL_MUTATION_REVIEW_FIELDS)[number];
export type PharmacyCanonicalMutationReviewValue = string | boolean | null;

export type PharmacyCanonicalMutationPatch = {
  name_en: string | null;
  legal_name: string | null;
  slug: string | null;
  description_en: string | null;
  primary_phone: string | null;
  whatsapp_phone: string | null;
  email: string | null;
  website_url: string | null;
  default_country: "om";
  default_locale: "en";
  metadata: {
    source: string;
    sourceEvidence: unknown;
    rawPayloadHash: string | null;
    visibility: "private";
    publicRouteEnabled: false;
    indexable: false;
    sitemapEligible: false;
  };
};

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function isNormalizedDraft(
  draft: ImportUnifiedDraftEntity | ImportUnifiedDraftEntityInput,
): draft is ImportUnifiedDraftEntity {
  return "status" in draft && "entityDomain" in draft;
}

function normalizeDraft(
  draft: ImportUnifiedDraftEntity | ImportUnifiedDraftEntityInput,
): ImportUnifiedDraftEntity {
  return isNormalizedDraft(draft) ? draft : buildUnifiedDraftEntity(draft);
}

export function serializePharmacyMutationReviewValue(value: unknown): string {
  return JSON.stringify(canonicalize(value)) ?? "null";
}

export function buildPharmacyCanonicalMutationPatch(
  input: ImportUnifiedDraftEntity | ImportUnifiedDraftEntityInput,
): PharmacyCanonicalMutationPatch {
  const draft = normalizeDraft(input);
  return {
    name_en: draft.name,
    legal_name: draft.legalName,
    slug: draft.slugCandidate,
    description_en: draft.description,
    primary_phone: draft.contact.phone,
    whatsapp_phone: draft.contact.whatsapp,
    email: draft.contact.email,
    website_url: draft.contact.website,
    default_country: "om",
    default_locale: "en",
    metadata: {
      source: draft.source,
      sourceEvidence: draft.sourceEvidence,
      rawPayloadHash: draft.rawPayloadHash,
      visibility: "private",
      publicRouteEnabled: false,
      indexable: false,
      sitemapEligible: false,
    },
  };
}

export function projectPharmacyCanonicalMutationPatchForReview(
  patch: PharmacyCanonicalMutationPatch,
): Record<PharmacyCanonicalMutationReviewField, PharmacyCanonicalMutationReviewValue> {
  return {
    name_en: patch.name_en,
    legal_name: patch.legal_name,
    slug: patch.slug,
    description_en: patch.description_en,
    primary_phone: patch.primary_phone,
    whatsapp_phone: patch.whatsapp_phone,
    email: patch.email,
    website_url: patch.website_url,
    default_country: patch.default_country,
    default_locale: patch.default_locale,
    metadata_source: patch.metadata.source,
    metadata_source_evidence: serializePharmacyMutationReviewValue(patch.metadata.sourceEvidence),
    metadata_raw_payload_hash: patch.metadata.rawPayloadHash,
    metadata_visibility: patch.metadata.visibility,
    metadata_public_route_enabled: patch.metadata.publicRouteEnabled,
    metadata_indexable: patch.metadata.indexable,
    metadata_sitemap_eligible: patch.metadata.sitemapEligible,
  };
}

export function projectPharmacyRollbackSnapshotForMutationReview(
  rollbackSnapshot: Readonly<Record<string, unknown>>,
): Record<PharmacyCanonicalMutationReviewField, PharmacyCanonicalMutationReviewValue> | null {
  const center = rollbackSnapshot.center;
  if (!isRecord(center)) return null;
  const metadata = isRecord(center.metadata) ? center.metadata : {};

  const readNullableString = (record: Readonly<Record<string, unknown>>, key: string): string | null => {
    const value = record[key];
    return typeof value === "string" ? value : null;
  };
  const readNullableBoolean = (record: Readonly<Record<string, unknown>>, key: string): boolean | null => {
    const value = record[key];
    return typeof value === "boolean" ? value : null;
  };

  return {
    name_en: readNullableString(center, "nameEn"),
    legal_name: readNullableString(center, "legalName"),
    slug: readNullableString(center, "slug"),
    description_en: readNullableString(center, "descriptionEn"),
    primary_phone: readNullableString(center, "primaryPhone"),
    whatsapp_phone: readNullableString(center, "whatsappPhone"),
    email: readNullableString(center, "email"),
    website_url: readNullableString(center, "websiteUrl"),
    default_country: readNullableString(center, "defaultCountry"),
    default_locale: readNullableString(center, "defaultLocale"),
    metadata_source: readNullableString(metadata, "source"),
    metadata_source_evidence: serializePharmacyMutationReviewValue(metadata.sourceEvidence ?? null),
    metadata_raw_payload_hash: readNullableString(metadata, "rawPayloadHash"),
    metadata_visibility: readNullableString(metadata, "visibility"),
    metadata_public_route_enabled: readNullableBoolean(metadata, "publicRouteEnabled"),
    metadata_indexable: readNullableBoolean(metadata, "indexable"),
    metadata_sitemap_eligible: readNullableBoolean(metadata, "sitemapEligible"),
  };
}
