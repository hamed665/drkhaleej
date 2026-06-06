'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

type HomeFeaturedBoard2026Props = {
  locale: SupportedLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
};

type ActionTone = 'profile' | 'directions' | 'call' | 'whatsapp';

type FeaturedAction = {
  label: string;
  symbol: string;
  tone: ActionTone;
  aria: string;
};

type VisibilitySlot = {
  title: string;
  category: string;
  description: string;
  statusChips: readonly string[];
  offerTitle: string;
  offerLines: readonly string[];
  placementLabels: readonly string[];
  railLabel: string;
};

type FeaturedBoardCopy = {
  ariaLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  trustNote: string;
  boardKicker: string;
  profileLabel: string;
  actionDockLabel: string;
  sponsoredLabel: string;
  offerKicker: string;
  offerNote: string;
  activeSlotLabel: string;
  railTitle: string;
  actions: readonly FeaturedAction[];
  slots: readonly VisibilitySlot[];
};

const featuredBoardCopy: Record<SupportedLocale, FeaturedBoardCopy> = {
  en: {
    ariaLabel: 'Compact featured provider and sponsored visibility preview board',
    badge: 'Featured visibility preview',
    title: 'Premium provider visibility, ready for profile actions',
    subtitle:
      'A calm preview of how approved providers can appear with profile actions, sponsored context and offer visibility after review.',
    trustNote: 'Sponsored visibility does not mean quality ranking. Public discovery only — confirm details with provider.',
    boardKicker: 'Oman discovery surface',
    profileLabel: 'Reviewed public profile',
    actionDockLabel: 'Profile actions preview',
    sponsoredLabel: 'Sponsored visibility preview',
    offerKicker: 'Provider-approved offer preview',
    offerNote: 'Offer visibility can support profile discovery after review, without prices or medical claims.',
    activeSlotLabel: 'Active visibility slot',
    railTitle: 'Rotating visibility slots',
    actions: [
      { label: 'View Profile', symbol: '↗', tone: 'profile', aria: 'Preview action. Provider profile appears after provider approval.' },
      { label: 'Directions', symbol: '⌖', tone: 'directions', aria: 'Preview action. Directions appear after provider approval.' },
      { label: 'Call', symbol: '◌', tone: 'call', aria: 'Preview action. Call action appears after provider approval.' },
      { label: 'WhatsApp', symbol: '◍', tone: 'whatsapp', aria: 'Preview action. WhatsApp action appears after provider approval.' }
    ],
    slots: [
      {
        title: 'Premium Clinic Preview',
        category: 'Clinic visibility surface',
        description: 'A compact profile module for an approved clinic or center with clear actions and review-first context.',
        statusChips: ['Premium profile surface', 'Approved actions after review', 'Public discovery only'],
        offerTitle: 'Provider-approved offer preview',
        offerLines: ['Appears after review', 'Sponsored context is clearly marked', 'Supports profile discovery'],
        placementLabels: ['Homepage', 'Area', 'Category'],
        railLabel: 'Clinic Preview'
      },
      {
        title: 'Specialist Profile Preview',
        category: 'Specialist action-ready card',
        description: 'A refined profile slot for approved specialist discovery without ratings, availability promises or claims.',
        statusChips: ['Specialist profile surface', 'Contact actions preview', 'Confirm details with provider'],
        offerTitle: 'Profile visibility preview',
        offerLines: ['Sponsored placement preview', 'Profile actions appear after approval', 'No quality-ranking implication'],
        placementLabels: ['Homepage', 'Specialty', 'Area'],
        railLabel: 'Specialist Preview'
      },
      {
        title: 'Lab Visibility Preview',
        category: 'Lab discovery surface',
        description: 'A preview slot for approved lab discovery and package context without prices or test claims.',
        statusChips: ['Lab visibility surface', 'Offer review required', 'Public discovery only'],
        offerTitle: 'Reviewed package visibility',
        offerLines: ['Appears after review', 'Review-first package context', 'Discovery context stays clear'],
        placementLabels: ['Homepage', 'Tests', 'Category'],
        railLabel: 'Lab Preview'
      },
      {
        title: 'Pharmacy Visibility Preview',
        category: 'Pharmacy discovery card',
        description: 'A calm local discovery surface for an approved pharmacy profile with preview-safe contact actions.',
        statusChips: ['Pharmacy discovery card', 'Actions after approval', 'Confirm details with provider'],
        offerTitle: 'Approved visibility context',
        offerLines: ['Sponsored context is clearly marked', 'Appears after review', 'Supports public discovery'],
        placementLabels: ['Homepage', 'Area', 'Category'],
        railLabel: 'Pharmacy Preview'
      }
    ]
  },
  ar: {
    ariaLabel: 'لوحة مدمجة لمعاينة الظهور المميز والمواضع المدعومة للمقدّمين',
    badge: 'معاينة الظهور المميز',
    title: 'ظهور مميز للمقدّمين مع إجراءات الملف',
    subtitle: 'معاينة هادئة لكيفية ظهور الملفات المعتمدة مع إجراءات التواصل وسياق الظهور المدعوم بعد المراجعة.',
    trustNote: 'الظهور المدعوم لا يعني ترتيباً للجودة. اكتشاف عام فقط — أكّد التفاصيل مع مقدّم الخدمة.',
    boardKicker: 'واجهة اكتشاف لعُمان',
    profileLabel: 'ملف عام قيد المراجعة',
    actionDockLabel: 'معاينة إجراءات الملف',
    sponsoredLabel: 'معاينة الظهور المدعوم',
    offerKicker: 'معاينة عرض معتمد من المقدّم',
    offerNote: 'يمكن أن يدعم ظهور العروض اكتشاف الملف بعد المراجعة، بدون أسعار أو ادعاءات طبية.',
    activeSlotLabel: 'موضع الظهور النشط',
    railTitle: 'مواضع ظهور متناوبة',
    actions: [
      { label: 'عرض الملف', symbol: '↗', tone: 'profile', aria: 'إجراء معاينة. يظهر ملف مقدّم الخدمة بعد الاعتماد.' },
      { label: 'الاتجاهات', symbol: '⌖', tone: 'directions', aria: 'إجراء معاينة. تظهر الاتجاهات بعد اعتماد مقدّم الخدمة.' },
      { label: 'اتصال', symbol: '◌', tone: 'call', aria: 'إجراء معاينة. يظهر إجراء الاتصال بعد اعتماد مقدّم الخدمة.' },
      { label: 'واتساب', symbol: '◍', tone: 'whatsapp', aria: 'إجراء معاينة. يظهر إجراء واتساب بعد اعتماد مقدّم الخدمة.' }
    ],
    slots: [
      {
        title: 'معاينة عيادة مميزة',
        category: 'واجهة ظهور لعيادة',
        description: 'وحدة ملف مدمجة لعيادة أو مركز معتمد، مع إجراءات واضحة وسياق يعتمد المراجعة أولاً.',
        statusChips: ['واجهة ملف مميزة', 'الإجراءات بعد المراجعة', 'اكتشاف عام فقط'],
        offerTitle: 'معاينة عرض معتمد من المقدّم',
        offerLines: ['يظهر بعد المراجعة', 'يتم توضيح سياق الظهور المدعوم', 'يدعم اكتشاف الملف'],
        placementLabels: ['الرئيسية', 'المنطقة', 'الفئة'],
        railLabel: 'معاينة عيادة'
      },
      {
        title: 'معاينة ملف اختصاصي',
        category: 'بطاقة اختصاصي جاهزة للإجراءات',
        description: 'موضع ملف مصقول لاكتشاف الاختصاصيين المعتمدين بدون تقييمات أو وعود مواعيد أو ادعاءات طبية.',
        statusChips: ['واجهة ملف اختصاصي', 'معاينة إجراءات التواصل', 'أكّد التفاصيل مع المقدّم'],
        offerTitle: 'معاينة ظهور الملف',
        offerLines: ['معاينة موضع مدعوم', 'تظهر إجراءات الملف بعد الاعتماد', 'لا يعني ترتيباً للجودة'],
        placementLabels: ['الرئيسية', 'التخصص', 'المنطقة'],
        railLabel: 'معاينة اختصاصي'
      },
      {
        title: 'معاينة ظهور مختبر',
        category: 'واجهة اكتشاف مختبر',
        description: 'موضع معاينة لاكتشاف المختبرات وسياق الباقات المعتمدة بدون أسعار أو ادعاءات فحوصات.',
        statusChips: ['واجهة ظهور مختبر', 'العروض تتطلب مراجعة', 'اكتشاف عام فقط'],
        offerTitle: 'ظهور باقات بعد المراجعة',
        offerLines: ['يظهر بعد المراجعة', 'سياق باقات بعد المراجعة', 'يبقى سياق الاكتشاف واضحاً'],
        placementLabels: ['الرئيسية', 'الفحوصات', 'الفئة'],
        railLabel: 'معاينة مختبر'
      },
      {
        title: 'معاينة ظهور صيدلية',
        category: 'بطاقة اكتشاف صيدلية',
        description: 'واجهة اكتشاف محلية هادئة لملف صيدلية معتمد مع إجراءات تواصل آمنة للمعاينة.',
        statusChips: ['بطاقة اكتشاف صيدلية', 'الإجراءات بعد الاعتماد', 'أكّد التفاصيل مع المقدّم'],
        offerTitle: 'سياق ظهور معتمد',
        offerLines: ['يتم توضيح سياق الظهور المدعوم', 'يظهر بعد المراجعة', 'يدعم الاكتشاف العام'],
        placementLabels: ['الرئيسية', 'المنطقة', 'الفئة'],
        railLabel: 'معاينة صيدلية'
      }
    ]
  }
};

export function HomeFeaturedBoard2026({ locale, country, dir }: HomeFeaturedBoard2026Props) {
  const copy = featuredBoardCopy[locale];
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeSlot = copy.slots[activeSlotIndex] ?? copy.slots[0]!;

  useEffect(() => {
    if (isPaused) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const rotationTimer = window.setInterval(() => {
      setActiveSlotIndex((currentIndex) => (currentIndex + 1) % copy.slots.length);
    }, 4500);

    return () => window.clearInterval(rotationTimer);
  }, [copy.slots.length, isPaused]);

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
        <div className="dm2026-featured-board__module">
          <span className="dm2026-featured-board__glow dm2026-featured-board__glow--teal" aria-hidden="true" />
          <span className="dm2026-featured-board__glow dm2026-featured-board__glow--gold" aria-hidden="true" />

          <header className="dm2026-featured-board__header">
            <div className="dm2026-featured-board__heading">
              <span className="dm2026-badge dm2026-featured-board__badge">{copy.badge}</span>
              <div>
                <p className="dm2026-featured-board__country">{copy.boardKicker}</p>
                <h2>{copy.title}</h2>
              </div>
            </div>
            <p className="dm2026-featured-board__subtitle">{copy.subtitle}</p>
            <p className="dm2026-featured-board__trust">{copy.trustNote}</p>
          </header>

          <div className="dm2026-featured-board__surface">
            <article className="dm2026-featured-board__main-card" aria-labelledby="dm2026-featured-main-title">
              <div className="dm2026-featured-board__identity-row">
                <div className="dm2026-featured-board__avatar" aria-hidden="true">
                  <span />
                </div>
                <div className="dm2026-featured-board__identity-copy">
                  <p>{copy.profileLabel}</p>
                  <h3 id="dm2026-featured-main-title">{activeSlot.title}</h3>
                  <span>{activeSlot.category}</span>
                </div>
                <span className="dm2026-featured-board__active-pill" aria-label={`${copy.activeSlotLabel}: ${activeSlot.railLabel}`}>
                  {activeSlot.railLabel}
                </span>
              </div>

              <p className="dm2026-featured-board__description">{activeSlot.description}</p>

              <div className="dm2026-featured-board__chips" aria-label={copy.activeSlotLabel}>
                {activeSlot.statusChips.map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>

              <div className="dm2026-featured-board__actions" aria-label={copy.actionDockLabel}>
                {copy.actions.map((action) => (
                  <button
                    key={action.label}
                    className={`dm2026-featured-board__action dm2026-featured-board__action--${action.tone}`}
                    type="button"
                    aria-label={action.aria}
                    title={action.aria}
                  >
                    <span className="dm2026-featured-board__action-icon" aria-hidden="true">
                      {action.symbol}
                    </span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </article>

            <aside className="dm2026-featured-board__offer-card" aria-labelledby="dm2026-featured-offer-title">
              <div className="dm2026-featured-board__offer-topline">
                <span>{copy.sponsoredLabel}</span>
                <span aria-hidden="true">✦</span>
              </div>
              <p className="dm2026-featured-board__offer-kicker">{copy.offerKicker}</p>
              <h3 id="dm2026-featured-offer-title">{activeSlot.offerTitle}</h3>
              <ul className="dm2026-featured-board__offer-lines">
                {activeSlot.offerLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div className="dm2026-featured-board__placements" aria-label={copy.sponsoredLabel}>
                {activeSlot.placementLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <p className="dm2026-featured-board__offer-note">{copy.offerNote}</p>
            </aside>

            <div className="dm2026-featured-board__rail" aria-label={copy.railTitle}>
              {copy.slots.map((slot, index) => {
                const isActive = index === activeSlotIndex;

                return (
                  <button
                    key={slot.title}
                    className="dm2026-featured-board__slot"
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveSlotIndex(index)}
                  >
                    <span className="dm2026-featured-board__slot-mark" aria-hidden="true" />
                    <span className="dm2026-featured-board__slot-copy">
                      <strong>{slot.railLabel}</strong>
                      <small>{slot.category}</small>
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
