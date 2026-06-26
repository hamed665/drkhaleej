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

function WhatsAppLogoMark() {
  return (
    <span className="dm2026-home-whatsapp-float__glyph" aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        <path d="M16.02 3.2c-6.98 0-12.66 5.54-12.66 12.35 0 2.18.6 4.32 1.73 6.2L3.25 28.8l7.28-1.8a13.06 13.06 0 0 0 5.49 1.2c6.98 0 12.66-5.54 12.66-12.35S23 3.2 16.02 3.2Zm0 22.84c-1.78 0-3.52-.46-5.05-1.33l-.36-.2-4.33 1.07 1.1-4.08-.24-.4a10.17 10.17 0 0 1-1.58-5.55c0-5.62 4.7-10.2 10.46-10.2 5.76 0 10.46 4.58 10.46 10.2 0 5.9-4.9 10.49-10.46 10.49Z" />
        <path d="M21.92 18.46c-.32-.16-1.9-.92-2.2-1.02-.3-.1-.52-.16-.74.16-.22.32-.85 1.02-1.04 1.23-.2.21-.38.24-.7.08-.32-.16-1.36-.49-2.6-1.56-.96-.83-1.6-1.86-1.8-2.18-.19-.32-.02-.49.15-.64.15-.14.32-.36.48-.55.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.55-.08-.16-.74-1.75-1.02-2.4-.27-.64-.54-.55-.74-.56h-.63c-.21 0-.55.08-.84.4-.3.32-1.1 1.07-1.1 2.6 0 1.54 1.13 3.02 1.29 3.23.16.21 2.23 3.34 5.4 4.68.76.33 1.35.52 1.81.66.76.24 1.45.2 2 .12.61-.09 1.9-.76 2.17-1.5.27-.74.27-1.37.19-1.5-.08-.14-.29-.22-.61-.37Z" />
      </svg>
    </span>
  );
}

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

export function HomeWhatsAppFloat2026({ locale, dir }: HomeSupportContact2026Props) {
  const copy = supportContactCopy[locale];
  const whatsAppNumber = normalizeWhatsAppNumber(process.env.NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER);
  const userHref = buildWhatsAppUrl(whatsAppNumber, copy.user.message);
  const whatsAppState = userHref ? 'active' : 'disabled';

  return (
    <div className="dm2026-home-whatsapp-float" dir={dir} data-whatsapp-state={whatsAppState}>
      {userHref ? (
        <a
          className="dm2026-home-whatsapp-float__fab dm2026-home-whatsapp-float__fab--active"
          href={userHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={copy.quickAriaLabel}
          data-whatsapp-state="active"
        >
          <WhatsAppLogoMark />
        </a>
      ) : (
        <span
          className="dm2026-home-whatsapp-float__fab dm2026-home-whatsapp-float__fab--disabled"
          aria-disabled="true"
          data-whatsapp-state="disabled"
          title={copy.unavailable}
        >
          <WhatsAppLogoMark />
        </span>
      )}
    </div>
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
  );
}
