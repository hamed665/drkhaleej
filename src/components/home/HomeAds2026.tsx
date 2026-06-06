import type { SupportedLocale } from '@/lib/i18n/config';

type HomeAds2026Props = {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
};

const copy = {
  en: {
    eyebrow: 'Advertising previews',
    title: 'Sponsored visibility spaces for future reviewed placements',
    subtitle: 'Sponsored visibility is paid placement, not quality ranking.',
    note: 'Preview only — no billing, wallet, checkout or ad backend is implemented.',
    placements: ['Homepage featured', 'Category featured', 'Area featured', 'Article sponsored placement']
  },
  ar: {
    eyebrow: 'معاينات الإعلانات',
    title: 'مساحات ظهور إعلاني لمواضع مستقبلية بعد المراجعة',
    subtitle: 'الظهور المموّل مساحة مدفوعة وليس ترتيباً لجودة الخدمة.',
    note: 'معاينة فقط — لا توجد فوترة أو محفظة أو دفع أو نظام إعلانات خلفي.',
    placements: ['مميز الصفحة الرئيسية', 'مميز الفئة', 'مميز المنطقة', 'موضع مقال ممول']
  }
} as const;

export function HomeAds2026({ locale, dir }: HomeAds2026Props) {
  const sectionCopy = copy[locale];

  return (
    <section className="dm2026-home-section" dir={dir} aria-labelledby="dm2026-home-ads-title">
      <div className="dm2026-home-monetization dm2026-card-glass">
        <div className="dm2026-home-section__head">
          <span className="dm2026-badge">{sectionCopy.eyebrow}</span>
          <h2 id="dm2026-home-ads-title">{sectionCopy.title}</h2>
          <p>{sectionCopy.subtitle}</p>
        </div>
        <div className="dm2026-home-ad-grid">
          {sectionCopy.placements.map((placement) => (
            <article key={placement} className="dm2026-home-ad-card">
              <span aria-hidden="true" />
              <h3>{placement}</h3>
              <p>{sectionCopy.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
