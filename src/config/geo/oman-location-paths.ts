import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

type OmanLocationPathBase = {
  locale: SupportedLocale;
  country: SupportedCountry;
  governorateSlug: string;
};

export type OmanGovernorateLocationPathInput = OmanLocationPathBase & {
  level: 'governorate';
};

export type OmanWilayatLocationPathInput = OmanLocationPathBase & {
  level: 'wilayat';
  wilayatSlug: string;
};

export type OmanAreaLocationPathInput = OmanLocationPathBase & {
  level: 'area';
  wilayatSlug: string;
  areaSlug: string;
};

export type OmanLocationPathInput =
  | OmanGovernorateLocationPathInput
  | OmanWilayatLocationPathInput
  | OmanAreaLocationPathInput;

const canonicalSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertCanonicalSlug(name: string, value: string): void {
  if (!canonicalSlugPattern.test(value)) {
    throw new Error(`${name} must be a lowercase kebab-case canonical slug.`);
  }
}

function baseLocationPath(input: OmanLocationPathBase): string {
  assertCanonicalSlug('governorateSlug', input.governorateSlug);
  return `/${input.locale}/${input.country}/locations/${input.governorateSlug}`;
}

export function buildOmanLocationPath(input: OmanLocationPathInput): string {
  const basePath = baseLocationPath(input);

  if (input.level === 'governorate') {
    return basePath;
  }

  assertCanonicalSlug('wilayatSlug', input.wilayatSlug);
  const wilayatPath = `${basePath}/${input.wilayatSlug}`;

  if (input.level === 'wilayat') {
    return wilayatPath;
  }

  assertCanonicalSlug('areaSlug', input.areaSlug);
  return `${wilayatPath}/${input.areaSlug}`;
}

export function buildOmanGovernorateLocationPath(
  input: Omit<OmanGovernorateLocationPathInput, 'level'>
): string {
  return buildOmanLocationPath({ ...input, level: 'governorate' });
}

export function buildOmanWilayatLocationPath(
  input: Omit<OmanWilayatLocationPathInput, 'level'>
): string {
  return buildOmanLocationPath({ ...input, level: 'wilayat' });
}

export function buildOmanAreaLocationPath(
  input: Omit<OmanAreaLocationPathInput, 'level'>
): string {
  return buildOmanLocationPath({ ...input, level: 'area' });
}
