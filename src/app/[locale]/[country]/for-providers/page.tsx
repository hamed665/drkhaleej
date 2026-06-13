import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  localeDirection,
  isSupportedCountry,
  isSupportedLocale,
  type SupportedCountry,
  type SupportedLocale
} from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

import { ProviderOnboardingForm, type ProviderFormCopy } from './provider-onboarding-form';

type Params = { locale: string; country: string };

type LocalizedText = Record<SupportedLocale, string>;

type ProviderCategory = {
  id: string;
  tone: 'dental' | 'beauty' | 'offers' | 'doctors' | 'labs' | 'pet' | 'hospitals';
  title: LocalizedText;
  description: LocalizedText;
};

type PricingPlan = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  prices: LocalizedText[];
};

type ProviderPageCopy = {
  metadataTitle: string;
  metadataDescription: string;
  hero: {
    badge: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    pills: readonly string[];
    trustMicrocopy: string;
    visualLabel: string;
    visualTitle: string;
    visualItems: readonly string[];
  };
  whoCanJoin: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
    ariaLabel: string;
  };
  benefits: {
    badge: string;
    title: string;
    subtitle: string;
    items: readonly { title: string; description: string }[];
  };
  onboarding: {
    badge: string;
    title: string;
    subtitle: string;
    steps: readonly { title: string; description: string }[];
  };
  review: {
    badge: string;
    title: string;
    subtitle: string;
    items: readonly string[];
  };
  pricing: {
    badge: string;
    title: string;
    subtitle: string;
    periods: readonly string[];
    disclaimer: string;
  };
  addons: {
    badge: string;
    title: string;
    subtitle: string;
    items: readonly string[];
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    chips: readonly string[];
    items: readonly { question: string; answer: string }[];
  };
  finalCta: {
    badge: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    trustMicrocopy: string;
  };
  disclaimer: {
    title: string;
    items: readonly string[];
  };
  form: ProviderFormCopy;
};

const providerCategories: readonly ProviderCategory[] = [
  {
    id: 'clinics',
    tone: 'hospitals',
    title: { en: 'Clinics', ar: 'العيادات' },
    description: { en: 'Public clinic information prepared for discovery after review.', ar: 'معلومات عيادات عامة تُجهّز للاكتشاف بعد المراجعة.' }
  },
  {
    id: 'doctors',
    tone: 'doctors',
    title: { en: 'Doctors', ar: 'الأطباء' },
    description: { en: 'Doctor profile details can be reviewed for public discovery readiness.', ar: 'يمكن مراجعة تفاصيل ملفات الأطباء لجاهزية الاكتشاف العام.' }
  },
  {
    id: 'dental',
    tone: 'dental',
    title: { en: 'Dental clinics', ar: 'عيادات الأسنان' },
    description: { en: 'Dental care categories, location and contact details can be checked.', ar: 'يمكن التحقق من فئات رعاية الأسنان والموقع وبيانات التواصل.' }
  },
  {
    id: 'pharmacies',
    tone: 'offers',
    title: { en: 'Pharmacies', ar: 'الصيدليات' },
    description: { en: 'Public pharmacy presence can be prepared without booking or sales claims.', ar: 'يمكن تجهيز حضور عام للصيدليات دون ادعاءات حجز أو بيع.' }
  },
  {
    id: 'labs',
    tone: 'labs',
    title: { en: 'Labs', ar: 'المختبرات' },
    description: { en: 'Diagnostic categories and contact readiness can be reviewed first.', ar: 'يمكن مراجعة فئات التشخيص وجاهزية التواصل أولاً.' }
  },
  {
    id: 'hospitals',
    tone: 'hospitals',
    title: { en: 'Hospitals & polyclinics', ar: 'المستشفيات والمجمعات الطبية' },
    description: { en: 'Large provider information can be prepared as reviewed public data.', ar: 'يمكن تجهيز معلومات مقدمي الخدمة الكبار كبيانات عامة مراجعة.' }
  },
  {
    id: 'beauty-wellness',
    tone: 'beauty',
    title: { en: 'Beauty & wellness providers', ar: 'مقدمو التجميل والرفاهية' },
    description: { en: 'Beauty, skin, laser and wellness categories can be listed carefully.', ar: 'يمكن عرض فئات التجميل والجلد والليزر والرفاهية بعناية.' }
  },
  {
    id: 'pet-clinics',
    tone: 'pet',
    title: { en: 'Pet clinics', ar: 'العيادات البيطرية' },
    description: { en: 'Veterinary public discovery information can be prepared for Oman users.', ar: 'يمكن تجهيز معلومات اكتشاف بيطرية عامة للمستخدمين في عُمان.' }
  }
];

const pricingPlans: readonly PricingPlan[] = [
  {
    id: 'free-discovery',
    title: { en: 'Free Discovery', ar: 'الاكتشاف المجاني' },
    description: { en: 'Basic reviewed public discovery concept.', ar: 'تصور أساسي لاكتشاف عام بعد المراجعة.' },
    prices: [{ en: 'Free', ar: 'مجاني' }, { en: 'Free', ar: 'مجاني' }, { en: 'Free', ar: 'مجاني' }]
  },
  {
    id: 'verified-starter',
    title: { en: 'Verified Starter', ar: 'بداية موثقة' },
    description: { en: 'Compact visibility concept for reviewed public information.', ar: 'تصور ظهور مختصر للمعلومات العامة بعد المراجعة.' },
    prices: [{ en: '49 OMR', ar: '49 ر.ع' }, { en: '89 OMR', ar: '89 ر.ع' }, { en: '159 OMR', ar: '159 ر.ع' }]
  },
  {
    id: 'growth-partner',
    title: { en: 'Growth Partner', ar: 'شريك النمو' },
    description: { en: 'Expanded visibility concept subject to confirmation.', ar: 'تصور ظهور أوسع يخضع للتأكيد.' },
    prices: [{ en: '99 OMR', ar: '99 ر.ع' }, { en: '179 OMR', ar: '179 ر.ع' }, { en: '329 OMR', ar: '329 ر.ع' }]
  },
  {
    id: 'premium-pro',
    title: { en: 'Premium Pro', ar: 'بريميوم برو' },
    description: { en: 'Higher-touch launch concept for eligible providers.', ar: 'تصور إطلاق بعناية أعلى لمقدمي الخدمة المؤهلين.' },
    prices: [{ en: '199 OMR', ar: '199 ر.ع' }, { en: '359 OMR', ar: '359 ر.ع' }, { en: '659 OMR', ar: '659 ر.ع' }]
  }
];

const copyByLocale: Record<SupportedLocale, ProviderPageCopy> = {
  en: {
    metadataTitle: 'List your healthcare business in Oman | DrMuscat',
    metadataDescription:
      'DrMuscat is onboarding clinics, doctors, pharmacies, labs, hospitals, wellness providers and pet clinics in Oman for reviewed bilingual public discovery profiles.',
    hero: {
      badge: 'For providers in Oman',
      title: 'Prepare your provider presence for DrMuscat discovery.',
      description:
        'Use the same Oman-first DrMuscat discovery experience to request review of your public provider information. This page is for visibility preparation only, not instant publishing or billing.',
      primaryCta: 'Request onboarding review',
      secondaryCta: 'Public discovery only',
      pills: ['Bilingual-ready', 'Contact-ready', 'Reviewed public information'],
      trustMicrocopy: 'No booking, payment flow, dashboard activation, ranking promise or immediate publishing is included in this request.',
      visualLabel: 'Provider readiness preview',
      visualTitle: 'Provider readiness',
      visualItems: ['Business category', 'City and area', 'Public contact details', 'Service categories']
    },
    whoCanJoin: {
      badge: 'Who can join',
      title: 'Provider categories DrMuscat can review',
      subtitle: 'A homepage-style discovery grid for public provider types across Oman.',
      cta: 'Review fit',
      ariaLabel: 'Provider categories eligible for onboarding review'
    },
    benefits: {
      badge: 'Benefits',
      title: 'What a reviewed public presence can prepare',
      subtitle: 'Conservative visibility foundations for future discovery pages, without fake guarantees or unsupported claims.',
      items: [
        { title: 'Public discovery profile', description: 'Prepare public provider details so people can understand location, category and contact options after review.' },
        { title: 'Bilingual presence', description: 'English and Arabic wording can be reviewed where available for Oman audiences.' },
        { title: 'Contact readiness', description: 'Public phone, WhatsApp, website, address and directions readiness can be checked before publication.' },
        { title: 'Services visibility', description: 'Service categories can be organized for discovery without making medical advice claims.' },
        { title: 'Reviewed public information', description: 'Submitted details may be reviewed for clarity, completeness and public suitability.' },
        { title: 'Future provider-approved offers', description: 'Offer concepts may be requested later only with provider approval and review.' }
      ]
    },
    onboarding: {
      badge: 'How onboarding works',
      title: 'A short review-first flow',
      subtitle: 'The request is deliberately simple and does not activate paid products or private dashboards.',
      steps: [
        { title: 'Submit onboarding request', description: 'Share core business, contact and location details through the form.' },
        { title: 'DrMuscat reviews public information', description: 'The team checks submitted details for public discovery readiness.' },
        { title: 'Approved details can be prepared', description: 'Accepted public details can be prepared for future discovery pages.' }
      ]
    },
    review: {
      badge: 'Reviewed first',
      title: 'What DrMuscat reviews before public preparation',
      subtitle: 'The review is focused on public information completeness and clarity.',
      items: [
        'business/provider name',
        'provider category',
        'city and area',
        'public phone and WhatsApp',
        'website and public address',
        'map or directions readiness',
        'public service categories',
        'bilingual wording where available'
      ]
    },
    pricing: {
      badge: 'Launch package concepts',
      title: 'Plans and pricing under review',
      subtitle: 'These concepts are shown for provider conversations only. They do not create checkout, payment, activation or entitlement flows.',
      periods: ['3 months', '6 months', '12 months'],
      disclaimer: 'Launch packages are subject to review, availability, and confirmation. Payment and activation workflows are not part of this page.'
    },
    addons: {
      badge: 'Future request-based add-ons',
      title: 'Add-ons can be requested separately later',
      subtitle: 'These are not active guaranteed products on this page; they are future/request-based concepts subject to review and confirmation.',
      items: [
        'Homepage featured placement',
        'Category featured placement',
        'Area placement',
        'Homepage offer placement',
        'Sponsored card request',
        'WhatsApp lead boost',
        'Extra doctors',
        'Extra branches',
        'Premium onboarding support'
      ]
    },
    faq: {
      badge: 'Provider FAQ',
      title: 'Questions providers usually ask before onboarding',
      subtitle: 'Clear answers for public discovery, review and future package concepts.',
      chips: ['Review-first', 'No medical advice', 'No instant publishing'],
      items: [
        { question: 'Is DrMuscat a booking platform?', answer: 'No. This page is for public discovery and visibility preparation only. Booking workflows are not part of this request.' },
        { question: 'Will my center be published immediately?', answer: 'No. Submitted details may require review, confirmation and preparation before anything is published.' },
        { question: 'Does this request give my business a verified badge?', answer: 'No. Sending a request does not grant a verified badge, ranking label or public claim.' },
        { question: 'What information does DrMuscat review first?', answer: 'The team reviews public name, category, city, area, contact details, address, directions readiness, services and bilingual wording where available.' },
        { question: 'Can my profile appear in English and Arabic?', answer: 'Yes, bilingual public wording can be prepared where accurate information is available and reviewed.' },
        { question: 'Can I add offers or packages later?', answer: 'Offer concepts may be requested later, but they require provider approval, review and clear presentation as public information.' },
        { question: 'Can prices or insurance details be listed?', answer: 'They may be considered only when public, accurate and confirmed. Users must still confirm prices and insurance directly with the provider.' },
        { question: 'Will being on DrMuscat guarantee Google ranking or new patients?', answer: 'No. DrMuscat does not guarantee search ranking, traffic, leads or patient acquisition.' },
        { question: 'Can doctors and branches be added later?', answer: 'They can be requested later for review, subject to availability, completeness and approval.' },
        { question: 'Can I upgrade plans later?', answer: 'Future plan changes may be discussed, but this page does not activate billing or entitlements.' },
        { question: 'Can I request advertising separately?', answer: 'Advertising requests can be discussed separately and must be reviewed before any public placement.' },
        { question: 'What happens if my submitted information is incomplete?', answer: 'DrMuscat may need additional details before preparing public discovery information.' },
        { question: 'Does DrMuscat provide medical advice?', answer: 'No. DrMuscat is a discovery and visibility platform only and does not provide medical advice.' }
      ]
    },
    finalCta: {
      badge: 'Ready to start',
      title: 'Request onboarding review',
      subtitle: 'Share public provider information so DrMuscat can review readiness for future discovery pages.',
      primaryCta: 'Request onboarding review',
      secondaryCta: 'Review details first',
      trustMicrocopy: 'Publishing is not immediate. Provider details may require review and confirmation.'
    },
    disclaimer: {
      title: 'Important discovery disclaimer',
      items: [
        'DrMuscat is public discovery and visibility only.',
        'DrMuscat is not medical advice.',
        'Publishing is not immediate and provider details may require review.',
        'Users must confirm services, prices, offers, insurance, availability and medical details directly with providers.'
      ]
    },
    form: {
      title: 'Request provider onboarding',
      description: 'Use this form to send your interest to the DrMuscat provider team for review.',
      requiredNote: 'Required fields are checked by browser validation before submission.',
      labels: {
        centerName: 'Center or business name',
        contactName: 'Contact person',
        phone: 'Phone',
        whatsapp: 'WhatsApp (optional)',
        email: 'Email (optional)',
        providerType: 'Provider type',
        cityText: 'City',
        areaText: 'Area (optional)',
        preferredLanguage: 'Preferred language',
        message: 'Message (optional)',
        consent: 'I agree that DrMuscat may contact me about provider onboarding and review of public information.',
        honeypot: 'Website'
      },
      placeholders: {
        centerName: 'Example Medical Center',
        contactName: 'Your name',
        phone: '+968 ...',
        whatsapp: '+968 ...',
        email: 'name@example.com',
        cityText: 'Muscat',
        areaText: 'Al Khuwair',
        message: 'Tell us which services or public details you want reviewed.'
      },
      providerTypeOptions: [
        { value: 'clinic', label: 'Clinic' },
        { value: 'medical_center', label: 'Medical center or hospital' },
        { value: 'dental_clinic', label: 'Dental clinic' },
        { value: 'pharmacy', label: 'Pharmacy' },
        { value: 'lab', label: 'Lab' },
        { value: 'wellness', label: 'Beauty or wellness provider' },
        { value: 'other', label: 'Other, including pet clinic' }
      ],
      languageOptions: [
        { value: 'en', label: 'English' },
        { value: 'ar', label: 'Arabic' },
        { value: 'en-ar', label: 'English and Arabic' }
      ],
      submit: 'Send onboarding request',
      submitting: 'Sending request…',
      success: 'Thank you. Your request was received for review.',
      error: 'We could not send the request. Please check the fields and try again.'
    }
  },
  ar: {
    metadataTitle: 'إدراج مقدم رعاية صحية في عُمان | DrMuscat',
    metadataDescription:
      'تستقبل DrMuscat طلبات انضمام العيادات والأطباء والصيدليات والمختبرات والمستشفيات ومقدمي التجميل والرفاهية والعيادات البيطرية في عُمان لملفات عامة ثنائية اللغة بعد المراجعة.',
    hero: {
      badge: 'لمقدمي الخدمات في عُمان',
      title: 'جهّز حضور مقدم الخدمة لاكتشاف DrMuscat.',
      description:
        'استخدم تجربة DrMuscat الموجهة لعُمان لطلب مراجعة معلوماتك العامة كمقدم خدمة. هذه الصفحة مخصصة لتجهيز الظهور فقط، وليست للنشر الفوري أو الدفع.',
      primaryCta: 'اطلب مراجعة الانضمام',
      secondaryCta: 'اكتشاف عام فقط',
      pills: ['جاهزية ثنائية اللغة', 'جاهزية التواصل', 'معلومات عامة مراجعة'],
      trustMicrocopy: 'لا يتضمن هذا الطلب حجزاً أو دفعاً أو تفعيل لوحة تحكم أو وعداً بالترتيب أو نشراً فورياً.',
      visualLabel: 'معاينة جاهزية مقدم الخدمة',
      visualTitle: 'جاهزية مقدم الخدمة',
      visualItems: ['فئة النشاط', 'المدينة والمنطقة', 'بيانات التواصل العامة', 'فئات الخدمات']
    },
    whoCanJoin: {
      badge: 'من يمكنه الانضمام',
      title: 'فئات مقدمي الخدمة التي يمكن لـ DrMuscat مراجعتها',
      subtitle: 'شبكة اكتشاف بأسلوب الصفحة الرئيسية لفئات مقدمي الخدمات العامة في عُمان.',
      cta: 'مراجعة الملاءمة',
      ariaLabel: 'فئات مقدمي الخدمة المؤهلة لطلب مراجعة الانضمام'
    },
    benefits: {
      badge: 'الفوائد',
      title: 'ما الذي يمكن أن يجهزه الحضور العام بعد المراجعة؟',
      subtitle: 'أسس ظهور محافظة لصفحات اكتشاف مستقبلية دون ضمانات غير مدعومة أو ادعاءات مزيفة.',
      items: [
        { title: 'ملف اكتشاف عام', description: 'تجهيز تفاصيل عامة تساعد الناس على فهم الموقع والفئة وخيارات التواصل بعد المراجعة.' },
        { title: 'حضور ثنائي اللغة', description: 'يمكن مراجعة صياغة عربية وإنجليزية عند توفر معلومات دقيقة لجمهور عُمان.' },
        { title: 'جاهزية التواصل', description: 'يمكن التحقق من الهاتف العام والواتساب والموقع الإلكتروني والعنوان وجاهزية الاتجاهات قبل النشر.' },
        { title: 'ظهور الخدمات', description: 'يمكن تنظيم فئات الخدمات للاكتشاف دون تقديم ادعاءات نصيحة طبية.' },
        { title: 'معلومات عامة مراجعة', description: 'قد تُراجع التفاصيل المرسلة من حيث الوضوح والاكتمال والملاءمة العامة.' },
        { title: 'عروض مستقبلية بموافقة مقدم الخدمة', description: 'يمكن طلب تصورات عروض لاحقاً فقط بموافقة مقدم الخدمة وبعد المراجعة.' }
      ]
    },
    onboarding: {
      badge: 'طريقة الانضمام',
      title: 'مسار قصير يبدأ بالمراجعة',
      subtitle: 'الطلب بسيط عمداً ولا يفعّل منتجات مدفوعة أو لوحات خاصة.',
      steps: [
        { title: 'إرسال طلب الانضمام', description: 'شارك بيانات النشاط والتواصل والموقع الأساسية عبر النموذج.' },
        { title: 'تراجع DrMuscat المعلومات العامة', description: 'يتحقق الفريق من جاهزية التفاصيل المرسلة للاكتشاف العام.' },
        { title: 'يمكن تجهيز التفاصيل المعتمدة', description: 'يمكن تجهيز التفاصيل العامة المقبولة لصفحات الاكتشاف المستقبلية.' }
      ]
    },
    review: {
      badge: 'تتم المراجعة أولاً',
      title: 'ما الذي تراجعه DrMuscat قبل التجهيز العام؟',
      subtitle: 'تركز المراجعة على اكتمال المعلومات العامة ووضوحها.',
      items: [
        'اسم النشاط أو مقدم الخدمة',
        'فئة مقدم الخدمة',
        'المدينة والمنطقة',
        'الهاتف العام والواتساب',
        'الموقع الإلكتروني والعنوان العام',
        'جاهزية الخريطة أو الاتجاهات',
        'فئات الخدمات العامة',
        'الصياغة ثنائية اللغة عند توفرها'
      ]
    },
    pricing: {
      badge: 'تصورات باقات الإطلاق',
      title: 'خطط وأسعار قيد المراجعة',
      subtitle: 'تُعرض هذه التصورات لنقاشات مقدمي الخدمة فقط. لا تنشئ عملية دفع أو تفعيل أو صلاحيات.',
      periods: ['3 أشهر', '6 أشهر', '12 شهراً'],
      disclaimer: 'تخضع باقات الإطلاق للمراجعة والتوفر والتأكيد. لا تتضمن هذه الصفحة مسارات الدفع أو التفعيل.'
    },
    addons: {
      badge: 'إضافات مستقبلية حسب الطلب',
      title: 'يمكن طلب الإضافات بشكل منفصل لاحقاً',
      subtitle: 'هذه ليست منتجات نشطة أو مضمونة في هذه الصفحة؛ إنها تصورات مستقبلية حسب الطلب وتخضع للمراجعة والتأكيد.',
      items: [
        'ظهور مميز في الصفحة الرئيسية',
        'ظهور مميز في الفئة',
        'ظهور حسب المنطقة',
        'موضع عرض في الصفحة الرئيسية',
        'طلب بطاقة ممولة',
        'تعزيز طلبات واتساب',
        'أطباء إضافيون',
        'فروع إضافية',
        'دعم انضمام مميز'
      ]
    },
    faq: {
      badge: 'أسئلة مقدمي الخدمة',
      title: 'أسئلة شائعة قبل طلب الانضمام',
      subtitle: 'إجابات واضحة حول الاكتشاف العام والمراجعة وتصورات الباقات المستقبلية.',
      chips: ['المراجعة أولاً', 'ليست نصيحة طبية', 'لا نشر فوري'],
      items: [
        { question: 'هل DrMuscat منصة حجز؟', answer: 'لا. هذه الصفحة مخصصة للاكتشاف العام وتجهيز الظهور فقط. مسارات الحجز ليست جزءاً من هذا الطلب.' },
        { question: 'هل سيتم نشر مركزي فوراً؟', answer: 'لا. قد تتطلب التفاصيل المرسلة مراجعة وتأكيداً وتجهيزاً قبل أي نشر.' },
        { question: 'هل يمنح هذا الطلب نشاطي شارة توثيق؟', answer: 'لا. إرسال الطلب لا يمنح شارة توثيق أو تسمية ترتيب أو ادعاء عاماً.' },
        { question: 'ما المعلومات التي تراجعها DrMuscat أولاً؟', answer: 'يراجع الفريق الاسم العام والفئة والمدينة والمنطقة وبيانات التواصل والعنوان وجاهزية الاتجاهات والخدمات والصياغة ثنائية اللغة عند توفرها.' },
        { question: 'هل يمكن أن يظهر ملفي بالعربية والإنجليزية؟', answer: 'نعم، يمكن تجهيز صياغة عامة ثنائية اللغة عند توفر معلومات دقيقة وبعد مراجعتها.' },
        { question: 'هل يمكنني إضافة عروض أو باقات لاحقاً؟', answer: 'يمكن طلب تصورات عروض لاحقاً، لكنها تحتاج إلى موافقة مقدم الخدمة ومراجعة وعرض واضح كمعلومات عامة.' },
        { question: 'هل يمكن عرض الأسعار أو تفاصيل التأمين؟', answer: 'قد تُدرس فقط عندما تكون عامة ودقيقة ومؤكدة. ويجب على المستخدمين تأكيد الأسعار والتأمين مباشرة مع مقدم الخدمة.' },
        { question: 'هل يضمن الظهور في DrMuscat ترتيباً في Google أو مرضى جدداً؟', answer: 'لا. لا تضمن DrMuscat ترتيب البحث أو الزيارات أو العملاء المحتملين أو اكتساب المرضى.' },
        { question: 'هل يمكن إضافة أطباء وفروع لاحقاً؟', answer: 'يمكن طلب ذلك لاحقاً للمراجعة، وفق التوفر والاكتمال والموافقة.' },
        { question: 'هل يمكنني ترقية الخطة لاحقاً؟', answer: 'يمكن مناقشة تغييرات مستقبلية في الخطط، لكن هذه الصفحة لا تفعّل الفوترة أو الصلاحيات.' },
        { question: 'هل يمكنني طلب إعلان بشكل منفصل؟', answer: 'يمكن مناقشة طلبات الإعلان بشكل منفصل ويجب مراجعتها قبل أي ظهور عام.' },
        { question: 'ماذا يحدث إذا كانت معلوماتي ناقصة؟', answer: 'قد تحتاج DrMuscat إلى تفاصيل إضافية قبل تجهيز معلومات الاكتشاف العامة.' },
        { question: 'هل تقدم DrMuscat نصيحة طبية؟', answer: 'لا. DrMuscat منصة اكتشاف وظهور فقط ولا تقدم نصيحة طبية.' }
      ]
    },
    finalCta: {
      badge: 'جاهز للبدء',
      title: 'اطلب مراجعة الانضمام',
      subtitle: 'شارك معلومات مقدم الخدمة العامة حتى تتمكن DrMuscat من مراجعة الجاهزية لصفحات الاكتشاف المستقبلية.',
      primaryCta: 'اطلب مراجعة الانضمام',
      secondaryCta: 'راجع التفاصيل أولاً',
      trustMicrocopy: 'النشر ليس فورياً. قد تتطلب تفاصيل مقدم الخدمة مراجعة وتأكيداً.'
    },
    disclaimer: {
      title: 'تنبيه مهم حول الاكتشاف',
      items: [
        'DrMuscat مخصصة للاكتشاف والظهور العام فقط.',
        'DrMuscat ليست نصيحة طبية.',
        'النشر ليس فورياً وقد تتطلب تفاصيل مقدم الخدمة مراجعة.',
        'يجب على المستخدمين تأكيد الخدمات والأسعار والعروض والتأمين والتوفر والتفاصيل الطبية مباشرة مع مقدمي الخدمة.'
      ]
    },
    form: {
      title: 'طلب انضمام مقدم خدمة',
      description: 'استخدم هذا النموذج لإرسال اهتمامك إلى فريق مقدمي الخدمات في DrMuscat للمراجعة.',
      requiredNote: 'يتحقق المتصفح من الحقول المطلوبة قبل الإرسال.',
      labels: {
        centerName: 'اسم المركز أو النشاط',
        contactName: 'الشخص المسؤول للتواصل',
        phone: 'الهاتف',
        whatsapp: 'واتساب (اختياري)',
        email: 'البريد الإلكتروني (اختياري)',
        providerType: 'نوع مقدم الخدمة',
        cityText: 'المدينة',
        areaText: 'المنطقة (اختياري)',
        preferredLanguage: 'لغة التواصل المفضلة',
        message: 'رسالة (اختياري)',
        consent: 'أوافق على أن تتواصل معي DrMuscat بخصوص الانضمام ومراجعة المعلومات العامة.',
        honeypot: 'الموقع الإلكتروني'
      },
      placeholders: {
        centerName: 'مثال: مركز طبي',
        contactName: 'اسمك',
        phone: '+968 ...',
        whatsapp: '+968 ...',
        email: 'name@example.com',
        cityText: 'مسقط',
        areaText: 'الخوير',
        message: 'أخبرنا بالخدمات أو التفاصيل العامة التي ترغب في مراجعتها.'
      },
      providerTypeOptions: [
        { value: 'clinic', label: 'عيادة' },
        { value: 'medical_center', label: 'مركز طبي أو مستشفى' },
        { value: 'dental_clinic', label: 'عيادة أسنان' },
        { value: 'pharmacy', label: 'صيدلية' },
        { value: 'lab', label: 'مختبر' },
        { value: 'wellness', label: 'تجميل أو رفاهية' },
        { value: 'other', label: 'أخرى، بما في ذلك عيادة بيطرية' }
      ],
      languageOptions: [
        { value: 'ar', label: 'العربية' },
        { value: 'en', label: 'الإنجليزية' },
        { value: 'en-ar', label: 'العربية والإنجليزية' }
      ],
      submit: 'إرسال طلب الانضمام',
      submitting: 'جارٍ الإرسال…',
      success: 'شكراً لك. تم استلام طلبك للمراجعة.',
      error: 'تعذر إرسال الطلب. يرجى مراجعة الحقول والمحاولة مرة أخرى.'
    }
  }
};

function ProviderEmbossedSymbol({ tone }: { tone: ProviderCategory['tone'] }) {
  if (tone === 'dental') {
    return (
      <svg className="dm2026-discovery-card__embossed-svg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <path className="dm2026-symbol__cast dm2026-symbol__cast--dental" d="M31 24c6-9 15-11 23-5 8-6 17-4 23 5 8 13 4 33-7 48-5 7-10 6-13-3-3-10-5-16-9-16s-6 6-9 16c-3 9-8 10-13 3-11-15-15-35-7-48Z" />
        <path className="dm2026-symbol__mass dm2026-symbol__mass--hero dm2026-symbol__mass--dental" d="M31 21c6-9 15-11 23-5 8-6 17-4 23 5 8 13 4 33-7 48-5 7-10 6-13-3-3-10-5-16-9-16s-6 6-9 16c-3 9-8 10-13 3-11-15-15-35-7-48Z" />
        <path className="dm2026-symbol__ridge dm2026-symbol__ridge--dental" d="M37 31c5-4 11-4 17-1 6-3 12-3 17 1" />
      </svg>
    );
  }

  if (tone === 'beauty') {
    return (
      <svg className="dm2026-discovery-card__embossed-svg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <path className="dm2026-symbol__cast dm2026-symbol__cast--beauty-mirror" d="M30 20h36c8 0 14 6 14 14v20c0 18-14 32-32 32S16 72 16 54V34c0-8 6-14 14-14Z" />
        <path className="dm2026-symbol__mass dm2026-symbol__mass--beauty-mirror" d="M31 17h34c8 0 14 6 14 14v20c0 18-13 32-31 32S17 69 17 51V31c0-8 6-14 14-14Z" />
        <path className="dm2026-symbol__ridge dm2026-symbol__ridge--beauty-mirror" d="M31 33h34M37 48c8 8 14 8 22 0M48 25v48" />
      </svg>
    );
  }

  return (
    <svg className="dm2026-discovery-card__embossed-svg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      <path className="dm2026-symbol__cast" d="M24 26h48c6 0 10 4 10 10v38H14V36c0-6 4-10 10-10Z" />
      <path className="dm2026-symbol__mass dm2026-symbol__mass--hero" d="M24 22h48c6 0 10 4 10 10v38H14V32c0-6 4-10 10-10Z" />
      <path className="dm2026-symbol__ridge" d="M30 38h36M30 52h22M48 22v-8h16v8" />
      {tone === 'doctors' ? <path className="dm2026-symbol__mark dm2026-symbol__mark--pulse" d="M22 70h16l5-10 7 18 7-12h19" /> : null}
      {tone === 'pet' ? <path className="dm2026-symbol__mark" d="M32 68c5-10 27-10 32 0M33 42h.1M63 42h.1M40 54c5 4 11 4 16 0" /> : null}
      {tone === 'labs' ? <path className="dm2026-symbol__mark" d="M38 34v26c0 7 5 12 10 12s10-5 10-12V34M35 34h26M39 56h18" /> : null}
      {tone === 'offers' ? <path className="dm2026-symbol__mark" d="M31 34h34l9 13-26 27-26-27ZM35 47h39M42 34l6 40 6-40" /> : null}
    </svg>
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};

  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({
    locale,
    country: country as SupportedCountry,
    pathname: '/for-providers',
    title: copy.metadataTitle,
    description: copy.metadataDescription
  });
}

export default async function PublicProviderPlansPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const copy = copyByLocale[safeLocale];
  const dir = localeDirection(safeLocale);

  return (
    <main className="home-foundation dm2026-home-page provider-onboarding-page" dir={dir} data-locale={safeLocale} data-country={safeCountry}>
      <section className="dm2026-provider-cta dm2026-container provider-onboarding-hero" aria-labelledby="provider-onboarding-title">
        <div className="dm2026-provider-cta__shell">
          <div className="dm2026-provider-cta__glow dm2026-provider-cta__glow--primary" aria-hidden="true" />
          <div className="dm2026-provider-cta__glow dm2026-provider-cta__glow--accent" aria-hidden="true" />

          <div className="dm2026-provider-cta__copy">
            <span className="dm2026-badge dm2026-provider-cta__badge">{copy.hero.badge}</span>
            <div className="dm2026-provider-cta__headline-group">
              <h1 id="provider-onboarding-title">{copy.hero.title}</h1>
              <p>{copy.hero.description}</p>
            </div>
            <p className="dm2026-provider-cta__supporting-line">{copy.hero.secondaryCta}</p>
            <ul className="dm2026-provider-cta__pills" aria-label={copy.hero.secondaryCta}>
              {copy.hero.pills.map((pill) => (
                <li key={pill}>{pill}</li>
              ))}
            </ul>
            <div className="dm2026-provider-cta__actions" aria-label={copy.hero.badge}>
              <a className="dm2026-button dm2026-button-primary dm2026-provider-cta__button" href="#provider-onboarding-form">
                {copy.hero.primaryCta}
              </a>
              <a className="dm2026-button dm2026-button-secondary dm2026-provider-cta__button" href="#provider-pricing-concepts">
                {copy.hero.secondaryCta}
              </a>
            </div>
            <p className="dm2026-provider-cta__trust">{copy.hero.trustMicrocopy}</p>
          </div>

          <div className="dm2026-provider-cta__visual provider-onboarding-hero__visual" aria-label={copy.hero.visualLabel}>
            <div className="dm2026-provider-cta__preview-card provider-onboarding-hero__readiness">
              <div className="dm2026-provider-cta__preview-head">
                <span aria-hidden="true" />
                <strong>{copy.hero.visualTitle}</strong>
              </div>
              <ul className="dm2026-provider-cta__preview-items">
                {copy.hero.visualItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="dm2026-discovery-categories dm2026-container provider-onboarding-section" aria-labelledby="provider-categories-title">
        <div className="dm2026-discovery-categories__module">
          <div className="dm2026-discovery-categories__glow dm2026-discovery-categories__glow--teal" aria-hidden="true" />
          <div className="dm2026-discovery-categories__glow dm2026-discovery-categories__glow--gold" aria-hidden="true" />
          <div className="dm2026-discovery-categories__header">
            <span className="dm2026-badge dm2026-discovery-categories__badge">{copy.whoCanJoin.badge}</span>
            <div>
              <h2 id="provider-categories-title">{copy.whoCanJoin.title}</h2>
              <p>{copy.whoCanJoin.subtitle}</p>
            </div>
          </div>
          <div className="dm2026-discovery-categories__grid provider-onboarding-categories__grid" aria-label={copy.whoCanJoin.ariaLabel}>
            {providerCategories.map((category, index) => {
              const variant = index < 3 ? 'hero' : 'secondary';
              const size = index < 3 ? 'large' : 'medium';
              return (
                <article
                  className={`dm2026-discovery-card dm2026-discovery-card--${variant} dm2026-discovery-card--${size} dm2026-discovery-card--${category.tone} dm2026-card-glass`}
                  key={category.id}
                >
                  <span className="dm2026-discovery-card__visual" aria-hidden="true">
                    <span className="dm2026-discovery-card__visual-plate">
                      <ProviderEmbossedSymbol tone={category.tone} />
                    </span>
                  </span>
                  <span className="dm2026-discovery-card__copy">
                    <strong>{category.title[safeLocale]}</strong>
                    <span>{category.description[safeLocale]}</span>
                  </span>
                  <span className="dm2026-discovery-card__cta">{copy.whoCanJoin.cta}</span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="dm2026-container dm2026-section provider-onboarding-section" aria-labelledby="provider-benefits-title">
        <div className="dm2026-section-header">
          <span className="dm2026-badge">{copy.benefits.badge}</span>
          <h2 id="provider-benefits-title">{copy.benefits.title}</h2>
          <p>{copy.benefits.subtitle}</p>
        </div>
        <div className="provider-onboarding-card-grid provider-onboarding-card-grid--three">
          {copy.benefits.items.map((benefit) => (
            <article className="dm2026-card-glass provider-onboarding-info-card" key={benefit.title}>
              <span className="provider-onboarding-info-card__dot" aria-hidden="true" />
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dm2026-container dm2026-section provider-onboarding-section provider-onboarding-review-flow" aria-labelledby="provider-onboarding-flow-title">
        <div className="dm2026-card-glass provider-onboarding-panel">
          <div className="dm2026-section-header provider-onboarding-panel__header">
            <span className="dm2026-badge">{copy.onboarding.badge}</span>
            <h2 id="provider-onboarding-flow-title">{copy.onboarding.title}</h2>
            <p>{copy.onboarding.subtitle}</p>
          </div>
          <ol className="provider-onboarding-steps">
            {copy.onboarding.steps.map((step, index) => (
              <li className="dm2026-card-soft" key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="dm2026-card-glass provider-onboarding-panel">
          <div className="dm2026-section-header provider-onboarding-panel__header">
            <span className="dm2026-badge">{copy.review.badge}</span>
            <h2>{copy.review.title}</h2>
            <p>{copy.review.subtitle}</p>
          </div>
          <ul className="provider-onboarding-checklist">
            {copy.review.items.map((item) => (
              <li className="dm2026-card-soft" key={item}>
                <span aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="provider-pricing-concepts" className="dm2026-container dm2026-section provider-onboarding-section" aria-labelledby="provider-pricing-title">
        <div className="dm2026-section-header">
          <span className="dm2026-badge">{copy.pricing.badge}</span>
          <h2 id="provider-pricing-title">{copy.pricing.title}</h2>
          <p>{copy.pricing.subtitle}</p>
        </div>
        <div className="provider-onboarding-periods" aria-label={copy.pricing.badge}>
          {copy.pricing.periods.map((period) => (
            <span className="dm2026-badge" key={period}>{period}</span>
          ))}
        </div>
        <div className="provider-onboarding-pricing-grid">
          {pricingPlans.map((plan) => (
            <article className="dm2026-card-glass provider-onboarding-price-card" key={plan.id}>
              <h3>{plan.title[safeLocale]}</h3>
              <p>{plan.description[safeLocale]}</p>
              <ul>
                {copy.pricing.periods.map((period, index) => (
                  <li key={`${plan.id}-${period}`}>
                    <span>{period}</span>
                    <strong>{plan.prices[index]?.[safeLocale]}</strong>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="dm2026-card-soft provider-onboarding-pricing-disclaimer">{copy.pricing.disclaimer}</p>
      </section>

      <section className="dm2026-container dm2026-section provider-onboarding-section" aria-labelledby="provider-addons-title">
        <div className="dm2026-section-header">
          <span className="dm2026-badge">{copy.addons.badge}</span>
          <h2 id="provider-addons-title">{copy.addons.title}</h2>
          <p>{copy.addons.subtitle}</p>
        </div>
        <ul className="provider-onboarding-pill-list">
          {copy.addons.items.map((item) => (
            <li className="dm2026-card-soft" key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section id="provider-onboarding-form" className="dm2026-container dm2026-section provider-onboarding-section provider-onboarding-form-section" aria-label={copy.form.title}>
        <ProviderOnboardingForm locale={safeLocale} copy={copy.form} />
      </section>

      <section className="dm2026-home-faq dm2026-container provider-onboarding-section" aria-labelledby="provider-faq-title" aria-describedby="provider-faq-subtitle">
        <div className="dm2026-home-faq__shell">
          <div className="dm2026-home-faq__intro">
            <span className="dm2026-badge dm2026-home-faq__badge">{copy.faq.badge}</span>
            <div className="dm2026-home-faq__headline-group">
              <h2 id="provider-faq-title">{copy.faq.title}</h2>
              <p id="provider-faq-subtitle">{copy.faq.subtitle}</p>
            </div>
            <ul className="dm2026-home-faq__trust-chips" aria-label={copy.faq.badge}>
              {copy.faq.chips.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
          </div>
          <div className="dm2026-home-faq__accordion" aria-label={copy.faq.title}>
            {copy.faq.items.map((item, index) => (
              <details className="dm2026-home-faq__item provider-onboarding-faq__item" key={item.question} open={index === 0}>
                <summary className="dm2026-home-faq__button">
                  <span>{item.question}</span>
                  <span className="dm2026-home-faq__icon" aria-hidden="true" />
                </summary>
                <div className="dm2026-home-faq__panel">
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="dm2026-provider-cta dm2026-container provider-onboarding-section provider-onboarding-final-cta" aria-labelledby="provider-final-cta-title">
        <div className="dm2026-provider-cta__shell">
          <div className="dm2026-provider-cta__glow dm2026-provider-cta__glow--primary" aria-hidden="true" />
          <div className="dm2026-provider-cta__copy">
            <span className="dm2026-badge dm2026-provider-cta__badge">{copy.finalCta.badge}</span>
            <div className="dm2026-provider-cta__headline-group">
              <h2 id="provider-final-cta-title">{copy.finalCta.title}</h2>
              <p>{copy.finalCta.subtitle}</p>
            </div>
            <div className="dm2026-provider-cta__actions" aria-label={copy.finalCta.badge}>
              <a className="dm2026-button dm2026-button-primary dm2026-provider-cta__button" href="#provider-onboarding-form">
                {copy.finalCta.primaryCta}
              </a>
              <a className="dm2026-button dm2026-button-secondary dm2026-provider-cta__button" href="#provider-pricing-concepts">
                {copy.finalCta.secondaryCta}
              </a>
            </div>
            <p className="dm2026-provider-cta__trust">{copy.finalCta.trustMicrocopy}</p>
          </div>
          <aside className="dm2026-card-glass provider-onboarding-disclaimer" aria-label={copy.disclaimer.title}>
            <h3>{copy.disclaimer.title}</h3>
            <ul>
              {copy.disclaimer.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <style>{`
        .provider-onboarding-page {
          padding-block: clamp(var(--dm-space-6), 6vw, var(--dm-space-10));
        }

        .provider-onboarding-section {
          scroll-margin-top: 7rem;
        }

        .provider-onboarding-hero .dm2026-provider-cta__shell,
        .provider-onboarding-final-cta .dm2026-provider-cta__shell {
          grid-template-columns: minmax(0, 1.15fr) minmax(17rem, 0.85fr);
        }

        .provider-onboarding-hero .dm2026-provider-cta__headline-group h1,
        .provider-onboarding-final-cta .dm2026-provider-cta__headline-group h2 {
          max-inline-size: 12.5ch;
        }

        .provider-onboarding-hero__visual {
          display: grid;
          align-items: center;
          min-block-size: 100%;
        }

        .provider-onboarding-hero__readiness {
          position: relative;
          z-index: 1;
          margin-inline: auto;
          inline-size: min(100%, 24rem);
        }

        .provider-onboarding-categories__grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .provider-onboarding-categories__grid .dm2026-discovery-card--hero,
        .provider-onboarding-categories__grid .dm2026-discovery-card--large,
        .provider-onboarding-categories__grid .dm2026-discovery-card--secondary,
        .provider-onboarding-categories__grid .dm2026-discovery-card--medium {
          grid-column: span 1;
          min-block-size: 100%;
        }

        .provider-onboarding-card-grid,
        .provider-onboarding-pricing-grid,
        .provider-onboarding-review-flow {
          display: grid;
          gap: var(--dm-space-4);
        }

        .provider-onboarding-card-grid--three {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .provider-onboarding-info-card,
        .provider-onboarding-price-card,
        .provider-onboarding-panel,
        .provider-onboarding-disclaimer {
          padding: clamp(var(--dm-space-4), 3vw, var(--dm-space-6));
        }

        .provider-onboarding-info-card {
          display: grid;
          gap: var(--dm-space-3);
        }

        .provider-onboarding-info-card h3,
        .provider-onboarding-price-card h3,
        .provider-onboarding-panel h3,
        .provider-onboarding-disclaimer h3 {
          margin: 0;
          color: var(--dm-color-text);
          font-size: clamp(1rem, 2vw, 1.18rem);
        }

        .provider-onboarding-info-card p,
        .provider-onboarding-price-card p,
        .provider-onboarding-panel p,
        .provider-onboarding-disclaimer li,
        .provider-onboarding-pricing-disclaimer {
          color: var(--dm-color-text-muted);
          line-height: 1.65;
        }

        .provider-onboarding-info-card__dot {
          inline-size: 0.72rem;
          block-size: 0.72rem;
          border-radius: var(--dm-radius-pill);
          background: linear-gradient(135deg, var(--dm-color-brand), var(--dm-color-accent-gold));
          box-shadow: 0 0 0 0.38rem rgba(14, 110, 100, 0.08);
        }

        .provider-onboarding-review-flow {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }

        .provider-onboarding-panel__header {
          margin-block-end: var(--dm-space-5);
        }

        .provider-onboarding-steps,
        .provider-onboarding-checklist,
        .provider-onboarding-pill-list,
        .provider-onboarding-price-card ul,
        .provider-onboarding-disclaimer ul {
          display: grid;
          gap: var(--dm-space-3);
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .provider-onboarding-steps li,
        .provider-onboarding-checklist li {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: var(--dm-space-3);
          align-items: start;
          padding: var(--dm-space-4);
        }

        .provider-onboarding-steps li > span,
        .provider-onboarding-checklist li > span {
          display: inline-grid;
          place-items: center;
          inline-size: 2rem;
          block-size: 2rem;
          border-radius: var(--dm-radius-pill);
          background: rgba(14, 110, 100, 0.1);
          color: var(--dm-color-brand-strong);
          font-weight: var(--dm-weight-bold, 700);
        }

        .provider-onboarding-steps p {
          margin-block: var(--dm-space-1) 0;
        }

        .provider-onboarding-periods,
        .provider-onboarding-pill-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--dm-space-2);
          margin-block-end: var(--dm-space-4);
        }

        .provider-onboarding-pricing-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .provider-onboarding-price-card {
          display: grid;
          gap: var(--dm-space-3);
          align-content: start;
        }

        .provider-onboarding-price-card p {
          margin: 0;
          font-size: var(--dm-type-caption, 0.875rem);
        }

        .provider-onboarding-price-card li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--dm-space-2);
          border: 1px solid rgba(14, 110, 100, 0.12);
          border-radius: var(--dm-radius-lg);
          background: rgba(255, 255, 255, 0.66);
          padding: 0.7rem 0.8rem;
          color: var(--dm-color-text-muted);
        }

        .provider-onboarding-price-card strong {
          color: var(--dm-color-brand-strong);
        }

        .provider-onboarding-pricing-disclaimer {
          margin-block: var(--dm-space-4) 0;
          padding: var(--dm-space-4);
          font-size: var(--dm-type-caption, 0.875rem);
        }

        .provider-onboarding-pill-list li {
          border-radius: var(--dm-radius-pill);
          padding: 0.72rem 1rem;
          color: var(--dm-color-brand-strong);
          font-weight: var(--dm-weight-semibold, 600);
        }

        .provider-onboarding-form-section {
          padding-block-start: clamp(var(--dm-space-8), 7vw, var(--dm-space-14));
        }

        .provider-onboarding-form {
          display: grid;
          gap: var(--dm-space-4);
          padding: clamp(var(--dm-space-4), 4vw, var(--dm-space-7));
        }

        .provider-onboarding-form__intro {
          display: grid;
          gap: var(--dm-space-2);
          max-inline-size: 46rem;
        }

        .provider-onboarding-form h2,
        .provider-onboarding-form p,
        .provider-onboarding-form__intro span,
        .provider-onboarding-form__status {
          margin: 0;
        }

        .provider-onboarding-form h2 {
          font-size: clamp(1.55rem, 3vw, 2.35rem);
          letter-spacing: -0.035em;
          color: var(--dm-color-text);
        }

        .provider-onboarding-form p,
        .provider-onboarding-form__intro span,
        .provider-onboarding-form__consent span {
          color: var(--dm-color-text-muted);
          line-height: 1.65;
        }

        .provider-onboarding-form__grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--dm-space-3);
        }

        .provider-onboarding-form label {
          display: grid;
          gap: 0.42rem;
          color: var(--dm-color-text);
          font-weight: var(--dm-weight-semibold, 600);
        }

        .provider-onboarding-form label > span {
          font-size: var(--dm-type-caption, 0.875rem);
        }

        .provider-onboarding-form__message,
        .provider-onboarding-form__consent,
        .provider-onboarding-form__submit,
        .provider-onboarding-form__status {
          grid-column: 1 / -1;
        }

        .provider-onboarding-form__consent {
          display: flex !important;
          align-items: flex-start;
          gap: var(--dm-space-2);
          border: 1px solid rgba(14, 110, 100, 0.12);
          border-radius: var(--dm-radius-lg);
          background: rgba(239, 246, 244, 0.72);
          padding: var(--dm-space-3);
        }

        .provider-onboarding-form__consent input {
          inline-size: auto;
          margin-block-start: 0.28rem;
          accent-color: var(--dm-color-brand);
        }

        .provider-onboarding-form__website {
          position: absolute;
          inline-size: 1px;
          block-size: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          clip-path: inset(50%);
          white-space: nowrap;
        }

        .provider-onboarding-form__submit {
          justify-self: start;
          border: 0;
        }

        [dir='rtl'] .provider-onboarding-form__submit {
          justify-self: end;
        }

        .provider-onboarding-form__status {
          min-block-size: 1.45rem;
          font-weight: var(--dm-weight-semibold, 600);
        }

        .provider-onboarding-form__status--success {
          color: var(--dm-color-brand-strong);
        }

        .provider-onboarding-form__status--error {
          color: #b42318;
        }

        .provider-onboarding-faq__item summary::-webkit-details-marker {
          display: none;
        }

        .provider-onboarding-faq__item[open] {
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 18px 45px rgba(8, 47, 43, 0.08);
        }

        .provider-onboarding-faq__item[open] .dm2026-home-faq__icon::after {
          transform: translate(-50%, -50%) scaleY(0);
        }

        .provider-onboarding-disclaimer {
          position: relative;
          z-index: 1;
          align-self: center;
        }

        .provider-onboarding-disclaimer ul {
          margin-block-start: var(--dm-space-3);
        }

        .provider-onboarding-disclaimer li {
          position: relative;
          padding-inline-start: 1.35rem;
        }

        .provider-onboarding-disclaimer li::before {
          content: '';
          position: absolute;
          inset-block-start: 0.72em;
          inset-inline-start: 0;
          inline-size: 0.42rem;
          block-size: 0.42rem;
          border-radius: var(--dm-radius-pill);
          background: var(--dm-color-accent-gold);
        }

        [dir='rtl'] .provider-onboarding-disclaimer li {
          padding-inline-start: 0;
          padding-inline-end: 1.35rem;
        }

        [dir='rtl'] .provider-onboarding-disclaimer li::before {
          inset-inline-start: auto;
          inset-inline-end: 0;
        }

        @media (max-width: 64rem) {
          .provider-onboarding-hero .dm2026-provider-cta__shell,
          .provider-onboarding-final-cta .dm2026-provider-cta__shell,
          .provider-onboarding-review-flow,
          .provider-onboarding-card-grid--three,
          .provider-onboarding-pricing-grid {
            grid-template-columns: 1fr;
          }

          .provider-onboarding-categories__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 48rem) {
          .provider-onboarding-page {
            padding-block-start: var(--dm-space-4);
          }

          .provider-onboarding-categories__grid,
          .provider-onboarding-form__grid {
            grid-template-columns: 1fr;
          }

          .provider-onboarding-form__submit {
            inline-size: 100%;
            justify-self: stretch;
          }

          .provider-onboarding-hero .dm2026-provider-cta__headline-group h1,
          .provider-onboarding-final-cta .dm2026-provider-cta__headline-group h2 {
            max-inline-size: 100%;
          }
        }
      `}</style>
    </main>
  );
}
