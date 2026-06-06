import type { SupportedLocale } from '@/lib/i18n/config';

type HomeTrust2026Props = {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
};

const copy = {
  en: {
    eyebrow: 'Trust layer',
    title: 'Clear boundaries for public healthcare discovery',
    subtitle: 'DrMuscat helps organize public discovery information without replacing provider confirmation or professional care.',
    items: ['Public discovery only', 'Confirm details with provider', 'Not medical advice', 'Emergency: use local emergency services', 'No fake ratings', 'Sponsored is not quality ranking']
  },
  ar: {
    eyebrow: 'طبقة الثقة',
    title: 'حدود واضحة لاكتشاف الرعاية الصحية العامة',
    subtitle: 'يساعد DrMuscat على تنظيم معلومات الاكتشاف العامة دون أن يحل محل تأكيد المقدّم أو الرعاية المهنية.',
    items: ['اكتشاف عام فقط', 'أكّد التفاصيل مع مقدّم الخدمة', 'ليست نصيحة طبية', 'للطوارئ استخدم خدمات الطوارئ المحلية', 'لا توجد تقييمات وهمية', 'الظهور المموّل ليس ترتيب جودة']
  }
} as const;

export function HomeTrust2026({ locale, dir }: HomeTrust2026Props) {
  const sectionCopy = copy[locale];

  return (
    <section className="dm2026-home-section" dir={dir} aria-labelledby="dm2026-home-trust-title">
      <div className="dm2026-home-trust-2026 dm2026-card-soft">
        <div className="dm2026-home-section__head">
          <span className="dm2026-badge">{sectionCopy.eyebrow}</span>
          <h2 id="dm2026-home-trust-title">{sectionCopy.title}</h2>
          <p>{sectionCopy.subtitle}</p>
        </div>
        <ul>
          {sectionCopy.items.map((item) => (
            <li key={item}>
              <span aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
