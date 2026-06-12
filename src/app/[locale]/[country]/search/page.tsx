import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedLocale
} from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

type Params = { locale: string; country: string };
type SearchParams = Record<string, string | string[] | undefined>;
type FilterKey = 'q' | 'providerType' | 'specialty' | 'city' | 'area' | 'contentType';

type RouteCopy = {
  title: string;
  description: string;
  badge: string;
  submittedHeading: string;
  noFiltersHeading: string;
  emptyLabel: string;
  preparationHeading: string;
  preparationBody: string;
  preparationItems: readonly string[];
  labels: Record<FilterKey, string>;
  emptyValue: string;
};

const filterKeys: readonly FilterKey[] = ['q', 'contentType', 'providerType', 'specialty', 'city', 'area'];

const styles = {
  main: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fbfb 0%, #edf7f6 100%)',
    color: '#102a2a',
    padding: 'clamp(2rem, 5vw, 5rem) clamp(1rem, 4vw, 4rem)'
  },
  section: {
    width: 'min(100%, 72rem)',
    marginInline: 'auto'
  },
  hero: {
    display: 'grid',
    gap: '1rem',
    paddingBlock: 'clamp(1rem, 3vw, 3rem)'
  },
  badge: {
    width: 'fit-content',
    border: '1px solid rgba(16, 42, 42, 0.12)',
    borderRadius: '999px',
    background: 'rgba(255, 255, 255, 0.78)',
    color: '#10756e',
    fontSize: '0.8rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    padding: '0.45rem 0.75rem',
    textTransform: 'uppercase'
  },
  rtlBadge: {
    letterSpacing: 0
  },
  h1: {
    maxWidth: '52rem',
    fontSize: 'clamp(2.25rem, 6vw, 5rem)',
    lineHeight: 0.98,
    letterSpacing: '-0.06em',
    margin: 0
  },
  rtlH1: {
    letterSpacing: 0,
    lineHeight: 1.12
  },
  h2: {
    margin: 0,
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    lineHeight: 1.1
  },
  p: {
    color: '#466566',
    fontSize: 'clamp(1rem, 2vw, 1.15rem)',
    lineHeight: 1.75,
    margin: 0
  },
  panel: {
    width: 'min(100%, 72rem)',
    marginInline: 'auto',
    border: '1px solid rgba(16, 42, 42, 0.1)',
    borderRadius: '2rem',
    background: 'rgba(255, 255, 255, 0.88)',
    boxShadow: '0 1.5rem 4rem rgba(15, 67, 65, 0.08)',
    marginBlockStart: '1.25rem',
    padding: 'clamp(1.25rem, 4vw, 2.5rem)',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))',
    gap: 'clamp(1rem, 3vw, 2rem)',
    alignItems: 'start'
  },
  stack: {
    display: 'grid',
    gap: '0.85rem'
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))',
    gap: '0.75rem',
    margin: 0
  },
  filterCard: {
    border: '1px solid rgba(16, 42, 42, 0.1)',
    borderRadius: '1.1rem',
    background: '#f8fbfb',
    padding: '0.9rem'
  },
  dt: {
    color: '#6d8585',
    fontSize: '0.78rem',
    fontWeight: 800,
    textTransform: 'uppercase'
  },
  dd: {
    margin: '0.25rem 0 0',
    color: '#102a2a',
    fontSize: '1rem',
    fontWeight: 800,
    overflowWrap: 'anywhere'
  },
  ul: {
    display: 'grid',
    gap: '0.6rem',
    margin: 0,
    paddingInlineStart: '1.2rem'
  },
  li: {
    color: '#466566',
    fontSize: 'clamp(1rem, 2vw, 1.15rem)',
    lineHeight: 1.75
  }
} satisfies Record<string, CSSProperties>;

const copyByLocale: Record<SupportedLocale, RouteCopy> = {
  en: {
    title: 'Search Healthcare in Oman',
    description: 'Search requests are now routed safely while DrMuscat expands public discovery with reviewed provider information.',
    badge: 'Public discovery search',
    submittedHeading: 'Submitted search filters',
    noFiltersHeading: 'Start a public healthcare search',
    emptyLabel: 'No search filters were submitted yet.',
    preparationHeading: 'Search results are being prepared',
    preparationBody:
      'DrMuscat is expanding public discovery as reviewed provider information is onboarded. Results will appear only when safe public listing data is available, so this page does not show fake counts, ratings, reviews, or verified badges.',
    preparationItems: [
      'Your search is preserved in the route query parameters.',
      'Public provider discovery will use reviewed public information only.',
      'Confirm clinical details directly with the provider before making care decisions.'
    ],
    labels: {
      q: 'Search term',
      providerType: 'Provider type',
      specialty: 'Specialty',
      city: 'City',
      area: 'Area',
      contentType: 'Search category'
    },
    emptyValue: 'Not selected'
  },
  ar: {
    title: 'البحث عن الرعاية الصحية في عُمان',
    description: 'أصبحت طلبات البحث مرتبطة بالمسار بأمان بينما يوسّع DrMuscat الاكتشاف العام بمعلومات مقدمي الخدمة بعد مراجعتها.',
    badge: 'بحث الاكتشاف العام',
    submittedHeading: 'فلاتر البحث المرسلة',
    noFiltersHeading: 'ابدأ بحثًا عامًا عن الرعاية الصحية',
    emptyLabel: 'لم يتم إرسال فلاتر بحث بعد.',
    preparationHeading: 'يتم تجهيز نتائج البحث',
    preparationBody:
      'يوسّع DrMuscat الاكتشاف العام مع إدخال معلومات مقدمي الخدمة بعد مراجعتها. ستظهر النتائج فقط عند توفر بيانات عامة آمنة، لذلك لا تعرض هذه الصفحة أعدادًا أو تقييمات أو مراجعات أو شارات موثقة وهمية.',
    preparationItems: [
      'يتم حفظ البحث في معاملات الاستعلام داخل المسار.',
      'سيستخدم الاكتشاف العام معلومات عامة تمت مراجعتها فقط.',
      'يرجى تأكيد التفاصيل الطبية مباشرة مع مقدم الخدمة قبل اتخاذ قرارات الرعاية.'
    ],
    labels: {
      q: 'عبارة البحث',
      providerType: 'نوع مقدم الخدمة',
      specialty: 'التخصص',
      city: 'المدينة',
      area: 'المنطقة',
      contentType: 'فئة البحث'
    },
    emptyValue: 'غير محدد'
  }
};

const firstSearchParamValue = (value: string | string[] | undefined) => {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return '';
  }

  return rawValue.trim().slice(0, 120);
};

const submittedFilters = (searchParams: SearchParams) =>
  filterKeys
    .map((key) => ({ key, value: firstSearchParamValue(searchParams[key]) }))
    .filter(({ value }) => value.length > 0);

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    return {};
  }

  const copy = copyByLocale[locale];

  return buildLocalizedMetadata({
    locale,
    country,
    pathname: '/search',
    title: copy.title,
    description: copy.description
  });
}

export default async function PublicRoutePage({
  params,
  searchParams
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    notFound();
  }

  const copy = copyByLocale[locale];
  const dir = localeDirection(locale);
  const filters = submittedFilters(await searchParams);
  const hasFilters = filters.length > 0;

  const badgeStyle = dir === 'rtl' ? { ...styles.badge, ...styles.rtlBadge } : styles.badge;
  const h1Style = dir === 'rtl' ? { ...styles.h1, ...styles.rtlH1 } : styles.h1;

  return (
    <main className="dm-public-search" dir={dir} style={styles.main}>
      <section className="dm-public-search__hero" aria-labelledby="dm-public-search-title" style={{ ...styles.section, ...styles.hero }}>
        <span className="dm-public-search__badge" style={badgeStyle}>{copy.badge}</span>
        <h1 id="dm-public-search-title" style={h1Style}>{copy.title}</h1>
        <p style={styles.p}>{copy.description}</p>
      </section>

      <section className="dm-public-search__panel" aria-labelledby="dm-public-search-summary-title" style={styles.panel}>
        <div style={styles.stack}>
          <span style={badgeStyle}>{hasFilters ? copy.submittedHeading : copy.noFiltersHeading}</span>
          <h2 id="dm-public-search-summary-title" style={styles.h2}>{hasFilters ? copy.submittedHeading : copy.noFiltersHeading}</h2>
          <p style={styles.p}>{hasFilters ? copy.preparationBody : copy.emptyLabel}</p>
        </div>

        {hasFilters ? (
          <dl className="dm-public-search__filters" style={styles.filters}>
            {filters.map(({ key, value }) => (
              <div key={key} style={styles.filterCard}>
                <dt style={styles.dt}>{copy.labels[key]}</dt>
                <dd style={styles.dd}>{value || copy.emptyValue}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      <section className="dm-public-search__state" aria-labelledby="dm-public-search-state-title" style={{ ...styles.panel, ...styles.stack }}>
        <span style={badgeStyle}>{copy.emptyValue}</span>
        <h2 id="dm-public-search-state-title" style={styles.h2}>{copy.preparationHeading}</h2>
        <p style={styles.p}>{copy.preparationBody}</p>
        <ul style={styles.ul}>
          {copy.preparationItems.map((item) => (
            <li key={item} style={styles.li}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
