'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

type HomeFeaturedBoard2026Props = {
  locale: SupportedLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
};

type LocalizedPreview = {
  providerKind: string;
  title: string;
  subtitle: string;
  city: string;
  area: string;
  chips: readonly string[];
  ratingLabel: string;
  ratingValue: string;
  ratingNote: string;
  providerContext: string;
  offerTitle: string;
  offerContext: readonly string[];
};

type VisibilityPreviewItem = {
  id: string;
  en: LocalizedPreview;
  ar: LocalizedPreview;
};

type FeaturedBoardCopy = {
  ariaLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  trustNote: string;
  activeLabel: string;
  profileLabel: string;
  locationLabel: string;
  servicesLabel: string;
  ratingAriaLabel: string;
  offerHeading: string;
  offerKicker: string;
  offerNote: string;
  railLabel: string;
  actionsLabel: string;
  actions: readonly {
    label: string;
    symbol: string;
    tone: 'primary' | 'neutral' | 'contact' | 'whatsapp';
    aria: string;
  }[];
};

const previewInventory: readonly VisibilityPreviewItem[] = [
  {
    id: 'muscat-dental-clinic-preview',
    en: {
      providerKind: 'Dental clinic',
      title: 'Muscat Dental Clinic Preview',
      subtitle: 'Approved dental profile preview with services, offer context and contact actions.',
      city: 'Muscat',
      area: 'Muscat area preview',
      chips: ['Dental care', 'Cleaning package preview', 'Profile actions after approval'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'This preview shows how a dental profile can present services and contact actions without live listing data.',
      offerTitle: 'Dental cleaning package',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'Sponsored placement is clearly marked']
    },
    ar: {
      providerKind: 'عيادة أسنان',
      title: 'معاينة عيادة أسنان في مسقط',
      subtitle: 'معاينة ملف أسنان معتمد مع الخدمات وسياق العرض وإجراءات التواصل.',
      city: 'مسقط',
      area: 'معاينة منطقة في مسقط',
      chips: ['رعاية الأسنان', 'معاينة باقة تنظيف', 'الإجراءات بعد الاعتماد'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'توضح هذه المعاينة كيف يمكن لملف أسنان عرض الخدمات وإجراءات التواصل بدون بيانات قائمة مباشرة.',
      offerTitle: 'باقة تنظيف الأسنان',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'يتم توضيح الظهور المدعوم بوضوح']
    }
  },
  {
    id: 'al-khuwair-medical-center-preview',
    en: {
      providerKind: 'Medical center',
      title: 'Al Khuwair Medical Center Preview',
      subtitle: 'Approved center profile preview with service chips and clear contact actions.',
      city: 'Muscat',
      area: 'Al Khuwair preview',
      chips: ['General care', 'Family services', 'Confirm details with provider'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'A center profile can highlight approved services, location context and action buttons in one calm card.',
      offerTitle: 'Family care package',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'No prices or discounts shown']
    },
    ar: {
      providerKind: 'مركز طبي',
      title: 'معاينة مركز طبي في الخوير',
      subtitle: 'معاينة ملف مركز معتمد مع شرائح الخدمات وإجراءات تواصل واضحة.',
      city: 'مسقط',
      area: 'معاينة الخوير',
      chips: ['رعاية عامة', 'خدمات عائلية', 'أكّد التفاصيل مع المقدّم'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'يمكن لملف المركز إبراز الخدمات المعتمدة وسياق الموقع وأزرار الإجراءات في بطاقة هادئة واحدة.',
      offerTitle: 'باقة رعاية عائلية',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'لا يتم عرض أسعار أو خصومات']
    }
  },
  {
    id: 'qurum-wellness-clinic-preview',
    en: {
      providerKind: 'Wellness clinic',
      title: 'Qurum Wellness Clinic Preview',
      subtitle: 'Approved wellness profile preview for calm services and reviewed offers.',
      city: 'Muscat',
      area: 'Qurum preview',
      chips: ['Wellness services', 'Reviewed offer preview', 'Public profile only'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'Wellness providers can show approved profile details while avoiding unsupported health promises.',
      offerTitle: 'Wellness package',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'Offer wording stays review-first']
    },
    ar: {
      providerKind: 'عيادة رفاهية',
      title: 'معاينة عيادة رفاهية في القرم',
      subtitle: 'معاينة ملف رفاهية معتمد للخدمات الهادئة والعروض بعد المراجعة.',
      city: 'مسقط',
      area: 'معاينة القرم',
      chips: ['خدمات رفاهية', 'معاينة عرض بعد المراجعة', 'ملف عام فقط'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'يمكن لمقدّمي الرفاهية عرض تفاصيل ملف معتمدة مع تجنّب الوعود الصحية غير المدعومة.',
      offerTitle: 'باقة رفاهية',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'تبقى صياغة العرض خاضعة للمراجعة']
    }
  },
  {
    id: 'seeb-lab-preview',
    en: {
      providerKind: 'Laboratory',
      title: 'Seeb Lab Preview',
      subtitle: 'Approved lab profile preview with package wording reviewed before publishing.',
      city: 'Muscat',
      area: 'Seeb preview',
      chips: ['Lab tests', 'Package preview', 'No prices shown'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'A lab profile can present service categories and package previews without making clinical claims.',
      offerTitle: 'Lab test package',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'No fake prices or availability']
    },
    ar: {
      providerKind: 'مختبر',
      title: 'معاينة مختبر في السيب',
      subtitle: 'معاينة ملف مختبر معتمد مع صياغة الباقات بعد المراجعة قبل النشر.',
      city: 'مسقط',
      area: 'معاينة السيب',
      chips: ['فحوصات مختبر', 'معاينة باقة', 'بدون أسعار'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'يمكن لملف المختبر عرض فئات الخدمات ومعاينات الباقات بدون ادعاءات طبية.',
      offerTitle: 'باقة فحوصات المختبر',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'بدون أسعار أو توفر وهمي']
    }
  },
  {
    id: 'bausher-specialist-clinic-preview',
    en: {
      providerKind: 'Specialist clinic',
      title: 'Bausher Specialist Clinic Preview',
      subtitle: 'Approved specialist profile preview with reviewed service and contact context.',
      city: 'Muscat',
      area: 'Bausher preview',
      chips: ['Specialist care', 'Service chips', 'Actions after approval'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'A specialist card can keep the provider profile prominent while clearly marking preview-only content.',
      offerTitle: 'Skin consultation offer',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'No medical promise included']
    },
    ar: {
      providerKind: 'عيادة تخصصية',
      title: 'معاينة عيادة تخصصية في بوشر',
      subtitle: 'معاينة ملف تخصصي معتمد مع سياق خدمة وتواصل بعد المراجعة.',
      city: 'مسقط',
      area: 'معاينة بوشر',
      chips: ['رعاية تخصصية', 'شرائح خدمات', 'الإجراءات بعد الاعتماد'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'تحافظ بطاقة الاختصاصي على بروز ملف المقدّم مع توضيح أن المحتوى للمعاينة فقط.',
      offerTitle: 'عرض استشارة جلدية',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'بدون وعود طبية']
    }
  },
  {
    id: 'azaiba-pharmacy-preview',
    en: {
      providerKind: 'Pharmacy',
      title: 'Azaiba Pharmacy Preview',
      subtitle: 'Approved pharmacy profile preview with clear area and contact action context.',
      city: 'Muscat',
      area: 'Azaiba preview',
      chips: ['Pharmacy profile', 'Area context', 'Confirm details with provider'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'Pharmacy profiles can show public information and actions only after provider approval.',
      offerTitle: 'Pharmacy offer preview',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'Sponsored placement is clearly marked']
    },
    ar: {
      providerKind: 'صيدلية',
      title: 'معاينة صيدلية في العذيبة',
      subtitle: 'معاينة ملف صيدلية معتمد مع سياق واضح للمنطقة وإجراءات التواصل.',
      city: 'مسقط',
      area: 'معاينة العذيبة',
      chips: ['ملف صيدلية', 'سياق المنطقة', 'أكّد التفاصيل مع المقدّم'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'يمكن لملفات الصيدليات عرض المعلومات العامة والإجراءات فقط بعد اعتماد المقدّم.',
      offerTitle: 'معاينة عرض صيدلية',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'يتم توضيح الظهور المدعوم بوضوح']
    }
  },
  {
    id: 'pet-care-clinic-preview',
    en: {
      providerKind: 'Pet clinic',
      title: 'Pet Care Clinic Preview',
      subtitle: 'Approved pet care profile preview with profile actions and service chips.',
      city: 'Muscat',
      area: 'Muscat area preview',
      chips: ['Pet care', 'Service chips', 'Public profile only'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'Pet care providers can use the same polished profile format with safe preview wording.',
      offerTitle: 'Pet care package',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'No fake availability shown']
    },
    ar: {
      providerKind: 'عيادة بيطرية',
      title: 'معاينة عيادة بيطرية',
      subtitle: 'معاينة ملف رعاية حيوانات معتمد مع إجراءات الملف وشرائح الخدمات.',
      city: 'مسقط',
      area: 'معاينة منطقة في مسقط',
      chips: ['رعاية الحيوانات', 'شرائح خدمات', 'ملف عام فقط'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'يمكن لمقدّمي رعاية الحيوانات استخدام نفس تنسيق الملف المصقول مع صياغة آمنة للمعاينة.',
      offerTitle: 'باقة رعاية الحيوانات',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'بدون توفر وهمي']
    }
  },
  {
    id: 'medical-service-provider-preview',
    en: {
      providerKind: 'Medical service',
      title: 'Medical Service Provider Preview',
      subtitle: 'Approved service profile preview for future provider inventory beyond clinics.',
      city: 'Muscat',
      area: 'Oman preview',
      chips: ['Service profile', 'Reviewed content', 'Clear contact actions'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'The preview inventory can scale to more providers while keeping each card profile-led.',
      offerTitle: 'Service offer preview',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'Sponsored placement is clearly marked']
    },
    ar: {
      providerKind: 'خدمة طبية',
      title: 'معاينة مقدم خدمة طبية',
      subtitle: 'معاينة ملف خدمة معتمد لمخزون مقدّمين مستقبلي يتجاوز العيادات.',
      city: 'مسقط',
      area: 'معاينة عُمان',
      chips: ['ملف خدمة', 'محتوى بعد المراجعة', 'إجراءات تواصل واضحة'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'يمكن لمخزون المعاينات التوسع لمقدّمين أكثر مع بقاء كل بطاقة متمحورة حول الملف.',
      offerTitle: 'معاينة عرض خدمة',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'يتم توضيح الظهور المدعوم بوضوح']
    }
  }
] as const;

const featuredBoardCopy: Record<SupportedLocale, FeaturedBoardCopy> = {
  en: {
    ariaLabel: 'Featured provider previews board',
    badge: 'Featured preview',
    title: 'Featured provider previews',
    subtitle: 'See how approved healthcare profiles can appear with rating, services, offers and clear contact actions.',
    trustNote: 'Preview content only. Ratings, offers and contact actions appear after provider approval.',
    activeLabel: 'Active provider preview',
    profileLabel: 'Approved profile preview',
    locationLabel: 'Provider preview location',
    servicesLabel: 'Provider preview services',
    ratingAriaLabel: 'Safe sample rating preview',
    offerHeading: 'Provider offer preview',
    offerKicker: 'Offer preview',
    offerNote: 'No real prices, discounts, availability or medical promises are shown in this static preview.',
    railLabel: 'Provider preview carousel',
    actionsLabel: 'Preview profile actions',
    actions: [
      { label: 'View Profile', symbol: '↗', tone: 'primary', aria: 'Preview action. Provider profile appears after provider approval.' },
      { label: 'Directions', symbol: '⌖', tone: 'neutral', aria: 'Preview action. Directions appear after provider approval.' },
      { label: 'Call', symbol: '◌', tone: 'contact', aria: 'Preview action. Call action appears after provider approval.' },
      { label: 'WhatsApp', symbol: '◍', tone: 'whatsapp', aria: 'Preview action. WhatsApp action appears after provider approval.' }
    ]
  },
  ar: {
    ariaLabel: 'لوحة معاينات مميزة لمقدمي الرعاية',
    badge: 'معاينة مميزة',
    title: 'معاينات مميزة لمقدمي الرعاية',
    subtitle: 'شاهد كيف يمكن أن تظهر الملفات المعتمدة مع التقييم والخدمات والعروض وإجراءات التواصل الواضحة.',
    trustNote: 'محتوى معاينة فقط. تظهر التقييمات والعروض وإجراءات التواصل بعد اعتماد مقدّم الخدمة.',
    activeLabel: 'معاينة مقدم نشطة',
    profileLabel: 'معاينة ملف معتمد',
    locationLabel: 'موقع معاينة مقدم الخدمة',
    servicesLabel: 'خدمات معاينة مقدم الخدمة',
    ratingAriaLabel: 'معاينة تقييم تجريبية وآمنة',
    offerHeading: 'معاينة عرض مقدم الخدمة',
    offerKicker: 'معاينة عرض',
    offerNote: 'لا يتم عرض أسعار أو خصومات أو توفر أو وعود طبية حقيقية في هذه المعاينة الثابتة.',
    railLabel: 'شريط معاينات مقدمي الرعاية',
    actionsLabel: 'معاينة إجراءات الملف',
    actions: [
      { label: 'عرض الملف', symbol: '↗', tone: 'primary', aria: 'إجراء معاينة. يظهر ملف مقدّم الخدمة بعد الاعتماد.' },
      { label: 'الاتجاهات', symbol: '⌖', tone: 'neutral', aria: 'إجراء معاينة. تظهر الاتجاهات بعد اعتماد مقدّم الخدمة.' },
      { label: 'اتصال', symbol: '◌', tone: 'contact', aria: 'إجراء معاينة. يظهر إجراء الاتصال بعد اعتماد مقدّم الخدمة.' },
      { label: 'واتساب', symbol: '◍', tone: 'whatsapp', aria: 'إجراء معاينة. يظهر إجراء واتساب بعد اعتماد مقدّم الخدمة.' }
    ]
  }
};

export function HomeFeaturedBoard2026({ locale, country, dir }: HomeFeaturedBoard2026Props) {
  const copy = featuredBoardCopy[locale];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeEntry = previewInventory[activeIndex] ?? previewInventory[0]!;
  const activePreview = activeEntry[locale];

  useEffect(() => {
    if (isPaused) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const rotationTimer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % previewInventory.length);
    }, 5200);

    return () => window.clearInterval(rotationTimer);
  }, [isPaused]);

  const pauseHandlers = useMemo(
    () => ({
      onMouseEnter: () => setIsPaused(true),
      onMouseLeave: () => setIsPaused(false),
      onFocus: () => setIsPaused(true),
      onBlur: () => setIsPaused(false)
    }),
    []
  );

  return (
    <section className="dm2026-featured-board" dir={dir} aria-label={copy.ariaLabel} data-country={country} {...pauseHandlers}>
      <div className="dm2026-container">
        <div className="dm2026-featured-board__module dm2026-glass">
          <span className="dm2026-featured-board__glow dm2026-featured-board__glow--primary" aria-hidden="true" />
          <span className="dm2026-featured-board__glow dm2026-featured-board__glow--accent" aria-hidden="true" />

          <header className="dm2026-featured-board__header">
            <div className="dm2026-featured-board__title-block">
              <span className="dm2026-badge dm2026-featured-board__badge">{copy.badge}</span>
              <div>
                <p className="dm2026-featured-board__kicker">{activePreview.providerKind}</p>
                <h2>{copy.title}</h2>
              </div>
            </div>
            <p className="dm2026-featured-board__subtitle">{copy.subtitle}</p>
            <p className="dm2026-featured-board__trust">{copy.trustNote}</p>
          </header>

          <div className="dm2026-featured-board__grid">
            <article className="dm2026-featured-board__profile dm2026-card-glass" aria-labelledby="dm2026-featured-profile-title">
              <div className="dm2026-featured-board__profile-head">
                <div className="dm2026-featured-board__mark" aria-hidden="true">
                  <span />
                </div>
                <div className="dm2026-featured-board__profile-copy">
                  <p>{copy.profileLabel}</p>
                  <h3 id="dm2026-featured-profile-title">{activePreview.title}</h3>
                  <span>{activePreview.subtitle}</span>
                </div>
                <span className="dm2026-featured-board__active-badge" aria-label={`${copy.activeLabel}: ${activePreview.title}`}>
                  {copy.activeLabel}
                </span>
              </div>

              <div className="dm2026-featured-board__meta" aria-label={copy.locationLabel}>
                <span>{activePreview.providerKind}</span>
                <span>{activePreview.city}</span>
                <span>{activePreview.area}</span>
              </div>

              <div className="dm2026-featured-board__rating" aria-label={copy.ratingAriaLabel}>
                <span className="dm2026-featured-board__rating-stars" aria-hidden="true">
                  ★★★★★
                </span>
                <span className="dm2026-featured-board__rating-value">{activePreview.ratingValue}</span>
                <span className="dm2026-featured-board__rating-note">{activePreview.ratingNote}</span>
              </div>

              <div className="dm2026-featured-board__chips" aria-label={copy.servicesLabel}>
                {activePreview.chips.map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>

              <p className="dm2026-featured-board__visibility-copy">{activePreview.providerContext}</p>

              <div className="dm2026-featured-board__actions" aria-label={copy.actionsLabel}>
                {copy.actions.map((action) => (
                  <button
                    key={action.label}
                    className={`dm2026-button dm2026-featured-board__action dm2026-featured-board__action--${action.tone}`}
                    type="button"
                    aria-label={action.aria}
                    title={action.aria}
                  >
                    <span className="dm2026-featured-board__action-symbol" aria-hidden="true">
                      {action.symbol}
                    </span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </article>

            <aside className="dm2026-featured-board__offer dm2026-card-soft" aria-labelledby="dm2026-featured-offer-title">
              <div className="dm2026-featured-board__offer-head">
                <span className="dm2026-badge">{copy.offerKicker}</span>
                <span aria-hidden="true">✦</span>
              </div>
              <h3 id="dm2026-featured-offer-title">{copy.offerHeading}</h3>
              <p className="dm2026-featured-board__offer-title">{activePreview.offerTitle}</p>
              <ul>
                {activePreview.offerContext.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>{copy.offerNote}</p>
            </aside>

            <div className="dm2026-featured-board__rail" aria-label={copy.railLabel}>
              {previewInventory.map((entry, index) => {
                const preview = entry[locale];
                const isActive = index === activeIndex;

                return (
                  <button
                    key={entry.id}
                    className="dm2026-featured-board__slot"
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveIndex(index)}
                  >
                    <span className="dm2026-featured-board__slot-dot" aria-hidden="true" />
                    <span>
                      <strong>{preview.title}</strong>
                      <small>{preview.providerKind}</small>
                      <small>{`${preview.area} · ${preview.ratingLabel}`}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
