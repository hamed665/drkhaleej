import { buildOmanGeoPath, type OmanAdapterGeoEntity } from '@/lib/geo/oman-country-adapter';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { homeRoute, publicDiscoveryRoute, type PublicDiscoverySlug } from '@/lib/routes/public';

export type InternalLinkIntent =
  | 'home'
  | 'directory'
  | 'area'
  | 'wilayat'
  | 'governorate'
  | 'nearby-directory'
  | 'provider-acquisition'
  | 'search';

export type InternalLinkPriority = 'primary' | 'secondary' | 'supporting';

export type InternalLinkDefinition = {
  key: string;
  href: string;
  label: string;
  intent: InternalLinkIntent;
  priority: InternalLinkPriority;
};

export type DirectoryInternalLinkInput = {
  locale: SupportedLocale;
  country: SupportedCountry;
  currentSlug?: PublicDiscoverySlug | null;
  includeSearch?: boolean;
  includeProviderAcquisition?: boolean;
};

export type GeoInternalLinkInput = {
  locale: SupportedLocale;
  country: SupportedCountry;
  entity: OmanAdapterGeoEntity;
  slug: string;
  label: string;
  parentLabel?: string | null;
  directorySlugs?: readonly PublicDiscoverySlug[];
};

const discoveryLabels: Record<SupportedLocale, Record<PublicDiscoverySlug, string>> = {
  en: {
    doctors: 'Doctors',
    dental: 'Dental clinics',
    centers: 'Medical centers',
    labs: 'Labs',
    pharmacies: 'Pharmacies',
    hospitals: 'Hospitals',
    offers: 'Healthcare offers',
    beauty: 'Beauty clinics',
    'pet-clinics': 'Pet clinics',
    'pet-shops': 'Pet shops',
    services: 'Healthcare services',
    search: 'Search'
  },
  ar: {
    doctors: 'الأطباء',
    dental: 'عيادات الأسنان',
    centers: 'المراكز الطبية',
    labs: 'المختبرات',
    pharmacies: 'الصيدليات',
    hospitals: 'المستشفيات',
    offers: 'عروض الرعاية الصحية',
    beauty: 'عيادات التجميل',
    'pet-clinics': 'عيادات الحيوانات الأليفة',
    'pet-shops': 'متاجر الحيوانات الأليفة',
    services: 'خدمات الرعاية الصحية',
    search: 'البحث'
  }
};

const acquisitionLabels: Record<SupportedLocale, string> = {
  en: 'List your center',
  ar: 'أدرج مركزك'
};

const homeLabels: Record<SupportedLocale, string> = {
  en: 'DrKhaleej home',
  ar: 'الرئيسية في دكتور خليج'
};

const defaultDirectorySlugs: readonly PublicDiscoverySlug[] = [
  'doctors',
  'dental',
  'centers',
  'labs',
  'pharmacies',
  'hospitals',
  'beauty',
  'services'
];

function uniqueLinks(links: readonly InternalLinkDefinition[]): InternalLinkDefinition[] {
  const seen = new Set<string>();
  const unique: InternalLinkDefinition[] = [];

  for (const link of links) {
    if (seen.has(link.key)) {
      continue;
    }

    seen.add(link.key);
    unique.push(link);
  }

  return unique;
}

function directoryLink(locale: SupportedLocale, country: SupportedCountry, slug: PublicDiscoverySlug, priority: InternalLinkPriority): InternalLinkDefinition {
  return {
    key: `directory:${slug}`,
    href: publicDiscoveryRoute(locale, country, slug),
    label: discoveryLabels[locale][slug],
    intent: slug === 'search' ? 'search' : 'directory',
    priority
  };
}

export function createDirectoryInternalLinks({
  locale,
  country,
  currentSlug = null,
  includeSearch = true,
  includeProviderAcquisition = true
}: DirectoryInternalLinkInput): InternalLinkDefinition[] {
  const links: InternalLinkDefinition[] = [
    {
      key: 'home',
      href: homeRoute(locale, country),
      label: homeLabels[locale],
      intent: 'home',
      priority: 'supporting'
    }
  ];

  for (const slug of defaultDirectorySlugs) {
    if (slug === currentSlug) {
      continue;
    }

    links.push(directoryLink(locale, country, slug, currentSlug ? 'secondary' : 'primary'));
  }

  if (includeSearch && currentSlug !== 'search') {
    links.push(directoryLink(locale, country, 'search', 'supporting'));
  }

  if (includeProviderAcquisition) {
    links.push({
      key: 'for-providers',
      href: `/${locale}/${country}/for-providers`,
      label: acquisitionLabels[locale],
      intent: 'provider-acquisition',
      priority: 'supporting'
    });
  }

  return uniqueLinks(links);
}

export function createGeoInternalLinks({
  locale,
  country,
  entity,
  slug,
  label,
  parentLabel = null,
  directorySlugs = defaultDirectorySlugs
}: GeoInternalLinkInput): InternalLinkDefinition[] {
  const geoHref = `/${locale}/${country}${buildOmanGeoPath(entity, slug)}`;
  const geoLabel = parentLabel ? `${label} · ${parentLabel}` : label;
  const links: InternalLinkDefinition[] = [
    {
      key: `${entity}:${slug}`,
      href: geoHref,
      label: geoLabel,
      intent: entity,
      priority: 'primary'
    },
    {
      key: 'home',
      href: homeRoute(locale, country),
      label: homeLabels[locale],
      intent: 'home',
      priority: 'supporting'
    }
  ];

  for (const directorySlug of directorySlugs) {
    links.push({
      ...directoryLink(locale, country, directorySlug, 'secondary'),
      key: `geo:${entity}:${slug}:directory:${directorySlug}`,
      intent: 'nearby-directory'
    });
  }

  return uniqueLinks(links);
}

export function selectPrimaryInternalLinks(links: readonly InternalLinkDefinition[], limit = 6): InternalLinkDefinition[] {
  const priorityOrder: Record<InternalLinkPriority, number> = {
    primary: 0,
    secondary: 1,
    supporting: 2
  };

  return [...links]
    .sort((left, right) => priorityOrder[left.priority] - priorityOrder[right.priority])
    .slice(0, Math.max(0, Math.floor(limit)));
}
