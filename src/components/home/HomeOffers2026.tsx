import type { SupportedLocale } from '@/lib/i18n/config';

type HomeOffers2026Props = {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
};

const copy = {
  en: {
    eyebrow: 'Offers preview',
    title: 'Provider-approved offers can be presented clearly after review',
    subtitle: 'No prices or guaranteed results are shown. These are generic offer preview categories only.',
    review: 'Provider-approved offers will appear here after review.',
    offers: ['Dental offers', 'Lab packages', 'Beauty packages', 'Pet clinic offers', 'Wellness packages']
  },
  ar: {
    eyebrow: 'معاينة العروض',
    title: 'يمكن عرض العروض المعتمدة من المقدّمين بوضوح بعد المراجعة',
    subtitle: 'لا توجد أسعار أو نتائج مضمونة. هذه فئات عامة لمعاينات العروض فقط.',
    review: 'ستظهر العروض المعتمدة من المقدّمين هنا بعد المراجعة.',
    offers: ['باقات الأسنان', 'باقات المختبر', 'عروض الجمال', 'عروض العيادات البيطرية', 'باقات الرفاهية']
  }
} as const;

export function HomeOffers2026({ locale, dir }: HomeOffers2026Props) {
  const sectionCopy = copy[locale];

  return (
    <section className="dm2026-home-section dm2026-home-offers" dir={dir} aria-labelledby="dm2026-home-offers-title">
      <div className="dm2026-home-section__head">
        <span className="dm2026-badge">{sectionCopy.eyebrow}</span>
        <h2 id="dm2026-home-offers-title">{sectionCopy.title}</h2>
        <p>{sectionCopy.subtitle}</p>
      </div>
      <div className="dm2026-home-card-grid dm2026-home-card-grid--offers">
        {sectionCopy.offers.map((offer) => (
          <article key={offer} className="dm2026-home-offer-card dm2026-card-soft">
            <span className="dm2026-home-preview-label">{sectionCopy.eyebrow}</span>
            <h3>{offer}</h3>
            <p>{sectionCopy.review}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
