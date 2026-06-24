import { OMAN_AREAS, OMAN_GOVERNORATES, OMAN_WILAYATS } from '@/config/geo/oman';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';
import { getOmanGeoPublicationGates } from '@/lib/geo/oman-publication-gates';

export type OmanGeoGatedSitemapCandidate = {
  entity: OmanGeoRouteEntity;
  slug: string;
  pathname: string;
};

export type OmanGeoGatedSitemapEntry = {
  entity: OmanGeoRouteEntity;
  slug: string;
  pathname: string;
};

export type OmanGeoGatedSitemapRuntimeState = {
  candidateCount: number;
  includedEntryCount: number;
  blockedEntryCount: number;
  sitemapPromotionAllowed: boolean;
  noindexRemovalAllowed: boolean;
  jsonLdAllowed: boolean;
  indexPromotionAllowed: boolean;
  blockedReasons: readonly string[];
};

export function listOmanGeoSitemapCandidates(): readonly OmanGeoGatedSitemapCandidate[] {
  return [
    ...OMAN_GOVERNORATES.map((item) => ({
      entity: 'governorate' as const,
      slug: item.slug,
      pathname: `/oman/governorates/${item.slug}`,
    })),
    ...OMAN_WILAYATS.map((item) => ({
      entity: 'wilayat' as const,
      slug: item.slug,
      pathname: `/oman/wilayats/${item.slug}`,
    })),
    ...OMAN_AREAS.map((item) => ({
      entity: 'area' as const,
      slug: item.slug,
      pathname: `/oman/areas/${item.slug}`,
    })),
  ];
}

export function listOmanGeoGatedSitemapEntries(): readonly OmanGeoGatedSitemapEntry[] {
  return listOmanGeoSitemapCandidates().filter((candidate) => {
    const gates = getOmanGeoPublicationGates({
      entity: candidate.entity,
      slug: candidate.slug,
      locale: 'en',
    });

    return gates.sitemapPromotionAllowed && gates.indexPromotionAllowed && gates.noindexRemovalAllowed;
  });
}

export function getOmanGeoGatedSitemapRuntimeState(): OmanGeoGatedSitemapRuntimeState {
  const candidates = listOmanGeoSitemapCandidates();
  const entries = listOmanGeoGatedSitemapEntries();

  return {
    candidateCount: candidates.length,
    includedEntryCount: entries.length,
    blockedEntryCount: candidates.length - entries.length,
    sitemapPromotionAllowed: false,
    noindexRemovalAllowed: false,
    jsonLdAllowed: false,
    indexPromotionAllowed: false,
    blockedReasons: entries.length === 0 ? ['publication-gates-blocked'] : [],
  };
}
