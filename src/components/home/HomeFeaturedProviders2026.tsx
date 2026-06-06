import type { SupportedLocale } from '@/lib/i18n/config';

type HomeFeaturedProviders2026Props = {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
};

const copy = {
  en: {
    eyebrow: 'Profile previews',
    title: 'Premium doctor and center profile shells',
    subtitle: 'Placeholder cards only. No provider names, ratings, review totals or availability claims are shown here.',
    sponsor: 'Sponsored placement preview',
    doctorTitle: 'Featured Doctors shell',
    centerTitle: 'Featured Centers / Clinics shell',
    doctorCards: [
      { title: 'Doctor profile preview', description: 'Specialty profile structure with verified information after review.' },
      { title: 'Specialty profile', description: 'Care focus and public profile completeness can appear after approval.' },
      { title: 'Verified information will appear after review', description: 'No fake names, ratings, reviews or availability are used in this shell.' }
    ],
    centerCards: [
      { title: 'Clinic profile preview', description: 'Center services, care categories and contact actions after approval.' },
      { title: 'Center services', description: 'A premium shell for clinics and centers without fake names or ratings.' },
      { title: 'Contact actions after approval', description: 'Call, directions and messaging surfaces are prepared for later approved phases.' }
    ]
  },
  ar: {
    eyebrow: 'معاينات الملفات',
    title: 'قوالب ملفات أطباء ومراكز بتصميم مميز',
    subtitle: 'بطاقات معاينة فقط. لا توجد أسماء مقدّمين أو تقييمات أو إجماليات مراجعات أو ادعاءات توفر.',
    sponsor: 'معاينة موضع إعلاني مدفوع',
    doctorTitle: 'قالب الأطباء المميزين',
    centerTitle: 'قالب المراكز / العيادات المميزة',
    doctorCards: [
      { title: 'معاينة ملف طبيب', description: 'هيكل ملف تخصصي مع معلومات موثقة بعد المراجعة.' },
      { title: 'ملف تخصصي', description: 'يمكن أن تظهر تفاصيل مجال الرعاية واكتمال الملف بعد الموافقة.' },
      { title: 'تظهر المعلومات الموثقة بعد المراجعة', description: 'لا تُستخدم أسماء أو تقييمات أو مراجعات أو ادعاءات توفر وهمية في هذا القالب.' }
    ],
    centerCards: [
      { title: 'معاينة ملف عيادة', description: 'خدمات المركز وفئات الرعاية وإجراءات التواصل بعد الموافقة.' },
      { title: 'خدمات المركز', description: 'قالب مميز للعيادات والمراكز دون أسماء أو تقييمات وهمية.' },
      { title: 'إجراءات التواصل بعد الموافقة', description: 'يتم تجهيز الاتصال والاتجاهات والمراسلة لمراحل لاحقة معتمدة.' }
    ]
  }
} as const;

export function HomeFeaturedProviders2026({ locale, dir }: HomeFeaturedProviders2026Props) {
  const sectionCopy = copy[locale];
  const groups = [
    { title: sectionCopy.doctorTitle, cards: sectionCopy.doctorCards },
    { title: sectionCopy.centerTitle, cards: sectionCopy.centerCards }
  ];

  return (
    <section className="dm2026-home-section" dir={dir} aria-labelledby="dm2026-home-featured-title">
      <div className="dm2026-home-section__head dm2026-home-section__head--split">
        <div>
          <span className="dm2026-badge">{sectionCopy.eyebrow}</span>
          <h2 id="dm2026-home-featured-title">{sectionCopy.title}</h2>
          <p>{sectionCopy.subtitle}</p>
        </div>
        <span className="dm2026-home-sponsored-note">{sectionCopy.sponsor}</span>
      </div>
      <div className="dm2026-home-profile-shells">
        {groups.map((group) => (
          <article key={group.title} className="dm2026-home-profile-shell dm2026-card-glass">
            <h3>{group.title}</h3>
            <div className="dm2026-home-profile-shell__cards">
              {group.cards.map((card) => (
                <div key={card.title} className="dm2026-home-provider-preview">
                  <span className="dm2026-home-provider-preview__media" aria-hidden="true" />
                  <div>
                    <span className="dm2026-home-preview-label">{sectionCopy.sponsor}</span>
                    <h4>{card.title}</h4>
                    <p>{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
