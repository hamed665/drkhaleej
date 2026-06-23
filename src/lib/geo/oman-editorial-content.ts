import {
  OMAN_GEO_EDITORIAL_CONTENT_REGISTRY,
  type OmanGeoEditorialContentEntry,
  type OmanGeoEditorialContentLocale,
} from '@/config/geo/editorial-content-contract';
import type { OmanGeoRouteEntity } from '@/config/geo/route-contract';

export type OmanGeoEditorialContentLookupInput = {
  entity: OmanGeoRouteEntity;
  slug: string;
  locale: OmanGeoEditorialContentLocale;
};

export type OmanGeoEditorialContentRuntimeState = {
  hasPublishedContent: boolean;
  registryEnabled: boolean;
  publishedContentCount: number;
};

function isPublishedHumanReviewedEntry(entry: OmanGeoEditorialContentEntry): boolean {
  return entry.status === 'published' && entry.reviewedByHuman === true;
}

export function listPublishedOmanGeoEditorialContent(): readonly OmanGeoEditorialContentEntry[] {
  return OMAN_GEO_EDITORIAL_CONTENT_REGISTRY.filter(isPublishedHumanReviewedEntry);
}

export function getOmanGeoEditorialContent(
  input: OmanGeoEditorialContentLookupInput,
): OmanGeoEditorialContentEntry | null {
  return (
    listPublishedOmanGeoEditorialContent().find(
      (entry) =>
        entry.entity === input.entity &&
        entry.slug === input.slug &&
        entry.locale === input.locale,
    ) ?? null
  );
}

export function getOmanGeoEditorialContentRuntimeState(): OmanGeoEditorialContentRuntimeState {
  const publishedContentCount = listPublishedOmanGeoEditorialContent().length;

  return {
    hasPublishedContent: publishedContentCount > 0,
    registryEnabled: false,
    publishedContentCount,
  };
}
