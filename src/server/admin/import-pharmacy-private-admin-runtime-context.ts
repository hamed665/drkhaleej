import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { ImportCanonicalGeo } from "./import-canonical-geo";
import type { ImportControlledPublishState } from "./import-controlled-publish-dry-run-executor";
import type { PharmacyPrivateAdminPublishContext } from "./import-pharmacy-private-admin-real-wiring";
import type { ImportPublishRollbackSnapshot } from "./import-private-persistence-adapter";

const CENTER_SELECT = "id,center_type,slug,name_en,name_ar,legal_name,status,verification_status,primary_phone,secondary_phone,whatsapp_phone,email,website_url,logo_url,cover_image_url,short_description_en,short_description_ar,description_en,description_ar,default_locale,default_country,is_active,is_claimable,is_featured,sort_order,metadata,deleted_at,updated_at";

export type PharmacyPrivateAdminRuntimeCenter = {
  id: string;
  center_type: string;
  slug: string | null;
  name_en: string | null;
  name_ar: string | null;
  legal_name: string | null;
  status: string;
  verification_status: string;
  primary_phone: string | null;
  secondary_phone: string | null;
  whatsapp_phone: string | null;
  email: string | null;
  website_url: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  short_description_en: string | null;
  short_description_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  default_locale: string;
  default_country: string;
  is_active: boolean;
  is_claimable: boolean;
  is_featured: boolean;
  sort_order: number;
  metadata: Record<string, unknown> | null;
  deleted_at: string | null;
  updated_at: string;
};

export type PharmacyPrivateAdminRuntimeContextBlocker =
  | "runtime_disabled"
  | "environment_not_preview"
  | "actor_not_allowed"
  | "entity_not_allowed"
  | "approval_token_invalid"
  | "pharmacy_read_failed"
  | "pharmacy_not_found"
  | "entity_not_pharmacy"
  | "pharmacy_not_private"
  | "pharmacy_deleted"
  | "metadata_missing"
  | "canonical_geo_missing"
  | "source_evidence_missing"
  | "projection_version_missing"
  | "route_locale_invalid"
  | "route_country_invalid";

export type PharmacyPrivateAdminRuntimeContextReader = {
  readPharmacy(entityId: string): Promise<{
    data: PharmacyPrivateAdminRuntimeCenter | null;
    error: { message?: string } | null;
  }>;
};

export type PharmacyPrivateAdminRuntimeContextInput = {
  executionEnabled: boolean;
  environment: string | undefined;
  actorId: string;
  entityId: string;
  allowedActorIds: readonly string[];
  allowedEntityIds: readonly string[];
  approvalToken: string;
  expectedApprovalToken: string;
  now?: Date;
};

export type PharmacyPrivateAdminRuntimeContextResult =
  | { ok: true; context: PharmacyPrivateAdminPublishContext; snapshotHash: string }
  | { ok: false; blockers: readonly PharmacyPrivateAdminRuntimeContextBlocker[] };

function isRecord(value: unknown): value is Record<string, unknown> {
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

function sha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function addMilliseconds(date: Date, milliseconds: number): string {
  return new Date(date.getTime() + milliseconds).toISOString();
}

function readCanonicalGeo(metadata: Record<string, unknown>): ImportCanonicalGeo | null {
  const value = metadata.canonicalGeo;
  if (!isRecord(value) || value.country_code !== "om" || typeof value.geo_resolution_status !== "string") {
    return null;
  }
  return value as ImportCanonicalGeo;
}

function buildCenterSnapshot(center: PharmacyPrivateAdminRuntimeCenter): Record<string, unknown> {
  return {
    id: center.id,
    centerType: center.center_type,
    slug: center.slug,
    nameEn: center.name_en,
    nameAr: center.name_ar,
    legalName: center.legal_name,
    status: center.status,
    verificationStatus: center.verification_status,
    primaryPhone: center.primary_phone,
    secondaryPhone: center.secondary_phone,
    whatsappPhone: center.whatsapp_phone,
    email: center.email,
    websiteUrl: center.website_url,
    logoUrl: center.logo_url,
    coverImageUrl: center.cover_image_url,
    shortDescriptionEn: center.short_description_en,
    shortDescriptionAr: center.short_description_ar,
    descriptionEn: center.description_en,
    descriptionAr: center.description_ar,
    defaultLocale: center.default_locale,
    defaultCountry: center.default_country,
    isActive: center.is_active,
    isClaimable: center.is_claimable,
    isFeatured: center.is_featured,
    sortOrder: center.sort_order,
    metadata: center.metadata ?? {},
    deletedAt: center.deleted_at,
  };
}

export function createSupabasePharmacyPrivateAdminContextReader(
  client: SupabaseClient,
): PharmacyPrivateAdminRuntimeContextReader {
  return {
    async readPharmacy(entityId) {
      const response = await client.from("centers").select(CENTER_SELECT).eq("id", entityId).maybeSingle();
      return {
        data: response.data as PharmacyPrivateAdminRuntimeCenter | null,
        error: response.error ? { message: response.error.message } : null,
      };
    },
  };
}

export async function loadPharmacyPrivateAdminRuntimeContext(
  input: PharmacyPrivateAdminRuntimeContextInput,
  reader: PharmacyPrivateAdminRuntimeContextReader,
): Promise<PharmacyPrivateAdminRuntimeContextResult> {
  const blockers: PharmacyPrivateAdminRuntimeContextBlocker[] = [];

  if (!input.executionEnabled) blockers.push("runtime_disabled");
  if (input.environment !== "preview") blockers.push("environment_not_preview");
  if (!input.allowedActorIds.includes(input.actorId)) blockers.push("actor_not_allowed");
  if (!input.allowedEntityIds.includes(input.entityId)) blockers.push("entity_not_allowed");
  if (!input.approvalToken || input.approvalToken !== input.expectedApprovalToken) {
    blockers.push("approval_token_invalid");
  }
  if (blockers.length > 0) return { ok: false, blockers: [...new Set(blockers)] };

  const read = await reader.readPharmacy(input.entityId);
  if (read.error) return { ok: false, blockers: ["pharmacy_read_failed"] };
  if (!read.data) return { ok: false, blockers: ["pharmacy_not_found"] };

  const center = read.data;
  if (center.center_type !== "pharmacy") blockers.push("entity_not_pharmacy");
  if (center.status !== "draft" || center.is_active || center.is_featured) {
    blockers.push("pharmacy_not_private");
  }
  if (center.deleted_at !== null) blockers.push("pharmacy_deleted");
  if (center.default_locale !== "en" && center.default_locale !== "ar") blockers.push("route_locale_invalid");
  if (center.default_country !== "om") blockers.push("route_country_invalid");

  const metadata = center.metadata;
  if (!metadata) blockers.push("metadata_missing");
  const canonicalGeo = metadata ? readCanonicalGeo(metadata) : null;
  if (!canonicalGeo) blockers.push("canonical_geo_missing");
  const sourceEvidence = metadata && isRecord(metadata.sourceEvidence) ? metadata.sourceEvidence : null;
  if (!sourceEvidence) blockers.push("source_evidence_missing");
  const projectionVersion = metadata && typeof metadata.projectionVersion === "string" ? metadata.projectionVersion : null;
  if (!projectionVersion) blockers.push("projection_version_missing");

  if (blockers.length > 0 || !metadata || !canonicalGeo || !sourceEvidence || !projectionVersion) {
    return { ok: false, blockers: [...new Set(blockers)] };
  }

  const canonicalRoute = `/${center.default_locale}/${center.default_country}/pharmacies/${center.slug ?? center.id}`;
  const currentState: ImportControlledPublishState = {
    visibility: "private",
    indexPolicy: "noindex",
    sitemapPolicy: "excluded",
    publishStatus: "private_published",
    publicReady: false,
    projectionVersion,
    canonicalRoute,
  };
  const rollbackSnapshot: ImportPublishRollbackSnapshot = {
    ...currentState,
    center: buildCenterSnapshot(center),
  };
  const draft = {
    draftId: center.id,
    source: typeof metadata.source === "string" ? metadata.source : "manual",
    entityType: "pharmacy",
    name: center.name_en,
    legalName: center.legal_name,
    slugCandidate: center.slug,
    description: center.description_en,
    services: [],
    specialties: [],
    contact: {
      phone: center.primary_phone,
      email: center.email,
      website: center.website_url,
      whatsapp: center.whatsapp_phone,
    },
    canonicalGeo,
    sourceEvidence,
    rawPayloadHash: typeof metadata.rawPayloadHash === "string" ? metadata.rawPayloadHash : null,
    duplicateCandidateIds: [],
    requiresManualReview: false,
  };

  const now = input.now ?? new Date();
  const idempotencyKey = randomUUID();
  const requestHash = sha256({
    actorId: input.actorId,
    entityId: center.id,
    expectedVersion: center.updated_at,
    draft,
  });
  const snapshotHash = sha256(rollbackSnapshot);
  const fingerprint = sha256(buildCenterSnapshot(center));

  return {
    ok: true,
    snapshotHash,
    context: {
      canaryInput: {
        executionEnabled: true,
        environment: "preview",
        actorId: input.actorId,
        entityId: center.id,
        allowedActorIds: input.allowedActorIds,
        allowedEntityIds: input.allowedEntityIds,
        approvalToken: input.approvalToken,
        expectedApprovalToken: input.expectedApprovalToken,
        reservationRequest: {
          entityId: center.id,
          actorId: input.actorId,
          idempotencyKey,
          requestHash,
          expectedVersion: center.updated_at,
          rollbackSnapshot,
          auditSchemaVersion: "1",
          reservationExpiresAt: addMilliseconds(now, 24 * 60 * 60 * 1000),
          rollbackExpiresAt: addMilliseconds(now, 30 * 24 * 60 * 60 * 1000),
        },
        expectedSnapshotHash: snapshotHash,
        expectedEntityFingerprint: fingerprint,
      },
      mutationRequest: {
        family: "pharmacy",
        selectedFamily: "pharmacy",
        draft,
        actorId: input.actorId,
        idempotencyKey,
        expectedVersion: center.updated_at,
        rollbackState: rollbackSnapshot,
        executionEnabled: true,
        batchSize: 1,
      },
    },
  };
}

export function createPharmacyPrivateAdminRuntimeContextReaderFromEnvironment(
  environment: Record<string, string | undefined> = process.env,
): PharmacyPrivateAdminRuntimeContextReader | null {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (environment.VERCEL_ENV !== "preview" || !url || !key) return null;

  return createSupabasePharmacyPrivateAdminContextReader(
    createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }),
  );
}
