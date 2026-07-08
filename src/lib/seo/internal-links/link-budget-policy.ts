import type {
  PublicInternalLinkBudgetPolicy,
  PublicInternalLinkSourcePageType,
} from './types';

export const publicInternalLinkBudgetPolicies = [
  { pageType: 'doctor_profile', maxTotal: 18, families: { primaryRelations: 3, geo: 3, specialty: 4, services: 3, nearby: 3, articles: 2 } },
  { pageType: 'center_profile', maxTotal: 22, families: { primaryRelations: 8, geo: 3, services: 5, nearby: 4, articles: 2 } },
  { pageType: 'hospital_profile', maxTotal: 22, families: { primaryRelations: 8, geo: 3, services: 5, nearby: 4, articles: 2 } },
  { pageType: 'pharmacy_profile', maxTotal: 13, families: { geo: 3, nearby: 4, sameArea: 3, articles: 3 } },
  { pageType: 'lab_profile', maxTotal: 14, families: { geo: 3, services: 4, nearby: 4, articles: 3 } },
  { pageType: 'imaging_profile', maxTotal: 14, families: { geo: 3, services: 4, nearby: 4, articles: 3 } },
  { pageType: 'dental_profile', maxTotal: 18, families: { primaryRelations: 5, geo: 3, services: 5, nearby: 3, articles: 2 } },
  { pageType: 'beauty_profile', maxTotal: 14, families: { geo: 3, services: 5, nearby: 4, articles: 2 } },
  { pageType: 'pet_profile', maxTotal: 13, families: { geo: 3, services: 3, nearby: 5, articles: 2 } },
  { pageType: 'charity_profile', maxTotal: 12, families: { geo: 3, services: 3, nearby: 4, articles: 2 } },
  { pageType: 'geo_page', maxTotal: 30, families: { geo: 8, sameFamily: 10, specialty: 4, services: 4, articles: 4 } },
  { pageType: 'specialty_page', maxTotal: 24, families: { geo: 4, specialty: 8, services: 4, sameFamily: 6, articles: 2 } },
  { pageType: 'service_page', maxTotal: 24, families: { geo: 4, services: 8, specialty: 4, sameFamily: 6, articles: 2 } },
  { pageType: 'article_page', maxTotal: 16, families: { primaryRelations: 4, geo: 3, specialty: 3, services: 4, nearby: 2 } },
] as const satisfies readonly PublicInternalLinkBudgetPolicy[];

export function getPublicInternalLinkBudgetPolicy(
  pageType: PublicInternalLinkSourcePageType,
): PublicInternalLinkBudgetPolicy {
  return publicInternalLinkBudgetPolicies.find((policy) => policy.pageType === pageType) ?? publicInternalLinkBudgetPolicies[0];
}
