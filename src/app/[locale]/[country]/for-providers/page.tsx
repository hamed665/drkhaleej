import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedCountry,
  type SupportedLocale
} from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

import { ProviderOnboardingForm, type ProviderFormCopy } from './provider-onboarding-form';

type Params = { locale: string; country: string };

type ProviderCategory = {
  id: 'clinics' | 'doctors' | 'dental' | 'pharmacies' | 'labs' | 'hospitals' | 'wellness' | 'pet';
  title: string;
  description: string;
  size: 'large' | 'medium';
};

type ProviderPlan = {
  name: string;
  note: string;
  prices: readonly string[];
};

type FAQItem = {
  question: string;
  answer: string;
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
    trustNote: string;
    pills: readonly string[];
    visualLabel: string;
    visualTitle: string;
    visualDescription: string;
    visualItems: readonly string[];
    visualActions: readonly string[];
  };
  categories: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
    items: readonly ProviderCategory[];
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
  reviewed: {
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
    plans: readonly ProviderPlan[];
    disclaimer: string;
  };
  addons: {
    badge: string;
    title: string;
    subtitle: string;
    items: readonly string[];
    note: string;
  };
  formIntro: {
    badge: string;
    title: string;
    subtitle: string;
  };
  faq: {
    badge: string;
    headline: string;
    subtitle: string;
    trustChips: readonly string[];
    items: readonly FAQItem[];
  };
  finalCta: {
    badge: string;
    title: string;
    subtitle: string;
    button: string;
  };
  disclaimer: {
    title: string;
    body: string;
  };
  form: ProviderFormCopy;
};

const copyByLocale: Record<SupportedLocale, ProviderPageCopy> = {
  en: {
    metadataTitle: 'List your healthcare business in Oman | DrMuscat',
    metadataDescription:
      'Request DrMuscat provider onboarding review for clinics, doctors, pharmacies, labs, hospitals, beauty, wellness and pet care providers in Oman. Public discovery only, not medical advice.',
    hero: {
      badge: 'For providers in Oman',
      title: 'Prepare your public DrMuscat discovery profile for review.',
      description:
        'A provider-focused DrMuscat onboarding page for clinics, doctors, labs, pharmacies, hospitals, dental, wellness, and pet-care businesses that want their public information reviewed for future bilingual discovery surfaces.',
      primaryCta: 'Request onboarding review',
      secondaryCta: 'Public discovery only',
      trustNote: 'No booking, payment, dashboard access, ranking promise, or immediate publishing is included in this request.',
      pills: ['English + Arabic ready', 'Contact details reviewed', 'Oman-first discovery'],
      visualLabel: 'Provider readiness',
      visualTitle: 'Review-ready public information',
      visualDescription: 'Share core details so the DrMuscat team can review the public-facing information before any discovery preparation.',
      visualItems: ['Provider category', 'City and area', 'Public contact options'],
      visualActions: ['Call', 'WhatsApp', 'Directions']
    },
    categories: {
      badge: 'Who can join',
      title: 'Built for care providers people search for in Oman.',
      subtitle: 'This section mirrors the homepage discovery-card rhythm so provider categories feel native to DrMuscat.',
      cta: 'Review scope',
      items: [
        { id: 'clinics', title: 'Clinics', description: 'Medical clinics preparing public discovery details.', size: 'large' },
        { id: 'doctors', title: 'Doctors', description: 'Individual doctors and specialist profiles.', size: 'medium' },
        { id: 'dental', title: 'Dental clinics', description: 'Dental centers, dentists and oral care services.', size: 'large' },
        { id: 'pharmacies', title: 'Pharmacies', description: 'Public pharmacy location and contact details.', size: 'medium' },
        { id: 'labs', title: 'Labs', description: 'Diagnostic labs and testing service profiles.', size: 'medium' },
        { id: 'hospitals', title: 'Hospitals & polyclinics', description: 'Larger care centers with public service categories.', size: 'medium' },
        { id: 'wellness', title: 'Beauty & wellness providers', description: 'Beauty, aesthetic and wellness providers with reviewed public wording.', size: 'large' },
        { id: 'pet', title: 'Pet clinics', description: 'Veterinary and pet care clinics preparing discovery details.', size: 'medium' }
      ]
    },
    benefits: {
      badge: 'Discovery benefits',
      title: 'A reviewed visibility foundation, not a demand promise.',
      subtitle: 'DrMuscat prepares public provider information so users can understand services, locations, and contact options, then confirm details directly with providers.',
      items: [
        { title: 'Public discovery profile', description: 'Core provider information can be shaped into a public profile after review.' },
        { title: 'Bilingual presence', description: 'English and Arabic wording can be prepared when accurate information is available.' },
        { title: 'Contact readiness', description: 'Phone, WhatsApp, website, and directions details can be checked before publication.' },
        { title: 'Services visibility', description: 'Public service categories can be organized to make discovery clearer.' },
        { title: 'Reviewed public information', description: 'Submitted details are reviewed before they are prepared for public discovery.' },
        { title: 'Future provider-approved offers', description: 'Offer concepts may be reviewed later only when provider-approved and clearly presented.' }
      ]
    },
    onboarding: {
      badge: 'How onboarding works',
      title: 'Three careful steps before public preparation.',
      subtitle: 'The process stays intentionally simple and review-led.',
      steps: [
        { title: 'Submit onboarding request', description: 'Share business, location, contact, and category information through the existing safe form.' },
        { title: 'DrMuscat reviews public information', description: 'The team checks whether the submitted information is complete enough for discovery preparation.' },
        { title: 'Approved details can be prepared', description: 'Reviewed public details can then be prepared for future DrMuscat discovery pages.' }
      ]
    },
    reviewed: {
      badge: 'What gets reviewed',
      title: 'The first review focuses on public basics.',
      subtitle: 'No private dashboard, payment, booking, or claim workflow is part of this page.',
      items: [
        'Business/provider name',
        'Provider category',
        'City and area',
        'Public phone and WhatsApp',
        'Website and public address',
        'Map or directions readiness',
        'Public service categories',
        'Bilingual wording where available'
      ]
    },
    pricing: {
      badge: 'Launch package concepts',
      title: 'Plan concepts for review conversations.',
      subtitle: 'These are compact launch package concepts only; this page does not activate billing or payments.',
      periods: ['3 months', '6 months', '12 months'],
      plans: [
        { name: 'Free Discovery', note: 'Basic public discovery review concept.', prices: ['Free', 'Free', 'Free'] },
        { name: 'Verified Starter', note: 'Starter visibility concept after review and confirmation.', prices: ['49 OMR', '89 OMR', '159 OMR'] },
        { name: 'Growth Partner', note: 'Expanded visibility concept for future provider conversations.', prices: ['99 OMR', '179 OMR', '329 OMR'] },
        { name: 'Premium Pro', note: 'Premium launch concept subject to availability and confirmation.', prices: ['199 OMR', '359 OMR', '659 OMR'] }
      ],
      disclaimer: 'Launch packages are subject to review, availability, and confirmation. Payment and activation workflows are not part of this page.'
    },
    addons: {
      badge: 'Future request-based add-ons',
      title: 'Add-on requests can be discussed later.',
      subtitle: 'These are future/request-based concepts, not active guaranteed products or automatic placements.',
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
      ],
      note: 'Any future sponsored or featured visibility must be reviewed, confirmed and clearly presented where applicable.'
    },
    formIntro: {
      badge: 'Provider request form',
      title: 'Send your onboarding review request.',
      subtitle: 'The existing form behavior is preserved: it submits the same payload to the provider onboarding lead API.'
    },
    faq: {
      badge: 'Provider FAQ',
      headline: 'Questions before requesting provider review',
      subtitle: 'Clear answers about onboarding, review, language support, launch package concepts and safe public discovery.',
      trustChips: ['Public discovery only', 'Review before publishing', 'English + Arabic ready'],
      items: [
        { question: 'Is DrMuscat a booking platform?', answer: 'No. This page is for public discovery onboarding review only. It does not add appointment booking, scheduling or patient management workflows.' },
        { question: 'Will my center be published immediately?', answer: 'No. Submitted information may require review and confirmation before any public discovery preparation or publishing.' },
        { question: 'Does this request give my business a verified badge?', answer: 'No. Submitting this form does not grant a verified badge, paid placement or automatic approval.' },
        { question: 'What information does DrMuscat review first?', answer: 'The first review focuses on provider name, category, city, area, public contacts, website, address, directions readiness, service categories and bilingual wording where available.' },
        { question: 'Can my profile appear in English and Arabic?', answer: 'DrMuscat is built for English and Arabic discovery in Oman. Bilingual wording can be prepared when accurate information is available.' },
        { question: 'Can I add offers or packages later?', answer: 'Offer or package requests may be discussed later, but they must be provider-approved, reviewed and clearly presented. They are not activated by this page.' },
        { question: 'Can prices or insurance details be listed?', answer: 'Prices or insurance details may require direct provider confirmation and review. Users must confirm prices and insurance directly with the provider.' },
        { question: 'Will being on DrMuscat guarantee Google ranking or new patients?', answer: 'No. DrMuscat does not guarantee search ranking, traffic, calls, WhatsApp messages or new patients.' },
        { question: 'Can doctors and branches be added later?', answer: 'Doctors and branches can be requested later for review when accurate public information is available.' },
        { question: 'Can I upgrade plans later?', answer: 'Plan upgrades may be discussed later as review-based launch concepts. This page does not include payment or activation workflows.' },
        { question: 'Can I request advertising separately?', answer: 'Advertising or sponsored visibility can be requested separately in future conversations and must be reviewed and clearly presented where applicable.' },
        { question: 'What happens if my submitted information is incomplete?', answer: 'DrMuscat may need additional details before public discovery preparation can continue.' },
        { question: 'Does DrMuscat provide medical advice?', answer: 'No. DrMuscat is public discovery and visibility only. It does not provide medical advice, diagnosis or treatment recommendations.' }
      ]
    },
    finalCta: {
      badge: 'Ready for review',
      title: 'Request onboarding review',
      subtitle: 'Share your public provider details for careful review before any discovery preparation.',
      button: 'Request onboarding review'
    },
    disclaimer: {
      title: 'Important discovery disclaimer',
      body:
        'DrMuscat is public discovery and visibility only. It is not medical advice. Publishing is not immediate. Provider details may require review. Users must confirm services, prices, offers, insurance, availability, and medical details directly with providers.'
    },
    form: {
      title: 'Request provider onboarding',
      description: 'Use this safe form to send your interest to the DrMuscat provider team.',
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
      'اطلب مراجعة انضمام مقدم خدمة إلى DrMuscat للعيادات والأطباء والصيدليات والمختبرات والمستشفيات ومقدمي التجميل والرفاهية ورعاية الحيوانات الأليفة في عُمان. اكتشاف عام فقط وليس نصيحة طبية.',
    hero: {
      badge: 'لمقدّمي الخدمة في عُمان',
      title: 'جهّز ملفك العام على DrMuscat للمراجعة.',
      description:
        'هذه صفحة انضمام مخصّصة لمقدّمي الخدمة على DrMuscat، مثل العيادات والأطباء والمختبرات والصيدليات والمستشفيات وطبّ الأسنان ومراكز الرفاهية وعيادات الحيوانات الأليفة، ممّن يرغبون في مراجعة معلوماتهم العامة تمهيدًا لظهورها مستقبلًا ضمن صفحات اكتشاف ثنائية اللغة.',
      primaryCta: 'اطلب مراجعة الانضمام',
      secondaryCta: 'اكتشاف عام فقط',
      trustNote: 'هذا الطلب لا يشمل الحجز أو الدفع أو لوحة تحكّم أو وعودًا بالترتيب أو النشر الفوري.',
      pills: ['جاهز بالعربية والإنجليزية', 'مراجعة معلومات التواصل', 'اكتشاف يركّز على عُمان'],
      visualLabel: 'جاهزية مقدم الخدمة',
      visualTitle: 'معلومات عامة جاهزة للمراجعة',
      visualDescription: 'شارك التفاصيل الأساسية حتى يتمكن فريق DrMuscat من مراجعة المعلومات العامة قبل أي إعداد لظهورك في صفحات الاكتشاف.',
      visualItems: ['فئة مقدم الخدمة', 'المدينة والمنطقة', 'وسائل التواصل العامة'],
      visualActions: ['اتصال', 'واتساب', 'الاتجاهات']
    },
    categories: {
      badge: 'من يمكنه الانضمام',
      title: 'مصمم لمقدّمي الرعاية الذين يبحث عنهم الناس في عُمان.',
      subtitle: 'يعكس هذا القسم إيقاع بطاقات الاكتشاف في الصفحة الرئيسية حتى تبدو فئات مقدّمي الخدمة جزءًا طبيعيًا من تجربة DrMuscat.',
      cta: 'نطاق المراجعة',
      items: [
        { id: 'clinics', title: 'العيادات', description: 'تفاصيل عامة للعيادات الطبية الجاهزة للاكتشاف.', size: 'large' },
        { id: 'doctors', title: 'الأطباء', description: 'ملفات الأطباء الفرديين والتخصصات.', size: 'medium' },
        { id: 'dental', title: 'عيادات الأسنان', description: 'مراكز وعيادات وخدمات طب الأسنان.', size: 'large' },
        { id: 'pharmacies', title: 'الصيدليات', description: 'معلومات مواقع الصيدليات ووسائل التواصل العامة.', size: 'medium' },
        { id: 'labs', title: 'المختبرات', description: 'ملفات المختبرات وخدمات الفحوصات.', size: 'medium' },
        { id: 'hospitals', title: 'المستشفيات والمجمعات', description: 'الجهات الطبية الأكبر ذات الفئات الخدمية العامة.', size: 'medium' },
        { id: 'wellness', title: 'مقدّمو التجميل والرفاهية', description: 'جهات التجميل والعناية والرفاهية بصياغة عامة مدروسة.', size: 'large' },
        { id: 'pet', title: 'عيادات الحيوانات الأليفة', description: 'ملفات العيادات البيطرية وخدمات رعاية الحيوانات الأليفة.', size: 'medium' }
      ]
    },
    benefits: {
      badge: 'مزايا الظهور',
      title: 'أساس ظهور خاضع للمراجعة، وليس وعدًا بالطلب.',
      subtitle: 'يُعِدّ DrMuscat معلومات مقدّمي الخدمة العامة حتى يتمكّن المستخدمون من فهم الخدمات والمواقع ووسائل التواصل، ثم تأكيد التفاصيل مباشرةً مع مقدّم الخدمة.',
      items: [
        { title: 'ملف عام للاكتشاف', description: 'يمكن تنظيم المعلومات الأساسية لمقدّم الخدمة ضمن ملف عام بعد المراجعة.' },
        { title: 'حضور ثنائي اللغة', description: 'يمكن إعداد الصياغة بالإنجليزية والعربية عندما تكون المعلومات دقيقة ومتاحة.' },
        { title: 'جاهزية التواصل', description: 'يمكن التحقق من الهاتف وواتساب والموقع الإلكتروني والاتجاهات قبل النشر.' },
        { title: 'وضوح الخدمات', description: 'يمكن تنظيم فئات الخدمات العامة لجعل الاكتشاف أوضح.' },
        { title: 'معلومات عامة خاضعة للمراجعة', description: 'تُراجَع التفاصيل المرسلة قبل إعدادها للاكتشاف العام.' },
        { title: 'عروض مستقبلية بموافقة المقدّم', description: 'قد تُراجَع أفكار العروض لاحقًا فقط عندما تكون معتمدة من مقدّم الخدمة ومعروضة بوضوح.' }
      ]
    },
    onboarding: {
      badge: 'كيف تتم المراجعة',
      title: 'ثلاث خطوات بعناية قبل إعداد الظهور العام.',
      subtitle: 'تم تصميم هذه العملية لتبقى بسيطة وتعتمد على المراجعة أولًا.',
      steps: [
        { title: 'إرسال طلب الانضمام', description: 'شارك معلومات النشاط والموقع ووسائل التواصل والتصنيف عبر النموذج الحالي الآمن.' },
        { title: 'يراجع DrMuscat المعلومات العامة', description: 'يتحقق الفريق مما إذا كانت المعلومات المرسلة مكتملة بما يكفي لإعداد الظهور في صفحات الاكتشاف.' },
        { title: 'يمكن إعداد التفاصيل المعتمدة', description: 'يمكن بعد ذلك إعداد التفاصيل العامة التي تمت مراجعتها لصفحات الاكتشاف المستقبلية في DrMuscat.' }
      ]
    },
    reviewed: {
      badge: 'ما الذي تتم مراجعته',
      title: 'تركّز المراجعة الأولى على الأساسيات العامة.',
      subtitle: 'لا يشمل هذا القسم لوحة تحكم خاصة أو دفعًا أو حجزًا أو مسار claim.',
      items: [
        'اسم المنشأة أو مقدم الخدمة',
        'تصنيف مقدم الخدمة',
        'المدينة والمنطقة',
        'الهاتف العام وواتساب',
        'الموقع الإلكتروني والعنوان العام',
        'جاهزية الخريطة أو الاتجاهات',
        'فئات الخدمات العامة',
        'الصياغة الثنائية اللغة عند توفرها'
      ]
    },
    pricing: {
      badge: 'تصورات باقات الإطلاق',
      title: 'تصورات خطط لمحادثات المراجعة.',
      subtitle: 'هذه تصورات باقات إطلاق مختصرة فقط؛ هذه الصفحة لا تفعّل الفوترة أو الدفع.',
      periods: ['3 أشهر', '6 أشهر', '12 شهراً'],
      plans: [
        { name: 'Free Discovery', note: 'تصور مراجعة اكتشاف عام أساسي.', prices: ['مجاني', 'مجاني', 'مجاني'] },
        { name: 'Verified Starter', note: 'تصور ظهور أولي بعد المراجعة والتأكيد.', prices: ['49 ر.ع', '89 ر.ع', '159 ر.ع'] },
        { name: 'Growth Partner', note: 'تصور ظهور موسع لمحادثات مستقبلية مع مقدم الخدمة.', prices: ['99 ر.ع', '179 ر.ع', '329 ر.ع'] },
        { name: 'Premium Pro', note: 'تصور إطلاق مميز يخضع للتوفر والتأكيد.', prices: ['199 ر.ع', '359 ر.ع', '659 ر.ع'] }
      ],
      disclaimer: 'تخضع باقات الإطلاق للمراجعة والتوفر والتأكيد. لا تتضمن هذه الصفحة أي مسارات دفع أو تفعيل.'
    },
    addons: {
      badge: 'إضافات مستقبلية حسب الطلب',
      title: 'يمكن مناقشة طلبات الإضافات لاحقاً.',
      subtitle: 'هذه تصورات مستقبلية حسب الطلب، وليست منتجات مفعلة مضمونة أو مواضع تلقائية.',
      items: [
        'ظهور مميز في الصفحة الرئيسية',
        'ظهور مميز في الفئة',
        'ظهور حسب المنطقة',
        'موضع عرض في الصفحة الرئيسية',
        'طلب بطاقة مدعومة',
        'تعزيز طلبات واتساب',
        'أطباء إضافيون',
        'فروع إضافية',
        'دعم انضمام مميز'
      ],
      note: 'أي ظهور مدعوم أو مميز مستقبلاً يجب أن يخضع للمراجعة والتأكيد وأن يعرض بوضوح عند الحاجة.'
    },
    formIntro: {
      badge: 'نموذج طلب مقدم الخدمة',
      title: 'أرسل طلب مراجعة الانضمام.',
      subtitle: 'تم الحفاظ على سلوك النموذج الحالي: يرسل نفس البيانات إلى واجهة طلبات انضمام مقدمي الخدمة.'
    },
    faq: {
      badge: 'أسئلة مقدمي الخدمة',
      headline: 'أسئلة قبل طلب مراجعة مقدم الخدمة',
      subtitle: 'إجابات واضحة حول الانضمام والمراجعة ودعم اللغتين وتصورات باقات الإطلاق والاكتشاف العام الآمن.',
      trustChips: ['اكتشاف عام فقط', 'مراجعة قبل النشر', 'جاهز للعربية والإنجليزية'],
      items: [
        { question: 'هل DrMuscat منصة حجز؟', answer: 'لا. هذه الصفحة مخصصة لمراجعة الانضمام للاكتشاف العام فقط، ولا تضيف حجز مواعيد أو جدولة أو إدارة مرضى.' },
        { question: 'هل سيتم نشر مركزي فوراً؟', answer: 'لا. قد تحتاج المعلومات المرسلة إلى مراجعة وتأكيد قبل أي تجهيز أو نشر للاكتشاف العام.' },
        { question: 'هل يمنح هذا الطلب نشاطي شارة موثقة؟', answer: 'لا. إرسال هذا النموذج لا يمنح شارة موثقة أو موضعاً مدفوعاً أو موافقة تلقائية.' },
        { question: 'ما المعلومات التي تراجعها DrMuscat أولاً؟', answer: 'تركز المراجعة الأولى على الاسم والفئة والمدينة والمنطقة ووسائل التواصل العامة والموقع الإلكتروني والعنوان وجاهزية الاتجاهات وفئات الخدمات والصياغة ثنائية اللغة عند توفرها.' },
        { question: 'هل يمكن أن يظهر ملفي بالعربية والإنجليزية؟', answer: 'DrMuscat مصمم لاكتشاف عربي وإنجليزي في عُمان. يمكن تجهيز الصياغة ثنائية اللغة عندما تتوفر معلومات دقيقة.' },
        { question: 'هل يمكنني إضافة عروض أو باقات لاحقاً؟', answer: 'يمكن مناقشة طلبات العروض أو الباقات لاحقاً، لكنها يجب أن تكون بموافقة مقدم الخدمة وتخضع للمراجعة وتعرض بوضوح. لا يتم تفعيلها من هذه الصفحة.' },
        { question: 'هل يمكن إدراج الأسعار أو تفاصيل التأمين؟', answer: 'قد تتطلب الأسعار أو تفاصيل التأمين تأكيداً مباشراً من مقدم الخدمة ومراجعة. يجب على المستخدمين تأكيد الأسعار والتأمين مباشرة مع مقدم الخدمة.' },
        { question: 'هل يضمن الظهور في DrMuscat ترتيباً في Google أو مرضى جدداً؟', answer: 'لا. لا تضمن DrMuscat ترتيب البحث أو الزيارات أو الاتصالات أو رسائل واتساب أو مرضى جدداً.' },
        { question: 'هل يمكن إضافة أطباء وفروع لاحقاً؟', answer: 'يمكن طلب إضافة الأطباء والفروع لاحقاً للمراجعة عندما تتوفر معلومات عامة دقيقة.' },
        { question: 'هل يمكنني ترقية الخطط لاحقاً؟', answer: 'يمكن مناقشة ترقيات الخطط لاحقاً كتصورات إطلاق قائمة على المراجعة. هذه الصفحة لا تتضمن الدفع أو التفعيل.' },
        { question: 'هل يمكنني طلب الإعلان بشكل منفصل؟', answer: 'يمكن طلب الإعلان أو الظهور المدعوم بشكل منفصل في محادثات مستقبلية، ويجب أن يخضع للمراجعة وأن يعرض بوضوح عند الحاجة.' },
        { question: 'ماذا يحدث إذا كانت معلوماتي غير مكتملة؟', answer: 'قد تحتاج DrMuscat إلى تفاصيل إضافية قبل متابعة تجهيز الاكتشاف العام.' },
        { question: 'هل تقدم DrMuscat نصائح طبية؟', answer: 'لا. DrMuscat مخصصة للاكتشاف والظهور العام فقط، ولا تقدم نصائح طبية أو تشخيصاً أو توصيات علاجية.' }
      ]
    },
    finalCta: {
      badge: 'جاهز للمراجعة',
      title: 'اطلب مراجعة الانضمام',
      subtitle: 'شارك تفاصيل مقدم الخدمة العامة لمراجعتها بعناية قبل أي تجهيز للاكتشاف.',
      button: 'اطلب مراجعة الانضمام'
    },
    disclaimer: {
      title: 'تنبيه مهم حول الاكتشاف',
      body:
        'DrMuscat مخصصة للاكتشاف والظهور العام فقط. ليست نصيحة طبية. النشر ليس فورياً. قد تتطلب تفاصيل مقدمي الخدمة مراجعة. يجب على المستخدمين تأكيد الخدمات والأسعار والعروض والتأمين والتوفر والتفاصيل الطبية مباشرة مع مقدمي الخدمة.'
    },
    form: {
      title: 'طلب انضمام مقدم خدمة',
      description: 'استخدم هذا النموذج الآمن لإرسال اهتمامك إلى فريق مقدمي الخدمة في DrMuscat.',
      requiredNote: 'تتحقق المتصفحات من الحقول المطلوبة قبل الإرسال.',
      labels: {
        centerName: 'اسم المركز أو النشاط',
        contactName: 'اسم مسؤول التواصل',
        phone: 'الهاتف',
        whatsapp: 'واتساب (اختياري)',
        email: 'البريد الإلكتروني (اختياري)',
        providerType: 'نوع مقدم الخدمة',
        cityText: 'المدينة',
        areaText: 'المنطقة (اختياري)',
        preferredLanguage: 'لغة التواصل المفضلة',
        message: 'رسالة (اختياري)',
        consent: 'أوافق على أن تتواصل معي DrMuscat بخصوص انضمام مقدمي الخدمة ومراجعة المعلومات العامة.',
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
        message: 'اذكر الخدمات أو التفاصيل العامة التي تريد مراجعتها.'
      },
      providerTypeOptions: [
        { value: 'clinic', label: 'عيادة' },
        { value: 'medical_center', label: 'مركز طبي أو مستشفى' },
        { value: 'dental_clinic', label: 'عيادة أسنان' },
        { value: 'pharmacy', label: 'صيدلية' },
        { value: 'lab', label: 'مختبر' },
        { value: 'wellness', label: 'مقدم تجميل أو رفاهية' },
        { value: 'other', label: 'أخرى، بما في ذلك عيادة بيطرية' }
      ],
      languageOptions: [
        { value: 'ar', label: 'العربية' },
        { value: 'en', label: 'الإنجليزية' },
        { value: 'en-ar', label: 'العربية والإنجليزية' }
      ],
      submit: 'إرسال طلب الانضمام',
      submitting: 'جارٍ إرسال الطلب…',
      success: 'شكراً لك. تم استلام طلبك للمراجعة.',
      error: 'تعذر إرسال الطلب. يرجى مراجعة الحقول والمحاولة مرة أخرى.'
    }
  }
};

function getProviderCategoryCardClassName(item: ProviderCategory) {
  const accentClass = item.id === 'dental' ? 'hero' : 'secondary';

  return `dm2026-discovery-card dm2026-discovery-card--medium dm2026-discovery-card--${accentClass} provider-onboarding-category-card provider-onboarding-category-card--${item.id}`;
}

function ProviderSymbol({ id }: { id: ProviderCategory['id'] }) {
  return (
    <svg className="dm2026-discovery-card__embossed-svg" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      {id === 'dental' ? (
        <>
          <path className="dm2026-symbol__cast dm2026-symbol__cast--dental" d="M31 24c6-9 15-11 23-5 8-6 17-4 23 5 8 13 4 33-7 48-5 7-10 6-13-3-3-10-5-16-9-16s-6 6-9 16c-3 9-8 10-13 3-11-15-15-35-7-48Z" />
          <path className="dm2026-symbol__mass dm2026-symbol__mass--hero dm2026-symbol__mass--dental" d="M31 21c6-9 15-11 23-5 8-6 17-4 23 5 8 13 4 33-7 48-5 7-10 6-13-3-3-10-5-16-9-16s-6 6-9 16c-3 9-8 10-13 3-11-15-15-35-7-48Z" />
          <path className="dm2026-symbol__ridge dm2026-symbol__ridge--dental" d="M37 31c5-4 11-4 17-1 6-3 12-3 17 1" />
        </>
      ) : null}

      {id === 'wellness' ? (
        <>
          <path className="dm2026-symbol__cast dm2026-symbol__cast--beauty-lotus" d="M48 75c-12-8-18-19-16-31 10 1 17 7 21 18 4-11 11-17 21-18 2 12-4 23-16 31Z" />
          <path className="dm2026-symbol__mass dm2026-symbol__mass--hero dm2026-symbol__mass--beauty-lotus" d="M48 72c-12-8-18-19-16-31 10 1 17 7 21 18 4-11 11-17 21-18 2 12-4 23-16 31Z" />
          <path className="dm2026-symbol__petal dm2026-symbol__petal--beauty" d="M48 19c11 10 13 25 5 40-9-15-7-30-5-40Z" />
          <path className="dm2026-symbol__ridge dm2026-symbol__ridge--beauty-lotus" d="M48 32c0 10 1 18 5 27M40 50c5 4 9 9 13 17M66 50c-5 4-9 9-13 17" />
        </>
      ) : null}

      {id === 'doctors' ? (
        <>
          <path className="dm2026-symbol__cast" d="M27 19v22c0 15 21 15 21 0V19M48 41c2 19 28 23 36 6" />
          <path className="dm2026-symbol__ridge dm2026-symbol__ridge--doctor" d="M27 16v22c0 15 21 15 21 0V16M48 38c2 19 28 23 36 6" />
          <circle className="dm2026-symbol__mass dm2026-symbol__mass--doctor" cx="84" cy="44" r="6.5" />
          <path className="dm2026-symbol__mark dm2026-symbol__mark--pulse" d="M21 68h15l5-10 7 18 7-12h21" />
        </>
      ) : null}

      {id === 'pharmacies' ? (
        <>
          <path className="dm2026-symbol__cast" d="M31 79V31c0-6 5-11 11-11h12c6 0 11 5 11 11v48H31Z" />
          <path className="dm2026-symbol__mass dm2026-symbol__mass--hero" d="M34 76V34c0-6 4-10 10-10h8c6 0 10 4 10 10v42H34Z" />
          <path className="dm2026-symbol__ridge" d="M39 38h18M39 65h18M48 44v15M41 51h14" />
          <path className="dm2026-symbol__mark" d="M40 24v-6h16v6" />
          <path className="dm2026-symbol__mark" d="M34 76h28" />
        </>
      ) : null}

      {id === 'labs' ? (
        <>
          <path className="dm2026-symbol__cast" d="M35 16h26M43 16v23L26 72c-3 6 1 10 7 10h30c6 0 10-4 7-10L53 39V16" />
          <path className="dm2026-symbol__ridge" d="M35 13h26M43 13v23L26 69c-3 6 1 10 7 10h30c6 0 10-4 7-10L53 36V13" />
          <path className="dm2026-symbol__mass dm2026-symbol__mass--lab" d="M34 63h28l8 16H26Z" />
          <circle className="dm2026-symbol__mark" cx="43" cy="61" r="3" />
        </>
      ) : null}

      {id === 'pet' ? (
        <>
          <path className="dm2026-symbol__cast" d="M30 56c7-11 29-11 36 0 8 12-2 23-18 23S22 68 30 56Z" />
          <path className="dm2026-symbol__mass dm2026-symbol__mass--pet" d="M30 53c7-11 29-11 36 0 8 12-2 23-18 23S22 65 30 53Z" />
          <circle className="dm2026-symbol__ridge" cx="28" cy="34" r="8" />
          <circle className="dm2026-symbol__ridge" cx="43" cy="27" r="8" />
          <circle className="dm2026-symbol__ridge" cx="58" cy="27" r="8" />
          <circle className="dm2026-symbol__ridge" cx="73" cy="34" r="8" />
        </>
      ) : null}

      {!['dental', 'wellness', 'doctors', 'pharmacies', 'labs', 'pet'].includes(id) ? (
        <>
          <path className="dm2026-symbol__cast" d="M24 78V31l24-15 24 15v47H24Z" />
          <path className="dm2026-symbol__mass dm2026-symbol__mass--hero" d="M24 75V28l24-15 24 15v47H24Z" />
          <path className="dm2026-symbol__ridge" d="M34 75V45h28v30M39 55h18M48 46v28M24 28h48" />
          <path className="dm2026-symbol__mark" d="M48 25v14M41 32h14" />
        </>
      ) : null}
    </svg>
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    return {};
  }

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const copy = copyByLocale[safeLocale];

  const localizedMetadata = buildLocalizedMetadata({
    locale: safeLocale,
    country: safeCountry,
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    pathname: '/for-providers'
  });

  return {
    ...localizedMetadata,
    openGraph: {
      ...localizedMetadata.openGraph,
      title: copy.metadataTitle,
      description: copy.metadataDescription
    },
    twitter: {
      ...localizedMetadata.twitter,
      title: copy.metadataTitle,
      description: copy.metadataDescription
    }
  };
}

export default async function ForProvidersPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) {
    notFound();
  }

  const safeLocale = locale as SupportedLocale;
  const safeCountry = country as SupportedCountry;
  const dir = localeDirection(safeLocale);
  const copy = copyByLocale[safeLocale];

  return (
    <main className="home-foundation dm2026-home-page provider-onboarding-page" dir={dir} data-locale={safeLocale} data-country={safeCountry}>
      <section className="dm2026-provider-cta provider-onboarding-hero" aria-labelledby="provider-onboarding-title">
        <div className="dm2026-container">
          <div className="dm2026-provider-cta__shell dm2026-glass provider-onboarding-hero__shell">
            <div className="dm2026-provider-cta__copy">
              <span className="dm2026-badge">{copy.hero.badge}</span>
              <div className="dm2026-provider-cta__headline-group">
                <h1 id="provider-onboarding-title">{copy.hero.title}</h1>
                <p>{copy.hero.description}</p>
              </div>
              <ul className="dm2026-provider-cta__pills" aria-label={copy.hero.badge}>
                {copy.hero.pills.map((pill) => (
                  <li key={pill}>{pill}</li>
                ))}
              </ul>
              <div className="dm2026-provider-cta__actions">
                <a className="dm2026-button dm2026-button-primary dm2026-provider-cta__button" href="#provider-onboarding-form">
                  {copy.hero.primaryCta}
                </a>
                <span className="dm2026-button dm2026-button-secondary dm2026-provider-cta__button dm2026-provider-cta__button--preview" aria-label={copy.hero.secondaryCta}>
                  {copy.hero.secondaryCta}
                </span>
              </div>
              <p className="dm2026-provider-cta__trust">{copy.hero.trustNote}</p>
            </div>

            <aside className="dm2026-provider-cta__visual provider-onboarding-hero__visual" aria-label={copy.hero.visualLabel}>
              <div className="provider-onboarding-hero__photo" aria-hidden="true">
                <span className="provider-onboarding-hero__photo-glow provider-onboarding-hero__photo-glow--primary" />
                <span className="provider-onboarding-hero__photo-glow provider-onboarding-hero__photo-glow--accent" />
                <span className="provider-onboarding-hero__photo-pane provider-onboarding-hero__photo-pane--main" />
                <span className="provider-onboarding-hero__photo-pane provider-onboarding-hero__photo-pane--side" />
              </div>
              <div className="dm2026-provider-cta__preview-card provider-onboarding-hero__preview">
                <div className="dm2026-provider-cta__preview-head">
                  <span>{copy.hero.visualLabel}</span>
                  <strong>{copy.hero.secondaryCta}</strong>
                </div>
                <h3>{copy.hero.visualTitle}</h3>
                <p>{copy.hero.visualDescription}</p>
                <ul className="dm2026-provider-cta__preview-items">
                  {copy.hero.visualItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <ul className="dm2026-provider-cta__preview-actions">
                  {copy.hero.visualActions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="dm2026-discovery-categories provider-onboarding-categories" aria-labelledby="provider-categories-title">
        <div className="dm2026-container">
          <div className="dm2026-discovery-categories__module dm2026-glass">
            <span className="dm2026-discovery-categories__glow dm2026-discovery-categories__glow--teal" aria-hidden="true" />
            <span className="dm2026-discovery-categories__glow dm2026-discovery-categories__glow--gold" aria-hidden="true" />
            <header className="dm2026-discovery-categories__header">
              <span className="dm2026-badge dm2026-discovery-categories__badge">{copy.categories.badge}</span>
              <h2 id="provider-categories-title">{copy.categories.title}</h2>
              <p>{copy.categories.subtitle}</p>
            </header>
            <div className="dm2026-discovery-categories__grid" role="list">
              {copy.categories.items.map((item) => (
                <article
                  className={getProviderCategoryCardClassName(item)}
                  key={item.id}
                  role="listitem"
                >
                  <div className="dm2026-discovery-card__visual" aria-hidden="true">
                    <div className="dm2026-discovery-card__visual-plate">
                      <ProviderSymbol id={item.id} />
                    </div>
                  </div>
                  <div className="dm2026-discovery-card__copy">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>
                  <span className="dm2026-discovery-card__cta">{copy.categories.cta}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="dm2026-section provider-onboarding-section provider-onboarding-benefits" aria-labelledby="provider-benefits-title">
        <div className="dm2026-container">
          <header className="dm2026-section-header provider-onboarding-section__header">
            <span className="dm2026-badge">{copy.benefits.badge}</span>
            <h2 id="provider-benefits-title">{copy.benefits.title}</h2>
            <p>{copy.benefits.subtitle}</p>
          </header>
          <div className="provider-onboarding-benefit-grid">
            {copy.benefits.items.map((benefit) => (
              <article className="dm2026-card-glass provider-onboarding-mini-card" key={benefit.title}>
                <span className="provider-onboarding-mini-card__dot" aria-hidden="true" />
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dm2026-section provider-onboarding-section provider-onboarding-section--compact provider-onboarding-review-flow" aria-labelledby="provider-onboarding-steps-title">
        <div className="dm2026-container provider-onboarding-two-column">
          <div>
            <header className="dm2026-section-header provider-onboarding-section__header">
              <span className="dm2026-badge">{copy.onboarding.badge}</span>
              <h2 id="provider-onboarding-steps-title">{copy.onboarding.title}</h2>
              <p>{copy.onboarding.subtitle}</p>
            </header>
            <ol className="provider-onboarding-step-list">
              {copy.onboarding.steps.map((step, index) => (
                <li className="dm2026-card-soft" key={step.title}>
                  <span>{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="dm2026-card-glass provider-onboarding-checklist" aria-labelledby="provider-reviewed-title">
            <span className="dm2026-badge">{copy.reviewed.badge}</span>
            <h2 id="provider-reviewed-title">{copy.reviewed.title}</h2>
            <p>{copy.reviewed.subtitle}</p>
            <ul>
              {copy.reviewed.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="dm2026-section provider-onboarding-section" aria-labelledby="provider-pricing-title">
        <div className="dm2026-container">
          <header className="dm2026-section-header provider-onboarding-section__header">
            <span className="dm2026-badge">{copy.pricing.badge}</span>
            <h2 id="provider-pricing-title">{copy.pricing.title}</h2>
            <p>{copy.pricing.subtitle}</p>
          </header>
          <div className="provider-onboarding-pricing-grid">
            {copy.pricing.plans.map((plan) => (
              <article className="dm2026-card-glass provider-onboarding-plan" key={plan.name}>
                <h3>{plan.name}</h3>
                <p>{plan.note}</p>
                <ul aria-label={plan.name}>
                  {copy.pricing.periods.map((period, index) => (
                    <li key={`${plan.name}-${period}`}>
                      <span>{period}</span>
                      <strong>{plan.prices[index]}</strong>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="dm2026-card-soft provider-onboarding-pricing-note">{copy.pricing.disclaimer}</p>
        </div>
      </section>

      <section className="dm2026-section provider-onboarding-section provider-onboarding-section--compact" aria-labelledby="provider-addons-title">
        <div className="dm2026-container">
          <div className="dm2026-card-glass provider-onboarding-addons">
            <header className="dm2026-section-header provider-onboarding-section__header">
              <span className="dm2026-badge">{copy.addons.badge}</span>
              <h2 id="provider-addons-title">{copy.addons.title}</h2>
              <p>{copy.addons.subtitle}</p>
            </header>
            <ul>
              {copy.addons.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>{copy.addons.note}</p>
          </div>
        </div>
      </section>

      <section id="provider-onboarding-form" className="dm2026-section provider-onboarding-section provider-onboarding-section--form" aria-labelledby="provider-form-title">
        <div className="dm2026-container provider-onboarding-two-column provider-onboarding-two-column--form">
          <header className="dm2026-section-header provider-onboarding-section__header provider-onboarding-form-copy">
            <span className="dm2026-badge">{copy.formIntro.badge}</span>
            <h2 id="provider-form-title">{copy.formIntro.title}</h2>
            <p>{copy.formIntro.subtitle}</p>
          </header>
          <ProviderOnboardingForm locale={safeLocale} copy={copy.form} />
        </div>
      </section>

      <section className="dm2026-home-faq provider-onboarding-faq" aria-labelledby="provider-faq-title">
        <div className="dm2026-container">
          <div className="dm2026-home-faq__shell dm2026-glass">
            <div className="dm2026-home-faq__intro">
              <span className="dm2026-badge">{copy.faq.badge}</span>
              <div className="dm2026-home-faq__headline-group">
                <h2 id="provider-faq-title">{copy.faq.headline}</h2>
                <p>{copy.faq.subtitle}</p>
              </div>
              <ul className="dm2026-home-faq__trust-chips" aria-label={copy.faq.badge}>
                {copy.faq.trustChips.map((chip) => (
                  <li key={chip}>{chip}</li>
                ))}
              </ul>
            </div>
            <div className="dm2026-home-faq__accordion">
              {copy.faq.items.map((item, index) => (
                <details className="dm2026-home-faq__item" key={item.question} open={index === 0}>
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
        </div>
      </section>

      <section className="dm2026-provider-cta provider-onboarding-final" aria-labelledby="provider-final-title">
        <div className="dm2026-container">
          <div className="dm2026-provider-cta__shell dm2026-glass provider-onboarding-final__shell">
            <div className="dm2026-provider-cta__copy">
              <span className="dm2026-badge">{copy.finalCta.badge}</span>
              <div className="dm2026-provider-cta__headline-group">
                <h2 id="provider-final-title">{copy.finalCta.title}</h2>
                <p>{copy.finalCta.subtitle}</p>
              </div>
              <div className="dm2026-provider-cta__actions">
                <a className="dm2026-button dm2026-button-primary dm2026-provider-cta__button" href="#provider-onboarding-form">
                  {copy.finalCta.button}
                </a>
              </div>
            </div>
            <aside className="dm2026-card-soft provider-onboarding-disclaimer" aria-labelledby="provider-disclaimer-title">
              <h2 id="provider-disclaimer-title">{copy.disclaimer.title}</h2>
              <p>{copy.disclaimer.body}</p>
            </aside>
          </div>
        </div>
      </section>

      <style>{`
        .provider-onboarding-page {
          padding-block-start: clamp(0.65rem, 2vw, 1.35rem);
        }

        .provider-onboarding-hero {
          padding-block: clamp(0.75rem, 2vw, 1.25rem) clamp(1.2rem, 3vw, 2.15rem);
        }

        .provider-onboarding-hero__shell {
          grid-template-columns: minmax(0, 1.02fr) minmax(18rem, 0.9fr);
          gap: clamp(0.9rem, 2.4vw, 1.55rem);
          align-items: center;
          border-color: rgba(14, 110, 100, 0.14);
          border-radius: clamp(1.45rem, 2.6vw, 2rem);
          background:
            linear-gradient(116deg, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.9) 45%, rgba(239, 246, 244, 0.72) 100%),
            radial-gradient(620px circle at 92% 16%, rgba(42, 161, 146, 0.15), transparent 55%),
            radial-gradient(460px circle at 8% 100%, rgba(201, 162, 75, 0.08), transparent 52%);
          box-shadow:
            0 22px 62px rgba(11, 40, 38, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.94);
          padding: clamp(0.85rem, 2.3vw, 1.45rem);
        }

        .provider-onboarding-hero .dm2026-provider-cta__copy {
          gap: clamp(0.52rem, 1.15vw, 0.78rem);
          max-inline-size: 40rem;
        }

        .provider-onboarding-hero .dm2026-badge {
          justify-self: start;
          min-block-size: 1.65rem;
          background: rgba(239, 246, 244, 0.88);
          font-size: var(--dm-type-caption, 0.8125rem);
          font-weight: var(--dm-weight-semibold, 600);
          line-height: var(--dm-type-caption-line, 1.45);
          padding-block: 0.22rem;
          padding-inline: 0.66rem;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92);
        }

        .provider-onboarding-hero .dm2026-provider-cta__headline-group {
          gap: 0.48rem;
        }

        .provider-onboarding-hero .dm2026-provider-cta__headline-group h1,
        .provider-onboarding-final .dm2026-provider-cta__headline-group h2,
        .provider-onboarding-section__header h2,
        .provider-onboarding-checklist h2,
        .provider-onboarding-disclaimer h2 {
          color: var(--dm-teal-950, #07302c);
          letter-spacing: -0.045em;
        }

        .provider-onboarding-hero .dm2026-provider-cta__headline-group h1 {
          max-inline-size: 16ch;
          margin: 0;
          font-family: var(--dm-font-display, var(--dm-font-sans, system-ui));
          font-size: clamp(2rem, 3.8vw, 3.35rem);
          font-weight: 720;
          letter-spacing: -0.035em;
          line-height: 1.045;
        }

        .provider-onboarding-hero .dm2026-provider-cta__headline-group p {
          max-inline-size: 42rem;
          color: var(--dm-ink-700, #2e3a3b);
          font-size: clamp(0.98rem, 1.25vw, 1.08rem);
          line-height: 1.62;
        }

        .provider-onboarding-hero .dm2026-provider-cta__pills {
          gap: 0.38rem;
        }

        .provider-onboarding-hero .dm2026-provider-cta__pills li {
          min-block-size: 1.82rem;
          border-color: rgba(14, 110, 100, 0.13);
          background: rgba(255, 255, 255, 0.74);
          font-size: var(--dm-type-caption, 0.8125rem);
          font-weight: 720;
          line-height: var(--dm-type-caption-line, 1.45);
          padding-block: 0.32rem;
          padding-inline: 0.58rem;
        }

        .provider-onboarding-hero .dm2026-provider-cta__actions {
          gap: 0.52rem;
          padding-block-start: 0.05rem;
        }

        .provider-onboarding-hero .dm2026-provider-cta__button {
          min-block-size: 2.72rem;
          min-inline-size: 10.2rem;
          border: 1px solid rgba(255, 255, 255, 0.56);
          font-size: 0.94rem;
          font-weight: 780;
          letter-spacing: -0.005em;
          padding-block: 0.68rem;
          padding-inline: 1.08rem;
          box-shadow:
            0 12px 30px rgba(11, 40, 38, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.76);
        }

        .provider-onboarding-hero .dm2026-button-primary {
          background:
            linear-gradient(135deg, rgba(18, 126, 114, 0.98) 0%, rgba(9, 82, 76, 0.98) 100%),
            radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.22), transparent 42%);
          box-shadow:
            0 16px 34px rgba(14, 110, 100, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .provider-onboarding-hero .dm2026-button-secondary {
          border-color: rgba(14, 110, 100, 0.16);
          background: rgba(255, 255, 255, 0.72);
          color: var(--dm-color-brand-strong, #0b4f4a);
        }

        @supports ((backdrop-filter: blur(14px)) or (-webkit-backdrop-filter: blur(14px))) {
          .provider-onboarding-hero .dm2026-provider-cta__button {
            -webkit-backdrop-filter: blur(14px) saturate(122%);
            backdrop-filter: blur(14px) saturate(122%);
          }
        }

        .provider-onboarding-hero .dm2026-provider-cta__button:hover,
        .provider-onboarding-hero .dm2026-provider-cta__button:focus-visible {
          transform: translateY(-1px);
          box-shadow:
            var(--dm-focus-ring, 0 0 0 3px rgba(14, 110, 100, 0.22)),
            0 16px 38px rgba(11, 40, 38, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.72);
        }

        .provider-onboarding-hero .dm2026-provider-cta__trust {
          max-inline-size: 38rem;
          color: var(--dm-color-text-muted, #66736f);
          font-size: var(--dm-type-small, 0.875rem);
          line-height: var(--dm-type-small-line, 1.5);
        }

        .provider-onboarding-final .dm2026-provider-cta__headline-group h2,
        .provider-onboarding-section__header h2,
        .provider-onboarding-checklist h2 {
          margin: 0;
          font-size: clamp(1.72rem, 3.5vw, 2.7rem);
          line-height: 1.08;
        }

        .provider-onboarding-hero__visual {
          min-block-size: clamp(17.5rem, 28vw, 21.5rem);
          align-items: end;
          justify-items: center;
          padding: clamp(0.54rem, 1.5vw, 0.85rem);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(239, 246, 244, 0.46)),
            radial-gradient(460px circle at 52% 8%, rgba(42, 161, 146, 0.2), transparent 58%);
        }

        .provider-onboarding-hero__photo {
          position: absolute;
          inset: clamp(0.48rem, 1.35vw, 0.78rem);
          z-index: 0;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.78);
          border-radius: clamp(1.05rem, 2vw, 1.55rem);
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.48), rgba(239, 246, 244, 0.18)),
            radial-gradient(340px circle at 22% 18%, rgba(255, 255, 255, 0.92), transparent 42%),
            radial-gradient(420px circle at 74% 18%, rgba(42, 161, 146, 0.22), transparent 48%),
            linear-gradient(135deg, rgba(226, 239, 236, 0.86) 0%, rgba(249, 247, 238, 0.9) 52%, rgba(213, 232, 228, 0.86) 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.92),
            0 18px 46px rgba(11, 40, 38, 0.1);
        }

        .provider-onboarding-hero__photo::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(115deg, rgba(255, 255, 255, 0.7) 0%, transparent 35%, rgba(255, 255, 255, 0.38) 100%),
            repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.24) 0 1px, transparent 1px 4.4rem);
          opacity: 0.78;
        }

        .provider-onboarding-hero__photo-glow,
        .provider-onboarding-hero__photo-pane {
          position: absolute;
          display: block;
          pointer-events: none;
        }

        .provider-onboarding-hero__photo-glow {
          border-radius: 999px;
          filter: blur(1px);
        }

        .provider-onboarding-hero__photo-glow--primary {
          inset-block-start: 10%;
          inset-inline-end: 8%;
          inline-size: 10rem;
          block-size: 10rem;
          background: rgba(42, 161, 146, 0.18);
        }

        .provider-onboarding-hero__photo-glow--accent {
          inset-block-end: 8%;
          inset-inline-start: 10%;
          inline-size: 8rem;
          block-size: 8rem;
          background: rgba(201, 162, 75, 0.13);
        }

        .provider-onboarding-hero__photo-pane {
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 1.05rem;
          background: rgba(255, 255, 255, 0.34);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.76);
        }

        .provider-onboarding-hero__photo-pane--main {
          inset-block-start: 12%;
          inset-inline-start: 10%;
          inline-size: 48%;
          block-size: 44%;
        }

        .provider-onboarding-hero__photo-pane--side {
          inset-block-start: 24%;
          inset-inline-end: 10%;
          inline-size: 28%;
          block-size: 34%;
          opacity: 0.72;
        }

        .provider-onboarding-hero__preview {
          inline-size: min(100% - 1rem, 21.75rem);
          margin: 0.54rem;
          gap: 0.54rem;
          background: rgba(255, 255, 255, 0.84);
          padding: clamp(0.78rem, 1.8vw, 0.98rem);
        }

        .provider-onboarding-hero__preview .dm2026-provider-cta__preview-head {
          direction: ltr;
        }

        .provider-onboarding-hero__preview h3 {
          font-size: clamp(1.02rem, 1.55vw, 1.18rem);
          line-height: 1.18;
        }


        .provider-onboarding-categories {
          padding-block: clamp(1.8rem, 4.5vw, 3.6rem);
        }

        .provider-onboarding-categories .dm2026-discovery-categories__module {
          padding: clamp(1rem, 2.6vw, 1.55rem);
          border-color: rgba(14, 110, 100, 0.13);
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(247, 251, 250, 0.82)),
            radial-gradient(540px circle at 15% 0%, rgba(42, 161, 146, 0.12), transparent 52%);
          box-shadow:
            0 22px 60px rgba(11, 40, 38, 0.09),
            inset 0 1px 0 rgba(255, 255, 255, 0.92);
        }

        .provider-onboarding-categories .dm2026-discovery-categories__header {
          max-inline-size: 46rem;
          margin-block-end: clamp(1rem, 2.4vw, 1.45rem);
        }

        .provider-onboarding-categories .dm2026-discovery-categories__header h2 {
          margin: 0;
          color: var(--dm-teal-950, #07302c);
          font-family: var(--dm-font-display, var(--dm-font-sans, system-ui));
          font-size: clamp(1.45rem, 2.45vw, 2.12rem);
          font-weight: 720;
          letter-spacing: -0.032em;
          line-height: 1.1;
        }

        .provider-onboarding-categories .dm2026-discovery-categories__header p {
          max-inline-size: 41rem;
          color: var(--dm-color-text-muted, #66736f);
          font-size: clamp(0.95rem, 1.1vw, 1.04rem);
          line-height: 1.62;
        }

        .provider-onboarding-categories .dm2026-discovery-categories__grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: clamp(0.72rem, 1.35vw, 1rem);
        }

        .provider-onboarding-category-card {
          grid-column: auto !important;
          min-block-size: 15.9rem;
          grid-template-rows: auto minmax(5.75rem, 1fr) auto;
          gap: 0.78rem;
          border-color: rgba(14, 110, 100, 0.13);
          background:
            linear-gradient(155deg, rgba(255, 255, 255, 0.88), rgba(248, 252, 251, 0.74)),
            radial-gradient(170px circle at 20% 0%, rgba(42, 161, 146, 0.11), transparent 62%);
          box-shadow:
            0 14px 34px rgba(11, 40, 38, 0.075),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          padding: clamp(0.9rem, 1.35vw, 1.08rem);
        }

        .provider-onboarding-category-card:hover {
          border-color: rgba(14, 110, 100, 0.2);
          box-shadow:
            0 18px 42px rgba(11, 40, 38, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.94);
        }

        .provider-onboarding-category-card .dm2026-discovery-card__visual {
          min-block-size: 6.9rem;
        }

        .provider-onboarding-category-card .dm2026-discovery-card__visual-plate {
          inline-size: min(7.2rem, 72%);
          border-color: rgba(14, 110, 100, 0.12);
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.76), rgba(239, 246, 244, 0.82)),
            radial-gradient(120px circle at 24% 12%, rgba(42, 161, 146, 0.14), transparent 62%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.94),
            0 10px 26px rgba(14, 110, 100, 0.08);
        }

        .provider-onboarding-category-card--pharmacies .dm2026-discovery-card__visual-plate {
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.78), rgba(236, 248, 245, 0.86)),
            radial-gradient(128px circle at 24% 12%, rgba(42, 161, 146, 0.17), transparent 62%);
        }

        .provider-onboarding-category-card .dm2026-discovery-card__embossed-svg {
          inline-size: 76%;
          block-size: 76%;
        }

        .provider-onboarding-category-card .dm2026-discovery-card__copy {
          gap: 0.38rem;
        }

        .provider-onboarding-category-card .dm2026-discovery-card__copy strong {
          color: var(--dm-teal-950, #07302c);
          font-family: var(--dm-font-display, var(--dm-font-sans, system-ui));
          font-size: clamp(1rem, 1.1vw, 1.12rem);
          font-weight: 720;
          letter-spacing: -0.012em;
          line-height: 1.24;
        }

        .provider-onboarding-category-card .dm2026-discovery-card__copy span {
          color: var(--dm-color-text-muted, #66736f);
          font-size: var(--dm-type-small, 0.875rem);
          line-height: 1.55;
        }

        .provider-onboarding-category-card .dm2026-discovery-card__cta {
          min-block-size: 2rem;
          border-color: rgba(14, 110, 100, 0.13);
          background: rgba(255, 255, 255, 0.72);
          color: var(--dm-color-brand-strong, #0b4f4a);
          font-size: var(--dm-type-caption, 0.8125rem);
          font-weight: 760;
          letter-spacing: -0.003em;
          box-shadow:
            0 8px 18px rgba(11, 40, 38, 0.055),
            inset 0 1px 0 rgba(255, 255, 255, 0.86);
        }

        @supports ((backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px))) {
          .provider-onboarding-category-card .dm2026-discovery-card__cta {
            -webkit-backdrop-filter: blur(10px) saturate(118%);
            backdrop-filter: blur(10px) saturate(118%);
          }
        }

        [dir='rtl'] .provider-onboarding-categories .dm2026-discovery-categories__header h2,
        [dir='rtl'] .provider-onboarding-category-card .dm2026-discovery-card__copy strong {
          letter-spacing: 0;
          line-height: 1.22;
        }

        .provider-onboarding-section {
          padding-block: clamp(2.4rem, 6vw, 4.8rem);
        }

        .provider-onboarding-section--compact {
          padding-block: clamp(1.6rem, 4vw, 3.2rem);
        }

        .provider-onboarding-section__header {
          margin-block-end: clamp(1.1rem, 3vw, 1.8rem);
        }

        .provider-onboarding-section__header p,
        .provider-onboarding-checklist p,
        .provider-onboarding-mini-card p,
        .provider-onboarding-step-list p,
        .provider-onboarding-plan p,
        .provider-onboarding-disclaimer p,
        .provider-onboarding-addons > p {
          color: var(--dm-color-text-muted, #66736f);
          line-height: 1.65;
        }

        .provider-onboarding-benefit-grid,
        .provider-onboarding-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: clamp(0.85rem, 2vw, 1.1rem);
        }

        .provider-onboarding-mini-card,
        .provider-onboarding-plan,
        .provider-onboarding-checklist,
        .provider-onboarding-addons,
        .provider-onboarding-disclaimer {
          position: relative;
          overflow: hidden;
          padding: clamp(1rem, 2.4vw, 1.35rem);
        }

        .provider-onboarding-mini-card h3,
        .provider-onboarding-step-list h3,
        .provider-onboarding-plan h3 {
          margin: 0;
          color: var(--dm-teal-950, #07302c);
          font-size: 1.05rem;
          line-height: 1.25;
        }

        .provider-onboarding-mini-card {
          display: grid;
          gap: 0.62rem;
        }

        .provider-onboarding-mini-card p,
        .provider-onboarding-step-list p,
        .provider-onboarding-plan p {
          margin: 0;
          font-size: 0.94rem;
        }

        .provider-onboarding-mini-card__dot {
          inline-size: 0.72rem;
          block-size: 0.72rem;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--dm-color-brand, #0e6e64), var(--dm-color-accent-gold, #c9a24b));
          box-shadow: 0 0 0 0.42rem rgba(14, 110, 100, 0.08);
        }


        .provider-onboarding-benefits {
          scroll-margin-block-start: clamp(5.75rem, 9vw, 7.5rem);
          padding-block: clamp(2.8rem, 6vw, 5rem) clamp(2rem, 5.2vw, 4.2rem);
        }

        .provider-onboarding-benefits .dm2026-container {
          position: relative;
        }

        .provider-onboarding-benefits .provider-onboarding-section__header {
          max-inline-size: 45rem;
          margin-block-end: clamp(1rem, 2.8vw, 1.7rem);
        }

        .provider-onboarding-benefits .dm2026-badge {
          border-color: rgba(14, 110, 100, 0.16);
          background: rgba(232, 246, 243, 0.92);
          color: var(--dm-color-brand-strong, #0b4f4a);
          box-shadow:
            0 8px 20px rgba(14, 110, 100, 0.07),
            inset 0 1px 0 rgba(255, 255, 255, 0.92);
        }

        .provider-onboarding-benefits .provider-onboarding-section__header h2 {
          max-inline-size: 20ch;
          font-family: var(--dm-font-display, var(--dm-font-sans, system-ui));
          font-size: clamp(1.68rem, 3vw, 2.5rem);
          font-weight: 760;
          letter-spacing: -0.036em;
          line-height: 1.08;
        }

        .provider-onboarding-benefits .provider-onboarding-section__header p {
          max-inline-size: 41rem;
          color: var(--dm-ink-700, #2e3a3b);
          font-size: clamp(0.98rem, 1.15vw, 1.08rem);
          line-height: 1.62;
        }

        .provider-onboarding-benefits .provider-onboarding-benefit-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: clamp(0.78rem, 1.6vw, 1.08rem);
        }

        .provider-onboarding-benefits .provider-onboarding-mini-card {
          isolation: isolate;
          display: grid;
          align-content: start;
          min-block-size: 12.9rem;
          gap: 0.62rem;
          border: 1px solid rgba(14, 110, 100, 0.18);
          border-radius: clamp(1.16rem, 2vw, 1.5rem);
          background:
            linear-gradient(150deg, rgba(255, 255, 255, 0.96), rgba(240, 249, 247, 0.88)),
            radial-gradient(190px circle at 18% 0%, rgba(42, 161, 146, 0.18), transparent 64%);
          box-shadow:
            0 18px 44px rgba(11, 40, 38, 0.105),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
          padding: clamp(1.05rem, 2vw, 1.32rem);
        }

        .provider-onboarding-benefits .provider-onboarding-mini-card::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.56), transparent 46%, rgba(14, 110, 100, 0.075));
          pointer-events: none;
        }

        .provider-onboarding-benefits .provider-onboarding-mini-card:hover {
          border-color: rgba(14, 110, 100, 0.24);
          box-shadow:
            0 20px 48px rgba(11, 40, 38, 0.125),
            inset 0 1px 0 rgba(255, 255, 255, 0.94);
        }

        .provider-onboarding-benefits .provider-onboarding-mini-card__dot {
          inline-size: 2.2rem;
          block-size: 2.2rem;
          border: 1px solid rgba(14, 110, 100, 0.24);
          border-radius: 999px;
          background:
            radial-gradient(circle at 50% 50%, rgba(14, 110, 100, 0.95) 0 18%, rgba(42, 161, 146, 0.32) 19% 38%, transparent 39%),
            linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(226, 246, 242, 0.96));
          box-shadow:
            0 10px 22px rgba(14, 110, 100, 0.12),
            0 0 0 0.38rem rgba(14, 110, 100, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
        }

        .provider-onboarding-benefits .provider-onboarding-mini-card h3 {
          margin: 0;
          color: var(--dm-teal-950, #07302c);
          font-family: var(--dm-font-display, var(--dm-font-sans, system-ui));
          font-size: clamp(1.02rem, 1.15vw, 1.14rem);
          font-weight: 760;
          letter-spacing: -0.014em;
          line-height: 1.24;
        }

        .provider-onboarding-benefits .provider-onboarding-mini-card p {
          margin: 0;
          color: var(--dm-ink-700, #2e3a3b);
          font-size: var(--dm-type-small, 0.875rem);
          line-height: 1.6;
        }

        @supports ((backdrop-filter: blur(12px)) or (-webkit-backdrop-filter: blur(12px))) {
          .provider-onboarding-benefits .provider-onboarding-mini-card {
            -webkit-backdrop-filter: blur(12px) saturate(116%);
            backdrop-filter: blur(12px) saturate(116%);
          }
        }

        [dir='rtl'] .provider-onboarding-benefits .provider-onboarding-section__header h2,
        [dir='rtl'] .provider-onboarding-benefits .provider-onboarding-mini-card h3 {
          letter-spacing: 0;
          line-height: 1.22;
        }

        .provider-onboarding-two-column {
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(18rem, 1.05fr);
          gap: clamp(1rem, 3vw, 1.4rem);
          align-items: start;
        }

        .provider-onboarding-two-column--form {
          grid-template-columns: minmax(16rem, 0.68fr) minmax(0, 1.32fr);
        }

        .provider-onboarding-step-list {
          display: grid;
          gap: 0.72rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .provider-onboarding-step-list li {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.75rem;
          align-items: start;
          padding: 0.95rem;
        }

        .provider-onboarding-step-list li > span {
          display: inline-grid;
          inline-size: 2rem;
          block-size: 2rem;
          place-items: center;
          border-radius: 999px;
          background: rgba(14, 110, 100, 0.1);
          color: var(--dm-color-brand-strong, #0b4f4a);
          font-weight: 800;
        }

        .provider-onboarding-checklist {
          display: grid;
          gap: 0.85rem;
        }

        .provider-onboarding-checklist ul,
        .provider-onboarding-addons ul {
          display: flex;
          flex-wrap: wrap;
          gap: 0.48rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .provider-onboarding-checklist li,
        .provider-onboarding-addons li,
        .provider-onboarding-pricing-note {
          border: 1px solid rgba(14, 110, 100, 0.11);
          border-radius: var(--dm-radius-pill, 999px);
          background: rgba(239, 246, 244, 0.78);
          color: var(--dm-color-brand-strong, #0b4f4a);
          font-size: 0.86rem;
          font-weight: 700;
          line-height: 1.35;
          padding: 0.44rem 0.68rem;
        }


        .provider-onboarding-review-flow {
          padding-block: clamp(2.2rem, 5vw, 4.1rem);
        }

        .provider-onboarding-review-flow .provider-onboarding-two-column {
          grid-template-columns: minmax(0, 0.96fr) minmax(20rem, 1.04fr);
          gap: clamp(1rem, 2.6vw, 1.55rem);
          align-items: stretch;
        }

        .provider-onboarding-review-flow .provider-onboarding-section__header {
          margin-block-end: clamp(0.95rem, 2.5vw, 1.4rem);
        }

        .provider-onboarding-review-flow .dm2026-badge {
          border-color: rgba(14, 110, 100, 0.15);
          background: rgba(236, 248, 245, 0.88);
          color: var(--dm-color-brand-strong, #0b4f4a);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92);
        }

        .provider-onboarding-review-flow .provider-onboarding-section__header h2,
        .provider-onboarding-review-flow .provider-onboarding-checklist h2 {
          margin: 0;
          color: var(--dm-teal-950, #07302c);
          font-family: var(--dm-font-display, var(--dm-font-sans, system-ui));
          font-size: clamp(1.58rem, 2.8vw, 2.35rem);
          font-weight: 740;
          letter-spacing: -0.034em;
          line-height: 1.1;
        }

        .provider-onboarding-review-flow .provider-onboarding-section__header p,
        .provider-onboarding-review-flow .provider-onboarding-checklist > p {
          max-inline-size: 38rem;
          color: var(--dm-ink-700, #2e3a3b);
          font-size: clamp(0.96rem, 1.08vw, 1.04rem);
          line-height: 1.62;
        }

        .provider-onboarding-review-flow .provider-onboarding-step-list {
          gap: 0.78rem;
        }

        .provider-onboarding-review-flow .provider-onboarding-step-list li {
          border: 1px solid rgba(14, 110, 100, 0.14);
          border-radius: clamp(1rem, 1.8vw, 1.28rem);
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.93), rgba(242, 250, 248, 0.8)),
            radial-gradient(160px circle at 0% 0%, rgba(42, 161, 146, 0.11), transparent 64%);
          box-shadow:
            0 12px 30px rgba(11, 40, 38, 0.07),
            inset 0 1px 0 rgba(255, 255, 255, 0.94);
          padding: clamp(0.9rem, 1.8vw, 1.08rem);
        }

        .provider-onboarding-review-flow .provider-onboarding-step-list li > span {
          inline-size: 2.25rem;
          block-size: 2.25rem;
          border: 1px solid rgba(14, 110, 100, 0.2);
          background:
            radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.95), transparent 38%),
            linear-gradient(135deg, rgba(14, 110, 100, 0.98), rgba(42, 161, 146, 0.9));
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 800;
          box-shadow:
            0 10px 22px rgba(14, 110, 100, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.28);
        }

        .provider-onboarding-review-flow .provider-onboarding-step-list h3 {
          color: var(--dm-teal-950, #07302c);
          font-family: var(--dm-font-display, var(--dm-font-sans, system-ui));
          font-size: clamp(1rem, 1.1vw, 1.1rem);
          font-weight: 740;
          letter-spacing: -0.012em;
        }

        .provider-onboarding-review-flow .provider-onboarding-step-list p {
          color: var(--dm-ink-700, #2e3a3b);
          font-size: var(--dm-type-small, 0.875rem);
          line-height: 1.6;
        }

        .provider-onboarding-review-flow .provider-onboarding-checklist {
          isolation: isolate;
          align-self: stretch;
          gap: 0.78rem;
          border: 1px solid rgba(14, 110, 100, 0.16);
          border-radius: clamp(1.2rem, 2.2vw, 1.6rem);
          background:
            linear-gradient(150deg, rgba(255, 255, 255, 0.94), rgba(236, 248, 245, 0.86)),
            radial-gradient(340px circle at 84% 8%, rgba(42, 161, 146, 0.18), transparent 58%);
          box-shadow:
            0 20px 54px rgba(11, 40, 38, 0.11),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
          padding: clamp(1.05rem, 2.4vw, 1.45rem);
        }

        .provider-onboarding-review-flow .provider-onboarding-checklist::before,
        .provider-onboarding-review-flow .provider-onboarding-checklist::after {
          content: '';
          position: absolute;
          z-index: 0;
          pointer-events: none;
        }

        .provider-onboarding-review-flow .provider-onboarding-checklist::before {
          inset: 0.55rem;
          border: 1px solid rgba(255, 255, 255, 0.58);
          border-radius: inherit;
          background:
            linear-gradient(115deg, rgba(255, 255, 255, 0.36), transparent 48%),
            repeating-linear-gradient(90deg, rgba(14, 110, 100, 0.05) 0 1px, transparent 1px 3.1rem);
          opacity: 0.82;
        }

        .provider-onboarding-review-flow .provider-onboarding-checklist::after {
          inset-block-start: 0.75rem;
          inset-inline-end: 0.85rem;
          inline-size: 8rem;
          block-size: 8rem;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(42, 161, 146, 0.2), transparent 66%);
          filter: blur(1px);
        }

        .provider-onboarding-review-flow .provider-onboarding-checklist > * {
          position: relative;
          z-index: 1;
        }

        .provider-onboarding-review-flow .provider-onboarding-checklist ul {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.54rem;
        }

        .provider-onboarding-review-flow .provider-onboarding-checklist li {
          display: flex;
          align-items: center;
          gap: 0.46rem;
          border-color: rgba(14, 110, 100, 0.14);
          border-radius: 0.95rem;
          background: rgba(255, 255, 255, 0.76);
          color: var(--dm-ink-700, #2e3a3b);
          font-size: var(--dm-type-small, 0.875rem);
          font-weight: 720;
          line-height: 1.42;
          padding: 0.56rem 0.62rem;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.84);
        }

        .provider-onboarding-review-flow .provider-onboarding-checklist li::before {
          content: '';
          flex: 0 0 auto;
          inline-size: 0.55rem;
          block-size: 0.55rem;
          border-radius: 999px;
          background: var(--dm-color-brand, #0e6e64);
          box-shadow: 0 0 0 0.24rem rgba(14, 110, 100, 0.09);
        }

        [dir='rtl'] .provider-onboarding-review-flow .provider-onboarding-section__header h2,
        [dir='rtl'] .provider-onboarding-review-flow .provider-onboarding-checklist h2,
        [dir='rtl'] .provider-onboarding-review-flow .provider-onboarding-step-list h3 {
          letter-spacing: 0;
          line-height: 1.2;
        }

        .provider-onboarding-plan {
          display: grid;
          gap: 0.78rem;
        }

        .provider-onboarding-plan ul {
          display: grid;
          gap: 0.45rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .provider-onboarding-plan li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.8rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          padding: 0.48rem 0.66rem;
        }

        .provider-onboarding-plan li span {
          color: var(--dm-color-text-muted, #66736f);
          font-size: 0.84rem;
          font-weight: 700;
        }

        .provider-onboarding-plan li strong {
          color: var(--dm-teal-950, #07302c);
          font-size: 0.94rem;
          white-space: nowrap;
        }

        .provider-onboarding-pricing-note {
          margin-block: 1rem 0;
          border-radius: clamp(1rem, 2vw, 1.35rem);
          color: var(--dm-ink-700, #2e3a3b);
        }

        .provider-onboarding-addons {
          display: grid;
          gap: 1rem;
        }

        .provider-onboarding-addons .provider-onboarding-section__header {
          margin-block-end: 0;
        }

        .provider-onboarding-addons > p {
          margin: 0;
          font-size: 0.92rem;
          font-weight: 700;
        }

        .provider-onboarding-form-copy {
          position: sticky;
          top: clamp(1rem, 5vw, 5rem);
          margin-block-end: 0;
        }

        .provider-onboarding-form {
          display: grid;
          gap: 1rem;
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .provider-onboarding-form__intro {
          display: grid;
          gap: 0.35rem;
        }

        .provider-onboarding-form__intro h2,
        .provider-onboarding-form__intro p,
        .provider-onboarding-form__intro span {
          margin: 0;
        }

        .provider-onboarding-form__intro h2 {
          color: var(--dm-teal-950, #07302c);
          font-size: clamp(1.28rem, 2vw, 1.6rem);
          letter-spacing: -0.025em;
        }

        .provider-onboarding-form__intro p,
        .provider-onboarding-form__intro span {
          color: var(--dm-color-text-muted, #66736f);
          font-size: 0.94rem;
          line-height: 1.58;
        }

        .provider-onboarding-form__grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.76rem;
        }

        .provider-onboarding-form label {
          display: grid;
          gap: 0.35rem;
          color: var(--dm-teal-950, #07302c);
          font-size: 0.9rem;
          font-weight: 720;
        }

        .provider-onboarding-form textarea.dm2026-input {
          min-block-size: 7rem;
          resize: vertical;
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
          gap: 0.65rem;
          border: 1px solid rgba(14, 110, 100, 0.1);
          border-radius: 1rem;
          background: rgba(239, 246, 244, 0.68);
          padding: 0.82rem;
        }

        .provider-onboarding-form__consent input {
          inline-size: 1rem;
          block-size: 1rem;
          margin-block-start: 0.16rem;
          accent-color: var(--dm-color-brand, #0e6e64);
        }

        .provider-onboarding-form__website {
          position: absolute;
          width: 1px;
          height: 1px;
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
          margin: 0;
          font-size: 0.92rem;
          font-weight: 800;
        }

        .provider-onboarding-form__status--success {
          color: var(--dm-color-brand-strong, #0b4f4a);
        }

        .provider-onboarding-form__status--error {
          color: #b42318;
        }

        .provider-onboarding-faq {
          padding-block: clamp(2rem, 6vw, 4.5rem);
        }

        .provider-onboarding-faq details > summary {
          list-style: none;
        }

        .provider-onboarding-faq details > summary::-webkit-details-marker {
          display: none;
        }

        .provider-onboarding-faq details[open] {
          border-color: rgba(14, 110, 100, 0.2);
          background: rgba(255, 255, 255, 0.9);
        }

        .provider-onboarding-faq details[open] .dm2026-home-faq__icon::after {
          transform: translate(-50%, -50%) rotate(90deg);
          opacity: 0;
        }

        .provider-onboarding-final {
          padding-block: clamp(1.2rem, 4vw, 3rem) clamp(2.5rem, 7vw, 5rem);
        }

        .provider-onboarding-final__shell {
          grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.8fr);
        }

        .provider-onboarding-disclaimer {
          align-self: stretch;
          display: grid;
          align-content: center;
          gap: 0.65rem;
        }

        .provider-onboarding-disclaimer h2,
        .provider-onboarding-disclaimer p {
          margin: 0;
        }

        [dir='rtl'] .provider-onboarding-hero .dm2026-provider-cta__headline-group h1,
        [dir='rtl'] .provider-onboarding-final .dm2026-provider-cta__headline-group h2,
        [dir='rtl'] .provider-onboarding-section__header h2,
        [dir='rtl'] .provider-onboarding-checklist h2,
        [dir='rtl'] .provider-onboarding-disclaimer h2 {
          letter-spacing: 0;
          line-height: 1.2;
        }

        [dir='rtl'] .provider-onboarding-plan li {
          flex-direction: row-reverse;
        }

        @media (max-width: 68rem) {
          .provider-onboarding-benefit-grid,
          .provider-onboarding-pricing-grid,
          .provider-onboarding-two-column,
          .provider-onboarding-two-column--form,
          .provider-onboarding-final__shell {
            grid-template-columns: 1fr;
          }

          .provider-onboarding-hero__shell {
            grid-template-columns: 1fr;
          }

          .provider-onboarding-hero__visual {
            min-block-size: clamp(16rem, 42vw, 20rem);
          }

          .provider-onboarding-categories .dm2026-discovery-categories__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .provider-onboarding-category-card {
            min-block-size: 14.8rem;
          }

          .provider-onboarding-benefits .provider-onboarding-benefit-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .provider-onboarding-benefits .provider-onboarding-mini-card {
            min-block-size: 12.2rem;
          }

          .provider-onboarding-form-copy {
            position: static;
          }
        }

        @media (max-width: 42rem) {
          .provider-onboarding-page {
            padding-block-start: 0.4rem;
          }

          .provider-onboarding-hero {
            padding-block: 0.55rem 1.45rem;
          }

          .provider-onboarding-hero__shell {
            gap: 0.72rem;
            padding: 0.72rem;
          }

          .provider-onboarding-hero .dm2026-provider-cta__copy {
            gap: 0.56rem;
          }

          .provider-onboarding-hero .dm2026-provider-cta__headline-group h1 {
            max-inline-size: 16ch;
            font-size: clamp(1.76rem, 7.6vw, 2.35rem);
            line-height: 1.08;
          }

          .provider-onboarding-hero .dm2026-provider-cta__headline-group p {
            font-size: 0.95rem;
            line-height: 1.58;
          }

          .provider-onboarding-hero .dm2026-provider-cta__visual {
            min-block-size: 15.6rem;
            padding: 0.5rem;
          }

          .provider-onboarding-hero__preview {
            inline-size: calc(100% - 0.7rem);
            margin: 0.35rem;
            padding: 0.74rem;
          }

          .provider-onboarding-categories .dm2026-discovery-categories__grid,
          .provider-onboarding-benefit-grid,
          .provider-onboarding-pricing-grid,
          .provider-onboarding-form__grid {
            grid-template-columns: 1fr;
          }

          .provider-onboarding-category-card {
            min-block-size: auto;
          }

          .provider-onboarding-category-card .dm2026-discovery-card__visual {
            min-block-size: 6.2rem;
          }

          .provider-onboarding-benefits .provider-onboarding-section__header h2 {
            max-inline-size: 100%;
          }

          .provider-onboarding-benefits .provider-onboarding-mini-card {
            min-block-size: auto;
            padding: 1rem;
          }

          .provider-onboarding-form__submit,
          .provider-onboarding-hero .dm2026-provider-cta__button,
          .provider-onboarding-final .dm2026-provider-cta__button {
            inline-size: 100%;
          }

          .provider-onboarding-checklist ul,
          .provider-onboarding-addons ul {
            display: grid;
          }

          .provider-onboarding-review-flow .provider-onboarding-checklist ul {
            grid-template-columns: 1fr;
          }

          .provider-onboarding-review-flow .provider-onboarding-step-list li {
            gap: 0.62rem;
          }

          .provider-onboarding-checklist li,
          .provider-onboarding-addons li {
            border-radius: 0.9rem;
          }

          .provider-onboarding-plan li {
            align-items: flex-start;
            border-radius: 0.9rem;
            flex-direction: column;
          }

          [dir='rtl'] .provider-onboarding-plan li {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
