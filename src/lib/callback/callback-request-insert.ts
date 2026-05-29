import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/service-role';
import type { Database } from '@/lib/supabase/types';

import { validateCallbackRequestInput, type NormalizedCallbackRequestInput } from './callback-request-validation';

export type CallbackRequestCreateResult =
  | { ok: true; inserted: boolean }
  | { ok: false; reason: 'invalid_request' | 'unavailable' };

type CallbackRequestInsert = Database['public']['Tables']['callback_requests']['Insert'];

const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

async function hasValidPublicCatalogContext(value: NormalizedCallbackRequestInput): Promise<boolean | null> {
  const supabase = createSupabaseServerClient();

  const { data: center, error: centerError } = await supabase
    .from('centers')
    .select('id,default_country')
    .eq('id', value.centerId)
    .is('deleted_at', null)
    .eq('is_active', true)
    .eq('status', 'active')
    .maybeSingle();

  if (centerError) return null;
  if (!center || center.default_country !== value.countryCode) return false;

  if (value.centerLocationId !== null) {
    const { data: centerLocation, error: centerLocationError } = await supabase
      .from('center_locations')
      .select('id')
      .eq('id', value.centerLocationId)
      .eq('center_id', value.centerId)
      .is('deleted_at', null)
      .eq('is_active', true)
      .maybeSingle();

    if (centerLocationError) return null;
    if (!centerLocation) return false;
  }

  if (value.doctorId !== null) {
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', value.doctorId)
      .is('deleted_at', null)
      .eq('is_active', true)
      .eq('status', 'active')
      .maybeSingle();

    if (doctorError) return null;
    if (!doctor) return false;
  }

  if (value.doctorPracticeLocationId !== null) {
    let practiceLocationQuery = supabase
      .from('doctor_practice_locations')
      .select('id')
      .eq('id', value.doctorPracticeLocationId)
      .eq('center_id', value.centerId)
      .is('deleted_at', null)
      .eq('is_active', true);

    if (value.doctorId !== null) {
      practiceLocationQuery = practiceLocationQuery.eq('doctor_id', value.doctorId);
    }

    if (value.centerLocationId !== null) {
      practiceLocationQuery = practiceLocationQuery.eq('center_location_id', value.centerLocationId);
    }

    const { data: practiceLocation, error: practiceLocationError } = await practiceLocationQuery.maybeSingle();

    if (practiceLocationError) return null;
    if (!practiceLocation) return false;
  }

  return true;
}

async function isDuplicateCallbackRequest(value: NormalizedCallbackRequestInput): Promise<boolean | null> {
  const supabase = createSupabaseServiceRoleClient();
  const createdSince = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();

  let duplicateQuery = supabase
    .from('callback_requests')
    .select('id')
    .eq('center_id', value.centerId)
    .eq('requester_phone', value.requesterPhone)
    .is('deleted_at', null)
    .gte('created_at', createdSince)
    .limit(1);

  if (value.doctorId === null) {
    duplicateQuery = duplicateQuery.is('doctor_id', null);
  } else {
    duplicateQuery = duplicateQuery.eq('doctor_id', value.doctorId);
  }

  const { data, error } = await duplicateQuery;

  if (error) return null;

  return (data ?? []).length > 0;
}

async function insertCallbackRequest(value: NormalizedCallbackRequestInput): Promise<boolean> {
  const supabase = createSupabaseServiceRoleClient();
  const insertValue: CallbackRequestInsert = {
    country_code: value.countryCode,
    locale: value.locale,
    center_id: value.centerId,
    center_location_id: value.centerLocationId,
    doctor_id: value.doctorId,
    doctor_practice_location_id: value.doctorPracticeLocationId,
    requester_name: value.requesterName,
    requester_phone: value.requesterPhone,
    preferred_language: value.preferredLanguage,
    message: value.message,
    consent_to_contact: true,
    request_source: 'public_profile',
    status: 'new',
    priority: 'normal',
    metadata: {}
  };

  const { error } = await supabase.from('callback_requests').insert(insertValue);

  return !error;
}

export async function createCallbackRequest(input: unknown): Promise<CallbackRequestCreateResult> {
  const validation = validateCallbackRequestInput(input);

  if (!validation.ok) {
    if (validation.reason === 'spam_detected') return { ok: true, inserted: false };
    return { ok: false, reason: 'invalid_request' };
  }

  const hasValidContext = await hasValidPublicCatalogContext(validation.value);
  if (hasValidContext === null) return { ok: false, reason: 'unavailable' };
  if (!hasValidContext) return { ok: true, inserted: false };

  const isDuplicate = await isDuplicateCallbackRequest(validation.value);
  if (isDuplicate === null) return { ok: false, reason: 'unavailable' };
  if (isDuplicate) return { ok: true, inserted: false };

  const inserted = await insertCallbackRequest(validation.value);
  if (!inserted) return { ok: false, reason: 'unavailable' };

  return { ok: true, inserted: true };
}
