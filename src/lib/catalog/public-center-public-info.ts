import { buildPublicContactActions, type PublicContactAction } from './public-contact';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type CenterRow = Database['public']['Tables']['centers']['Row'];
type CenterLocationRow = Database['public']['Tables']['center_locations']['Row'];
type VerificationStatus = Database['public']['Enums']['verification_status'];

type PublicCenterInfoRow = Pick<
  CenterRow,
  | 'id'
  | 'default_country'
  | 'primary_phone'
  | 'secondary_phone'
  | 'whatsapp_phone'
  | 'email'
  | 'website_url'
  | 'public_primary_phone_visible'
  | 'public_secondary_phone_visible'
  | 'public_whatsapp_phone_visible'
  | 'public_email_visible'
  | 'contact_review_status'
>;

type PublicCenterLocationInfoRow = Pick<
  CenterLocationRow,
  | 'id'
  | 'name_en'
  | 'name_ar'
  | 'address_line1_en'
  | 'address_line1_ar'
  | 'address_line2_en'
  | 'address_line2_ar'
  | 'landmark_en'
  | 'landmark_ar'
  | 'postal_code'
  | 'latitude'
  | 'longitude'
  | 'map_url'
  | 'primary_phone'
  | 'secondary_phone'
  | 'whatsapp_phone'
  | 'email'
  | 'public_primary_phone_visible'
  | 'public_secondary_phone_visible'
  | 'public_whatsapp_phone_visible'
  | 'public_email_visible'
  | 'contact_review_status'
  | 'is_primary'
  | 'sort_order'
>;

export type PublicCenterPublicLocationInfo = {
  id: string;
  locationNameEn: string | null;
  locationNameAr: string | null;
  addressLine1En: string | null;
  addressLine1Ar: string | null;
  addressLine2En: string | null;
  addressLine2Ar: string | null;
  landmarkEn: string | null;
  landmarkAr: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  mapUrl: string | null;
  isPrimary: boolean;
  sortOrder: number;
  contactActions: PublicContactAction[];
};

export type PublicCenterPublicInfo = {
  contactActions: PublicContactAction[];
  locations: PublicCenterPublicLocationInfo[];
  error: boolean;
};

export const PUBLIC_CENTER_INFO_LOCATION_LIMIT = 6;
const safeVerificationStatuses = [
  'unverified',
  'pending',
  'verified',
] as const satisfies readonly VerificationStatus[];

const centerInfoSelect = [
  'id',
  'default_country',
  'primary_phone',
  'secondary_phone',
  'whatsapp_phone',
  'email',
  'website_url',
  'public_primary_phone_visible',
  'public_secondary_phone_visible',
  'public_whatsapp_phone_visible',
  'public_email_visible',
  'contact_review_status'
].join(',');

const locationInfoSelect = [
  'id',
  'name_en',
  'name_ar',
  'address_line1_en',
  'address_line1_ar',
  'address_line2_en',
  'address_line2_ar',
  'landmark_en',
  'landmark_ar',
  'postal_code',
  'latitude',
  'longitude',
  'map_url',
  'primary_phone',
  'secondary_phone',
  'whatsapp_phone',
  'email',
  'public_primary_phone_visible',
  'public_secondary_phone_visible',
  'public_whatsapp_phone_visible',
  'public_email_visible',
  'contact_review_status',
  'is_primary',
  'sort_order'
].join(',');

function createEmptyPublicCenterInfo(error = false): PublicCenterPublicInfo {
  return { contactActions: [], locations: [], error };
}

export function mapPublicCenterInfoForTest(center: PublicCenterInfoRow): PublicCenterPublicInfo {
  return {
    contactActions: buildPublicContactActions({
      contactReviewStatus: center.contact_review_status,
      country: center.default_country,
      primaryPhone: center.primary_phone,
      secondaryPhone: center.secondary_phone,
      whatsappPhone: center.whatsapp_phone,
      email: center.email,
      websiteUrl: center.website_url,
      publicPrimaryPhoneVisible: center.public_primary_phone_visible,
      publicSecondaryPhoneVisible: center.public_secondary_phone_visible,
      publicWhatsappPhoneVisible: center.public_whatsapp_phone_visible,
      publicEmailVisible: center.public_email_visible
    }),
    locations: [],
    error: false
  };
}

function mapLocationInfoRow(
  row: PublicCenterLocationInfoRow,
  center: PublicCenterInfoRow
): PublicCenterPublicLocationInfo {
  return {
    id: row.id,
    locationNameEn: row.name_en,
    locationNameAr: row.name_ar,
    addressLine1En: row.address_line1_en,
    addressLine1Ar: row.address_line1_ar,
    addressLine2En: row.address_line2_en,
    addressLine2Ar: row.address_line2_ar,
    landmarkEn: row.landmark_en,
    landmarkAr: row.landmark_ar,
    postalCode: row.postal_code,
    latitude: row.latitude,
    longitude: row.longitude,
    mapUrl: row.map_url,
    isPrimary: row.is_primary,
    sortOrder: row.sort_order,
    contactActions: buildPublicContactActions({
      contactReviewStatus: row.contact_review_status,
      country: center.default_country,
      primaryPhone: row.primary_phone,
      secondaryPhone: row.secondary_phone,
      whatsappPhone: row.whatsapp_phone,
      email: row.email,
      publicPrimaryPhoneVisible: row.public_primary_phone_visible,
      publicSecondaryPhoneVisible: row.public_secondary_phone_visible,
      publicWhatsappPhoneVisible: row.public_whatsapp_phone_visible,
      publicEmailVisible: row.public_email_visible
    })
  };
}

export async function getPublicCenterPublicInfo(centerId: string): Promise<PublicCenterPublicInfo> {
  const supabase = createSupabaseServerClient();

  const { data: center, error: centerError } = await supabase
    .from('centers')
    .select(centerInfoSelect)
    .eq('id', centerId)
    .eq('is_active', true)
    .eq('status', 'active')
    .in('verification_status', [...safeVerificationStatuses])
    .is('deleted_at', null)
    .maybeSingle();

  if (centerError) return createEmptyPublicCenterInfo(true);
  if (!center) return createEmptyPublicCenterInfo(false);

  const { data: locations, error: locationsError } = await supabase
    .from('center_locations')
    .select(locationInfoSelect)
    .eq('center_id', centerId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })
    .limit(PUBLIC_CENTER_INFO_LOCATION_LIMIT);

  if (locationsError) return createEmptyPublicCenterInfo(true);

  const centerInfo = center as PublicCenterInfoRow;

  return {
    contactActions: mapPublicCenterInfoForTest(centerInfo).contactActions,
    locations: ((locations ?? []) as PublicCenterLocationInfoRow[]).map((location) => mapLocationInfoRow(location, centerInfo)),
    error: false
  };
}
