import 'server-only';

import { createSupabaseServiceRoleClient } from '@/lib/supabase/service-role';
import type { Database } from '@/lib/supabase/types';

import type { NormalizedProviderOnboardingLeadPayload } from './provider-onboarding-lead-validation';

export type ProviderOnboardingLeadInsertInput = NormalizedProviderOnboardingLeadPayload | { spam: true };

export type ProviderOnboardingLeadCreateResult =
  | { ok: true; accepted: true; duplicate?: boolean; spam?: boolean }
  | { ok: false; reason: 'unavailable' };

type ProviderOnboardingLeadInsert = Database['public']['Tables']['provider_onboarding_leads']['Insert'];

const DUPLICATE_WINDOW_MS = 15 * 60 * 1000;

function isSpamInput(input: ProviderOnboardingLeadInsertInput): input is { spam: true } {
  return 'spam' in input && input.spam === true;
}

async function isDuplicateProviderOnboardingLead(value: NormalizedProviderOnboardingLeadPayload): Promise<boolean | null> {
  const supabase = createSupabaseServiceRoleClient();
  const createdSince = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();

  const { data, error } = await supabase
    .from('provider_onboarding_leads')
    .select('id')
    .eq('phone', value.phone)
    .eq('center_name', value.centerName)
    .is('deleted_at', null)
    .gte('created_at', createdSince)
    .limit(1);

  if (error) return null;

  return (data ?? []).length > 0;
}

async function insertProviderOnboardingLead(value: NormalizedProviderOnboardingLeadPayload): Promise<boolean> {
  const supabase = createSupabaseServiceRoleClient();
  const insertValue: ProviderOnboardingLeadInsert = {
    country_code: value.countryCode,
    locale: value.locale,
    center_name: value.centerName,
    contact_name: value.contactName,
    phone: value.phone,
    email: value.email,
    whatsapp: value.whatsapp,
    provider_type: value.providerType,
    area_text: value.areaText,
    city_text: value.cityText,
    preferred_language: value.preferredLanguage,
    message: value.message,
    consent_to_contact: true,
    request_source: value.requestSource,
    status: 'new',
    priority: 'normal',
    metadata: {}
  };

  const { error } = await supabase.from('provider_onboarding_leads').insert(insertValue);

  return !error;
}

export async function createProviderOnboardingLead(
  input: ProviderOnboardingLeadInsertInput
): Promise<ProviderOnboardingLeadCreateResult> {
  if (isSpamInput(input)) return { ok: true, accepted: true, spam: true };

  const isDuplicate = await isDuplicateProviderOnboardingLead(input);
  if (isDuplicate === null) return { ok: false, reason: 'unavailable' };
  if (isDuplicate) return { ok: true, accepted: true, duplicate: true };

  const inserted = await insertProviderOnboardingLead(input);
  if (!inserted) return { ok: false, reason: 'unavailable' };

  return { ok: true, accepted: true };
}
