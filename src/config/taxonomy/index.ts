import { taxonomyDoctorLevels } from './doctor-levels';
import { taxonomyEntityTypes } from './entity-types';
import { taxonomySchemaHints } from './schema-hints';
import { taxonomyServices } from './services';
import { taxonomySpecialties } from './specialties';
import { taxonomyVerticals } from './verticals';

const bySlug = <T extends { slug: string }>(items: readonly T[]) => new Map(items.map((item) => [item.slug, item]));

export { taxonomyDoctorLevels } from './doctor-levels';
export { taxonomyEntityTypes } from './entity-types';
export { taxonomySchemaHints } from './schema-hints';
export { taxonomyServices } from './services';
export { taxonomySpecialties } from './specialties';
export { taxonomyVerticals } from './verticals';
export type { DoctorLevel, EntityType, SchemaHint, Service, Specialty, Vertical } from './types';

export const coreTaxonomyVerticals = taxonomyVerticals.filter((vertical) => vertical.scope === 'core');
export const adjacentTaxonomyVerticals = taxonomyVerticals.filter((vertical) => vertical.scope === 'adjacent');
export const deferredTaxonomyVerticals = taxonomyVerticals.filter((vertical) => vertical.scope === 'deferred');
export const excludedTaxonomyVerticals = taxonomyVerticals.filter((vertical) => vertical.scope === 'excluded');

export const taxonomyVerticalBySlug = bySlug(taxonomyVerticals);
export const taxonomyEntityTypeBySlug = bySlug(taxonomyEntityTypes);
export const taxonomyDoctorLevelBySlug = bySlug(taxonomyDoctorLevels);
export const taxonomySpecialtyBySlug = bySlug(taxonomySpecialties);
export const taxonomyServiceBySlug = bySlug(taxonomyServices);
export const taxonomySchemaHintBySlug = bySlug(taxonomySchemaHints);

export const getTaxonomyVertical = (slug: string) => taxonomyVerticalBySlug.get(slug);
export const getTaxonomyEntityType = (slug: string) => taxonomyEntityTypeBySlug.get(slug);
export const getTaxonomyDoctorLevel = (slug: string) => taxonomyDoctorLevelBySlug.get(slug);
export const getTaxonomySpecialty = (slug: string) => taxonomySpecialtyBySlug.get(slug);
export const getTaxonomyService = (slug: string) => taxonomyServiceBySlug.get(slug);
export const getTaxonomySchemaHint = (slug: string) => taxonomySchemaHintBySlug.get(slug);
