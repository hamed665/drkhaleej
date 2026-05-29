import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicProviderPlans } from '@/components/public/public-provider-plans';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedLocale
} from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };

type ProviderPlansPageCopy = {
  metadataTitle: string;
  metadataDescription: string;
};

const copyByLocale: Record<SupportedLocale, ProviderPlansPageCopy> = {
  en: {
    metadataTitle: 'Provider Plans for Clinics in Oman | DrMuscat',
    metadataDescription:
      'Explore DrMuscat provider listing options for clinics and medical centers in Oman. Manual onboarding, SEO-friendly profiles, media, contact options, and future sponsored visibility.'
  },
  ar: {
    metadataTitle: 'خطط مقدمي الخدمة للمراكز الصحية في عُمان | DrMuscat',
    metadataDescription:
      'تعرّف على خيارات ظهور المراكز والعيادات على DrMuscat في عُمان، مع ملفات تعريف مناسبة لمحركات البحث وخيارات تواصل ووسائط وظهور ممول مستقبلاً.'
  }
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};

  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({
    locale,
    country,
    pathname: '/for-providers',
    title: copy.metadataTitle,
    description: copy.metadataDescription
  });
}

export default async function PublicProviderPlansPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  return <PublicProviderPlans locale={locale} country={country} dir={localeDirection(locale)} />;
}
