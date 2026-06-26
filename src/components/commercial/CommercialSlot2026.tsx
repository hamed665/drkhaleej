import type { SupportedLocale } from '@/lib/i18n/config';

export type CommercialSlotPlacement =
  | 'home_mid'
  | 'directory_top'
  | 'profile_sidebar'
  | 'offer_inline';

export type CommercialSlotVariant = 'provider_visibility' | 'sponsor_placeholder';

type CommercialSlotCopy = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  disclaimer: string;
  placementLabel: string;
  benefits: readonly string[];
};

type CommercialSlot2026Props = {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
  placement: CommercialSlotPlacement;
  variant?: CommercialSlotVariant;
};

const commercialSlotCopy: Record<SupportedLocale, CommercialSlotCopy> = {
  en: {
    eyebrow: 'Provider visibility slot',
    title: 'A reviewed space for healthcare providers in Oman',
    description:
      'This reusable slot prepares DrKhaleej for featured provider visibility, sponsored education and reviewed commercial placements without changing page templates later.',
    primaryLabel: 'Visibility slot reserved',
    secondaryLabel: 'Review required before publishing',
    disclaimer: 'Commercial content appears only after internal review. No medical, MOH, rating, booking or insurance claims are implied.',
    placementLabel: 'Placement',
    benefits: ['Reusable across public pages', 'Review-first publishing', 'Ready for provider campaigns']
  },
  ar: {
    eyebrow: 'مساحة ظهور للمقدّمين',
    title: 'مساحة مراجَعة لمقدمي الرعاية الصحية في عُمان',
    description:
      'تجهّز هذه المساحة DrKhaleej لظهور مقدمي الخدمة والمحتوى التعليمي المدعوم والمساحات التجارية بعد المراجعة دون تغيير قوالب الصفحات لاحقاً.',
    primaryLabel: 'مساحة الظهور محجوزة',
    secondaryLabel: 'المراجعة مطلوبة قبل النشر',
    disclaimer: 'يظهر المحتوى التجاري بعد المراجعة الداخلية فقط. لا توجد أي ادعاءات طبية أو اعتماد من وزارة الصحة أو تقييمات أو حجز أو تأمين.',
    placementLabel: 'الموضع',
    benefits: ['قابلة لإعادة الاستخدام في الصفحات العامة', 'نشر بعد المراجعة أولاً', 'جاهزة لحملات مقدمي الخدمة']
  }
};

function placementDisplayName(placement: CommercialSlotPlacement): string {
  return placement.replace(/_/g, ' ');
}

export function CommercialSlot2026({ locale, dir, placement, variant = 'provider_visibility' }: CommercialSlot2026Props) {
  const copy = commercialSlotCopy[locale];
  const titleId = `commercial-slot-title-${placement}-${locale}`;
  const disclaimerId = `commercial-slot-disclaimer-${placement}-${locale}`;

  return (
    <aside
      className="dm2026-container dm2026-section"
      dir={dir}
      aria-labelledby={titleId}
      aria-describedby={disclaimerId}
      data-commercial-slot-placement={placement}
      data-commercial-slot-variant={variant}
    >
      <div className="dm2026-card-soft" style={{ display: 'grid', gap: '1rem', padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
        <div className="dm2026-section-header" style={{ marginBlockEnd: 0 }}>
          <span className="dm2026-badge">{copy.eyebrow}</span>
          <h2 id={titleId} style={{ margin: 0 }}>{copy.title}</h2>
          <p style={{ margin: 0 }}>{copy.description}</p>
        </div>

        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
          {copy.benefits.map((benefit) => (
            <li className="dm2026-badge" key={benefit}>{benefit}</li>
          ))}
        </ul>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <button className="dm2026-button dm2026-button-primary" type="button" aria-disabled="true" aria-describedby={disclaimerId}>
            {copy.primaryLabel}
          </button>
          <button className="dm2026-button dm2026-button-secondary" type="button" aria-disabled="true" aria-describedby={disclaimerId}>
            {copy.secondaryLabel}
          </button>
          <span className="dm2026-badge">{copy.placementLabel}: {placementDisplayName(placement)}</span>
        </div>

        <p id={disclaimerId} style={{ color: 'var(--dm-color-text-muted)', margin: 0 }}>{copy.disclaimer}</p>
      </div>
    </aside>
  );
}
