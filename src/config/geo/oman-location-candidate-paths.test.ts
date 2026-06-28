import { describe, expect, it } from 'vitest';

import {
  buildOmanAreaLocationCandidatePath,
  buildOmanGovernorateLocationCandidatePath,
  buildOmanLocationCandidatePath,
  buildOmanWilayatLocationCandidatePath,
} from './oman-location-candidate-paths';

describe('Oman location candidate path builder', () => {
  it('builds governorate category candidate paths with parent-aware location context', () => {
    expect(
      buildOmanGovernorateLocationCandidatePath({
        locale: 'en',
        country: 'om',
        governorateSlug: 'muscat',
        dimension: 'category',
        dimensionSlug: 'pharmacies',
      })
    ).toBe('/en/om/locations/muscat/categories/pharmacies');
  });

  it('builds wilayat service candidate paths with parent-aware location context', () => {
    expect(
      buildOmanWilayatLocationCandidatePath({
        locale: 'ar',
        country: 'om',
        governorateSlug: 'muscat',
        wilayatSlug: 'al-seeb',
        dimension: 'service',
        dimensionSlug: 'ivf',
      })
    ).toBe('/ar/om/locations/muscat/al-seeb/services/ivf');
  });

  it('builds area specialty candidate paths with full parent hierarchy', () => {
    expect(
      buildOmanAreaLocationCandidatePath({
        locale: 'en',
        country: 'om',
        governorateSlug: 'muscat',
        wilayatSlug: 'bawshar',
        areaSlug: 'al-khuwair',
        dimension: 'specialty',
        dimensionSlug: 'dermatology',
      })
    ).toBe('/en/om/locations/muscat/bawshar/al-khuwair/specialties/dermatology');
  });

  it('requires wilayat context before area candidate paths can be built', () => {
    expect(() =>
      buildOmanLocationCandidatePath({
        locale: 'en',
        country: 'om',
        level: 'area',
        governorateSlug: 'muscat',
        wilayatSlug: 'Al Seeb',
        areaSlug: 'al-khoud',
        dimension: 'category',
        dimensionSlug: 'clinics',
      })
    ).toThrow('wilayatSlug must be a lowercase kebab-case canonical slug.');
  });

  it('rejects non-canonical dimension slugs', () => {
    expect(() =>
      buildOmanGovernorateLocationCandidatePath({
        locale: 'en',
        country: 'om',
        governorateSlug: 'muscat',
        dimension: 'category',
        dimensionSlug: 'Hair Clinics',
      })
    ).toThrow('dimensionSlug must be a lowercase kebab-case canonical slug.');
  });

  it('rejects non-canonical area slugs', () => {
    expect(() =>
      buildOmanAreaLocationCandidatePath({
        locale: 'en',
        country: 'om',
        governorateSlug: 'muscat',
        wilayatSlug: 'al-seeb',
        areaSlug: 'Al Khoud',
        dimension: 'service',
        dimensionSlug: 'blood-test',
      })
    ).toThrow('areaSlug must be a lowercase kebab-case canonical slug.');
  });
});
