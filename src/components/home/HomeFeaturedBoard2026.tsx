'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';

type HomeFeaturedBoard2026Props = {
  locale: SupportedLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
};

type MockProviderPhoto = {
  label: string;
  tone: 'clinic' | 'suite' | 'reception' | 'lab' | 'wellness' | 'pharmacy' | 'pet' | 'service';
};

const photoOverlayLabels: Record<SupportedLocale, Record<MockProviderPhoto['tone'], string>> = {
  en: {
    clinic: 'Care space',
    suite: 'Treatment room',
    reception: 'Reception preview',
    lab: 'Diagnostic services',
    wellness: 'Wellness room',
    pharmacy: 'Pharmacy counter',
    pet: 'Pet care room',
    service: 'Featured care'
  },
  ar: {
    clinic: 'مساحة رعاية',
    suite: 'غرفة علاج',
    reception: 'معاينة الاستقبال',
    lab: 'خدمات تشخيصية',
    wellness: 'غرفة رفاهية',
    pharmacy: 'واجهة الصيدلية',
    pet: 'غرفة رعاية بيطرية',
    service: 'رعاية مميزة'
  }
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
  photos: readonly MockProviderPhoto[];
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
  photosLabel: string;
  offerHeading: string;
  offerKicker: string;
  offerNote: string;
  railLabel: string;
  actionsLabel: string;
  actions: readonly {
    label: string;
    icon: 'profile' | 'directions' | 'call' | 'whatsapp';
    tone: 'primary' | 'neutral' | 'contact' | 'whatsapp';
    aria: string;
  }[];
};

const previewInventory: readonly VisibilityPreviewItem[] = [
  {
    id: 'muscat-dental-clinic-preview',
    en: {
      providerKind: 'Dental clinic',
      title: 'Muscat Dental Clinic',
      subtitle: 'Approved dental profile preview with services, offer context and contact actions.',
      city: 'Muscat',
      area: 'Muscat area preview',
      chips: ['Dental care', 'Cleaning package preview', 'Profile actions after approval'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'A calm preview of how a dental center can present services, location context and contact actions.',
      offerTitle: 'Dental cleaning package',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'Sponsored placement is clearly marked'],
      photos: [
        { label: 'Dental reception mock photo', tone: 'reception' },
        { label: 'Dental suite mock photo', tone: 'suite' },
        { label: 'Calm dental care mock photo', tone: 'clinic' },
        { label: 'Provider lounge mock photo', tone: 'wellness' }
      ]
    },
    ar: {
      providerKind: 'عيادة أسنان',
      title: 'عيادة أسنان في مسقط',
      subtitle: 'معاينة ملف أسنان معتمد مع الخدمات وسياق العرض وإجراءات التواصل.',
      city: 'مسقط',
      area: 'معاينة منطقة في مسقط',
      chips: ['رعاية الأسنان', 'معاينة باقة تنظيف', 'الإجراءات بعد الاعتماد'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'معاينة هادئة لكيفية عرض مركز أسنان للخدمات وسياق الموقع وإجراءات التواصل.',
      offerTitle: 'باقة تنظيف الأسنان',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'يتم توضيح الظهور المدعوم بوضوح'],
      photos: [
        { label: 'صورة معاينة لاستقبال عيادة الأسنان', tone: 'reception' },
        { label: 'صورة معاينة لجناح أسنان', tone: 'suite' },
        { label: 'صورة معاينة لرعاية أسنان هادئة', tone: 'clinic' },
        { label: 'صورة معاينة لاستراحة مقدم الخدمة', tone: 'wellness' }
      ]
    }
  },
  {
    id: 'al-khuwair-medical-center-preview',
    en: {
      providerKind: 'Medical center',
      title: 'Al Khuwair Medical Center',
      subtitle: 'Approved center profile preview with service chips and clear contact actions.',
      city: 'Muscat',
      area: 'Al Khuwair preview',
      chips: ['General care', 'Family services', 'Confirm details with provider'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'A center profile can highlight approved services and make the next action obvious.',
      offerTitle: 'Family care package',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'No prices or discounts shown'],
      photos: [
        { label: 'Medical center exterior mock photo', tone: 'clinic' },
        { label: 'Medical center reception mock photo', tone: 'reception' },
        { label: 'Consultation room mock photo', tone: 'suite' },
        { label: 'Care corridor mock photo', tone: 'service' }
      ]
    },
    ar: {
      providerKind: 'مركز طبي',
      title: 'مركز طبي في الخوير',
      subtitle: 'معاينة ملف مركز معتمد مع شرائح الخدمات وإجراءات تواصل واضحة.',
      city: 'مسقط',
      area: 'معاينة الخوير',
      chips: ['رعاية عامة', 'خدمات عائلية', 'أكّد التفاصيل مع المقدّم'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'يمكن لملف المركز إبراز الخدمات المعتمدة وجعل الخطوة التالية واضحة.',
      offerTitle: 'باقة رعاية عائلية',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'لا يتم عرض أسعار أو خصومات'],
      photos: [
        { label: 'صورة معاينة لواجهة مركز طبي', tone: 'clinic' },
        { label: 'صورة معاينة لاستقبال مركز طبي', tone: 'reception' },
        { label: 'صورة معاينة لغرفة استشارة', tone: 'suite' },
        { label: 'صورة معاينة لممر رعاية', tone: 'service' }
      ]
    }
  },
  {
    id: 'qurum-wellness-clinic-preview',
    en: {
      providerKind: 'Wellness clinic',
      title: 'Qurum Wellness Clinic',
      subtitle: 'Approved wellness profile preview for calm services and reviewed offers.',
      city: 'Muscat',
      area: 'Qurum preview',
      chips: ['Wellness services', 'Reviewed offer preview', 'Public profile only'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'Wellness providers can show refined profile details while avoiding unsupported health promises.',
      offerTitle: 'Wellness package',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'Offer wording stays review-first'],
      photos: [
        { label: 'Wellness lobby mock photo', tone: 'wellness' },
        { label: 'Wellness suite mock photo', tone: 'suite' },
        { label: 'Quiet care room mock photo', tone: 'clinic' },
        { label: 'Soft reception mock photo', tone: 'reception' }
      ]
    },
    ar: {
      providerKind: 'عيادة رفاهية',
      title: 'عيادة رفاهية في القرم',
      subtitle: 'معاينة ملف رفاهية معتمد للخدمات الهادئة والعروض بعد المراجعة.',
      city: 'مسقط',
      area: 'معاينة القرم',
      chips: ['خدمات رفاهية', 'معاينة عرض بعد المراجعة', 'ملف عام فقط'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'يمكن لمقدّمي الرفاهية عرض تفاصيل ملف مصقولة مع تجنّب الوعود الصحية غير المدعومة.',
      offerTitle: 'باقة رفاهية',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'تبقى صياغة العرض خاضعة للمراجعة'],
      photos: [
        { label: 'صورة معاينة لاستقبال رفاهية', tone: 'wellness' },
        { label: 'صورة معاينة لجناح رفاهية', tone: 'suite' },
        { label: 'صورة معاينة لغرفة رعاية هادئة', tone: 'clinic' },
        { label: 'صورة معاينة لاستقبال ناعم', tone: 'reception' }
      ]
    }
  },
  {
    id: 'seeb-lab-preview',
    en: {
      providerKind: 'Laboratory',
      title: 'Seeb Lab',
      subtitle: 'Approved lab profile preview with package wording reviewed before publishing.',
      city: 'Muscat',
      area: 'Seeb preview',
      chips: ['Lab tests', 'Package preview', 'No prices shown'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'A lab profile can present service categories and package previews without making clinical claims.',
      offerTitle: 'Lab test package',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'No fake prices or availability'],
      photos: [
        { label: 'Laboratory counter mock photo', tone: 'lab' },
        { label: 'Sample room mock photo', tone: 'suite' },
        { label: 'Lab reception mock photo', tone: 'reception' },
        { label: 'Clean testing area mock photo', tone: 'service' }
      ]
    },
    ar: {
      providerKind: 'مختبر',
      title: 'مختبر في السيب',
      subtitle: 'معاينة ملف مختبر معتمد مع صياغة الباقات بعد المراجعة قبل النشر.',
      city: 'مسقط',
      area: 'معاينة السيب',
      chips: ['فحوصات مختبر', 'معاينة باقة', 'بدون أسعار'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'يمكن لملف المختبر عرض فئات الخدمات ومعاينات الباقات بدون ادعاءات طبية.',
      offerTitle: 'باقة فحوصات المختبر',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'بدون أسعار أو توفر وهمي'],
      photos: [
        { label: 'صورة معاينة لمنضدة مختبر', tone: 'lab' },
        { label: 'صورة معاينة لغرفة عينات', tone: 'suite' },
        { label: 'صورة معاينة لاستقبال مختبر', tone: 'reception' },
        { label: 'صورة معاينة لمنطقة فحص نظيفة', tone: 'service' }
      ]
    }
  },
  {
    id: 'bausher-specialist-clinic-preview',
    en: {
      providerKind: 'Specialist clinic',
      title: 'Bausher Specialist Clinic',
      subtitle: 'Approved specialist profile preview with reviewed service and contact context.',
      city: 'Muscat',
      area: 'Bausher preview',
      chips: ['Specialist care', 'Service chips', 'Actions after approval'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'A specialist card can keep the provider prominent while clearly marking preview-only content.',
      offerTitle: 'Skin consultation offer',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'No medical promise included'],
      photos: [
        { label: 'Specialist clinic mock photo', tone: 'clinic' },
        { label: 'Consultation suite mock photo', tone: 'suite' },
        { label: 'Specialist reception mock photo', tone: 'reception' },
        { label: 'Care detail mock photo', tone: 'service' }
      ]
    },
    ar: {
      providerKind: 'عيادة تخصصية',
      title: 'عيادة تخصصية في بوشر',
      subtitle: 'معاينة ملف تخصصي معتمد مع سياق خدمة وتواصل بعد المراجعة.',
      city: 'مسقط',
      area: 'معاينة بوشر',
      chips: ['رعاية تخصصية', 'شرائح خدمات', 'الإجراءات بعد الاعتماد'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'تحافظ بطاقة الاختصاصي على بروز ملف المقدّم مع توضيح أن المحتوى للمعاينة فقط.',
      offerTitle: 'عرض استشارة جلدية',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'بدون وعود طبية'],
      photos: [
        { label: 'صورة معاينة لعيادة تخصصية', tone: 'clinic' },
        { label: 'صورة معاينة لجناح استشارة', tone: 'suite' },
        { label: 'صورة معاينة لاستقبال تخصصي', tone: 'reception' },
        { label: 'صورة معاينة لتفاصيل رعاية', tone: 'service' }
      ]
    }
  },
  {
    id: 'azaiba-pharmacy-preview',
    en: {
      providerKind: 'Pharmacy',
      title: 'Azaiba Pharmacy',
      subtitle: 'Approved pharmacy profile preview with clear area and contact action context.',
      city: 'Muscat',
      area: 'Azaiba preview',
      chips: ['Pharmacy profile', 'Area context', 'Confirm details with provider'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'Pharmacy profiles can show public information and actions only after provider approval.',
      offerTitle: 'Pharmacy offer preview',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'Sponsored placement is clearly marked'],
      photos: [
        { label: 'Pharmacy front mock photo', tone: 'pharmacy' },
        { label: 'Pharmacy shelves mock photo', tone: 'service' },
        { label: 'Pharmacy counter mock photo', tone: 'reception' },
        { label: 'Local pharmacy mock photo', tone: 'clinic' }
      ]
    },
    ar: {
      providerKind: 'صيدلية',
      title: 'صيدلية في العذيبة',
      subtitle: 'معاينة ملف صيدلية معتمد مع سياق واضح للمنطقة وإجراءات التواصل.',
      city: 'مسقط',
      area: 'معاينة العذيبة',
      chips: ['ملف صيدلية', 'سياق المنطقة', 'أكّد التفاصيل مع المقدّم'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'يمكن لملفات الصيدليات عرض المعلومات العامة والإجراءات فقط بعد اعتماد المقدّم.',
      offerTitle: 'معاينة عرض صيدلية',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'يتم توضيح الظهور المدعوم بوضوح'],
      photos: [
        { label: 'صورة معاينة لواجهة صيدلية', tone: 'pharmacy' },
        { label: 'صورة معاينة لرفوف صيدلية', tone: 'service' },
        { label: 'صورة معاينة لمنضدة صيدلية', tone: 'reception' },
        { label: 'صورة معاينة لصيدلية محلية', tone: 'clinic' }
      ]
    }
  },
  {
    id: 'pet-care-clinic-preview',
    en: {
      providerKind: 'Pet clinic',
      title: 'Pet Care Clinic',
      subtitle: 'Approved pet care profile preview with profile actions and service chips.',
      city: 'Muscat',
      area: 'Muscat area preview',
      chips: ['Pet care', 'Service chips', 'Public profile only'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'Pet care providers can use the same polished profile format with safe preview wording.',
      offerTitle: 'Pet care package',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'No fake availability shown'],
      photos: [
        { label: 'Pet clinic reception mock photo', tone: 'pet' },
        { label: 'Pet care room mock photo', tone: 'suite' },
        { label: 'Pet clinic front mock photo', tone: 'clinic' },
        { label: 'Pet care detail mock photo', tone: 'service' }
      ]
    },
    ar: {
      providerKind: 'عيادة بيطرية',
      title: 'عيادة بيطرية',
      subtitle: 'معاينة ملف رعاية حيوانات معتمد مع إجراءات الملف وشرائح الخدمات.',
      city: 'مسقط',
      area: 'معاينة منطقة في مسقط',
      chips: ['رعاية الحيوانات', 'شرائح خدمات', 'ملف عام فقط'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'يمكن لمقدّمي رعاية الحيوانات استخدام نفس تنسيق الملف المصقول مع صياغة آمنة للمعاينة.',
      offerTitle: 'باقة رعاية الحيوانات',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'بدون توفر وهمي'],
      photos: [
        { label: 'صورة معاينة لاستقبال عيادة بيطرية', tone: 'pet' },
        { label: 'صورة معاينة لغرفة رعاية حيوانات', tone: 'suite' },
        { label: 'صورة معاينة لواجهة عيادة بيطرية', tone: 'clinic' },
        { label: 'صورة معاينة لتفاصيل رعاية حيوانات', tone: 'service' }
      ]
    }
  },
  {
    id: 'medical-service-provider-preview',
    en: {
      providerKind: 'Medical service',
      title: 'Medical Service Provider',
      subtitle: 'Approved service profile preview for future provider inventory beyond clinics.',
      city: 'Muscat',
      area: 'Oman preview',
      chips: ['Service profile', 'Reviewed content', 'Clear contact actions'],
      ratingLabel: 'Rating preview',
      ratingValue: '4.8 sample rating',
      ratingNote: 'Verified reviews appear after approval',
      providerContext: 'The preview inventory can scale to more providers while keeping each card profile-led.',
      offerTitle: 'Service offer preview',
      offerContext: ['Provider offer preview', 'Appears after provider approval', 'Sponsored placement is clearly marked'],
      photos: [
        { label: 'Medical service mock photo', tone: 'service' },
        { label: 'Service reception mock photo', tone: 'reception' },
        { label: 'Care suite mock photo', tone: 'suite' },
        { label: 'Provider detail mock photo', tone: 'clinic' }
      ]
    },
    ar: {
      providerKind: 'خدمة طبية',
      title: 'مقدم خدمة طبية',
      subtitle: 'معاينة ملف خدمة معتمد لمخزون مقدّمين مستقبلي يتجاوز العيادات.',
      city: 'مسقط',
      area: 'معاينة عُمان',
      chips: ['ملف خدمة', 'محتوى بعد المراجعة', 'إجراءات تواصل واضحة'],
      ratingLabel: 'معاينة التقييم',
      ratingValue: 'تقييم تجريبي 4.8',
      ratingNote: 'تظهر المراجعات الموثقة بعد الاعتماد',
      providerContext: 'يمكن لمخزون المعاينات التوسع لمقدّمين أكثر مع بقاء كل بطاقة متمحورة حول الملف.',
      offerTitle: 'معاينة عرض خدمة',
      offerContext: ['معاينة عرض مقدم الخدمة', 'يظهر بعد اعتماد مقدم الخدمة', 'يتم توضيح الظهور المدعوم بوضوح'],
      photos: [
        { label: 'صورة معاينة لخدمة طبية', tone: 'service' },
        { label: 'صورة معاينة لاستقبال خدمة', tone: 'reception' },
        { label: 'صورة معاينة لجناح رعاية', tone: 'suite' },
        { label: 'صورة معاينة لتفاصيل مقدم خدمة', tone: 'clinic' }
      ]
    }
  }
] as const;

const featuredBoardCopy: Record<SupportedLocale, FeaturedBoardCopy> = {
  en: {
    ariaLabel: 'Featured provider previews board',
    badge: 'Featured provider preview',
    title: 'Premium provider discovery',
    subtitle: 'Photos, rating, services, offers and contact actions in one approved profile preview.',
    trustNote: 'Demo profile. Confirm details with the provider after approval.',
    activeLabel: 'Featured now',
    profileLabel: 'Approved profile preview',
    locationLabel: 'Provider preview location',
    servicesLabel: 'Provider preview services',
    ratingAriaLabel: 'Safe sample rating preview',
    photosLabel: 'Provider photo preview rotation',
    offerHeading: 'Special Offer Preview',
    offerKicker: 'After approval',
    offerNote: 'No real prices, discounts, availability or medical promises are shown in this static preview.',
    railLabel: 'Provider preview selector',
    actionsLabel: 'Preview profile actions',
    actions: [
      { label: 'View Profile', icon: 'profile', tone: 'primary', aria: 'Preview action. Provider profile appears after provider approval.' },
      { label: 'Directions', icon: 'directions', tone: 'neutral', aria: 'Preview action. Directions appear after provider approval.' },
      { label: 'Call', icon: 'call', tone: 'contact', aria: 'Preview action. Call action appears after provider approval.' },
      { label: 'WhatsApp', icon: 'whatsapp', tone: 'whatsapp', aria: 'Preview action. WhatsApp action appears after provider approval.' }
    ]
  },
  ar: {
    ariaLabel: 'لوحة معاينات مميزة لمقدمي الرعاية',
    badge: 'معاينة مقدم مميز',
    title: 'اكتشاف مميز لمقدمي الرعاية',
    subtitle: 'صور وتقييم وخدمات وعروض وإجراءات تواصل ضمن معاينة ملف معتمد.',
    trustNote: 'ملف تجريبي. أكّد التفاصيل مع مقدم الخدمة بعد الاعتماد.',
    activeLabel: 'مميز الآن',
    profileLabel: 'معاينة ملف معتمد',
    locationLabel: 'موقع معاينة مقدم الخدمة',
    servicesLabel: 'خدمات معاينة مقدم الخدمة',
    ratingAriaLabel: 'معاينة تقييم تجريبية وآمنة',
    photosLabel: 'دوران صور مقدم الخدمة للمعاينة',
    offerHeading: 'معاينة عرض خاص',
    offerKicker: 'بعد الاعتماد',
    offerNote: 'لا يتم عرض أسعار أو خصومات أو توفر أو وعود طبية حقيقية في هذه المعاينة الثابتة.',
    railLabel: 'محدد معاينات مقدمي الرعاية',
    actionsLabel: 'معاينة إجراءات الملف',
    actions: [
      { label: 'عرض الملف', icon: 'profile', tone: 'primary', aria: 'إجراء معاينة. يظهر ملف مقدّم الخدمة بعد الاعتماد.' },
      { label: 'الاتجاهات', icon: 'directions', tone: 'neutral', aria: 'إجراء معاينة. تظهر الاتجاهات بعد اعتماد مقدّم الخدمة.' },
      { label: 'اتصال', icon: 'call', tone: 'contact', aria: 'إجراء معاينة. يظهر إجراء الاتصال بعد اعتماد مقدّم الخدمة.' },
      { label: 'واتساب', icon: 'whatsapp', tone: 'whatsapp', aria: 'إجراء معاينة. يظهر إجراء واتساب بعد اعتماد مقدّم الخدمة.' }
    ]
  }
};


function HomeFeaturedActionIcon({ icon }: { icon: FeaturedBoardCopy['actions'][number]['icon'] }) {
  if (icon === 'profile') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7.5 7.8a4.5 4.5 0 0 1 9 0v.3a4.5 4.5 0 0 1-9 0z" />
        <path d="M5.2 20.2c.7-3.3 3.1-5.2 6.8-5.2 1.4 0 2.6.27 3.6.8" />
        <path d="M16.4 13.6h4v4" />
        <path d="m20.2 13.8-5.4 5.4" />
      </svg>
    );
  }

  if (icon === 'directions') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 21s6.2-5.4 6.2-11.2A6.2 6.2 0 0 0 5.8 9.8C5.8 15.6 12 21 12 21z" />
        <path d="M12 12.2a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z" />
        <path d="M14.8 14.4 20 16.2l-1.8-5.2" />
        <path d="m20 16.2-5.2-1.8" />
      </svg>
    );
  }

  if (icon === 'call') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7.4 4.8 9.6 4c.8-.3 1.7.1 2 .9l.9 2.1c.3.7.1 1.5-.5 2l-1.1.9a9.8 9.8 0 0 0 4.2 4.2l.9-1.1c.5-.6 1.3-.8 2-.5l2.1.9c.8.3 1.2 1.2.9 2l-.8 2.2c-.3.8-1 1.3-1.8 1.3A14.4 14.4 0 0 1 6.1 6.6c0-.8.5-1.5 1.3-1.8z" />
        <path d="M15.8 5.5a5.2 5.2 0 0 1 2.7 2.8" />
        <path d="M17.9 3.5a8 8 0 0 1 3.8 4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5.6 19.2 6.7 16A8 8 0 1 1 10 18.3z" />
      <path d="M9.4 8.2c.35 2.7 2.15 4.75 4.55 5.45l1.35-1.15 2.2 1.12c-.4 1.52-1.42 2.34-2.86 2.34-3.74 0-7.28-3.62-7.28-7.36 0-1.44.82-2.46 2.34-2.86z" />
      <path d="M8.5 20.3 5.6 21l.85-2.75" />
    </svg>
  );
}

export function HomeFeaturedBoard2026({ locale, country, dir }: HomeFeaturedBoard2026Props) {
  const copy = featuredBoardCopy[locale];
  const [activeIndex, setActiveIndex] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeEntry = previewInventory[activeIndex] ?? previewInventory[0]!;
  const activePreview = activeEntry[locale];
  const primaryPhoto = activePreview.photos[activePhotoIndex] ?? activePreview.photos[0]!;
  const primaryPhotoOverlay = photoOverlayLabels[locale][primaryPhoto.tone];
  const hasSpecialOffer = Boolean(activePreview.offerTitle);
  const specialOfferStamp = locale === 'ar' ? 'عرض خاص' : 'Special Offer';
  const specialOfferTitle = locale === 'ar' ? `عرض خاص من ${activePreview.title}` : `Special Offer from ${activePreview.title}`;
  const specialOfferSubtitle = locale === 'ar' ? `${activePreview.offerTitle} من ${activePreview.title}` : `${activePreview.offerTitle} from ${activePreview.title}`;
  const specialOfferBullets =
    locale === 'ar'
      ? ['معاينة عرض خاص معتمد من مقدم الخدمة', 'مرتبط بهذا الملف', 'يظهر بعد الاعتماد']
      : ['Provider-approved special offer preview', 'Linked to this provider profile', 'Visible after approval'];


  useEffect(() => {
    if (isPaused) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const rotationTimer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % previewInventory.length);
    }, 5200);

    return () => window.clearInterval(rotationTimer);
  }, [isPaused]);

  useEffect(() => {
    if (isPaused) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const photoTimer = window.setInterval(() => {
      setActivePhotoIndex((currentIndex) => (currentIndex + 1) % activePreview.photos.length);
    }, 1750);

    return () => window.clearInterval(photoTimer);
  }, [activePreview.photos.length, isPaused]);

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
              <div className="dm2026-featured-board__photos" aria-label={copy.photosLabel}>
                <div
                  key={`${activeEntry.id}-${primaryPhoto.label}-main`}
                  className={`dm2026-featured-board__photo dm2026-featured-board__photo--main dm2026-featured-board__photo--${primaryPhoto.tone}`}
                  role="img"
                  aria-label={primaryPhoto.label}
                >
                  <span aria-hidden="true" />
                  <span className="dm2026-featured-board__photo-label">{primaryPhotoOverlay}</span>
                </div>
              </div>

              <div className="dm2026-featured-board__profile-head">
                <div className="dm2026-featured-board__profile-copy">
                  <p>{copy.profileLabel}</p>
                  <h3 id="dm2026-featured-profile-title">{activePreview.title}</h3>
                  <span>{activePreview.subtitle}</span>
                </div>
                <span className="dm2026-featured-board__profile-badges">
                  <span className="dm2026-featured-board__active-badge" aria-label={`${copy.activeLabel}: ${activePreview.title}`}>
                    {copy.activeLabel}
                  </span>
                  {hasSpecialOffer ? (
                    <span className="dm2026-featured-board__offer-stamp">
                      <span aria-hidden="true">✦</span>
                      {specialOfferStamp}
                    </span>
                  ) : null}
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
                    <span className={`dm2026-featured-board__action-symbol dm2026-featured-board__action-symbol--${action.tone}`} aria-hidden="true">
                      <HomeFeaturedActionIcon icon={action.icon} />
                    </span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </article>

            <aside className="dm2026-featured-board__offer dm2026-card-soft" aria-labelledby="dm2026-featured-offer-title">
              <div className="dm2026-featured-board__offer-head">
                <span className="dm2026-badge">{copy.offerKicker}</span>
                <span className="dm2026-featured-board__offer-seal" aria-hidden="true">✦</span>
              </div>
              <p className="dm2026-featured-board__offer-provider">{copy.offerHeading}</p>
              <h3 id="dm2026-featured-offer-title">{specialOfferTitle}</h3>
              <p className="dm2026-featured-board__offer-title">{specialOfferSubtitle}</p>
              <ul>
                {specialOfferBullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="dm2026-featured-board__offer-note">{copy.offerNote}</p>
            </aside>

            <div className="dm2026-featured-board__rail" aria-label={copy.railLabel}>
              {previewInventory.map((entry, index) => {
                const preview = entry[locale];
                const isActive = index === activeIndex;
                const railPhoto = preview.photos[0] ?? activePreview.photos[0]!;

                return (
                  <button
                    key={entry.id}
                    className="dm2026-featured-board__slot"
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveIndex(index)}
                  >
                    <span className={`dm2026-featured-board__slot-thumb dm2026-featured-board__slot-thumb--${railPhoto.tone}`} aria-hidden="true" />
                    <span>
                      <strong>{preview.title}</strong>
                      <small>{`${preview.providerKind} · ${preview.area}`}</small>
                      <span className="dm2026-featured-board__slot-rating">{preview.ratingValue}</span>
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
