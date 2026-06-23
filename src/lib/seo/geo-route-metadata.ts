import type { Metadata } from 'next';

import type { GeoLaunchPhase, GeoScope } from '@/config/geo/oman';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

export type OmanGeoMetadataEntity = 'governorate' | 'wilayat' | 'area';

export type OmanGeoMetadataItem = {
  slug: string;
  labelEn: string;
  labelAr: string;
  scope: GeoScope;
  publicLaunchPhase: GeoLaunchPhase;
  isMvp: boolean;
};

type BuildOmanGeoNoindexMetadataInput = {
  locale: SupportedLocale;
  country: SupportedCountry;
  entity: OmanGeoMetadataEntity;
  item: OmanGeoMetadataItem;
  pathname: string;
  parentLabel?: string;
};

const entityLabelByLocale: Record<SupportedLocale, Record<OmanGeoMetadataEntity, string>> = {
  en: {
    governorate: 'Governorate',
    wilayat: 'Wilayat',
    area: 'Area',
  },
  ar: {
    governorate: 'محافظة',
    wilayat: 'ولاية',
    area: 'منطقة',
  },
};

const noindexRobots: Metadata['robots'] = {
  index: false,
  follow: true,
  googleBot: {
    index: false,
    follow: true,
  },
};

function labelForLocale(item: OmanGeoMetadataItem, locale: SupportedLocale): string {
  return locale === 'ar' ? item.labelAr : item.labelEn;
}

function buildTitle(locale: SupportedLocale, entity: OmanGeoMetadataEntity, label: string): string {
  if (locale === 'ar') {
    return `${label} | DrMuscat عُمان`;
  }

  return `${label} ${entityLabelByLocale.en[entity]} | DrMuscat Oman`;
}

function buildDescription(locale: SupportedLocale, entity: OmanGeoMetadataEntity, label: string, parentLabel?: string): string {
  if (locale === 'ar') {
    const parent = parentLabel ? ` ضمن ${parentLabel}` : '';
    return `صفحة اكتشاف مبدئية لـ ${entityLabelByLocale.ar[entity]} ${label}${parent} في عُمان. الصفحة غير مفهرسة حالياً حتى تكتمل البيانات والقوائم.`;
  }

  const parent = parentLabel ? ` in ${parentLabel}` : '';
  return `Runtime scaffold page for ${label} ${entityLabelByLocale.en[entity]}${parent} in Oman. This page is currently noindex until listings and SEO content are ready.`;
}

export function buildOmanGeoNoindexMetadata(input: BuildOmanGeoNoindexMetadataInput): Metadata {
  const label = labelForLocale(input.item, input.locale);
  const title = buildTitle(input.locale, input.entity, label);
  const description = buildDescription(input.locale, input.entity, label, input.parentLabel);

  return {
    ...buildLocalizedMetadata({
      locale: input.locale,
      country: input.country,
      pathname: input.pathname,
      title,
      description,
    }),
    robots: noindexRobots,
  };
}
