import type { PublicContactAction } from './public-contact';
import type { Database } from '@/lib/supabase/types';

export type PublicCatalogLocale = 'en' | 'ar';

export type PublicCatalogCountry = 'om';

export type PublicMediaUsageKind = 'logo' | 'cover' | 'profile' | 'gallery' | 'thumbnail';

export type PublicMediaImage = {
  id: string;
  url: string;
  altText: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  usageKind: PublicMediaUsageKind;
  isPrimary: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

export type PublicCatalogSlug = 'doctors' | 'centers' | 'pharmacies' | 'pet-clinics' | 'labs' | 'services' | 'search';

export type PublicCatalogEmptyReason =
  | 'no_rows'
  | 'unsupported_entity'
  | 'query_not_implemented'
  | 'query_error'
  | 'search_query_too_short';

export type PublicCatalogQueryError = {
  code: 'PUBLIC_CATALOG_QUERY_FAILED';
  message: 'Public catalog query failed.';
};

export type PublicCatalogQueryResult<T> = {
  ok: boolean;
  data: T;
  emptyReason: PublicCatalogEmptyReason | null;
  error: PublicCatalogQueryError | null;
};

export type PublicDiscoveryCategory = {
  slug: Exclude<PublicCatalogSlug, 'search'>;
  label: string;
};

export type CenterType = Database['public']['Enums']['center_type'];
export type CountryCode = Database['public']['Enums']['country_code'];
export type DoctorGender = Database['public']['Enums']['doctor_gender'];
export type DoctorTitle = Database['public']['Enums']['doctor_title'];
export type VerificationStatus = Database['public']['Enums']['verification_status'];

export type PublicLicenseInfo = {
  licenseNumber: string;
  licenseAuthority: string | null;
  licenseCountry: CountryCode;
};

export type PublicCenterSummary = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string | null;
  centerType: CenterType;
  descriptionEn: string | null;
  descriptionAr: string | null;
  shortDescriptionEn: string | null;
  shortDescriptionAr: string | null;
  defaultCountry: CountryCode;
};

export type PublicDoctorSummary = {
  id: string;
  slug: string;
  fullNameEn: string;
  fullNameAr: string | null;
  titleEn: DoctorTitle;
  titleAr: DoctorTitle;
  gender: DoctorGender;
  defaultCountry: CountryCode;
};

export type PublicServiceSummary = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  categoryId: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
};

export type PublicGeoAreaSummary = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  cityId: string;
  countryId: string;
};

export type PublicCenterDetailServiceSummary = {
  id: string;
  slug: string | null;
  nameEn: string;
  nameAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  requiresMedicalDisclaimer: boolean;
};

export type PublicCenterDetailDoctorSummary = PublicDoctorSummary;

export type PublicDoctorDetailSpecialtySummary = {
  id: string;
  nameEn: string;
  nameAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
};

export type PublicDoctorDetailServiceSummary = {
  id: string;
  slug: string | null;
  nameEn: string;
  nameAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  requiresMedicalDisclaimer: boolean;
};

export type PublicProviderLocationSummary = {
  id: string;
  locationNameEn: string | null;
  locationNameAr: string | null;
  areaNameEn: string | null;
  areaNameAr: string | null;
  cityNameEn: string | null;
  cityNameAr: string | null;
  countryNameEn: string | null;
  countryNameAr: string | null;
  mapUrl: string | null;
  isPrimary: boolean;
  sortOrder: number;
  contactActions: PublicContactAction[];
};

export type PublicCenterDetailLocationSummary = PublicProviderLocationSummary;

export type PublicCenterDetail = PublicCenterSummary & {
  verificationStatus: VerificationStatus;
  licenseInfo: PublicLicenseInfo | null;
  location: PublicProviderLocationSummary | null;
  locations: PublicProviderLocationSummary[];
  services: PublicCenterDetailServiceSummary[];
  doctors: PublicCenterDetailDoctorSummary[];
  contactActions: PublicContactAction[];
  galleryImages: PublicMediaImage[];
  logoImage: PublicMediaImage | null;
  coverImage: PublicMediaImage | null;
};

export type PublicDoctorPracticeLocationSummary = {
  id: string;
  center: Pick<PublicCenterSummary, 'id' | 'slug' | 'nameEn' | 'nameAr' | 'centerType' | 'shortDescriptionEn' | 'shortDescriptionAr' | 'defaultCountry'> & {
    verificationStatus: VerificationStatus;
  };
  primarySpecialty: PublicDoctorDetailSpecialtySummary | null;
  location: PublicProviderLocationSummary | null;
  contactActions: PublicContactAction[];
};

export type PublicDoctorDetail = PublicDoctorSummary & {
  displayNameEn: string | null;
  licenseInfo: PublicLicenseInfo | null;
  displayNameAr: string | null;
  bioEn: string | null;
  bioAr: string | null;
  profileImageUrl: string | null;
  profileImage: PublicMediaImage | null;
  yearsExperience: number | null;
  verificationStatus: VerificationStatus;
  primarySpecialty: PublicDoctorDetailSpecialtySummary | null;
  services: PublicDoctorDetailServiceSummary[];
  practiceLocations: PublicDoctorPracticeLocationSummary[];
};

export type PublicCatalogSearchResult = {
  centers: PublicCenterSummary[];
  doctors: PublicDoctorSummary[];
  services: PublicServiceSummary[];
  areas: PublicGeoAreaSummary[];
};

export type PublicListOptions = {
  limit?: number;
};

export type PublicCenterListOptions = PublicListOptions & {
  country?: CountryCode;
  centerType?: CenterType;
};

export type PublicCenterDetailOptions = {
  slug: string;
  country?: CountryCode;
  locale?: PublicCatalogLocale;
  servicesLimit?: number;
  doctorsLimit?: number;
};

export type PublicDoctorListOptions = PublicListOptions & {
  country?: CountryCode;
};

export type PublicDoctorDetailOptions = {
  slug: string;
  country?: CountryCode;
  locale?: PublicCatalogLocale;
  servicesLimit?: number;
  practiceLocationsLimit?: number;
};

export type PublicServiceListOptions = PublicListOptions & {
  categoryId?: string;
};

export type PublicGeoAreaListOptions = PublicListOptions & {
  countryId?: string;
  cityId?: string;
};

export type PublicSearchOptions = PublicListOptions;
