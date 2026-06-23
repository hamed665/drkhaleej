export type GeoScope = 'core' | 'adjacent' | 'deferred' | 'excluded';

export type GeoLaunchPhase = 1 | 2 | 3 | 'deferred' | 'excluded';

export type OmanGovernorate = {
  slug: string;
  labelEn: string;
  labelAr: string;
  countryCode: 'OM';
  scope: GeoScope;
  publicLaunchPhase: GeoLaunchPhase;
  isMvp: boolean;
};

export type OmanWilayat = {
  slug: string;
  governorateSlug: string;
  labelEn: string;
  labelAr: string;
  scope: GeoScope;
  publicLaunchPhase: GeoLaunchPhase;
  isMvp: boolean;
};

export type OmanArea = {
  slug: string;
  governorateSlug: string;
  wilayatSlug: string;
  labelEn: string;
  labelAr: string;
  scope: GeoScope;
  publicLaunchPhase: GeoLaunchPhase;
  isMvp: boolean;
};

export const OMAN_GOVERNORATES: readonly OmanGovernorate[] = [
  { slug: 'muscat', labelEn: 'Muscat Governorate', labelAr: 'محافظة مسقط', countryCode: 'OM', scope: 'core', publicLaunchPhase: 1, isMvp: true },
] as const;

export const OMAN_WILAYATS: readonly OmanWilayat[] = [
  { slug: 'al-amarat', governorateSlug: 'muscat', labelEn: 'Al Amarat', labelAr: 'العامرات', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'bawshar', governorateSlug: 'muscat', labelEn: 'Bawshar', labelAr: 'بوشر', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'muscat', governorateSlug: 'muscat', labelEn: 'Muscat', labelAr: 'مسقط', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'muttrah', governorateSlug: 'muscat', labelEn: 'Muttrah', labelAr: 'مطرح', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'qurayyat', governorateSlug: 'muscat', labelEn: 'Qurayyat', labelAr: 'قريات', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'al-seeb', governorateSlug: 'muscat', labelEn: 'Al Seeb', labelAr: 'السيب', scope: 'core', publicLaunchPhase: 1, isMvp: true },
] as const;

export const OMAN_AREAS: readonly OmanArea[] = [
  { slug: 'al-khuwair', governorateSlug: 'muscat', wilayatSlug: 'bawshar', labelEn: 'Al Khuwair', labelAr: 'الخوير', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'al-ghubrah', governorateSlug: 'muscat', wilayatSlug: 'bawshar', labelEn: 'Al Ghubrah', labelAr: 'الغبرة', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'al-azaiba', governorateSlug: 'muscat', wilayatSlug: 'bawshar', labelEn: 'Al Azaiba', labelAr: 'العذيبة', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'ghala', governorateSlug: 'muscat', wilayatSlug: 'bawshar', labelEn: 'Ghala', labelAr: 'غلا', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'qurum', governorateSlug: 'muscat', wilayatSlug: 'bawshar', labelEn: 'Qurum', labelAr: 'القرم', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'madinat-sultan-qaboos', governorateSlug: 'muscat', wilayatSlug: 'bawshar', labelEn: 'Madinat Sultan Qaboos', labelAr: 'مدينة السلطان قابوس', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'ruwi', governorateSlug: 'muscat', wilayatSlug: 'muttrah', labelEn: 'Ruwi', labelAr: 'روي', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'muttrah', governorateSlug: 'muscat', wilayatSlug: 'muttrah', labelEn: 'Muttrah', labelAr: 'مطرح', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'al-hail', governorateSlug: 'muscat', wilayatSlug: 'al-seeb', labelEn: 'Al Hail', labelAr: 'الحيل', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'al-khoud', governorateSlug: 'muscat', wilayatSlug: 'al-seeb', labelEn: 'Al Khoud', labelAr: 'الخوض', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'al-mawaleh', governorateSlug: 'muscat', wilayatSlug: 'al-seeb', labelEn: 'Al Mawaleh', labelAr: 'الموالح', scope: 'core', publicLaunchPhase: 1, isMvp: true },
  { slug: 'al-seeb', governorateSlug: 'muscat', wilayatSlug: 'al-seeb', labelEn: 'Al Seeb', labelAr: 'السيب', scope: 'core', publicLaunchPhase: 1, isMvp: true },
] as const;

export const OMAN_GEO_REGISTRY = {
  governorates: OMAN_GOVERNORATES,
  wilayats: OMAN_WILAYATS,
  areas: OMAN_AREAS,
} as const;
