import { describe, expect, it } from 'vitest';
import { doctorLevels, entityTypes, schemaHints, services, specialties, taxonomyVerticals } from './index';

const expectUnique = (values: readonly string[]) => {
  expect(new Set(values).size).toBe(values.length);
};

describe('master taxonomy registry', () => {
  it('does not duplicate registry slugs', () => {
    expectUnique(taxonomyVerticals.map((item) => item.slug));
    expectUnique(entityTypes.map((item) => item.slug));
    expectUnique(doctorLevels.map((item) => item.slug));
    expectUnique(specialties.map((item) => item.slug));
    expectUnique(services.map((item) => item.slug));
  });

  it('references only registered vertical, specialty, entity type, and schema hint slugs', () => {
    const verticalSlugs = new Set(taxonomyVerticals.map((item) => item.slug));
    const specialtySlugs = new Set(specialties.map((item) => item.slug));
    const entityTypeSlugs = new Set(entityTypes.map((item) => item.slug));
    const schemaHintSlugs = new Set(schemaHints.map((item) => item.slug));

    for (const entityType of entityTypes) {
      expect(verticalSlugs.has(entityType.primaryVertical)).toBe(true);
      expect(schemaHintSlugs.has(entityType.schemaHint)).toBe(true);
      for (const vertical of entityType.secondaryVerticals) expect(verticalSlugs.has(vertical)).toBe(true);
    }

    for (const specialty of specialties) {
      for (const vertical of specialty.verticals) expect(verticalSlugs.has(vertical)).toBe(true);
      for (const entityType of specialty.relatedEntityTypes) expect(entityTypeSlugs.has(entityType)).toBe(true);
    }

    for (const service of services) {
      expect(schemaHintSlugs.has(service.schemaHint)).toBe(true);
      for (const vertical of service.verticals) expect(verticalSlugs.has(vertical)).toBe(true);
      for (const specialty of service.relatedSpecialtySlugs) expect(specialtySlugs.has(specialty)).toBe(true);
      for (const entityType of service.relatedEntityTypes) expect(entityTypeSlugs.has(entityType)).toBe(true);
    }
  });

  it('keeps excluded and deferred verticals out of core launch scope', () => {
    for (const slug of ['healthy-food', 'healthy-meal-delivery', 'restaurants']) {
      const vertical = taxonomyVerticals.find((item) => item.slug === slug);
      expect(vertical?.scope).toBe('excluded');
    }
    expect(taxonomyVerticals.find((item) => item.slug === 'beauty-nonmedical')?.scope).not.toBe('core');
    expect(entityTypes.find((item) => item.slug === 'pet-shop')?.scope).not.toBe('core');
  });
});
