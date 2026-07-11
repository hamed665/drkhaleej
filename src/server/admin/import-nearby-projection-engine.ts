import "server-only";

import type { ImportEntityDomain, ImportEntityType } from "./import-entity-domain";
import type { ImportInternalLinkIntelligenceResult } from "./import-internal-link-intelligence";
import {
  isOmanGeoAuthorityRegistryReady,
  type OmanGeoAuthorityEntry,
  type OmanGeoAuthorityRegistry,
} from "./import-oman-geo-authority-registry";
import type { ImportPublicProjectionManifest } from "./import-public-projection-layer";

export type ImportNearbyRelation = "same_area" | "nearby_area" | "same_city";

export type ImportNearbyCandidate = {
  targetEntityId: string;
  targetEntityType: ImportEntityType;
  targetEntityDomain: ImportEntityDomain;
  targetAreaId: string | null;
  targetCityId: string | null;
  relation: ImportNearbyRelation;
  precomputedDistanceKm: number | null;
  qualityScore: number;
  publicProjectionReady: boolean;
  labelEn: string;
  labelAr: string;
};

export type ImportNearbyProjectionEngineInput = {
  sourceEntityId: string;
  sourceEntityType: ImportEntityType;
  sourceEntityDomain: ImportEntityDomain;
  sourceAreaId: string | null;
  sourceCityId: string | null;
  routeId: string;
  geoRegistry: OmanGeoAuthorityRegistry;
  internalLinks: ImportInternalLinkIntelligenceResult;
  publicProjection: ImportPublicProjectionManifest;
  candidates: readonly ImportNearbyCandidate[];
  minimumQualityScore: number;
  maximumCandidates: number;
  maximumDistanceKm: number;
  publishReady: boolean;
  sitemapEligible: boolean;
};

export type ImportNearbyProjectionBlocker =
  | "geo_registry_not_ready"
  | "source_geo_missing"
  | "internal_links_not_ready"
  | "entity_projection_not_ready"
  | "candidate_missing"
  | "self_candidate"
  | "domain_mismatch"
  | "geo_relation_not_authoritative"
  | "distance_not_precomputed"
  | "distance_out_of_range"
  | "candidate_quality_too_low"
  | "candidate_projection_not_ready"
  | "candidate_label_missing"
  | "candidate_duplicate"
  | "candidate_limit_invalid";

export type ImportNearbyProjectionEngineResult = {
  nearbyProjectionReady: boolean;
  publishReady: boolean;
  sitemapEligible: boolean;
  blockers: readonly ImportNearbyProjectionBlocker[];
  acceptedCandidates: readonly ImportNearbyCandidate[];
};

function getGeoEntry(registry: OmanGeoAuthorityRegistry, id: string | null): OmanGeoAuthorityEntry | null {
  if (!id) return null;
  return registry.entries.find((entry) => entry.id === id) ?? null;
}

function hasReadyEntityProjection(manifest: ImportPublicProjectionManifest, routeId: string): boolean {
  return manifest.routeId === routeId && manifest.records.some(
    (record) =>
      record.kind === "entity" &&
      record.status === "ready" &&
      record.routeId === routeId &&
      record.buildSources.length > 0,
  );
}

function isAuthoritativeRelation(
  sourceArea: OmanGeoAuthorityEntry | null,
  sourceCityId: string | null,
  candidate: ImportNearbyCandidate,
): boolean {
  if (candidate.relation === "same_area") {
    return sourceArea !== null && candidate.targetAreaId === sourceArea.id;
  }
  if (candidate.relation === "nearby_area") {
    return sourceArea !== null && candidate.targetAreaId !== null && sourceArea.nearbyAreaIds.includes(candidate.targetAreaId);
  }
  return sourceCityId !== null && candidate.targetCityId === sourceCityId;
}

export function getImportNearbyProjectionEngineResult(
  input: ImportNearbyProjectionEngineInput,
): ImportNearbyProjectionEngineResult {
  const blockers: ImportNearbyProjectionBlocker[] = [];
  const acceptedCandidates: ImportNearbyCandidate[] = [];
  const seenTargets = new Set<string>();
  const sourceArea = getGeoEntry(input.geoRegistry, input.sourceAreaId);

  if (!isOmanGeoAuthorityRegistryReady(input.geoRegistry)) blockers.push("geo_registry_not_ready");
  if (!input.sourceAreaId && !input.sourceCityId) blockers.push("source_geo_missing");
  if (!input.internalLinks.internalLinksReady) blockers.push("internal_links_not_ready");
  if (!hasReadyEntityProjection(input.publicProjection, input.routeId)) blockers.push("entity_projection_not_ready");
  if (input.candidates.length === 0) blockers.push("candidate_missing");
  if (input.maximumCandidates < 1) blockers.push("candidate_limit_invalid");

  for (const candidate of input.candidates) {
    let blocked = false;

    if (candidate.targetEntityId === input.sourceEntityId) {
      blockers.push("self_candidate");
      blocked = true;
    }
    if (candidate.targetEntityDomain !== input.sourceEntityDomain) {
      blockers.push("domain_mismatch");
      blocked = true;
    }
    if (!isAuthoritativeRelation(sourceArea, input.sourceCityId, candidate)) {
      blockers.push("geo_relation_not_authoritative");
      blocked = true;
    }
    if (candidate.precomputedDistanceKm === null) {
      blockers.push("distance_not_precomputed");
      blocked = true;
    } else if (candidate.precomputedDistanceKm < 0 || candidate.precomputedDistanceKm > input.maximumDistanceKm) {
      blockers.push("distance_out_of_range");
      blocked = true;
    }
    if (candidate.qualityScore < input.minimumQualityScore) {
      blockers.push("candidate_quality_too_low");
      blocked = true;
    }
    if (!candidate.publicProjectionReady) {
      blockers.push("candidate_projection_not_ready");
      blocked = true;
    }
    if (!candidate.labelEn.trim() || !candidate.labelAr.trim()) {
      blockers.push("candidate_label_missing");
      blocked = true;
    }
    if (seenTargets.has(candidate.targetEntityId)) {
      blockers.push("candidate_duplicate");
      blocked = true;
    }

    if (!blocked) {
      seenTargets.add(candidate.targetEntityId);
      acceptedCandidates.push(candidate);
    }
  }

  const sortedCandidates = acceptedCandidates
    .sort((left, right) => {
      const distanceDifference = (left.precomputedDistanceKm ?? Number.POSITIVE_INFINITY) -
        (right.precomputedDistanceKm ?? Number.POSITIVE_INFINITY);
      if (distanceDifference !== 0) return distanceDifference;
      return right.qualityScore - left.qualityScore || left.targetEntityId.localeCompare(right.targetEntityId);
    })
    .slice(0, Math.max(0, input.maximumCandidates));

  const uniqueBlockers = Array.from(new Set(blockers));
  return {
    nearbyProjectionReady: uniqueBlockers.length === 0 && sortedCandidates.length > 0,
    publishReady: input.publishReady,
    sitemapEligible: input.sitemapEligible,
    blockers: uniqueBlockers,
    acceptedCandidates: sortedCandidates,
  };
}

export function isImportNearbyProjectionReady(input: ImportNearbyProjectionEngineInput): boolean {
  return getImportNearbyProjectionEngineResult(input).nearbyProjectionReady;
}
