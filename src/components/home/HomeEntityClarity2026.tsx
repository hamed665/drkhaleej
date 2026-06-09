import { SupportedLocale } from '@/lib/i18n/config';

type HomeEntityClarity2026Props = {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
};

type EntityClarityCard = {
  title: string;
  body: string;
};

type EntityClarityCopy = {
  heading: string;
  cards: readonly EntityClarityCard[];
};

const entityClarityCopy: Record<SupportedLocale, EntityClarityCopy> = {
  en: {
    heading: 'What DrMuscat helps you explore',
    cards: [
      {
        title: 'Public discovery',
        body: 'Explore healthcare, beauty, wellness and pet care options across Oman.'
      },
      {
        title: 'Provider information',
        body: 'Review public details, services, offers and contact actions when available.'
      },
      {
        title: 'Safe boundaries',
        body: 'DrMuscat is not medical advice. Always confirm details directly with providers.'
      }
    ]
  },
  ar: {
    heading: 'ما الذي يساعدك DrMuscat على استكشافه',
    cards: [
      {
        title: 'اكتشاف عام',
        body: 'استكشف خيارات الرعاية الصحية والتجميل والرفاهية ورعاية الحيوانات الأليفة في عُمان.'
      },
      {
        title: 'معلومات مقدمي الخدمة',
        body: 'اطّلع على التفاصيل العامة والخدمات والعروض وطرق التواصل عند توفرها.'
      },
      {
        title: 'حدود آمنة',
        body: 'DrMuscat ليس نصيحة طبية. يرجى دائماً تأكيد التفاصيل مباشرة مع مقدمي الخدمة.'
      }
    ]
  }
};

export function HomeEntityClarity2026({ locale, dir }: HomeEntityClarity2026Props) {
  const copy = entityClarityCopy[locale];

  return (
    <section className="dm2026-home-entity" dir={dir} aria-labelledby="dm2026-home-entity-title">
      <div className="dm2026-home-entity__header">
        <span className="dm2026-home-entity__eyebrow">DrMuscat</span>
        <h2 id="dm2026-home-entity-title">{copy.heading}</h2>
      </div>
      <div className="dm2026-home-entity__grid" role="list">
        {copy.cards.map((card) => (
          <article className="dm2026-home-entity__card" key={card.title} role="listitem">
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
