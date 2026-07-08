import type { PublicProviderRouteFamily } from './public-provider-route-resolver';

export const publicEntityFamilies = [
  'doctor',
  'hospital',
  'clinic',
  'dental_clinic',
  'dentist',
  'pharmacy',
  'lab',
  'imaging_center',
  'beauty_clinic',
  'charity_center',
  'pet_clinic',
  'pet_shop',
  'service',
  'specialty',
  'department',
  'article',
  'geo_area',
] as const;

export type PublicEntityFamily = (typeof publicEntityFamilies)[number];

export const publicProviderEntityFamilies = [
  'doctor',
  'hospital',
  'clinic',
  'dental_clinic',
  'dentist',
  'pharmacy',
  'lab',
  'imaging_center',
  'beauty_clinic',
  'charity_center',
  'pet_clinic',
  'pet_shop',
] as const satisfies readonly PublicEntityFamily[];

export type PublicProviderEntityFamily = (typeof publicProviderEntityFamilies)[number];

export const publicNonProviderEntityFamilies = [
  'service',
  'specialty',
  'department',
  'article',
  'geo_area',
] as const satisfies readonly PublicEntityFamily[];

export type PublicNonProviderEntityFamily = (typeof publicNonProviderEntityFamilies)[number];

export type PublicEntityFamilyVertical =
  | 'healthcare'
  | 'pharmacy'
  | 'lab'
  | 'imaging'
  | 'dental'
  | 'beauty'
  | 'pet'
  | 'charity'
  | 'geo'
  | 'content';

export type PublicEntityFamilyCapabilities = {
  detailPage: boolean;
  directoryPage: boolean;
  geoPage: boolean;
  servicePage: boolean;
  specialtyPage: boolean;
  searchResult: boolean;
  internalLinkTarget: boolean;
  sitemapEntry: boolean;
  structuredData: boolean;
  nearbyRecommendation: boolean;
};

export type PublicEntityFamilyRegistryEntry = {
  family: PublicEntityFamily;
  vertical: PublicEntityFamilyVertical;
  provider: boolean;
  routeFamily: PublicProviderRouteFamily | null;
  capabilities: PublicEntityFamilyCapabilities;
};

const providerCapabilities: PublicEntityFamilyCapabilities = {
  detailPage: true,
  directoryPage: true,
  geoPage: true,
  servicePage: false,
  specialtyPage: false,
  searchResult: true,
  internalLinkTarget: true,
  sitemapEntry: true,
  structuredData: true,
  nearbyRecommendation: true,
};

const nonProviderCapabilities: PublicEntityFamilyCapabilities = {
  detailPage: false,
  directoryPage: false,
  geoPage: false,
  servicePage: true,
  specialtyPage: true,
  searchResult: true,
  internalLinkTarget: true,
  sitemapEntry: true,
  structuredData: false,
  nearbyRecommendation: false,
};

export const publicEntityFamilyRegistry = [
  { family: 'doctor', vertical: 'healthcare', provider: true, routeFamily: 'doctor', capabilities: providerCapabilities },
  { family: 'hospital', vertical: 'healthcare', provider: true, routeFamily: 'hospital', capabilities: providerCapabilities },
  { family: 'clinic', vertical: 'healthcare', provider: true, routeFamily: 'clinic', capabilities: providerCapabilities },
  { family: 'dental_clinic', vertical: 'dental', provider: true, routeFamily: 'dental_clinic', capabilities: providerCapabilities },
  { family: 'dentist', vertical: 'dental', provider: true, routeFamily: 'dentist', capabilities: providerCapabilities },
  { family: 'pharmacy', vertical: 'pharmacy', provider: true, routeFamily: 'pharmacy', capabilities: providerCapabilities },
  { family: 'lab', vertical: 'lab', provider: true, routeFamily: 'lab', capabilities: providerCapabilities },
  { family: 'imaging_center', vertical: 'imaging', provider: true, routeFamily: 'imaging_center', capabilities: providerCapabilities },
  { family: 'beauty_clinic', vertical: 'beauty', provider: true, routeFamily: 'beauty_clinic', capabilities: providerCapabilities },
  { family: 'charity_center', vertical: 'charity', provider: true, routeFamily: 'charity_center', capabilities: providerCapabilities },
  { family: 'pet_clinic', vertical: 'pet', provider: true, routeFamily: 'pet_clinic', capabilities: providerCapabilities },
  { family: 'pet_shop', vertical: 'pet', provider: true, routeFamily: 'pet_shop', capabilities: providerCapabilities },
  { family: 'service', vertical: 'healthcare', provider: false, routeFamily: null, capabilities: nonProviderCapabilities },
  { family: 'specialty', vertical: 'healthcare', provider: false, routeFamily: null, capabilities: nonProviderCapabilities },
  { family: 'department', vertical: 'healthcare', provider: false, routeFamily: null, capabilities: nonProviderCapabilities },
  { family: 'article', vertical: 'content', provider: false, routeFamily: null, capabilities: { ...nonProviderCapabilities, servicePage: false, specialtyPage: false, structuredData: true } },
  { family: 'geo_area', vertical: 'geo', provider: false, routeFamily: null, capabilities: { ...nonProviderCapabilities, geoPage: true, servicePage: false, specialtyPage: false } },
] as const satisfies readonly PublicEntityFamilyRegistryEntry[];

export function isPublicEntityFamily(value: string): value is PublicEntityFamily {
  return publicEntityFamilies.includes(value as PublicEntityFamily);
}

export function isPublicProviderEntityFamily(value: string): value is PublicProviderEntityFamily {
  return publicProviderEntityFamilies.includes(value as PublicProviderEntityFamily);
}

export function getPublicEntityFamilyRegistryEntry(family: PublicEntityFamily): PublicEntityFamilyRegistryEntry {
  return publicEntityFamilyRegistry.find((entry) => entry.family === family) ?? publicEntityFamilyRegistry[0];
}
