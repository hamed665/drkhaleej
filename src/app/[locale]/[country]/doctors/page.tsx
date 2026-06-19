import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DoctorsHeroCarousel } from '@/components/public/doctors/DoctorsHeroCarousel';
import { DoctorsSearch2026 } from '@/components/public/doctors/DoctorsSearch2026';
import { PublicDirectoryListingContent } from '@/components/public/public-directory-listing-content';
import { listPublicDoctors } from '@/lib/catalog/public-queries';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedCountry,
  type SupportedLocale
} from '@/lib/i18n/config';
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from '@/lib/contact/whatsapp';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };

type RouteCopy = {
  metadataTitle: string;
  metadataDescription: string;
  badge: string;
  title: string;
  description: string;
  listCta: string;
  whatsappCta: string;
  whatsappMessage: string;
  whatsappUnavailable: string;
  resultsHeading: string;
  resultsSubtext: string;
};

const copyByLocale: Record<SupportedLocale, RouteCopy> = {
  en: {
    metadataTitle: 'Doctors in Oman | DrMuscat',
    metadataDescription: 'Browse doctors, specialties, clinics and care paths in Oman. Public discovery only, not medical advice.',
    badge: 'Doctors in Oman',
    title: 'Find doctors in Oman.',
    description: 'Browse doctors, specialties, clinics and care paths across Oman. Public discovery only, not medical advice.',
    listCta: 'List your center',
    whatsappCta: 'WhatsApp',
    whatsappMessage: 'Hello DrMuscat, I need help with doctor discovery in Oman.',
    whatsappUnavailable: 'WhatsApp activation pending',
    resultsHeading: 'Browse doctors',
    resultsSubtext: 'Search results and public doctor listings appear here after approval.'
  },
  ar: {
    metadataTitle: 'الأطباء في عُمان | DrMuscat',
    metadataDescription: 'تصفح الأطباء والتخصصات والعيادات ومسارات الرعاية في عُمان. اكتشاف عام فقط وليس نصيحة طبية.',
    badge: 'الأطباء في عُمان',
    title: 'ابحث عن أطباء في عُمان.',
    description: 'تصفح الأطباء والتخصصات والعيادات ومسارات الرعاية في عُمان. اكتشاف عام فقط وليس نصيحة طبية.',
    listCta: 'أدرج مركزك',
    whatsappCta: 'واتساب',
    whatsappMessage: 'مرحباً DrMuscat، أحتاج مساعدة في اكتشاف الأطباء في عُمان.',
    whatsappUnavailable: 'تفعيل واتساب قيد الإعداد',
    resultsHeading: 'تصفح الأطباء',
    resultsSubtext: 'تظهر هنا نتائج البحث وقوائم الأطباء العامة بعد الاعتماد.'
  }
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];

  return buildLocalizedMetadata({
    locale,
    country,
    pathname: '/doctors',
    title: copy.metadataTitle,
    description: copy.metadataDescription
  });
}

export default async function PublicDoctorsPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const copy = copyByLocale[safeLocale];
  const result = await listPublicDoctors({ country: safeCountry });
  const whatsAppNumber = normalizeWhatsAppNumber(process.env.NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER);
  const whatsAppHref = buildWhatsAppUrl(whatsAppNumber, copy.whatsappMessage);

  return (
    <main className="home-foundation dm2026-home-page dm2026-doctors-page" dir={dir} data-country={safeCountry} data-locale={safeLocale}>
      <section className="dm2026-doctors-first-fold dm2026-container" aria-labelledby="dm2026-doctors-title">
        <div className="dm2026-doctors-hero-shell dm2026-search-surface">
          <div className="dm2026-doctors-hero-content">
            <div className="dm2026-doctors-hero__copy">
              <span className="dm2026-badge">{copy.badge}</span>
              <h1 id="dm2026-doctors-title">{copy.title}</h1>
              <p>{copy.description}</p>
            </div>
            <div className="dm2026-doctors-hero__actions" aria-label={copy.badge}>
              <Link className="dm2026-button dm2026-button-secondary" href={`/${safeLocale}/${safeCountry}/for-providers`}>{copy.listCta}</Link>
              {whatsAppHref ? (
                <a className="dm2026-button dm2026-button-ghost" href={whatsAppHref} target="_blank" rel="noopener noreferrer">{copy.whatsappCta}</a>
              ) : (
                <span className="dm2026-button dm2026-button-ghost" aria-disabled="true" title={copy.whatsappUnavailable}>{copy.whatsappCta}</span>
              )}
            </div>
            <div id="doctor-search" className="dm2026-doctors-hero__search">
              <DoctorsSearch2026 locale={safeLocale} country={safeCountry} dir={dir} resultsId="doctor-results" />
            </div>
          </div>

          <DoctorsHeroCarousel locale={safeLocale} dir={dir} />
        </div>
      </section>

      <section id="doctor-results" className="dm2026-container dm2026-doctors-listings" aria-labelledby="doctor-results-title">
        <div className="dm2026-doctors-results-header dm2026-card-soft">
          <h2 id="doctor-results-title">{copy.resultsHeading}</h2>
          <p>{copy.resultsSubtext}</p>
        </div>
        <PublicDirectoryListingContent locale={safeLocale} variant="doctor" result={result} />
      </section>
    </main>
  );
}
