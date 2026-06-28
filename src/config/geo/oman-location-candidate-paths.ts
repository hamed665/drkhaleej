import type { OmanLocationCandidateDimension } from '@/config/geo/location-threshold-policy';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

type OmanLocationCandidatePathBase = {
  locale: SupportedLocale;
  country: SupportedCountry;
  governorateSlug: string;
  dimension: OmanLocationCandidateDimension;
  dimensionSlug: string;
};

export type OmanGovernorateLocationCandidatePathInput = OmanLocationCandidatePathBase & {
  level: 'governorate';
};

export type OmanWilayatLocationCandidatePathInput = OmanLocationCandidatePathBase & {
  level: 'wilayat';
  wilayatSlug: string;
};

export type OmanAreaLocationCandidatePathInput = OmanLocationCandidatePathBase & {
  level: 'area';
  wilayatSlug: string;
  areaSlug: string;
};

export type OmanLocationCandidatePathInput =
  | OmanGovernorateLocationCandidatePathInput
  | OmanWilayatLocationCandidatePathInput
  | OmanAreaLocationCandidatePathInput;

const canonicalSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const dimensionPathSegment: Record<OmanLocationCandidateDimension, string> = {
  category: 'categories',
  service: 'services',
  specialty: 'specialties',
};

function assertCanonicalSlug(name: string, value: string): void {
  if (typeof value !== 'string' || !canonicalSlugPattern.test(value)) {
    throw new Error(`${name} must be a lowercase kebab-case canonical slug.`);
  }
}

function buildCandidateSuffix(input: Pick<OmanLocationCandidatePathBase, 'dimension' | 'dimensionSlug'>): string {
  assertCanonicalSlug('dimensionSlug', input.dimensionSlug);
  return `${dimensionPathSegment[input.dimension]}/${input.dimensionSlug}`;
}

export function buildOmanLocationCandidatePath(input: OmanLocationCandidatePathInput): string {
  assertCanonicalSlug('governorateSlug', input.governorateSlug);
  const basePath = `/${input.locale}/${input.country}/locations/${input.governorateSlug}`;
  const candidateSuffix = buildCandidateSuffix(input);

  if (input.level === 'governorate') {
    return `${basePath}/${candidateSuffix}`;
  }

  assertCanonicalSlug('wilayatSlug', input.wilayatSlug);
  const wilayatPath = `${basePath}/${input.wilayatSlug}`;

  if (input.level === 'wilayat') {
    return `${wilayatPath}/${candidateSuffix}`;
  }

  assertCanonicalSlug('areaSlug', input.areaSlug);
  return `${wilayatPath}/${input.areaSlug}/${candidateSuffix}`;
}

export function buildOmanGovernorateLocationCandidatePath(
  input: Omit<OmanGovernorateLocationCandidatePathInput, 'level'>
): string {
  return buildOmanLocationCandidatePath({ ...input, level: 'governorate' });
}

export function buildOmanWilayatLocationCandidatePath(
  input: Omit<OmanWilayatLocationCandidatePathInput, 'level'>
): string {
  return buildOmanLocationCandidatePath({ ...input, level: 'wilayat' });
}

export function buildOmanAreaLocationCandidatePath(input: Omit<OmanAreaLocationCandidatePathInput, 'level'>): string {
  return buildOmanLocationCandidatePath({ ...input, level: 'area' });
}
