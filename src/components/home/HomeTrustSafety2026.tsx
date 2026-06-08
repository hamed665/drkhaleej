import type { SupportedLocale } from '@/lib/i18n/config';

type HomeTrustSafety2026Props = {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
};

type TrustSafetyPoint = {
  title: string;
  body: string;
};

type TrustSafetyCopy = {
  eyebrow: string;
  heading: string;
  body: string;
  points: readonly TrustSafetyPoint[];
  pills: readonly string[];
};

const trustSafetyCopy: Record<SupportedLocale, TrustSafetyCopy> = {
  en: {
    eyebrow: 'Trust & safety',
    heading: 'Built for safe public discovery',
    body:
      'DrMuscat helps people explore public provider information in Oman without replacing professional medical judgment.',
    points: [
      {
        title: 'Discovery, not diagnosis',
        body: 'Public pages help users compare services, locations, and contact options; they do not provide diagnosis, treatment, or emergency guidance.'
      },
      {
        title: 'Offers are promotional',
        body: 'Special Offers and sponsored visibility are separated from medical quality and should not be treated as clinical rankings.'
      },
      {
        title: 'Confirm before visiting',
        body: 'People should confirm services, prices, hours, location, availability, and medical suitability directly with the provider.'
      }
    ],
    pills: ['Public discovery only', 'Not medical advice', 'Confirm with provider', 'Sponsored clearly marked', 'Offers after review']
  },
  ar: {
    eyebrow: 'الثقة والسلامة',
    heading: 'مصمم لاكتشاف عام آمن',
    body:
      'يساعد DrMuscat المستخدمين على استكشاف معلومات عامة عن مقدمي الخدمة في عُمان دون أن يحل محل الحكم الطبي المتخصص.',
    points: [
      {
        title: 'اكتشاف وليس تشخيصاً',
        body: 'تساعد الصفحات العامة المستخدمين على مقارنة الخدمات والمواقع وخيارات التواصل؛ ولا تقدم تشخيصاً أو علاجاً أو إرشادات للطوارئ.'
      },
      {
        title: 'العروض ترويجية',
        body: 'العروض الخاصة والظهور المدعوم منفصلان عن الجودة الطبية، ولا يجب التعامل معهما كترتيب سريري.'
      },
      {
        title: 'أكّد قبل الزيارة',
        body: 'ينبغي تأكيد الخدمات والأسعار وساعات العمل والموقع والتوفر والملاءمة الطبية مباشرة مع مقدم الخدمة.'
      }
    ],
    pills: ['اكتشاف عام فقط', 'ليست نصيحة طبية', 'أكّد مع مقدم الخدمة', 'الظهور المدعوم موضح', 'العروض بعد المراجعة']
  }
};

export function HomeTrustSafety2026({ locale, dir }: HomeTrustSafety2026Props) {
  const copy = trustSafetyCopy[locale];
  const titleId = `dm2026-home-trust-title-${locale}`;

  return (
    <section className="dm2026-home-trust dm2026-container" dir={dir} aria-labelledby={titleId}>
      <div className="dm2026-home-trust__shell">
        <div className="dm2026-home-trust__copy">
          <div className="dm2026-home-trust__heading-row">
            <div className="dm2026-home-trust__mark" aria-hidden="true">
              <span />
            </div>
            <div>
              <span className="dm2026-home-trust__eyebrow">{copy.eyebrow}</span>
              <h2 id={titleId}>{copy.heading}</h2>
            </div>
          </div>
          <p>{copy.body}</p>
        </div>
        <div className="dm2026-home-trust__details">
          <ul className="dm2026-home-trust__points" aria-label={copy.eyebrow}>
            {copy.points.map((point) => (
              <li key={point.title}>
                <strong>{point.title}</strong>
                <span>{point.body}</span>
              </li>
            ))}
          </ul>
          <ul className="dm2026-home-trust__pills" aria-label={copy.heading}>
            {copy.pills.map((pill) => (
              <li key={pill}>{pill}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
