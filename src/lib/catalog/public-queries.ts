import { buildPublicContactActions } from './public-contact';
import { buildPublicMediaImage, getAllowedPublicImageMimeTypes, type PublicMediaInput } from './public-media';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

import type {
  PublicCatalogQueryError,
  PublicCatalogQueryResult,
  PublicCatalogLocale,
  PublicCatalogSearchResult,
  PublicCenterDetail,
  PublicCenterDetailDoctorSummary,
  PublicCenterDetailOptions,
  PublicCenterDetailServiceSummary,
  PublicCenterListOptions,
  PublicCenterSummary,
  PublicDiscoveryCategory,
  PublicDoctorDetail,
  PublicDoctorDetailOptions,
  PublicDoctorDetailServiceSummary,
  PublicDoctorDetailSpecialtySummary,
  PublicDoctorListOptions,
  PublicDoctorPracticeLocationSummary,
  PublicDoctorSummary,
  PublicGeoAreaListOptions,
  PublicGeoAreaSummary,
  PublicLicenseInfo,
  PublicMediaImage,
  PublicProviderLocationSummary,
  PublicSearchOptions,
  PublicServiceListOptions,
  PublicServiceSummary
} from './public-types';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_SEARCH_QUERY_LENGTH = 64;
const HTML_LIKE_TAG_PATTERN = /<[^>]+>/;
const SAFE_LICENSE_NUMBER_PATTERN = /^[A-Za-z0-9 .\-/]+$/;
const CENTER_MEDIA_QUERY_LIMIT = 24;
const CENTER_GALLERY_IMAGE_LIMIT = 8;

const PUBLIC_CENTER_DETAIL_SELECT = 'id,slug,name_en,name_ar,center_type,description_en,description_ar,short_description_en,short_description_ar,default_country,verification_status,primary_phone,secondary_phone,whatsapp_phone,email,website_url,public_primary_phone_visible,public_secondary_phone_visible,public_whatsapp_phone_visible,public_email_visible,contact_review_status';
const PUBLIC_CENTER_LOCATION_SELECT = 'id,center_id,name_en,name_ar,address_line1_en,address_line1_ar,address_line2_en,address_line2_ar,landmark_en,landmark_ar,postal_code,area_id,city_id,country_id,is_primary,sort_order,map_url,primary_phone,secondary_phone,whatsapp_phone,email,public_primary_phone_visible,public_secondary_phone_visible,public_whatsapp_phone_visible,public_email_visible,contact_review_status';

type CenterRow = Database['public']['Tables']['centers']['Row'];
type CenterLocationRow = Database['public']['Tables']['center_locations']['Row'];
type CenterServiceRow = Database['public']['Tables']['center_services']['Row'];
type DoctorPracticeLocationRow = Database['public']['Tables']['doctor_practice_locations']['Row'];
type DoctorServiceRow = Database['public']['Tables']['doctor_services']['Row'];
type DoctorRow = Database['public']['Tables']['doctors']['Row'];
type ProviderLicenseRecordRow = Database['public']['Tables']['provider_license_records']['Row'];
type ServiceRow = Database['public']['Tables']['services']['Row'];
type SpecialtyRow = Database['public']['Tables']['specialties']['Row'];
type GeoAreaRow = Database['public']['Tables']['geo_areas']['Row'];
type GeoCityRow = Database['public']['Tables']['geo_cities']['Row'];
type GeoCountryRow = Database['public']['Tables']['geo_countries']['Row'];
type EntityMediaRow = Database['public']['Tables']['entity_media']['Row'];
type MediaAssetRow = Database['public']['Tables']['media_assets']['Row'];

type PublicMediaAssetLookupRow = Pick<MediaAssetRow, 'id' | 'public_url' | 'mime_type' | 'width' | 'height'>;

type PublicEntityMediaLookupRow = Pick<
  EntityMediaRow,
  | 'id'
  | 'usage_kind'
  | 'alt_text_en'
  | 'alt_text_ar'
  | 'caption_en'
  | 'caption_ar'
  | 'is_primary'
  | 'is_featured'
  | 'sort_order'
> & {
  media_assets: PublicMediaAssetLookupRow | PublicMediaAssetLookupRow[] | null;
};

type PublicCenterMediaResult = {
  galleryImages: PublicMediaImage[];
  logoImage: PublicMediaImage | null;
  coverImage: PublicMediaImage | null;
};

type PublicDoctorMediaResult = {
  profileImage: PublicMediaImage | null;
};

type PublicLicenseRecordLookupRow = Pick<
  ProviderLicenseRecordRow,
  | 'entity_type'
  | 'center_id'
  | 'doctor_id'
  | 'license_number'
  | 'license_authority'
  | 'license_country'
  | 'license_review_status'
  | 'public_license_visible'
  | 'deleted_at'
>;

type PublicLicenseEntityLookup =
  | { entityType: 'center'; entityId: string }
  | { entityType: 'doctor'; entityId: string };

function clampLimit(limit: number | undefined): number {
  if (typeof limit !== 'number' || Number.isNaN(limit)) return DEFAULT_LIMIT;
  if (limit < 1) return 1;
  return Math.min(limit, MAX_LIMIT);
}

function normalizeSearchQuery(input: string): string {
  return input
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s_-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_SEARCH_QUERY_LENGTH);
}

function createSuccessResult<T>(data: T, emptyReason: PublicCatalogQueryResult<T>['emptyReason'] = null): PublicCatalogQueryResult<T> {
  return { ok: true, data, emptyReason, error: null };
}

function createErrorResult<T>(fallbackData: T): PublicCatalogQueryResult<T> {
  const error: PublicCatalogQueryError = {
    code: 'PUBLIC_CATALOG_QUERY_FAILED',
    message: 'Public catalog query failed.'
  };

  return {
    ok: false,
    data: fallbackData,
    emptyReason: 'query_error',
    error
  };
}

function mapPublicLicenseInfo(
  row: PublicLicenseRecordLookupRow,
  entity: PublicLicenseEntityLookup
): PublicLicenseInfo | null {
  if (entity.entityType === 'center') {
    if (row.entity_type !== 'center' || row.center_id !== entity.entityId || row.doctor_id !== null) return null;
  } else if (row.entity_type !== 'doctor' || row.doctor_id !== entity.entityId || row.center_id !== null) {
    return null;
  }

  if (row.deleted_at !== null) return null;
  if (row.public_license_visible !== true) return null;
  if (row.license_review_status !== 'approved') return null;
  if (typeof row.license_number !== 'string') return null;

  const licenseNumber = row.license_number.trim();
  if (licenseNumber.length < 3 || licenseNumber.length > 80) return null;
  if (HTML_LIKE_TAG_PATTERN.test(licenseNumber)) return null;
  if (!SAFE_LICENSE_NUMBER_PATTERN.test(licenseNumber)) return null;

  let licenseAuthority: string | null = null;
  if (typeof row.license_authority === 'string') {
    const trimmedAuthority = row.license_authority.trim();

    if (
      trimmedAuthority.length >= 2 &&
      trimmedAuthority.length <= 120 &&
      !HTML_LIKE_TAG_PATTERN.test(trimmedAuthority)
    ) {
      licenseAuthority = trimmedAuthority;
    }
  }

  return {
    licenseNumber,
    licenseAuthority,
    licenseCountry: row.license_country
  };
}

async function getPublicLicenseInfoForEntity(
  entity: PublicLicenseEntityLookup
): Promise<{ licenseInfo: PublicLicenseInfo | null; error: boolean }> {
  const supabase = createSupabaseServerClient();
  const query = supabase
    .from('provider_license_records')
    .select(
      'entity_type,center_id,doctor_id,license_number,license_authority,license_country,license_review_status,public_license_visible,deleted_at'
    )
    .eq('entity_type', entity.entityType)
    .is('deleted_at', null)
    .limit(1);

  const { data, error } = entity.entityType === 'center'
    ? await query.eq('center_id', entity.entityId).maybeSingle()
    : await query.eq('doctor_id', entity.entityId).maybeSingle();

  if (error) return { licenseInfo: null, error: true };
  if (!data) return { licenseInfo: null, error: false };

  return {
    licenseInfo: mapPublicLicenseInfo(data, entity),
    error: false
  };
}

function normalizePublicCatalogLocale(locale: PublicCatalogLocale | undefined): PublicCatalogLocale {
  return locale === 'ar' ? 'ar' : 'en';
}

function createEmptyCenterMediaResult(): PublicCenterMediaResult {
  return {
    galleryImages: [],
    logoImage: null,
    coverImage: null
  };
}

function createEmptyDoctorMediaResult(): PublicDoctorMediaResult {
  return { profileImage: null };
}

function mapEntityMediaLookupRow(row: PublicEntityMediaLookupRow): PublicMediaInput {
  return {
    id: row.id,
    usage_kind: row.usage_kind,
    alt_text_en: row.alt_text_en,
    alt_text_ar: row.alt_text_ar,
    caption_en: row.caption_en,
    caption_ar: row.caption_ar,
    is_primary: row.is_primary,
    is_featured: row.is_featured,
    sort_order: row.sort_order,
    media_assets: row.media_assets
  };
}

async function getPublicCenterMedia(
  centerId: string,
  locale: PublicCatalogLocale
): Promise<{ media: PublicCenterMediaResult; error: boolean }> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('entity_media')
    .select(
      'id,usage_kind,alt_text_en,alt_text_ar,caption_en,caption_ar,is_primary,is_featured,sort_order,media_assets!inner(id,public_url,mime_type,width,height)'
    )
    .eq('entity_type', 'center')
    .eq('entity_id', centerId)
    .is('deleted_at', null)
    .eq('public_media_visible', true)
    .eq('media_review_status', 'approved')
    .in('usage_kind', ['logo', 'cover', 'gallery', 'thumbnail'])
    .is('media_assets.deleted_at', null)
    .eq('media_assets.status', 'approved')
    .not('media_assets.public_url', 'is', null)
    .in('media_assets.mime_type', getAllowedPublicImageMimeTypes())
    .order('is_featured', { ascending: false })
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(CENTER_MEDIA_QUERY_LIMIT);

  if (error) return { media: createEmptyCenterMediaResult(), error: true };

  const media = createEmptyCenterMediaResult();

  for (const row of (data ?? []) as PublicEntityMediaLookupRow[]) {
    const image = buildPublicMediaImage(mapEntityMediaLookupRow(row), locale, 'center');
    if (!image) continue;

    if (image.usageKind === 'logo' && !media.logoImage) {
      media.logoImage = image;
      continue;
    }

    if (image.usageKind === 'cover' && !media.coverImage) {
      media.coverImage = image;
      continue;
    }

    if ((image.usageKind === 'gallery' || image.usageKind === 'thumbnail') && media.galleryImages.length < CENTER_GALLERY_IMAGE_LIMIT) {
      media.galleryImages.push(image);
    }
  }

  return { media, error: false };
}
