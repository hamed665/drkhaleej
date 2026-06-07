import Link from 'next/link';

import type { SupportedLocale } from '@/lib/i18n/config';

type ProviderCTACopy = {
  badge: string;
  headline: string;
  subtitle: string;
  supportingLine: string;
  featurePills: readonly string[];
  primaryCta: string;
  secondaryCta: string;
  trustMicrocopy: string;
  imageAlt: string;
  previewLabel: string;
  previewTitle: string;
  previewMeta: string;
  previewOffer: string;
  previewItems: readonly string[];
  previewActions: readonly string[];
};

type HomeProviderCTA2026Props = {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
  providerHref: string;
};

const providerCTACopy: Record<SupportedLocale, ProviderCTACopy> = {
  en: {
    badge: 'For healthcare providers in Oman',
    headline: 'Grow your healthcare presence in Oman',
    subtitle:
      'Create a reviewed DrMuscat profile with photos, services, special offers and direct contact actions.',
    supportingLine: 'A premium public profile built for discovery, trust and direct enquiries.',
    featurePills: [
      'Premium profile',
      'Photos & gallery',
      'Special Offers',
      'WhatsApp, Call & Directions',
      'Reviewed public information',
      'English + Arabic presence'
    ],
    primaryCta: 'List your center',
    secondaryCta: 'Learn how it works',
    trustMicrocopy: 'Public discovery only. Provider details appear after review and approval.',
    imageAlt: 'Healthcare provider profile preview illustration',
    previewLabel: 'Profile preview',
    previewTitle: 'Center public profile preview',
    previewMeta: 'Reviewed information before publishing',
    previewOffer: 'Special Offer area',
    previewItems: ['Photos', 'Services', 'Special Offer', 'WhatsApp-ready'],
    previewActions: ['WhatsApp', 'Call', 'Directions', 'View Profile']
  },
  ar: {
    badge: 'لمقدمي الرعاية الصحية في عُمان',
    headline: 'نمِّ حضور مركزك الصحي في عُمان',
    subtitle:
      'أنشئ ملفاً معتمداً على DrMuscat مع الصور والخدمات والعروض الخاصة وإجراءات التواصل المباشرة.',
    supportingLine: 'ملف عام مميز يساعد على الاكتشاف والثقة والتواصل المباشر.',
    featurePills: [
      'ملف مميز',
      'صور ومعرض',
      'عروض خاصة',
      'واتساب واتصال واتجاهات',
      'معلومات عامة بعد المراجعة',
      'حضور بالعربية والإنجليزية'
    ],
    primaryCta: 'أدرج مركزك',
    secondaryCta: 'تعرّف على الطريقة',
    trustMicrocopy: 'اكتشاف عام فقط. تظهر تفاصيل مقدم الخدمة بعد المراجعة والاعتماد.',
    imageAlt: 'رسم توضيحي لمعاينة ملف مقدم رعاية صحية',
    previewLabel: 'معاينة الملف',
    previewTitle: 'معاينة ملف عام للمركز',
    previewMeta: 'معلومات مراجعة قبل النشر',
    previewOffer: 'مساحة العروض الخاصة',
    previewItems: ['صور', 'خدمات', 'عرض خاص', 'جاهز لواتساب'],
    previewActions: ['واتساب', 'اتصال', 'اتجاهات', 'عرض الملف']
  }
};

export function HomeProviderCTA2026({ locale, dir, providerHref }: HomeProviderCTA2026Props) {
  const copy = providerCTACopy[locale];

  return (
    <section className="dm2026-provider-cta dm2026-container" dir={dir} aria-labelledby="dm2026-provider-cta-title">
      <div className="dm2026-provider-cta__shell">
        <div className="dm2026-provider-cta__glow dm2026-provider-cta__glow--primary" aria-hidden="true" />
        <div className="dm2026-provider-cta__glow dm2026-provider-cta__glow--accent" aria-hidden="true" />

        <div className="dm2026-provider-cta__copy">
          <span className="dm2026-badge dm2026-provider-cta__badge">{copy.badge}</span>
          <div className="dm2026-provider-cta__headline-group">
            <h2 id="dm2026-provider-cta-title">{copy.headline}</h2>
            <p>{copy.subtitle}</p>
          </div>
          <p className="dm2026-provider-cta__supporting-line">{copy.supportingLine}</p>

          <ul className="dm2026-provider-cta__pills" aria-label={copy.supportingLine}>
            {copy.featurePills.map((pill) => (
              <li key={pill}>{pill}</li>
            ))}
          </ul>

          <div className="dm2026-provider-cta__actions" aria-label={copy.badge}>
            <Link className="dm2026-button dm2026-button-primary dm2026-provider-cta__button" href={providerHref}>
              {copy.primaryCta}
            </Link>
            <Link className="dm2026-button dm2026-button-secondary dm2026-provider-cta__button" href={providerHref}>
              {copy.secondaryCta}
            </Link>
          </div>

          <p className="dm2026-provider-cta__trust">{copy.trustMicrocopy}</p>
        </div>

        <div className="dm2026-provider-cta__visual" aria-label={copy.imageAlt}>
          <picture className="dm2026-provider-cta__picture">
            <source media="(max-width: 42rem)" srcSet="/images/home/provider-cta-healthcare-platform-preview-mobile.webp" type="image/webp" />
            <source srcSet="/images/home/provider-cta-healthcare-platform-preview.webp" type="image/webp" />
            <img src="/images/home/provider-cta-healthcare-platform-preview.jpg" alt={copy.imageAlt} loading="lazy" decoding="async" />
          </picture>

          <div className="dm2026-provider-cta__preview-card" aria-label={copy.previewLabel}>
            <div className="dm2026-provider-cta__preview-head">
              <span>{copy.previewLabel}</span>
              <strong>{copy.previewOffer}</strong>
            </div>
            <h3>{copy.previewTitle}</h3>
            <p>{copy.previewMeta}</p>
            <ul className="dm2026-provider-cta__preview-items">
              {copy.previewItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="dm2026-provider-cta__preview-actions" aria-hidden="true">
              {copy.previewActions.map((action) => (
                <span key={action}>{action}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
