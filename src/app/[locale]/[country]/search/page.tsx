import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { searchPublicCatalog } from '@/lib/catalog/public-eligible-queries';
import type { PublicCatalogLocale, PublicCenterSummary, PublicDoctorSummary, PublicGeoAreaSummary, PublicServiceSummary } from '@/lib/catalog/public-types';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedCountry,
  type SupportedLocale
} from '@/lib/i18n/config';
import { publicCenterDetailRoute, publicDoctorDetailRoute } from '@/lib/routes/public';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };
type SearchParams = Record<string, string | string[] | undefined>;
type SearchCopy = {
  title: string;
  description: string;
  badge: string;
  searchTermLabel: string;
  emptyTitle: string;
  emptyBody: string;
  errorTitle: string;
  errorBody: string;
  doctorsTitle: string;
  centersTitle: string;
  servicesTitle: string;
  areasTitle: string;
  noResults: string;
  profileCta: string;
  previewOnly: string;
};

const explicitSearchRobots: Metadata['robots'] = { index: false, follow: true };

const copyByLocale: Record<SupportedLocale, SearchCopy> = {
  en: {
    title: 'Search Healthcare in Oman',
    description: 'Search reviewed public doctors, clinics, services and areas in Oman. Public discovery only; confirm details directly with providers.',
    badge: 'Public discovery search',
    searchTermLabel: 'Search term',
    emptyTitle: 'Start with a search term',
    emptyBody: 'Use the home search box or add a search term. Results appear only from public eligible data.',
    errorTitle: 'Search is temporarily unavailable',
    errorBody: 'Public search could not be loaded safely. No private data is exposed here.',
    doctorsTitle: 'Doctors',
    centersTitle: 'Centers',
    servicesTitle: 'Services',
    areasTitle: 'Areas',
    noResults: 'No public eligible results were found for this search yet.',
    profileCta: 'View public profile',
    previewOnly: 'Preview only'
  },
  ar: {
    title: 'البحث عن الرعاية الصحية في عُمان',
    description: 'ابحث في بيانات عامة تمت مراجعتها للأطباء والعيادات والخدمات والمناطق في عُمان. اكتشاف عام فقط، ويجب تأكيد التفاصيل مباشرة مع مقدمي الخدمة.',
    badge: 'بحث الاكتشاف العام',
    searchTermLabel: 'عبارة البحث',
    emptyTitle: 'ابدأ بعبارة بحث',
    emptyBody: 'استخدم مربع البحث في الصفحة الرئيسية أو أضف عبارة بحث. تظهر النتائج فقط من البيانات العامة المؤهلة.',
    errorTitle: 'البحث غير متاح مؤقتاً',
    errorBody: 'تعذر تحميل البحث العام بأمان. لا يتم عرض أي بيانات خاصة هنا.',
    doctorsTitle: 'الأطباء',
    centersTitle: 'المراكز',
    servicesTitle: 'الخدمات',
    areasTitle: 'المناطق',
    noResults: 'لا توجد نتائج عامة مؤهلة لهذا البحث حتى الآن.',
    profileCta: 'عرض الملف العام',
    previewOnly: 'معاينة فقط'
  }
};

function firstSearchParamValue(value: string | string[] | undefined): string {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return rawValue ? rawValue.trim().slice(0, 80) : '';
}

function preferredText(locale: PublicCatalogLocale, en: string | null, ar: string | null): string | null {
  return locale === 'ar' ? ar ?? en : en ?? ar;
}

function neutralLabel(value: string): string {
  return value
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(' ');
}

function ResultCard({
  title,
  description,
  label,
  href,
  cta,
}: {
  title: string;
  description?: string | null;
  label?: string | null;
  href?: string | null;
  cta: string;
}) {
  return (
    <li className="rounded-3xl border border-emerald-100/80 bg-white/85 p-4 shadow-sm ring-1 ring-white/70 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:p-5">
      <div className="space-y-3">
        {label ? <p className="inline-flex w-fit rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{label}</p> : null}
        <h3 className="text-base font-semibold leading-7 text-slate-950">
          {href ? (
            <Link href={href} className="underline-offset-4 hover:text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        {description ? <p className="text-sm leading-6 text-slate-600">{description}</p> : null}
        {href ? (
          <Link href={href} className="inline-flex text-xs font-semibold text-emerald-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
            {cta}
          </Link>
        ) : null}
      </div>
    </li>
  );
}

function ResultGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-white via-emerald-50/30 to-cyan-50/30 p-4 shadow-[0_18px_50px_rgba(15,118,110,0.08)] ring-1 ring-white/80 sm:p-6">
      <h2 className="text-lg font-semibold leading-7 tracking-[-0.01em] text-slate-950 sm:text-xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];
  const metadata = buildLocalizedMetadata({ locale, country, pathname: '/search', title: copy.title, description: copy.description });
  return { ...metadata, robots: explicitSearchRobots };
}

export default async function PublicSearchPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<SearchParams> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const copy = copyByLocale[safeLocale];
  const submitted = await searchParams;
  const query = firstSearchParamValue(submitted.q);
  const result = query.length >= 2 ? await searchPublicCatalog(query, { limit: 12 }) : null;
  const hasResults = Boolean(result?.ok && (result.data.centers.length || result.data.doctors.length || result.data.services.length || result.data.areas.length));

  return (
    <main className="home-foundation dm2026-home-page dm-public-search" dir={dir} data-country={safeCountry} data-locale={safeLocale}>
      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:px-8 lg:py-12" aria-labelledby="dm-public-search-title">
        <div className="rounded-[2rem] border border-emerald-100/80 bg-gradient-to-br from-white via-emerald-50/40 to-cyan-50/40 p-5 shadow-[0_24px_70px_rgba(15,118,110,0.1)] ring-1 ring-white/80 sm:p-8">
          <p className="inline-flex w-fit rounded-full border border-emerald-100 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">{copy.badge}</p>
          <h1 id="dm-public-search-title" className="mt-4 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{copy.description}</p>
          {query ? (
            <p className="mt-5 inline-flex rounded-full border border-emerald-100 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700">
              {copy.searchTermLabel}: <span className="ms-1 text-emerald-800">{query}</span>
            </p>
          ) : null}
        </div>

        {!query ? (
          <ResultGroup title={copy.emptyTitle}>
            <p className="text-sm leading-7 text-slate-600">{copy.emptyBody}</p>
          </ResultGroup>
        ) : null}

        {result && !result.ok ? (
          <ResultGroup title={copy.errorTitle}>
            <p className="text-sm leading-7 text-slate-600">{copy.errorBody}</p>
          </ResultGroup>
        ) : null}

        {result?.ok && !hasResults ? (
          <ResultGroup title={copy.noResults}>
            <p className="text-sm leading-7 text-slate-600">{copy.noResults}</p>
          </ResultGroup>
        ) : null}

        {result?.ok && result.data.doctors.length > 0 ? (
          <ResultGroup title={copy.doctorsTitle}>
            <ul className="grid gap-3 md:grid-cols-2" role="list">
              {result.data.doctors.map((doctor: PublicDoctorSummary) => {
                const name = preferredText(safeLocale, doctor.fullNameEn, doctor.fullNameAr) ?? doctor.fullNameEn;
                const href = publicDoctorDetailRoute(safeLocale, doctor.defaultCountry, doctor.slug);
                return <ResultCard key={doctor.id} title={name} label={neutralLabel(doctor.titleEn)} href={href} cta={copy.profileCta} />;
              })}
            </ul>
          </ResultGroup>
        ) : null}

        {result?.ok && result.data.centers.length > 0 ? (
          <ResultGroup title={copy.centersTitle}>
            <ul className="grid gap-3 md:grid-cols-2" role="list">
              {result.data.centers.map((center: PublicCenterSummary) => {
                const name = preferredText(safeLocale, center.nameEn, center.nameAr) ?? center.nameEn;
                const description = preferredText(safeLocale, center.shortDescriptionEn, center.shortDescriptionAr) ?? preferredText(safeLocale, center.descriptionEn, center.descriptionAr);
                const href = publicCenterDetailRoute(safeLocale, center.defaultCountry, center.slug);
                return <ResultCard key={center.id} title={name} description={description} label={neutralLabel(center.centerType)} href={href} cta={copy.profileCta} />;
              })}
            </ul>
          </ResultGroup>
        ) : null}

        {result?.ok && result.data.services.length > 0 ? (
          <ResultGroup title={copy.servicesTitle}>
            <ul className="grid gap-3 md:grid-cols-2" role="list">
              {result.data.services.map((service: PublicServiceSummary) => {
                const name = preferredText(safeLocale, service.nameEn, service.nameAr) ?? service.nameEn;
                const description = preferredText(safeLocale, service.descriptionEn, service.descriptionAr);
                return <ResultCard key={service.id} title={name} description={description} label={copy.previewOnly} cta={copy.profileCta} />;
              })}
            </ul>
          </ResultGroup>
        ) : null}

        {result?.ok && result.data.areas.length > 0 ? (
          <ResultGroup title={copy.areasTitle}>
            <ul className="grid gap-3 md:grid-cols-2" role="list">
              {result.data.areas.map((area: PublicGeoAreaSummary) => {
                const name = preferredText(safeLocale, area.nameEn, area.nameAr) ?? area.nameEn;
                return <ResultCard key={area.id} title={name} label={copy.previewOnly} cta={copy.profileCta} />;
              })}
            </ul>
          </ResultGroup>
        ) : null}
      </section>
    </main>
  );
}
