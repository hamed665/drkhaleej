import type { SupportedLocale } from '@/lib/i18n/config';

type HomeTrustSafety2026Props = {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
};

type TrustSafetyCopy = {
  heading: string;
  body: string;
  pills: readonly string[];
};

const trustSafetyCopy: Record<SupportedLocale, TrustSafetyCopy> = {
  en: {
    heading: 'Built for safe public discovery',
    body:
      'DrKhaleej helps people explore public provider information in Oman. It is not medical advice. Sponsored visibility and Special Offers do not mean medical quality ranking. Always confirm details directly with the provider.',
    pills: ['Public discovery only', 'Not medical advice', 'Confirm with provider', 'Sponsored clearly marked', 'Offers after review']
  },
  ar: {
    heading: 'مصمم لاكتشاف عام آمن',
    body:
      'يساعد DrKhaleej المستخدمين على استكشاف معلومات عامة عن مقدمي الخدمة في عُمان. لا يُعد ذلك نصيحة طبية. الظهور المدعوم والعروض الخاصة لا تعني ترتيباً لجودة طبية. يرجى دائماً تأكيد التفاصيل مباشرة مع مقدم الخدمة.',
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
            <h2 id={titleId}>{copy.heading}</h2>
          </div>
          <p>{copy.body}</p>
        </div>
        <ul className="dm2026-home-trust__pills" aria-label={copy.heading}>
          {copy.pills.map((pill) => (
            <li key={pill}>{pill}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
