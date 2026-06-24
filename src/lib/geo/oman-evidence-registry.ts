import {
  OMAN_GEO_EVIDENCE_REGISTRY_CONTRACT,
  OMAN_GEO_EVIDENCE_REGISTRY_ENTRIES,
  OMAN_GEO_EVIDENCE_REGISTRY_ENTITY_CONTRACTS,
  type OmanGeoEvidenceKind,
  type OmanGeoEvidenceRegistryEntityContract,
  type OmanGeoEvidenceRegistryEntry,
} from '@/config/geo/evidence-registry-contract';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanGeoEvidenceRegistryLookupInput = {
  entity: OmanGeoRouteEntity;
  slug?: string;
  locale?: 'en' | 'ar' | 'all';
  kind?: OmanGeoEvidenceKind;
};

export type OmanGeoEvidenceRegistryRuntimeState = {
  registryEnabled: boolean;
  totalEntries: number;
  approvedEntries: number;
  humanReviewedEntries: number;
  promotionAllowed: boolean;
  noindexRemovalAllowed: boolean;
  sitemapPromotionAllowed: boolean;
  jsonLdAllowed: boolean;
  indexPromotionAllowed: boolean;
};

export function listOmanGeoEvidenceRegistryEntries(): readonly OmanGeoEvidenceRegistryEntry[] {
  return OMAN_GEO_EVIDENCE_REGISTRY_ENTRIES;
}

export function listOmanGeoEvidenceRegistryEntityContracts(): readonly OmanGeoEvidenceRegistryEntityContract[] {
  return OMAN_GEO_EVIDENCE_REGISTRY_ENTITY_CONTRACTS;
}

export function getOmanGeoEvidenceRegistryEntityContract(
  entity: OmanGeoRouteEntity,
): OmanGeoEvidenceRegistryEntityContract | null {
  return listOmanGeoEvidenceRegistryEntityContracts().find((contract) => contract.entity === entity) ?? null;
}

export function listOmanGeoEvidenceRegistryEntriesForEntity(
  input: OmanGeoEvidenceRegistryLookupInput,
): readonly OmanGeoEvidenceRegistryEntry[] {
  return listOmanGeoEvidenceRegistryEntries().filter((entry) => {
    if (entry.entity !== input.entity) return false;
    if (input.slug && entry.slug !== input.slug) return false;
    if (input.locale && entry.locale !== input.locale && entry.locale !== 'all') return false;
    if (input.kind && entry.kind !== input.kind) return false;
    return entry.reviewedByHuman === true && entry.status === 'approved';
  });
}

export function getOmanGeoEvidenceRegistryRuntimeState(): OmanGeoEvidenceRegistryRuntimeState {
  const entries = listOmanGeoEvidenceRegistryEntries();

  return {
    registryEnabled: OMAN_GEO_EVIDENCE_REGISTRY_CONTRACT.registryEnabled,
    totalEntries: entries.length,
    approvedEntries: entries.filter((entry) => entry.status === 'approved').length,
    humanReviewedEntries: entries.filter((entry) => entry.reviewedByHuman).length,
    promotionAllowed: false,
    noindexRemovalAllowed: false,
    sitemapPromotionAllowed: false,
    jsonLdAllowed: false,
    indexPromotionAllowed: false,
  };
}
