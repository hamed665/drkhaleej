import { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

type HomeFeaturedBoard2026Props = {
  locale: SupportedLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
};

type FeaturedBoardCopy = {
  ariaLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  trustNote: string;
  countryLabel: string;
  mainTitle: string;
  mainKicker: string;
  mainDescription: string;
  chips: readonly string[];
  labels: readonly string[];
  actionsTitle: string;
  actions: readonly {
    label: string;
    tone: 'profile' | 'directions' | 'call' | 'whatsapp';
    aria: string;
  }[];
  sideTitle: string;
  sideSubtitle: string;
  sideItems: readonly {
    label: string;
    value: string;
  }[];
  disclaimerTitle: string;
  disclaimers: readonly string[];
  railTitle: string;
  miniCards: readonly {
    title: string;
    description: string;
    tag: string;
  }[];
};

const featuredBoardCopy: Record<SupportedLocale, FeaturedBoardCopy> = {
  en: {
    ariaLabel: 'Featured provider and sponsored visibility preview board',
    badge: 'Featured visibility preview',
    title: 'Premium provider visibility, designed for serious healthcare discovery.',
    subtitle:
      'A static preview of how approved clinics, specialists, labs, pharmacies and wellness providers can appear with calm, conversion-ready profile actions.',
    trustNote: 'Sponsored visibility does not mean quality ranking. Public discovery only — confirm details with provider.',
    countryLabel: 'Oman discovery surface',
    mainTitle: 'Premium Clinic Preview',
    mainKicker: 'Reviewed public profile',
    mainDescription:
      'A premium profile surface can present provider type, service context and approved action points without fake ratings, claims or unavailable booking promises.',
    chips: ['Premium profile surface', 'Profile actions preview', 'Public discovery only'],
    labels: ['Sponsored placement preview', 'Reviewed public profile'],
    actionsTitle: 'Profile actions preview',
    actions: [
      { label: 'View Profile', tone: 'profile', aria: 'Preview action. Provider profile opens after provider approval.' },
      { label: 'Directions', tone: 'directions', aria: 'Preview action. Directions are available after provider approval.' },
      { label: 'Call', tone: 'call', aria: 'Preview action. Call action is available after provider approval.' },
      { label: 'WhatsApp', tone: 'whatsapp', aria: 'Preview action. WhatsApp action is available after provider approval.' }
    ],
    sideTitle: 'Sponsored placement preview',
    sideSubtitle: 'Approved offers can appear after review, with clear sponsored context and no hidden organic boost.',
    sideItems: [
      { label: 'Visibility slot', value: 'Homepage preview' },
      { label: 'Offer status', value: 'Appears after review' },
      { label: 'Profile status', value: 'Actions after approval' }
    ],
    disclaimerTitle: 'Visibility trust note',
    disclaimers: ['Sponsored visibility does not mean quality ranking', 'Provider profile actions appear after approval', 'Confirm details with provider'],
    railTitle: 'Future visibility slots',
    miniCards: [
      { title: 'Specialist Profile Preview', description: 'Doctor profile action-ready card', tag: 'Profile surface' },
      { title: 'Lab Visibility Preview', description: 'Packages and test discovery surface', tag: 'Discovery slot' },
      { title: 'Pharmacy Visibility Preview', description: 'Public pharmacy discovery card', tag: 'Local discovery' },
      { title: 'Wellness Profile Preview', description: 'Calm wellness provider surface', tag: 'Review-first' }
    ]
  },
  ar: {
    ariaLabel: 'لوحة معاينة الظهور المميز والمواضع المدعومة للمقدّمين',
    badge: 'معاينة الظهور المميز',
    title: 'ظهور مميز للمقدّمين، مصمم لاكتشاف صحي جاد وموثوق.',
    subtitle:
      'معاينة ثابتة لكيفية ظهور العيادات والاختصاصيين والمختبرات والصيدليات ومقدّمي الرفاهية بعد الاعتماد، مع إجراءات ملف واضحة وجاهزة للتحويل.',
    trustNote: 'الظهور المدعوم لا يعني ترتيباً للجودة. اكتشاف عام فقط — أكّد التفاصيل مع مقدّم الخدمة.',
    countryLabel: 'واجهة اكتشاف لعُمان',
    mainTitle: 'معاينة عيادة مميزة',
    mainKicker: 'ملف عام قيد المراجعة',
    mainDescription:
      'يمكن لواجهة الملف المميزة عرض نوع مقدّم الخدمة وسياق الخدمات ونقاط الإجراءات المعتمدة بدون تقييمات وهمية أو ادعاءات أو وعود حجز غير مفعّلة.',
    chips: ['واجهة ملف مميزة', 'معاينة إجراءات الملف', 'اكتشاف عام فقط'],
    labels: ['معاينة موضع مدعوم', 'ملف عام قيد المراجعة'],
    actionsTitle: 'معاينة إجراءات الملف',
    actions: [
      { label: 'عرض الملف', tone: 'profile', aria: 'إجراء معاينة. يفتح ملف مقدّم الخدمة بعد الاعتماد.' },
      { label: 'الاتجاهات', tone: 'directions', aria: 'إجراء معاينة. تتوفر الاتجاهات بعد اعتماد مقدّم الخدمة.' },
      { label: 'اتصال', tone: 'call', aria: 'إجراء معاينة. يتوفر الاتصال بعد اعتماد مقدّم الخدمة.' },
      { label: 'واتساب', tone: 'whatsapp', aria: 'إجراء معاينة. يتوفر واتساب بعد اعتماد مقدّم الخدمة.' }
    ],
    sideTitle: 'معاينة موضع مدعوم',
    sideSubtitle: 'تظهر العروض بعد المراجعة والاعتماد، مع سياق مدعوم واضح وبدون تعزيز عضوي مخفي.',
    sideItems: [
      { label: 'موضع الظهور', value: 'معاينة الصفحة الرئيسية' },
      { label: 'حالة العرض', value: 'يظهر بعد المراجعة' },
      { label: 'حالة الملف', value: 'الإجراءات بعد الاعتماد' }
    ],
    disclaimerTitle: 'ملاحظة ثقة الظهور',
    disclaimers: ['الظهور المدعوم لا يعني ترتيباً للجودة', 'تظهر إجراءات الملف بعد الاعتماد', 'أكّد التفاصيل مع مقدّم الخدمة'],
    railTitle: 'مواضع ظهور مستقبلية',
    miniCards: [
      { title: 'معاينة ملف اختصاصي', description: 'بطاقة ملف طبيب جاهزة للإجراءات', tag: 'واجهة ملف' },
      { title: 'معاينة ظهور مختبر', description: 'واجهة لاكتشاف الباقات والفحوصات', tag: 'موضع اكتشاف' },
      { title: 'معاينة ظهور صيدلية', description: 'بطاقة اكتشاف عامة للصيدلية', tag: 'اكتشاف محلي' },
      { title: 'معاينة ملف رفاهية', description: 'واجهة هادئة لمقدّم رفاهية', tag: 'المراجعة أولاً' }
    ]
  }
};

export function HomeFeaturedBoard2026({ locale, country, dir }: HomeFeaturedBoard2026Props) {
  const copy = featuredBoardCopy[locale];

  return (
    <section className="dm2026-featured-board" dir={dir} aria-label={copy.ariaLabel} data-country={country}>
      <div className="dm2026-container">
        <div className="dm2026-featured-board__header">
          <span className="dm2026-badge dm2026-featured-board__badge">{copy.badge}</span>
          <div>
            <p className="dm2026-featured-board__country">{copy.countryLabel}</p>
            <h2>{copy.title}</h2>
          </div>
          <p className="dm2026-featured-board__subtitle">{copy.subtitle}</p>
          <p className="dm2026-featured-board__trust">{copy.trustNote}</p>
        </div>

        <div className="dm2026-featured-board__surface">
          <span className="dm2026-featured-board__glow dm2026-featured-board__glow--teal" aria-hidden="true" />
          <span className="dm2026-featured-board__glow dm2026-featured-board__glow--gold" aria-hidden="true" />

          <article className="dm2026-featured-board__main-card" aria-labelledby="dm2026-featured-main-title">
            <div className="dm2026-featured-board__identity">
              <div className="dm2026-featured-board__avatar" aria-hidden="true">
                <span />
              </div>
              <div>
                <p>{copy.mainKicker}</p>
                <h3 id="dm2026-featured-main-title">{copy.mainTitle}</h3>
              </div>
            </div>

            <div className="dm2026-featured-board__labels" aria-label={copy.badge}>
              {copy.labels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <p className="dm2026-featured-board__description">{copy.mainDescription}</p>

            <div className="dm2026-featured-board__chips" aria-label={copy.railTitle}>
              {copy.chips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>

            <div className="dm2026-featured-board__actions" aria-label={copy.actionsTitle}>
              {copy.actions.map((action) => (
                <button
                  key={action.label}
                  className={`dm2026-featured-board__action dm2026-featured-board__action--${action.tone}`}
                  type="button"
                  aria-label={action.aria}
                  title={action.aria}
                >
                  <span className="dm2026-featured-board__action-icon" aria-hidden="true" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </article>

          <aside className="dm2026-featured-board__side-card" aria-labelledby="dm2026-featured-side-title">
            <div className="dm2026-featured-board__side-orbit" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="dm2026-featured-board__side-kicker">{copy.disclaimerTitle}</p>
            <h3 id="dm2026-featured-side-title">{copy.sideTitle}</h3>
            <p>{copy.sideSubtitle}</p>
            <dl>
              {copy.sideItems.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <ul>
              {copy.disclaimers.map((disclaimer) => (
                <li key={disclaimer}>{disclaimer}</li>
              ))}
            </ul>
          </aside>

          <div className="dm2026-featured-board__rail" aria-label={copy.railTitle}>
            {copy.miniCards.map((card) => (
              <article key={card.title} className="dm2026-featured-board__mini-card">
                <span aria-hidden="true" />
                <p>{card.tag}</p>
                <h3>{card.title}</h3>
                <small>{card.description}</small>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
