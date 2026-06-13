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
        'A provider-focused DrMuscat onboarding page for clinics, doctors and care businesses that want their public information reviewed for future bilingual discovery surfaces.',
      primaryCta: 'Request onboarding review',
      secondaryCta: 'Public discovery only',
      trustNote: 'No booking, payment, dashboard access, ranking promise or immediate publishing is included in this request.',
      pills: ['English + Arabic ready', 'Contact details reviewed', 'Oman-first discovery'],
      visualLabel: 'Provider readiness',
      visualTitle: 'Review-ready public information',
      visualDescription: 'Share core details once so the DrMuscat team can review the public-facing information before any discovery preparation.',
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
      title: 'A conservative visibility foundation, not a promise of demand.',
      subtitle: 'DrMuscat prepares public information so users can understand and confirm details directly with providers.',
      items: [
        { title: 'Public discovery profile', description: 'Core information can be shaped into a public profile after review.' },
        { title: 'Bilingual presence', description: 'English and Arabic wording can be prepared where information is available.' },
        { title: 'Contact readiness', description: 'Phone, WhatsApp, website and directions readiness can be checked.' },
        { title: 'Services visibility', description: 'Public service categories can be organized for easier discovery.' },
        { title: 'Reviewed public information', description: 'Submitted details are reviewed before they are prepared for public discovery.' },
        { title: 'Future provider-approved offers', description: 'Offer concepts may be reviewed later only when provider-approved and clearly presented.' }
      ]
    },
    onboarding: {
      badge: 'How onboarding works',
      title: 'Three careful steps before public preparation.',
      subtitle: 'The flow stays intentionally simple and review-led.',
      steps: [
        { title: 'Submit onboarding request', description: 'Send business, location, contact and category information through the existing safe form.' },
        { title: 'DrMuscat reviews public information', description: 'The team checks whether submitted information is complete enough for discovery preparation.' },
        { title: 'Approved details can be prepared', description: 'Reviewed public details can then be prepared for future DrMuscat discovery pages.' }
      ]
    },
    reviewed: {
      badge: 'What gets reviewed',
      title: 'The first review focuses on public basics.',
      subtitle: 'No private dashboard, payment, booking or claim workflow is part of this page.',
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
      badge: 'لمقدمي الخدمة في عُمان',
      title: 'جهّز ملفك العام في DrMuscat للمراجعة.',
      description:
        'صفحة انضمام مخصصة لمقدمي الخدمة في DrMuscat للعيادات والأطباء ومؤسسات الرعاية التي ترغب في مراجعة معلوماتها العامة تمهيداً لظهورها مستقبلاً في تجربة اكتشاف ثنائية اللغة.',
      primaryCta: 'اطلب مراجعة الانضمام',
      secondaryCta: 'اكتشاف عام فقط',
      trustNote: 'لا يشمل هذا الطلب حجزاً أو دفعاً أو لوحة تحكم أو وعداً بالترتيب أو نشراً فورياً.',
      pills: ['جاهز للعربية والإنجليزية', 'مراجعة معلومات التواصل', 'اكتشاف يركز على عُمان'],
      visualLabel: 'جاهزية مقدم الخدمة',
      visualTitle: 'معلومات عامة جاهزة للمراجعة',
      visualDescription: 'شارك التفاصيل الأساسية مرة واحدة حتى يراجع فريق DrMuscat المعلومات العامة قبل أي تجهيز لصفحات الاكتشاف.',
      visualItems: ['فئة مقدم الخدمة', 'المدينة والمنطقة', 'خيارات تواصل عامة'],
      visualActions: ['اتصال', 'واتساب', 'الاتجاهات']
    },
    categories: {
      badge: 'من يمكنه الانضمام',
      title: 'مصمم لمقدمي الرعاية الذين يبحث عنهم الناس في عُمان.',
      subtitle: 'يعكس هذا القسم إيقاع بطاقات الاكتشاف في الصفحة الرئيسية حتى تبدو فئات مقدمي الخدمة جزءاً أصيلاً من DrMuscat.',
      cta: 'نطاق المراجعة',
      items: [
        { id: 'clinics', title: 'العيادات', description: 'عيادات طبية تجهّز تفاصيل الاكتشاف العامة.', size: 'large' },
        { id: 'doctors', title: 'الأطباء', description: 'أطباء أفراد وملفات اختصاصيين.', size: 'medium' },
        { id: 'dental', title: 'عيادات الأسنان', description: 'مراكز أسنان وأطباء أسنان وخدمات رعاية الفم.', size: 'large' },
        { id: 'pharmacies', title: 'الصيدليات', description: 'تفاصيل عامة للموقع والتواصل مع الصيدلية.', size: 'medium' },
        { id: 'labs', title: 'المختبرات', description: 'مختبرات تشخيصية وملفات خدمات الفحوصات.', size: 'medium' },
        { id: 'hospitals', title: 'المستشفيات والمجمعات', description: 'مراكز رعاية أكبر مع فئات خدمات عامة.', size: 'medium' },
        { id: 'wellness', title: 'مقدمو التجميل والرفاهية', description: 'مقدمو خدمات تجميل ورفاهية بصياغة عامة مراجعة.', size: 'large' },
        { id: 'pet', title: 'العيادات البيطرية', description: 'عيادات بيطرية ورعاية حيوانات أليفة تجهّز تفاصيل الاكتشاف.', size: 'medium' }
      ]
    },
    benefits: {
      badge: 'فوائد الاكتشاف',
      title: 'أساس ظهور محافظ، وليس وعداً بالطلب.',
      subtitle: 'تجهّز DrMuscat المعلومات العامة كي يفهم المستخدمون التفاصيل ويؤكدوها مباشرة مع مقدمي الخدمة.',
      items: [
        { title: 'ملف اكتشاف عام', description: 'يمكن تحويل المعلومات الأساسية إلى ملف عام بعد المراجعة.' },
        { title: 'حضور ثنائي اللغة', description: 'يمكن تجهيز الصياغة بالعربية والإنجليزية عند توفر معلومات دقيقة.' },
        { title: 'جاهزية التواصل', description: 'يمكن مراجعة الهاتف والواتساب والموقع الإلكتروني وجاهزية الاتجاهات.' },
        { title: 'وضوح الخدمات', description: 'يمكن تنظيم فئات الخدمات العامة لتسهيل الاكتشاف.' },
        { title: 'معلومات عامة مراجعة', description: 'تتم مراجعة التفاصيل المرسلة قبل تجهيزها للاكتشاف العام.' },
        { title: 'عروض مستقبلية بموافقة مقدم الخدمة', description: 'يمكن مراجعة أفكار العروض لاحقاً فقط عند موافقة مقدم الخدمة وعرضها بوضوح.' }
      ]
    },
    onboarding: {
      badge: 'كيف يعمل الانضمام',
      title: 'ثلاث خطوات حذرة قبل تجهيز الظهور العام.',
      subtitle: 'يبقى المسار بسيطاً وقائماً على المراجعة.',
      steps: [
        { title: 'إرسال طلب الانضمام', description: 'أرسل معلومات النشاط والموقع والتواصل والفئة عبر النموذج الآمن الحالي.' },
        { title: 'تراجع DrMuscat المعلومات العامة', description: 'يتحقق الفريق من اكتمال المعلومات بما يكفي لتجهيز الاكتشاف.' },
        { title: 'يمكن تجهيز التفاصيل المعتمدة', description: 'بعد المراجعة يمكن تجهيز التفاصيل العامة لصفحات اكتشاف DrMuscat المستقبلية.' }
      ]
    },
    reviewed: {
      badge: 'ما الذي تتم مراجعته',
      title: 'تركز المراجعة الأولى على الأساسيات العامة.',
      subtitle: 'لا تتضمن هذه الصفحة لوحة خاصة أو دفعاً أو حجزاً أو مسار مطالبة.',
      items: [
        'اسم النشاط أو مقدم الخدمة',
        'فئة مقدم الخدمة',
        'المدينة والمنطقة',
        'الهاتف والواتساب العامان',
        'الموقع الإلكتروني والعنوان العام',
        'جاهزية الخريطة أو الاتجاهات',
        'فئات الخدمات العامة',
        'الصياغة ثنائية اللغة عند توفرها'
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

      {!['dental', 'wellness', 'doctors', 'labs', 'pet'].includes(id) ? (
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
              <div className="dm2026-provider-cta__preview-card provider-onboarding-hero__preview">
                <div className="dm2026-provider-cta__preview-head">
                  <span>{copy.hero.visualLabel}</span>
                  <strong>{copy.hero.secondaryCta}</strong>
                </div>
                <h2>{copy.hero.visualTitle}</h2>
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
                  className={`dm2026-discovery-card dm2026-discovery-card--${item.size === 'large' ? 'large' : 'medium'} dm2026-discovery-card--${item.id === 'wellness' ? 'secondary' : item.id === 'dental' ? 'hero' : item.id === 'pharmacies' ? 'offers' : 'secondary'}`}
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

      <section className="dm2026-section provider-onboarding-section" aria-labelledby="provider-benefits-title">
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

      <section className="dm2026-section provider-onboarding-section provider-onboarding-section--compact" aria-labelledby="provider-onboarding-steps-title">
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
          padding-block-start: clamp(1.2rem, 3vw, 2.4rem);
        }

        .provider-onboarding-hero__shell {
          align-items: stretch;
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
          max-inline-size: 15ch;
          margin: 0;
          font-size: clamp(2.05rem, 5vw, 4rem);
          line-height: 1.02;
        }

        .provider-onboarding-final .dm2026-provider-cta__headline-group h2,
        .provider-onboarding-section__header h2,
        .provider-onboarding-checklist h2 {
          margin: 0;
          font-size: clamp(1.72rem, 3.5vw, 2.7rem);
          line-height: 1.08;
        }

        .provider-onboarding-hero__visual {
          min-block-size: clamp(17rem, 27vw, 22rem);
        }

        .provider-onboarding-hero__preview {
          inline-size: min(100% - 1.4rem, 24rem);
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

          .provider-onboarding-form-copy {
            position: static;
          }
        }

        @media (max-width: 42rem) {
          .provider-onboarding-page {
            padding-block-start: 0.4rem;
          }

          .provider-onboarding-hero .dm2026-provider-cta__headline-group h1 {
            max-inline-size: 15ch;
            font-size: clamp(1.72rem, 8vw, 2.35rem);
          }

          .provider-onboarding-benefit-grid,
          .provider-onboarding-pricing-grid,
          .provider-onboarding-form__grid {
            grid-template-columns: 1fr;
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
