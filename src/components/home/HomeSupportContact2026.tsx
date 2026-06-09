import type { SupportedLocale } from '@/lib/i18n/config';
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from '@/lib/contact/whatsapp';

type HomeSupportContact2026Props = {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
};

type SupportCardCopy = {
  title: string;
  body: string;
  button: string;
  message: string;
  ariaLabel: string;
};

type SupportContactCopy = {
  eyebrow: string;
  headline: string;
  subtitle: string;
  unavailable: string;
  quickLabel: string;
  quickAriaLabel: string;
  user: SupportCardCopy;
  provider: SupportCardCopy;
};

const supportContactCopy: Record<SupportedLocale, SupportContactCopy> = {
  en: {
    eyebrow: 'Support',
    headline: 'Need help using DrMuscat?',
    subtitle:
      'Choose the right WhatsApp path for public discovery help or provider listing support. We do not provide medical advice.',
    unavailable: 'WhatsApp activation pending',
    quickLabel: 'WhatsApp',
    quickAriaLabel: 'Contact DrMuscat support on WhatsApp',
    user: {
      title: 'Need help finding public provider information?',
      body: 'Message DrMuscat support on WhatsApp for help with public discovery. We do not provide medical advice.',
      button: 'WhatsApp support',
      message: 'Hi DrMuscat, I need help finding public healthcare provider information in Oman.',
      ariaLabel: 'Message DrMuscat support on WhatsApp for public discovery help'
    },
    provider: {
      title: 'Want to list or claim your center?',
      body: 'Contact our provider team to prepare your public profile, services, offers and contact actions.',
      button: 'Provider team',
      message: 'Hi DrMuscat, I want to list or claim my center on DrMuscat.',
      ariaLabel: 'Message the DrMuscat provider team about listing or claiming a center'
    }
  },
  ar: {
    eyebrow: 'الدعم',
    headline: 'هل تحتاج مساعدة في استخدام DrMuscat؟',
    subtitle: 'اختر مسار واتساب المناسب للمساعدة في الاكتشاف العام أو دعم إدراج مقدمي الخدمة. لا نقدم نصائح طبية.',
    unavailable: 'تفعيل واتساب قيد الإعداد',
    quickLabel: 'واتساب',
    quickAriaLabel: 'تواصل مع دعم DrMuscat عبر واتساب',
    user: {
      title: 'هل تحتاج مساعدة في العثور على معلومات عامة؟',
      body: 'راسل دعم DrMuscat عبر واتساب للمساعدة في الاكتشاف العام. لا نقدم نصائح طبية.',
      button: 'دعم واتساب',
      message: 'مرحباً DrMuscat، أحتاج مساعدة في العثور على معلومات عامة عن مقدمي الرعاية الصحية في عُمان.',
      ariaLabel: 'راسل دعم DrMuscat عبر واتساب للمساعدة في الاكتشاف العام'
    },
    provider: {
      title: 'هل تريد إدراج أو مطالبة مركزك؟',
      body: 'تواصل مع فريق مقدمي الخدمة لتجهيز ملفك العام والخدمات والعروض وطرق التواصل.',
      button: 'فريق مقدمي الخدمة',
      message: 'مرحباً DrMuscat، أريد إدراج أو مطالبة مركزي على DrMuscat.',
      ariaLabel: 'راسل فريق مقدمي الخدمة في DrMuscat حول إدراج أو مطالبة مركز'
    }
  }
};

function SupportAction({ href, copy, unavailable }: { href: string | null; copy: SupportCardCopy; unavailable: string }) {
  if (!href) {
    return (
      <span className="dm2026-home-support__button dm2026-home-support__button--disabled" aria-disabled="true">
        <span>{copy.button}</span>
        <small>{unavailable}</small>
      </span>
    );
  }

  return (
    <a className="dm2026-home-support__button" href={href} target="_blank" rel="noopener noreferrer" aria-label={copy.ariaLabel}>
      {copy.button}
    </a>
  );
}

export function HomeSupportContact2026({ locale, dir }: HomeSupportContact2026Props) {
  const copy = supportContactCopy[locale];
  const titleId = `dm2026-home-support-title-${locale}`;
  const whatsAppNumber = normalizeWhatsAppNumber(process.env.NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER);
  const userHref = buildWhatsAppUrl(whatsAppNumber, copy.user.message);
  const providerHref = buildWhatsAppUrl(whatsAppNumber, copy.provider.message);
  const whatsAppState = userHref ? 'active' : 'disabled';

  return (
    <>
      <section className="dm2026-home-support dm2026-container" dir={dir} aria-labelledby={titleId} data-whatsapp-state={whatsAppState}>
        <div className="dm2026-home-support__shell">
          <div className="dm2026-home-support__intro">
            <span className="dm2026-home-support__eyebrow">{copy.eyebrow}</span>
            <div className="dm2026-home-support__headline-group">
              <h2 id={titleId}>{copy.headline}</h2>
              <p>{copy.subtitle}</p>
            </div>
          </div>

          <div className="dm2026-home-support__cards" aria-label={copy.headline}>
            {[copy.user, copy.provider].map((card) => {
              const href = card === copy.user ? userHref : providerHref;

              return (
                <article className="dm2026-home-support__card" key={card.title}>
                  <div className="dm2026-home-support__card-mark" aria-hidden="true">
                    <span />
                  </div>
                  <div className="dm2026-home-support__card-copy">
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                  </div>
                  <SupportAction href={href} copy={card} unavailable={copy.unavailable} />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <div className="dm2026-home-whatsapp-float" dir={dir} data-whatsapp-state={whatsAppState}>
        {userHref ? (
          <>
            <span className="dm2026-home-whatsapp-float__companion" aria-hidden="true">{copy.quickLabel}</span>
            <a
              className="dm2026-home-whatsapp-float__fab dm2026-home-whatsapp-float__fab--active"
              href={userHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={copy.quickAriaLabel}
              data-whatsapp-state="active"
            >
              <span className="dm2026-home-whatsapp-float__glyph" aria-hidden="true">
                <span />
              </span>
            </a>
          </>
        ) : (
          <span
            className="dm2026-home-whatsapp-float__fab dm2026-home-whatsapp-float__fab--disabled"
            aria-disabled="true"
            data-whatsapp-state="disabled"
            title={copy.unavailable}
          >
            <span className="dm2026-home-whatsapp-float__glyph" aria-hidden="true">
              <span />
            </span>
          </span>
        )}
      </div>
    </>
  );
}
