import type { SupportedLocale } from '@/lib/i18n/config';

type HomeArticles2026Props = {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
};

const copy = {
  en: {
    eyebrow: 'Health guides',
    title: 'Educational guides for safer public discovery',
    subtitle: 'Health guides are educational and do not replace professional medical advice.',
    planned: 'Planned article preview',
    articles: ['Dental guide', 'Lab tests guide', 'Choosing a clinic', 'Pharmacy guide', 'Kids health guide', 'Pet care guide']
  },
  ar: {
    eyebrow: 'أدلة صحية',
    title: 'أدلة تعليمية لاكتشاف عام أكثر وضوحاً',
    subtitle: 'الأدلة الصحية تعليمية ولا تغني عن النصيحة الطبية المهنية.',
    planned: 'معاينة مقال مخطط',
    articles: ['دليل الأسنان', 'دليل فحوصات المختبر', 'اختيار عيادة', 'دليل الصيدلية', 'دليل صحة الأطفال', 'دليل رعاية الحيوانات الأليفة']
  }
} as const;

export function HomeArticles2026({ locale, dir }: HomeArticles2026Props) {
  const sectionCopy = copy[locale];

  return (
    <section className="dm2026-home-section" dir={dir} aria-labelledby="dm2026-home-articles-title">
      <div className="dm2026-home-section__head">
        <span className="dm2026-badge">{sectionCopy.eyebrow}</span>
        <h2 id="dm2026-home-articles-title">{sectionCopy.title}</h2>
        <p>{sectionCopy.subtitle}</p>
      </div>
      <div className="dm2026-home-article-grid">
        {sectionCopy.articles.map((article, index) => (
          <article key={article} className="dm2026-home-article-card dm2026-card-soft">
            <span className="dm2026-home-article-card__media" aria-hidden="true" data-index={index + 1} />
            <div>
              <span className="dm2026-home-preview-label">{sectionCopy.planned}</span>
              <h3>{article}</h3>
              <p>{sectionCopy.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
