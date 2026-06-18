'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { SupportedCountry } from '@/lib/i18n/config';
import type { PublicCatalogLocale, PublicCatalogQueryResult, PublicDoctorSummary } from '@/lib/catalog/public-types';

type Props = {
  locale: PublicCatalogLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
  result: PublicCatalogQueryResult<PublicDoctorSummary[]>;
};

const en = {
  badge: 'Doctor discovery · Oman',
  title: 'Find doctors in Oman with DrMuscat.',
  body: 'A premium public discovery page prepared for approved doctor profiles, helpful guides, visibility slots, and reviewed offers.',
  search: 'Search doctors',
  providers: 'List your center',
  imageTitle: 'Image-ready hero space',
  imageBody: 'Prepared for a real approved doctor, clinic, or editorial image.',
  placeholder: 'Search doctor name or title…',
  reset: 'Reset',
  emptyTitle: 'Doctor profiles are ready to appear here after approval.',
  emptyBody: 'No public doctor listings are published yet. Private or unreviewed records stay hidden.',
  noMatch: 'No doctors match this search yet.',
  loadError: 'Doctor listings could not be loaded.',
  profile: 'View profile',
  note: 'Confirm details directly with the provider.',
  ads: 'Sponsored placement',
  adsTitle: 'Doctor visibility slots, clearly labeled.',
  offers: 'Special offers',
  offersTitle: 'Reviewed care offers can sit beside doctor discovery.',
  articles: 'Guides',
  articlesTitle: 'Helpful guides for choosing care.',
  faq: 'FAQ',
  faqTitle: 'Before using doctor discovery',
  safety: 'Discovery safety',
  chips: ['Pediatrics', 'Dermatology', 'Dentistry', 'Gynecology', 'ENT', 'Orthopedics'],
  safetyItems: ['Public discovery only', 'Informational only', 'Approved listings only']
};

const ar: typeof en = {
  ...en,
  badge: 'اكتشاف الأطباء · عُمان',
  title: 'ابحث عن أطباء في عُمان عبر DrMuscat.',
  body: 'صفحة اكتشاف عامة مميزة جاهزة لملفات الأطباء المعتمدة والأدلة ومساحات الظهور والعروض بعد المراجعة.',
  search: 'ابحث عن الأطباء',
  providers: 'أدرج مركزك',
  imageTitle: 'مساحة صورة جاهزة',
  imageBody: 'مجهزة لصورة طبيب أو عيادة أو صورة تحريرية معتمدة.',
  placeholder: 'ابحث باسم الطبيب أو اللقب…',
  reset: 'إعادة',
  emptyTitle: 'ملفات الأطباء جاهزة للظهور هنا بعد الاعتماد.',
  emptyBody: 'لا توجد قوائم أطباء عامة منشورة بعد. تبقى السجلات الخاصة أو غير المراجعة مخفية.',
  noMatch: 'لا توجد نتائج مطابقة لهذا البحث حالياً.',
  loadError: 'تعذر تحميل قوائم الأطباء.',
  profile: 'عرض الملف',
  note: 'يرجى تأكيد التفاصيل مباشرة مع مقدم الخدمة.',
  ads: 'مساحة ممولة',
  adsTitle: 'مساحات ظهور للأطباء مع تمييز واضح.',
  offers: 'عروض خاصة',
  offersTitle: 'يمكن للعروض المعتمدة أن تظهر بجانب اكتشاف الأطباء.',
  articles: 'أدلة',
  articlesTitle: 'أدلة مفيدة لاختيار الرعاية.',
  faq: 'أسئلة',
  faqTitle: 'قبل استخدام اكتشاف الأطباء',
  safety: 'سلامة الاكتشاف',
  chips: ['طب الأطفال', 'جلدية', 'أسنان', 'نساء وولادة', 'أنف وأذن وحنجرة', 'عظام'],
  safetyItems: ['اكتشاف عام فقط', 'معلومات فقط', 'قوائم معتمدة فقط']
};

function label(value: string): string {
  return value.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
}

function text(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function doctorText(doctor: PublicDoctorSummary): string {
  return [doctor.fullNameEn, doctor.fullNameAr ?? '', doctor.titleEn, doctor.titleAr, doctor.gender, doctor.defaultCountry].join(' ').toLowerCase();
}

export function DoctorsPageDm2026({ locale, country, dir, result }: Props) {
  const t = locale === 'ar' ? ar : en;
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const doctors = useMemo(() => (result.ok ? result.data : []), [result]);
  const normalizedQuery = text(query);
  const visibleDoctors = useMemo(() => {
    if (!normalizedQuery) return doctors;
    return doctors.filter((doctor) => doctorText(doctor).includes(normalizedQuery));
  }, [doctors, normalizedQuery]);

  return (
    <main className="dm2026-shell dm2026-doctors-page" dir={dir}>
      <section className="dm2026-doctors-hero">
        <div className="dm2026-container dm2026-doctors-hero__grid">
          <div className="dm2026-glass dm2026-doctors-hero__copy">
            <span className="dm2026-badge">{t.badge}</span>
            <h1>{t.title}</h1>
            <p>{t.body}</p>
            <div className="dm2026-doctors-hero__actions">
              <a className="dm2026-button dm2026-button-primary" href="#doctor-search">{t.search}</a>
              <Link className="dm2026-button dm2026-button-secondary" href={`/${locale}/${country}/for-providers`}>{t.providers}</Link>
            </div>
          </div>
          <figure className="dm2026-card-glass dm2026-doctors-image-card">
            <div className="dm2026-doctors-image-slot"><figcaption className="dm2026-doctors-image-slot__copy"><strong>{t.imageTitle}</strong><span>{t.imageBody}</span></figcaption></div>
          </figure>
        </div>
      </section>

      <section id="doctor-search" className="dm2026-container dm2026-doctors-search-section">
        <div className="dm2026-search-surface dm2026-doctors-search">
          <header className="dm2026-doctors-search__header"><span className="dm2026-badge">{t.search}</span><h2>{t.search}</h2><p>{t.body}</p></header>
          <form className="dm2026-doctors-search__row" onSubmit={(event) => event.preventDefault()}>
            <label className="sr-only" htmlFor="doctors-page-search">{t.placeholder}</label>
            <input className="dm2026-input" id="doctors-page-search" onChange={(event) => { setQuery(event.target.value); setActiveChip(null); }} placeholder={t.placeholder} type="search" value={query} />
            <button className="dm2026-button dm2026-button-primary" type="submit">{t.search}</button>
          </form>
          <div className="dm2026-doctors-chip-row">
            {t.chips.map((chip) => <button className="dm2026-doctors-chip" data-active={activeChip === chip ? 'true' : undefined} key={chip} onClick={() => { setQuery(chip); setActiveChip(chip); }} type="button">{chip}</button>)}
          </div>
        </div>
      </section>

      <section className="dm2026-container dm2026-doctors-results">
        <div className="dm2026-doctors-results__meta"><span><strong>{visibleDoctors.length}</strong> / {doctors.length}</span><button className="dm2026-button dm2026-button-ghost" onClick={() => { setQuery(''); setActiveChip(null); }} type="button">{t.reset}</button></div>
        {!result.ok ? <div className="dm2026-card-glass dm2026-doctors-empty"><h3>{t.loadError}</h3></div> : null}
        {result.ok && doctors.length === 0 ? <div className="dm2026-card-glass dm2026-doctors-empty"><h3>{t.emptyTitle}</h3><p>{t.emptyBody}</p></div> : null}
        {result.ok && doctors.length > 0 && visibleDoctors.length === 0 ? <div className="dm2026-card-glass dm2026-doctors-empty"><h3>{t.noMatch}</h3></div> : null}
        {visibleDoctors.length > 0 ? <ul className="dm2026-doctors-card-grid">{visibleDoctors.map((doctor) => <li key={doctor.id}><Link className="dm2026-card-glass dm2026-doctor-card" href={`/${locale}/${country}/doctor/${doctor.slug}`}><span className="dm2026-doctor-card__top"><span className="dm2026-doctor-card__photo">Dr</span><span><span className="dm2026-badge">{label(doctor.titleEn)}</span><h3>{locale === 'ar' ? doctor.fullNameAr ?? doctor.fullNameEn : doctor.fullNameEn}</h3></span></span><p>{t.note}</p><span className="dm2026-doctor-card__footer"><span className="dm2026-badge">{doctor.defaultCountry.toUpperCase()}</span><span className="dm2026-button dm2026-button-ghost">{t.profile}</span></span></Link></li>)}</ul> : null}
      </section>

      <section className="dm2026-container dm2026-section"><div className="dm2026-doctors-compact-grid"><article className="dm2026-card-glass dm2026-doctors-module"><span className="dm2026-badge">{t.ads}</span><h3>{t.adsTitle}</h3></article><article className="dm2026-card-glass dm2026-doctors-module"><span className="dm2026-badge">{t.offers}</span><h3>{t.offersTitle}</h3></article></div></section>
      <section className="dm2026-container dm2026-section"><header className="dm2026-section-header dm2026-doctors-section-header"><span className="dm2026-badge">{t.articles}</span><h2>{t.articlesTitle}</h2></header></section>
      <section className="dm2026-container dm2026-section"><header className="dm2026-section-header dm2026-doctors-section-header"><span className="dm2026-badge">{t.faq}</span><h2>{t.faqTitle}</h2></header></section>
      <section className="dm2026-container"><div className="dm2026-glass dm2026-doctors-safety"><strong>{t.safety}</strong><ul>{t.safetyItems.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
    </main>
  );
}
