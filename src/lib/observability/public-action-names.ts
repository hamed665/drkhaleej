export const publicActionNames = [
  'provider_form_submit',
  'contact_form_submit',
  'whatsapp_click',
  'call_click',
  'website_click',
  'map_click',
  'language_switch_click',
  'search_submit',
  'provider_profile_view',
] as const;

export const publicActionRouteFamilies = [
  'country_root',
  'directory',
  'provider_onboarding',
  'policy',
  'search',
  'profile',
] as const;

export const publicActionEntityFamilies = [
  'doctor',
  'pharmacy',
  'hospital',
  'center',
  'lab',
  'service',
] as const;

export type PublicActionName = (typeof publicActionNames)[number];
export type PublicActionRouteFamily = (typeof publicActionRouteFamilies)[number];
export type PublicActionEntityFamily = (typeof publicActionEntityFamilies)[number];

const publicActionNameSet = new Set<string>(publicActionNames);
const publicActionRouteFamilySet = new Set<string>(publicActionRouteFamilies);
const publicActionEntityFamilySet = new Set<string>(publicActionEntityFamilies);

export function isPublicActionName(value: string): value is PublicActionName {
  return publicActionNameSet.has(value);
}

export function isPublicActionRouteFamily(value: string): value is PublicActionRouteFamily {
  return publicActionRouteFamilySet.has(value);
}

export function isPublicActionEntityFamily(value: string): value is PublicActionEntityFamily {
  return publicActionEntityFamilySet.has(value);
}

export type PublicActionPayload = Readonly<{
  name: PublicActionName;
  locale?: 'en' | 'ar';
  country?: 'om';
  routeFamily?: PublicActionRouteFamily;
  entityFamily?: PublicActionEntityFamily;
}>;

export type PublicActionPayloadInput = Readonly<{
  name: string;
  locale?: string;
  country?: string;
  routeFamily?: string;
  entityFamily?: string;
}>;

export function isPublicActionPayload(input: PublicActionPayloadInput): input is PublicActionPayload {
  if (!isPublicActionName(input.name)) return false;
  if (input.locale !== undefined && input.locale !== 'en' && input.locale !== 'ar') return false;
  if (input.country !== undefined && input.country !== 'om') return false;
  if (input.routeFamily !== undefined && !isPublicActionRouteFamily(input.routeFamily)) return false;
  if (input.entityFamily !== undefined && !isPublicActionEntityFamily(input.entityFamily)) return false;

  return true;
}
