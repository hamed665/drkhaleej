import type { SupportedLocale } from '@/lib/i18n/config';

type HomeCareStories2026Props = {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
};

const copy = {
  en: {
    eyebrow: 'Care stories',
    title: 'Start with the kind of care you are exploring',
    subtitle: 'Quick visual prompts for common public discovery paths. These are browsing examples, not provider recommendations.',
    stories: ['Dental', 'Beauty', 'Kids', 'Pet Clinic', 'Labs', 'Offers', 'Articles', 'For Providers']
  },
  ar: {
    eyebrow: 'قصص الرعاية',
    title: 'ابدأ بنوع الرعاية التي تستكشفها',
    subtitle: 'إشارات تصفح سريعة لمسارات اكتشاف عامة. هذه أمثلة للتصفح وليست توصيات بمقدّمين.',
    stories: ['الأسنان', 'الجمال', 'الأطفال', 'عيادات بيطرية', 'المختبرات', 'العروض', 'المقالات', 'للمقدّمين']
  }
} as const;

export function HomeCareStories2026({ locale, dir }: HomeCareStories2026Props) {
  const sectionCopy = copy[locale];

  return (
    <section className="dm2026-home-section dm2026-home-stories" dir={dir} aria-labelledby="dm2026-home-stories-title">
      <div className="dm2026-home-section__head">
        <span className="dm2026-badge">{sectionCopy.eyebrow}</span>
        <h2 id="dm2026-home-stories-title">{sectionCopy.title}</h2>
        <p>{sectionCopy.subtitle}</p>
      </div>
      <div className="dm2026-home-rail" aria-label={sectionCopy.title}>
        {sectionCopy.stories.map((story, index) => (
          <article key={story} className="dm2026-home-story dm2026-card-glass">
            <span className="dm2026-home-story__orb" aria-hidden="true" data-index={index + 1} />
            <h3>{story}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
