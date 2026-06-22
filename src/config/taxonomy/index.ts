export * from './types';
export * from './verticals';
export * from './entity-types';
export * from './doctor-levels';
export * from './specialties';
export * from './services';
export * from './schema-hints';

import { doctorLevels, type DoctorLevelSlug } from './doctor-levels';
import { entityTypes, type EntityTypeSlug } from './entity-types';
import { schemaHints, type SchemaHint } from './schema-hints';
import { services, type ServiceSlug } from './services';
import { specialties, type SpecialtySlug } from './specialties';
import { taxonomyVerticals, type TaxonomyVerticalSlug } from './verticals';
import type { SchemaHintSlug } from './types';

export const coreTaxonomyVerticals = taxonomyVerticals.filter((vertical) => vertical.scope === 'core');
export const adjacentTaxonomyVerticals = taxonomyVerticals.filter((vertical) => vertical.scope === 'adjacent');
export const deferredTaxonomyVerticals = taxonomyVerticals.filter((vertical) => vertical.scope === 'deferred');
export const excludedTaxonomyVerticals = taxonomyVerticals.filter((vertical) => vertical.scope === 'excluded');

export const getTaxonomyVerticalBySlug = (slug: TaxonomyVerticalSlug | string) =>
  taxonomyVerticals.find((vertical) => vertical.slug === slug);

export const getEntityTypeBySlug = (slug: EntityTypeSlug | string) =>
  entityTypes.find((entityType) => entityType.slug === slug);

export const getDoctorLevelBySlug = (slug: DoctorLevelSlug | string) =>
  doctorLevels.find((doctorLevel) => doctorLevel.slug === slug);

export const getSpecialtyBySlug = (slug: SpecialtySlug | string) =>
  specialties.find((specialty) => specialty.slug === slug);

export const getServiceBySlug = (slug: ServiceSlug | string) =>
  services.find((service) => service.slug === slug);

export const getSchemaHintBySlug = (slug: SchemaHintSlug | string): SchemaHint | undefined =>
  schemaHints.find((schemaHint) => schemaHint.slug === slug);
