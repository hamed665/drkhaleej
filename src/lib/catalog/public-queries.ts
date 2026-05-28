import type {
  PublicCatalogQueryResult,
  PublicCatalogSearchResult,
  PublicCenterSummary,
  PublicDiscoveryCategory,
  PublicDoctorSummary,
  PublicGeoAreaSummary,
  PublicServiceSummary
} from './public-types';

function createEmptyResult<T>(data: T, emptyReason: PublicCatalogQueryResult<T>['emptyReason']): PublicCatalogQueryResult<T> {
  return {
    ok: true,
    data,
    emptyReason,
    error: null
  };
}

function createDiscoveryCategories(): PublicDiscoveryCategory[] {
  return [
    { slug: 'doctors', label: 'Doctors' },
    { slug: 'centers', label: 'Centers' },
    { slug: 'pharmacies', label: 'Pharmacies' },
    { slug: 'labs', label: 'Labs' },
    { slug: 'services', label: 'Services' }
  ];
}

export async function listPublicDiscoveryCategories(): Promise<PublicCatalogQueryResult<PublicDiscoveryCategory[]>> {
  return createEmptyResult(createDiscoveryCategories(), null);
}

export async function listPublicCenters(): Promise<PublicCatalogQueryResult<PublicCenterSummary[]>> {
  return createEmptyResult([], 'query_not_implemented');
}

export async function listPublicDoctors(): Promise<PublicCatalogQueryResult<PublicDoctorSummary[]>> {
  return createEmptyResult([], 'query_not_implemented');
}

export async function listPublicServices(): Promise<PublicCatalogQueryResult<PublicServiceSummary[]>> {
  return createEmptyResult([], 'query_not_implemented');
}

export async function listPublicGeoAreas(): Promise<PublicCatalogQueryResult<PublicGeoAreaSummary[]>> {
  return createEmptyResult([], 'query_not_implemented');
}

export async function searchPublicCatalog(): Promise<PublicCatalogQueryResult<PublicCatalogSearchResult>> {
  return createEmptyResult(
    {
      centers: [],
      doctors: [],
      services: [],
      areas: []
    },
    'query_not_implemented'
  );
}
