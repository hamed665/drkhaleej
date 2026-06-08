'use client';

import { useEffect, useMemo, useState } from 'react';

import { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

type HomeSpecialOffersShowcase2026Props = {
  locale: SupportedLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
};

type OfferMediaType = 'image' | 'video';
type OfferAccent = 'dental' | 'beauty' | 'labs' | 'pet' | 'center' | 'doctor' | 'wellness';

type SpecialOfferPreview = {
  id: string;
  providerNameEn: string;
  providerNameAr: string;
  providerTypeEn: string;
  providerTypeAr: string;
  cityEn: string;
  cityAr: string;
  areaEn: string;
  areaAr: string;
  offerTitleEn: string;
  offerTitleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  categoryEn: string;
  categoryAr: string;
  chipsEn: readonly string[];
  chipsAr: readonly string[];
  mediaType: OfferMediaType;
  mediaLabelEn: string;
  mediaLabelAr: string;
  accent: OfferAccent;
};

type SpecialOffersCopy = {
  badge: string;
  headline: string;
  subtitle: string;
  sectionAria: string;
  offerBadge: string;
  providerApproved: string;
  photoReady: string;
  videoReady: string;
  primaryCta: string;
  secondaryCta: string;
  trustNote: string;
  previousLabel: string;
  nextLabel: string;
  dotLabel: (index: number, title: string) => string;
  locationJoiner: string;
  previewOnly: string;
};

const specialOffersCopy: Record<SupportedLocale, SpecialOffersCopy> = {
  en: {
    badge: 'Special Offers',
    headline: 'Special Offers from reviewed providers',
    subtitle: 'Explore provider-approved offers with photo and video-ready previews.',
    sectionAria: 'Special Offers Showcase',
    offerBadge: 'Special Offer preview',
    providerApproved: 'Provider-approved offer',
    photoReady: 'Photo-ready preview',
    videoReady: 'Video-ready preview',
    primaryCta: 'View offer',
    secondaryCta: 'View profile',
    trustNote: 'Confirm details with provider',
    previousLabel: 'Show previous special offer',
    nextLabel: 'Show next special offer',
    dotLabel: (index, title) => `Show offer ${index}: ${title}`,
    locationJoiner: ', ',
    previewOnly: 'Public discovery only'
  },
  ar: {
    badge: 'العروض الخاصة',
    headline: 'عروض خاصة من مقدمي خدمة تمت مراجعتهم',
    subtitle: 'استكشف عروضاً معتمدة مع معاينات جاهزة للصور والفيديو.',
    sectionAria: 'معرض العروض الخاصة',
    offerBadge: 'معاينة عرض خاص',
    providerApproved: 'عرض معتمد من مقدم الخدمة',
    photoReady: 'معاينة جاهزة للصور',
    videoReady: 'معاينة جاهزة للفيديو',
    primaryCta: 'عرض التفاصيل',
    secondaryCta: 'عرض الملف',
    trustNote: 'أكّد التفاصيل مع مقدم الخدمة',
    previousLabel: 'عرض العرض الخاص السابق',
    nextLabel: 'عرض العرض الخاص التالي',
    dotLabel: (index, title) => `عرض العرض ${index}: ${title}`,
    locationJoiner: '، ',
    previewOnly: 'اكتشاف عام فقط'
  }
};

const specialOfferPreviews: readonly SpecialOfferPreview[] = [
  {
    id: 'dental-cleaning-preview',
    providerNameEn: 'Muscat Dental Clinic Preview',
    providerNameAr: 'معاينة عيادة أسنان في مسقط',
    providerTypeEn: 'Dental clinic',
    providerTypeAr: 'عيادة أسنان',
    cityEn: 'Muscat',
    cityAr: 'مسقط',
    areaEn: 'Al Khuwair',
    areaAr: 'الخوير',
    offerTitleEn: 'Dental cleaning package preview',
    offerTitleAr: 'معاينة باقة تنظيف الأسنان',
    descriptionEn: 'A provider-approved dental package preview that can appear after review.',
    descriptionAr: 'معاينة باقة أسنان معتمدة من مقدم الخدمة ويمكن أن تظهر بعد المراجعة.',
    categoryEn: 'Dental',
    categoryAr: 'الأسنان',
    chipsEn: ['Dental care', 'Cleaning', 'Photo-ready'],
    chipsAr: ['رعاية الأسنان', 'تنظيف', 'جاهز للصور'],
    mediaType: 'image',
    mediaLabelEn: 'Photo-ready preview',
    mediaLabelAr: 'معاينة جاهزة للصور',
    accent: 'dental'
  },
  {
    id: 'beauty-skin-preview',
    providerNameEn: 'Qurum Beauty Center Preview',
    providerNameAr: 'معاينة مركز تجميل في القرم',
    providerTypeEn: 'Beauty center',
    providerTypeAr: 'مركز تجميل',
    cityEn: 'Muscat',
    cityAr: 'مسقط',
    areaEn: 'Qurum',
    areaAr: 'القرم',
    offerTitleEn: 'Skin care special offer preview',
    offerTitleAr: 'معاينة عرض خاص للعناية بالبشرة',
    descriptionEn: 'A premium aesthetics offer preview prepared for provider approval.',
    descriptionAr: 'معاينة عرض تجميلي مميز جاهزة لاعتماد مقدم الخدمة.',
    categoryEn: 'Beauty',
    categoryAr: 'الجمال',
    chipsEn: ['Beauty', 'Skin care', 'Video-ready'],
    chipsAr: ['الجمال', 'العناية بالبشرة', 'جاهز للفيديو'],
    mediaType: 'video',
    mediaLabelEn: 'Video-ready preview',
    mediaLabelAr: 'معاينة جاهزة للفيديو',
    accent: 'beauty'
  },
  {
    id: 'lab-diagnostic-preview',
    providerNameEn: 'Seeb Lab Preview',
    providerNameAr: 'معاينة مختبر في السيب',
    providerTypeEn: 'Diagnostic lab',
    providerTypeAr: 'مختبر تشخيصي',
    cityEn: 'Seeb',
    cityAr: 'السيب',
    areaEn: 'Al Hail',
    areaAr: 'الحيل',
    offerTitleEn: 'Diagnostic package preview',
    offerTitleAr: 'معاينة باقة تشخيصية',
    descriptionEn: 'Reviewed lab package previews can appear after provider approval.',
    descriptionAr: 'يمكن أن تظهر معاينات باقات المختبر بعد مراجعتها واعتمادها من مقدم الخدمة.',
    categoryEn: 'Labs',
    categoryAr: 'المختبرات',
    chipsEn: ['Labs', 'Diagnostics', 'Photo-ready'],
    chipsAr: ['مختبرات', 'تشخيص', 'جاهز للصور'],
    mediaType: 'image',
    mediaLabelEn: 'Photo-ready preview',
    mediaLabelAr: 'معاينة جاهزة للصور',
    accent: 'labs'
  },
  {
    id: 'pet-care-preview',
    providerNameEn: 'Pet Care Clinic Preview',
    providerNameAr: 'معاينة عيادة بيطرية',
    providerTypeEn: 'Pet clinic',
    providerTypeAr: 'عيادة بيطرية',
    cityEn: 'Muscat',
    cityAr: 'مسقط',
    areaEn: 'Azaiba',
    areaAr: 'العذيبة',
    offerTitleEn: 'Veterinary care package preview',
    offerTitleAr: 'معاينة باقة رعاية بيطرية',
    descriptionEn: 'Pet care offers can be presented with clear provider context after review.',
    descriptionAr: 'يمكن عرض عروض رعاية الحيوانات مع سياق واضح لمقدم الخدمة بعد المراجعة.',
    categoryEn: 'Pet clinic',
    categoryAr: 'عيادة بيطرية',
    chipsEn: ['Pet clinic', 'Care package', 'Photo-ready'],
    chipsAr: ['عيادة بيطرية', 'باقة رعاية', 'جاهز للصور'],
    mediaType: 'image',
    mediaLabelEn: 'Photo-ready preview',
    mediaLabelAr: 'معاينة جاهزة للصور',
    accent: 'pet'
  },
  {
    id: 'medical-center-preview',
    providerNameEn: 'Al Khuwair Medical Center Preview',
    providerNameAr: 'معاينة مركز طبي في الخوير',
    providerTypeEn: 'Medical center',
    providerTypeAr: 'مركز طبي',
    cityEn: 'Muscat',
    cityAr: 'مسقط',
    areaEn: 'Al Khuwair',
    areaAr: 'الخوير',
    offerTitleEn: 'Family care package preview',
    offerTitleAr: 'معاينة باقة رعاية عائلية',
    descriptionEn: 'A reviewed center-led care package preview for public discovery.',
    descriptionAr: 'معاينة باقة رعاية من مركز تمت مراجعتها للاكتشاف العام.',
    categoryEn: 'Medical center',
    categoryAr: 'مركز طبي',
    chipsEn: ['Center', 'Family care', 'Video-ready'],
    chipsAr: ['مركز', 'رعاية عائلية', 'جاهز للفيديو'],
    mediaType: 'video',
    mediaLabelEn: 'Video-ready preview',
    mediaLabelAr: 'معاينة جاهزة للفيديو',
    accent: 'center'
  },
  {
    id: 'specialist-consultation-preview',
    providerNameEn: 'Specialist Consultation Preview',
    providerNameAr: 'معاينة استشارة تخصصية',
    providerTypeEn: 'Specialist doctor',
    providerTypeAr: 'طبيب اختصاصي',
    cityEn: 'Muscat',
    cityAr: 'مسقط',
    areaEn: 'Bawshar',
    areaAr: 'بوشر',
    offerTitleEn: 'Consultation offer preview',
    offerTitleAr: 'معاينة عرض استشارة',
    descriptionEn: 'A specialist-led consultation preview that appears only after review.',
    descriptionAr: 'معاينة استشارة يقودها اختصاصي ولا تظهر إلا بعد المراجعة.',
    categoryEn: 'Doctors',
    categoryAr: 'الأطباء',
    chipsEn: ['Specialist', 'Consultation', 'Photo-ready'],
    chipsAr: ['اختصاصي', 'استشارة', 'جاهز للصور'],
    mediaType: 'image',
    mediaLabelEn: 'Photo-ready preview',
    mediaLabelAr: 'معاينة جاهزة للصور',
    accent: 'doctor'
  },
  {
    id: 'wellness-nutrition-preview',
    providerNameEn: 'Wellness & Nutrition Preview',
    providerNameAr: 'معاينة رفاهية وتغذية',
    providerTypeEn: 'Wellness provider',
    providerTypeAr: 'مقدم رفاهية',
    cityEn: 'Muscat',
    cityAr: 'مسقط',
    areaEn: 'Al Mouj',
    areaAr: 'الموج',
    offerTitleEn: 'Healthy lifestyle preview',
    offerTitleAr: 'معاينة نمط حياة صحي',
    descriptionEn: 'A reviewed wellness preview designed for calm provider-led discovery.',
    descriptionAr: 'معاينة رفاهية تمت مراجعتها لاكتشاف هادئ تقوده الجهة المقدمة.',
    categoryEn: 'Wellness',
    categoryAr: 'الرفاهية',
    chipsEn: ['Wellness', 'Nutrition', 'Video-ready'],
    chipsAr: ['رفاهية', 'تغذية', 'جاهز للفيديو'],
    mediaType: 'video',
    mediaLabelEn: 'Video-ready preview',
    mediaLabelAr: 'معاينة جاهزة للفيديو',
    accent: 'wellness'
  },
  {
    id: 'family-care-center-preview',
    providerNameEn: 'Family Care Center Preview',
    providerNameAr: 'معاينة مركز رعاية عائلية',
    providerTypeEn: 'Family care center',
    providerTypeAr: 'مركز رعاية عائلية',
    cityEn: 'Seeb',
    cityAr: 'السيب',
    areaEn: 'Mabela',
    areaAr: 'المعبيلة',
    offerTitleEn: 'Family care package preview',
    offerTitleAr: 'معاينة باقة رعاية عائلية',
    descriptionEn: 'A center-led family care preview prepared for future offer placements.',
    descriptionAr: 'معاينة رعاية عائلية من مركز جاهزة لمساحات العروض المستقبلية.',
    categoryEn: 'Family care',
    categoryAr: 'رعاية عائلية',
    chipsEn: ['Family care', 'Center', 'Photo-ready'],
    chipsAr: ['رعاية عائلية', 'مركز', 'جاهز للصور'],
    mediaType: 'image',
    mediaLabelEn: 'Photo-ready preview',
    mediaLabelAr: 'معاينة جاهزة للصور',
    accent: 'center'
  }
];

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
}

function getCircularIndex(index: number, length: number) {
  return (index + length) % length;
}

function getOfferAt(index: number) {
  const offer = specialOfferPreviews[getCircularIndex(index, specialOfferPreviews.length)];

  if (!offer) {
    throw new Error('Special offer preview dataset is unexpectedly empty.');
  }

  return offer;
}

export function HomeSpecialOffersShowcase2026({ locale, country, dir }: HomeSpecialOffersShowcase2026Props) {
  const copy = specialOffersCopy[locale];
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const visibleOffers = useMemo(() => {
    const previousIndex = getCircularIndex(activeIndex - 1, specialOfferPreviews.length);
    const nextIndex = getCircularIndex(activeIndex + 1, specialOfferPreviews.length);

    return [
      { offer: getOfferAt(previousIndex), slot: 'previous' as const, index: previousIndex },
      { offer: getOfferAt(activeIndex), slot: 'active' as const, index: activeIndex },
      { offer: getOfferAt(nextIndex), slot: 'next' as const, index: nextIndex }
    ];
  }, [activeIndex]);

  useEffect(() => {
    if (prefersReducedMotion || isPaused) {
      return undefined;
    }

    const rotationTimer = window.setInterval(() => {
      setActiveIndex((currentIndex) => getCircularIndex(currentIndex + 1, specialOfferPreviews.length));
    }, 4500);

    return () => window.clearInterval(rotationTimer);
  }, [isPaused, prefersReducedMotion]);

  const titleId = `dm2026-special-offers-title-${locale}-${country}`;
  const descriptionId = `dm2026-special-offers-description-${locale}-${country}`;

  const showPreviousOffer = () => setActiveIndex((currentIndex) => getCircularIndex(currentIndex - 1, specialOfferPreviews.length));
  const showNextOffer = () => setActiveIndex((currentIndex) => getCircularIndex(currentIndex + 1, specialOfferPreviews.length));

  return (
    <section
      className="dm2026-special-offers dm2026-container"
      dir={dir}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-roledescription="carousel"
      aria-label={copy.sectionAria}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="dm2026-special-offers__shell">
        <div className="dm2026-special-offers__glow dm2026-special-offers__glow--teal" aria-hidden="true" />
        <div className="dm2026-special-offers__glow dm2026-special-offers__glow--gold" aria-hidden="true" />

        <div className="dm2026-special-offers__header">
          <span className="dm2026-badge dm2026-special-offers__badge">{copy.badge}</span>
          <div className="dm2026-special-offers__headline">
            <h2 id={titleId}>{copy.headline}</h2>
            <p id={descriptionId}>{copy.subtitle}</p>
          </div>
          <div className="dm2026-special-offers__controls" aria-label={copy.sectionAria}>
            <button className="dm2026-special-offers__control" type="button" onClick={showPreviousOffer} aria-label={copy.previousLabel}>
              <span aria-hidden="true">‹</span>
            </button>
            <button className="dm2026-special-offers__control" type="button" onClick={showNextOffer} aria-label={copy.nextLabel}>
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>

        <div className="dm2026-special-offers__stage" aria-live={isPaused || prefersReducedMotion ? 'polite' : 'off'}>
          {visibleOffers.map(({ offer, slot, index }) => (
            <OfferCard
              key={`${offer.id}-${slot}`}
              copy={copy}
              locale={locale}
              offer={offer}
              slot={slot}
              isActive={slot === 'active'}
              slideIndex={index}
              onPreview={() => setActiveIndex(index)}
            />
          ))}
        </div>

        <div className="dm2026-special-offers__dots" role="tablist" aria-label={copy.sectionAria}>
          {specialOfferPreviews.map((offer, index) => {
            const offerTitle = locale === 'ar' ? offer.offerTitleAr : offer.offerTitleEn;
            const isActive = index === activeIndex;

            return (
              <button
                key={offer.id}
                className="dm2026-special-offers__dot"
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={copy.dotLabel(index + 1, offerTitle)}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => setActiveIndex(index)}
              >
                <span aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type OfferCardProps = {
  copy: SpecialOffersCopy;
  locale: SupportedLocale;
  offer: SpecialOfferPreview;
  slot: 'previous' | 'active' | 'next';
  isActive: boolean;
  slideIndex: number;
  onPreview: () => void;
};

function OfferCard({ copy, locale, offer, slot, isActive, slideIndex, onPreview }: OfferCardProps) {
  const providerName = locale === 'ar' ? offer.providerNameAr : offer.providerNameEn;
  const providerType = locale === 'ar' ? offer.providerTypeAr : offer.providerTypeEn;
  const city = locale === 'ar' ? offer.cityAr : offer.cityEn;
  const area = locale === 'ar' ? offer.areaAr : offer.areaEn;
  const offerTitle = locale === 'ar' ? offer.offerTitleAr : offer.offerTitleEn;
  const description = locale === 'ar' ? offer.descriptionAr : offer.descriptionEn;
  const category = locale === 'ar' ? offer.categoryAr : offer.categoryEn;
  const chips = locale === 'ar' ? offer.chipsAr : offer.chipsEn;
  const mediaLabel = locale === 'ar' ? offer.mediaLabelAr : offer.mediaLabelEn;
  const mediaTypeLabel = offer.mediaType === 'video' ? copy.videoReady : copy.photoReady;

  return (
    <article
      className="dm2026-special-offers-card"
      data-slot={slot}
      data-accent={offer.accent}
      aria-roledescription="slide"
      aria-label={offerTitle}
      aria-current={isActive ? 'true' : undefined}
    >
      <button
        className="dm2026-special-offers-card__preview-button"
        type="button"
        onClick={onPreview}
        aria-label={copy.dotLabel(slideIndex + 1, offerTitle)}
        tabIndex={isActive ? -1 : 0}
      />

      <div className="dm2026-special-offers-card__media" aria-label={mediaLabel}>
        <div className="dm2026-special-offers-card__media-orb dm2026-special-offers-card__media-orb--one" aria-hidden="true" />
        <div className="dm2026-special-offers-card__media-orb dm2026-special-offers-card__media-orb--two" aria-hidden="true" />
        <span className="dm2026-special-offers-card__media-category">{category}</span>
        {offer.mediaType === 'video' ? (
          <span className="dm2026-special-offers-card__play" aria-hidden="true">
            <span />
          </span>
        ) : (
          <span className="dm2026-special-offers-card__photo-frame" aria-hidden="true" />
        )}
        <span className="dm2026-special-offers-card__media-label">{mediaTypeLabel}</span>
      </div>

      <div className="dm2026-special-offers-card__body">
        <div className="dm2026-special-offers-card__meta-row">
          <span className="dm2026-special-offers-card__offer-badge">{copy.offerBadge}</span>
        </div>

        <div className="dm2026-special-offers-card__provider">
          <strong>{providerName}</strong>
          <span>{providerType}</span>
          <small>
            {area}
            {copy.locationJoiner}
            {city}
          </small>
        </div>

        <div className="dm2026-special-offers-card__copy">
          <h3>{offerTitle}</h3>
          <p>{description}</p>
        </div>

        <ul className="dm2026-special-offers-card__chips" aria-label={category}>
          {chips.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>

        <div className="dm2026-special-offers-card__actions" aria-label={copy.providerApproved}>
          <button className="dm2026-button dm2026-button-primary dm2026-special-offers-card__cta" type="button" aria-describedby={`${offer.id}-trust`}>
            {copy.primaryCta}
          </button>
          <button className="dm2026-button dm2026-button-secondary dm2026-special-offers-card__cta" type="button" aria-describedby={`${offer.id}-trust`}>
            {copy.secondaryCta}
          </button>
        </div>

        <p id={`${offer.id}-trust`} className="dm2026-special-offers-card__trust">
          {copy.trustNote} · {copy.previewOnly}
        </p>
      </div>
    </article>
  );
}
