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

export type PublicActionName = (typeof publicActionNames)[number];

const publicActionNameSet = new Set<string>(publicActionNames);

export function isPublicActionName(value: string): value is PublicActionName {
  return publicActionNameSet.has(value);
}

export type PublicActionPayload = Readonly<{
  name: PublicActionName;
  locale?: 'en' | 'ar';
  country?: 'om';
  routeFamily?: string;
  entityFamily?: 'doctor' | 'pharmacy' | 'hospital' | 'center' | 'lab' | 'service';
}>;
