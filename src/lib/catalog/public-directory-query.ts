import type {
  CenterType,
  PublicCatalogQueryResult,
  PublicCatalogSearchResult,
  PublicCenterSummary,
  PublicDoctorSummary,
} from './public-types';

export type PublicDirectorySearchParamValue = string | string[] | undefined;

export function firstDirectorySearchParamValue(value: PublicDirectorySearchParamValue): string {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return rawValue ? rawValue.trim().slice(0, 80) : '';
}

export function isDirectorySearchQuery(query: string): boolean {
  return query.length >= 2;
}

export function doctorDirectoryResultFromSearch(
  result: PublicCatalogQueryResult<PublicCatalogSearchResult>,
): PublicCatalogQueryResult<PublicDoctorSummary[]> {
  return {
    ok: result.ok,
    data: result.ok ? result.data.doctors : [],
    emptyReason: result.emptyReason,
    error: result.error,
  };
}

export function centerDirectoryResultFromSearch(
  result: PublicCatalogQueryResult<PublicCatalogSearchResult>,
): PublicCatalogQueryResult<PublicCenterSummary[]> {
  return {
    ok: result.ok,
    data: result.ok ? result.data.centers : [],
    emptyReason: result.emptyReason,
    error: result.error,
  };
}

export function centerTypeDirectoryResultFromSearch(
  result: PublicCatalogQueryResult<PublicCatalogSearchResult>,
  centerType: CenterType,
): PublicCatalogQueryResult<PublicCenterSummary[]> {
  return {
    ok: result.ok,
    data: result.ok ? result.data.centers.filter((center) => center.centerType === centerType) : [],
    emptyReason: result.emptyReason,
    error: result.error,
  };
}
