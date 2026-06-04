import type { SupportedLocale } from '@/lib/i18n/config';
import type { PublicDiscoverySlug } from '@/lib/routes/public';

export type CategoryTone2026 = 'teal' | 'mint' | 'gold' | 'aqua' | 'soft';

export type Home2026Copy = {
  metadataTitle: string;
  metadataDescription: string;
  brand: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    searchLabel: string;
    searchPlaceholder: string;
    searchButton: string;
    locationLabel: string;
    suggestionTitle: string;
    quickLinksLabel: string;
    chips: readonly { label: string; slug: PublicDiscoverySlug }[];
    suggestionGroups: readonly { title: string; items: readonly string[] }[];
  };
  location: {
    country: string;
    city: string;
    area: string;
    countryHelp: string;
    comingSoon: string;
    allAreas: string;
    unavailableCity: string;
    unavailableArea: string;
  };
  trustBar: readonly string[];
  actions: {
    viewProfile: string;
    whatsapp: string;
    call: string;
    directions: string;
    unavailable: string;
  };
  featured: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: readonly { title: string; specialty: string; description: string; slug: PublicDiscoverySlug }[];
  };
  carousel: {
    eyebrow: string;
    title: string;
    subtitle: string;
    previous: string;
    next: string;
    pauseLabel: string;
    sampleLabel: string;
    providers: readonly {
      name: string;
      category: string;
      location: string;
      hours: string;
      description: string;
      route: PublicDiscoverySlug;
    }[];
  };
  categories: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: readonly { title: string; description: string; slug: PublicDiscoverySlug; tone: CategoryTone2026 }[];
  };
  areas: {
    eyebrow: string;
    title: string;
    subtitle: string;
    exploreLabel: string;
    areas: readonly string[];
  };
  articles: {
    eyebrow: string;
    title: string;
    subtitle: string;
    disclaimer: string;
    cards: readonly { category: string; title: string; description: string; readTime: string }[];
  };
  safety: {
    eyebrow: string;
    title: string;
    subtitle: string;
    points: readonly string[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: readonly { question: string; answer: string }[];
  };
  disclaimer: string;
  providerCta: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
    note: string;
  };
  floating: {
    whatsapp: string;
    ai: string;
    whatsappTitle: string;
    whatsappBody: string;
    whatsappCta: string;
    aiTitle: string;
    aiBody: string;
    aiPlaceholder: string;
    send: string;
    close: string;
    disclaimer: string;
  };
};

export const home2026CopyByLocale: Record<SupportedLocale, Home2026Copy> = {
  en: {
    metadataTitle: 'DrMuscat Oman | Healthcare Discovery Foundation',
    metadataDescription:
      'Find healthcare options in Oman, faster. DrMuscat is building a bilingual healthcare discovery foundation for patients and providers across Oman.',
    brand: 'DrMuscat',
    hero: {
      eyebrow: 'Oman-first healthcare discovery',
      title: 'Find trusted healthcare in Oman.',
      subtitle: 'Search doctors, clinics, pharmacies, labs, pet clinics, dental, beauty and wellness in one calm Oman-focused place.',
      searchLabel: 'What care are you looking for?',
      searchPlaceholder: 'Search doctors, clinics, services, areas or health guides',
      searchButton: 'Search',
      locationLabel: 'Choose your location',
      suggestionTitle: 'Suggested discovery paths',
      quickLinksLabel: 'Quick categories',
      chips: [
        { label: 'Doctors', slug: 'doctors' },
        { label: 'Clinics', slug: 'centers' },
        { label: 'Pharmacies', slug: 'pharmacies' },
        { label: 'Labs', slug: 'labs' },
        { label: 'Services', slug: 'services' }
      ],
      suggestionGroups: [
        { title: 'Categories', items: ['Doctors', 'Clinics', 'Pharmacies'] },
        { title: 'Providers', items: ['Reviewed listings', 'Clinic profiles'] },
        { title: 'Services', items: ['Dental', 'Beauty and wellness', 'Diagnostics'] },
        { title: 'Areas', items: ['Muscat', 'Seeb', 'Bausher'] },
        { title: 'Articles', items: ['Health guides', 'Care checklists'] }
      ]
    },
    location: {
      country: 'Country',
      city: 'City',
      area: 'Area',
      countryHelp: 'Oman is active. Other countries are coming soon.',
      comingSoon: 'coming soon',
      allAreas: 'All areas',
      unavailableCity: 'Cities coming soon',
      unavailableArea: 'Areas coming soon'
    },
    trustBar: ['Clear bilingual discovery', 'Listings reviewed before display', 'No fake ratings or review counts'],
    actions: {
      viewProfile: 'View profile',
      whatsapp: 'WhatsApp',
      call: 'Call',
      directions: 'Directions',
      unavailable: 'Contact actions preview only'
    },
    featured: {
      eyebrow: 'Explore trusted care across Oman',
      title: 'Explore care pathways',
      subtitle: 'Polished provider previews show the future contact flow without inventing ratings, review counts, or phone numbers.',
      cards: [
        { title: 'Doctor profiles', specialty: 'Doctors', description: 'Browse doctor discovery with clear profile and contact actions when listings are reviewed.', slug: 'doctors' },
        { title: 'Clinics and centers', specialty: 'Centers', description: 'Explore clinic and center profiles for healthcare, dental, beauty, and wellness discovery.', slug: 'centers' },
        { title: 'Pharmacies, labs and services', specialty: 'Care services', description: 'Find approved discovery routes for everyday healthcare services across Oman.', slug: 'services' }
      ]
    },
    carousel: {
      eyebrow: 'Featured centers',
      title: 'Trusted care across Oman',
      subtitle: 'Sample center previews show the intended discovery layout. They do not claim ratings, reviews, availability, or paid placement.',
      previous: 'Previous featured centers',
      next: 'Next featured centers',
      pauseLabel: 'Featured centers carousel',
      sampleLabel: 'Sample preview',
      providers: [
        { name: 'Al Khuwair Medical Centre', category: 'Medical centre', location: 'Muscat · Al Khuwair', hours: 'Hours preview', description: 'A sample public card for general healthcare discovery and contact actions.', route: 'centers' },
        { name: 'Madinat Qaboos Dental Clinic', category: 'Dental clinic', location: 'Muscat · Madinat Qaboos', hours: 'Hours preview', description: 'Dental service discovery preview without ratings, reviews, or clinical claims.', route: 'services' },
        { name: 'Seeb Family Pharmacy', category: 'Pharmacy', location: 'Seeb · Al Hail', hours: 'Hours preview', description: 'Pharmacy discovery card showing safe contact and directions actions.', route: 'pharmacies' },
        { name: 'Ruwi Diagnostic Laboratory', category: 'Laboratory', location: 'Muscat · Ruwi', hours: 'Hours preview', description: 'Lab discovery preview for future reviewed public listings.', route: 'labs' },
        { name: 'Azaiba Pet Clinic', category: 'Pet clinic', location: 'Muscat · Azaiba', hours: 'Hours preview', description: 'Veterinary discovery preview for pet-care related services.', route: 'services' },
        { name: 'Qurum Wellness & Beauty Clinic', category: 'Wellness and beauty', location: 'Muscat · Qurum', hours: 'Hours preview', description: 'Wellness and beauty discovery preview with honest sample labeling.', route: 'services' },
        { name: 'Al Ghubrah Eye Centre', category: 'Eye clinic', location: 'Muscat · Al Ghubrah', hours: 'Hours preview', description: 'Eye care discovery preview without ranking or treatment claims.', route: 'centers' },
        { name: 'Muscat Physiotherapy Clinic', category: 'Physiotherapy', location: 'Muscat · Bausher', hours: 'Hours preview', description: 'Physiotherapy service discovery preview for future approved listings.', route: 'services' }
      ]
    },
    categories: {
      eyebrow: 'Browse healthcare by category',
      title: 'Start with the type of care you need',
      subtitle: 'Soft category cards route only to approved public discovery pages.',
      cards: [
        { title: 'Doctors', description: 'Medical specialist discovery.', slug: 'doctors', tone: 'teal' },
        { title: 'Clinics', description: 'Clinics and medical centers.', slug: 'centers', tone: 'mint' },
        { title: 'Pharmacies', description: 'Pharmacy discovery.', slug: 'pharmacies', tone: 'gold' },
        { title: 'Labs', description: 'Laboratory discovery.', slug: 'labs', tone: 'aqua' },
        { title: 'Dental', description: 'Dental care services.', slug: 'services', tone: 'soft' },
        { title: 'Beauty clinics', description: 'Beauty and aesthetic care.', slug: 'services', tone: 'gold' },
        { title: 'Wellness', description: 'Wellness and preventive care.', slug: 'services', tone: 'mint' },
        { title: 'Physiotherapy', description: 'Rehab and movement care.', slug: 'services', tone: 'teal' },
        { title: 'Nutrition', description: 'Nutrition and lifestyle care.', slug: 'services', tone: 'soft' },
        { title: 'Eye clinics', description: 'Eye care discovery.', slug: 'services', tone: 'aqua' },
        { title: 'Dermatology', description: 'Skin care services.', slug: 'services', tone: 'gold' },
        { title: 'Pediatrics', description: 'Child healthcare discovery.', slug: 'doctors', tone: 'mint' },
        { title: 'Women’s health', description: 'Women-focused care.', slug: 'services', tone: 'teal' },
        { title: 'Pet clinics', description: 'Veterinary clinic discovery.', slug: 'services', tone: 'soft' }
      ]
    },
    areas: {
      eyebrow: 'Find care by area',
      title: 'Browse care around familiar places',
      subtitle: 'Area cards are calm navigation prompts and do not claim provider coverage or counts.',
      exploreLabel: 'Explore area',
      areas: ['Muscat', 'Al Khuwair', 'Qurum', 'Azaiba', 'Seeb', 'Sohar', 'Salalah', 'Nizwa']
    },
    articles: {
      eyebrow: 'Health guides and articles',
      title: 'Learn before you choose care',
      subtitle: 'Simple education and discovery guides will sit below search so care discovery remains the main action.',
      disclaimer: 'Guides are for general education only and do not replace professional medical advice.',
      cards: [
        { category: 'Guide', title: 'How to choose a clinic in Oman', description: 'A practical discovery checklist for comparing public clinic information safely.', readTime: '4 min read' },
        { category: 'Checklist', title: 'Preparing for a lab visit', description: 'General questions to consider before visiting a laboratory or diagnostic provider.', readTime: '3 min read' },
        { category: 'Explainer', title: 'Dental, beauty and wellness discovery', description: 'Understand how to review service information without relying on unsupported claims.', readTime: '5 min read' }
      ]
    },
    safety: {
      eyebrow: 'Clear, bilingual healthcare discovery for Oman',
      title: 'Built for public trust without unsafe claims',
      subtitle: 'DrMuscat organizes public-facing healthcare information while keeping clinical decisions with qualified professionals.',
      points: ['No diagnosis or guaranteed outcomes', 'No fake ratings, reviews, or provider counts', 'No private data exposed on the homepage']
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Common questions',
      items: [
        { question: 'Can I book an appointment here?', answer: 'Not in this phase. The homepage links to approved public discovery routes only.' },
        { question: 'Are ratings shown?', answer: 'No. Ratings and reviews are not shown unless a future approved data and moderation phase supports them.' },
        { question: 'Which countries are active?', answer: 'Oman is active. United Arab Emirates, Saudi Arabia, Qatar, Bahrain, Kuwait and Iran are coming soon.' }
      ]
    },
    disclaimer: 'DrMuscat is a public healthcare discovery platform. It is not a substitute for medical advice, emergency care, diagnosis, or treatment.',
    providerCta: {
      eyebrow: 'For providers',
      title: 'Prepare a clearer public presence for your clinic or center.',
      subtitle: 'Clinics and centers can learn about the future onboarding direction for reviewed public profiles in Oman.',
      cta: 'For Providers',
      note: 'No payment gateway, AI chat, backend search, or provider dashboard feature is added here.'
    },
    floating: { whatsapp: 'WhatsApp help', ai: 'AI assistant', whatsappTitle: 'WhatsApp support preview', whatsappBody: 'WhatsApp support preview. A real number will be connected later.', whatsappCta: 'Open WhatsApp placeholder', aiTitle: 'DrMuscat AI assistant', aiBody: 'AI assistant preview. This will help users find care, compare options, and ask questions.', aiPlaceholder: 'Preview only — type is disabled', send: 'Send', close: 'Close', disclaimer: 'General discovery help only, not medical advice.' }
  },
  ar: {
    metadataTitle: 'DrMuscat عُمان | أساس اكتشاف الرعاية الصحية',
    metadataDescription:
      'اعثر على خيارات الرعاية الصحية في عُمان بسرعة أكبر. يبني DrMuscat أساساً ثنائي اللغة لاكتشاف الرعاية الصحية للمرضى ومقدمي الخدمة في عُمان.',
    brand: 'دكتور مسقط',
    hero: {
      eyebrow: 'اكتشاف الرعاية الصحية في عُمان أولاً',
      title: 'ابحث عن رعاية صحية موثوقة في عُمان.',
      subtitle: 'ابحث عن أطباء، عيادات، صيدليات، مختبرات، عيادات بيطرية، أسنان، تجميل وعناية في مكان واحد هادئ ومخصص لعُمان.',
      searchLabel: 'ما نوع الرعاية التي تبحث عنها؟',
      searchPlaceholder: 'ابحث عن أطباء، عيادات، خدمات، مناطق أو أدلة صحية',
      searchButton: 'بحث',
      locationLabel: 'اختر موقعك',
      suggestionTitle: 'مسارات مقترحة للاكتشاف',
      quickLinksLabel: 'فئات سريعة',
      chips: [
        { label: 'الأطباء', slug: 'doctors' },
        { label: 'العيادات', slug: 'centers' },
        { label: 'الصيدليات', slug: 'pharmacies' },
        { label: 'المختبرات', slug: 'labs' },
        { label: 'الخدمات', slug: 'services' }
      ],
      suggestionGroups: [
        { title: 'الفئات', items: ['الأطباء', 'العيادات', 'الصيدليات'] },
        { title: 'مقدمو الرعاية', items: ['قوائم تتم مراجعتها', 'ملفات العيادات'] },
        { title: 'الخدمات', items: ['الأسنان', 'التجميل والعناية', 'الفحوصات'] },
        { title: 'المناطق', items: ['مسقط', 'السيب', 'بوشر'] },
        { title: 'المقالات', items: ['أدلة صحية', 'قوائم تحقق'] }
      ]
    },
    location: {
      country: 'الدولة',
      city: 'المدينة',
      area: 'المنطقة',
      countryHelp: 'عُمان متاحة حالياً. الدول الأخرى قريبة الإطلاق.',
      comingSoon: 'قريباً',
      allAreas: 'كل المناطق',
      unavailableCity: 'المدن قريباً',
      unavailableArea: 'المناطق قريباً'
    },
    trustBar: ['دليل واضح بثنائية اللغة', 'تتم مراجعة القوائم قبل عرضها', 'دون تقييمات أو أعداد مراجعات وهمية'],
    actions: {
      viewProfile: 'عرض الملف',
      whatsapp: 'واتساب',
      call: 'اتصال',
      directions: 'الاتجاهات',
      unavailable: 'إجراءات التواصل للمعاينة فقط'
    },
    featured: {
      eyebrow: 'استكشف الرعاية الصحية في عُمان',
      title: 'استكشف مسارات الرعاية',
      subtitle: 'تعرض بطاقات المعاينة شكل التواصل المستقبلي دون اختراع تقييمات أو أعداد مراجعات أو أرقام هواتف.',
      cards: [
        { title: 'ملفات الأطباء', specialty: 'الأطباء', description: 'تصفح اكتشاف الأطباء مع إجراءات ملف وتواصل واضحة عند مراجعة القوائم.', slug: 'doctors' },
        { title: 'العيادات والمراكز', specialty: 'المراكز', description: 'استكشف ملفات العيادات والمراكز للصحة والأسنان والتجميل والعناية.', slug: 'centers' },
        { title: 'الصيدليات والمختبرات والخدمات', specialty: 'خدمات الرعاية', description: 'اعثر على مسارات اكتشاف معتمدة لخدمات الرعاية اليومية في عُمان.', slug: 'services' }
      ]
    },
    carousel: {
      eyebrow: 'مراكز مميزة',
      title: 'رعاية موثوقة في عُمان',
      subtitle: 'تعرض بطاقات المراكز عينة من شكل الاكتشاف فقط، دون تقييمات أو مراجعات أو توفر حقيقي أو ادعاء ترويجي.',
      previous: 'المراكز السابقة',
      next: 'المراكز التالية',
      pauseLabel: 'عارض المراكز المميزة',
      sampleLabel: 'معاينة نموذجية',
      providers: [
        { name: 'مركز الخوير الطبي', category: 'مركز طبي', location: 'مسقط · الخوير', hours: 'معاينة الأوقات', description: 'بطاقة نموذجية لاكتشاف الرعاية العامة وإجراءات التواصل.', route: 'centers' },
        { name: 'عيادة مدينة قابوس للأسنان', category: 'عيادة أسنان', location: 'مسقط · مدينة قابوس', hours: 'معاينة الأوقات', description: 'معاينة لاكتشاف خدمات الأسنان دون تقييمات أو ادعاءات سريرية.', route: 'services' },
        { name: 'صيدلية السيب العائلية', category: 'صيدلية', location: 'السيب · الحيل', hours: 'معاينة الأوقات', description: 'بطاقة اكتشاف صيدلية مع إجراءات تواصل واتجاهات آمنة.', route: 'pharmacies' },
        { name: 'مختبر روي التشخيصي', category: 'مختبر', location: 'مسقط · روي', hours: 'معاينة الأوقات', description: 'معاينة مختبر لقوائم عامة معتمدة مستقبلاً.', route: 'labs' },
        { name: 'عيادة العذيبة البيطرية', category: 'عيادة بيطرية', location: 'مسقط · العذيبة', hours: 'معاينة الأوقات', description: 'معاينة لاكتشاف خدمات رعاية الحيوانات الأليفة.', route: 'services' },
        { name: 'عيادة القرم للعناية والتجميل', category: 'العناية والتجميل', location: 'مسقط · القرم', hours: 'معاينة الأوقات', description: 'معاينة هادئة لاكتشاف خدمات العناية دون ادعاءات.', route: 'services' },
        { name: 'مركز الغبرة للعيون', category: 'عيادة عيون', location: 'مسقط · الغبرة', hours: 'معاينة الأوقات', description: 'معاينة لاكتشاف رعاية العيون دون ترتيب أو ادعاءات علاجية.', route: 'centers' },
        { name: 'عيادة مسقط للعلاج الطبيعي', category: 'العلاج الطبيعي', location: 'مسقط · بوشر', hours: 'معاينة الأوقات', description: 'معاينة لاكتشاف خدمات العلاج الطبيعي في قوائم مستقبلية.', route: 'services' }
      ]
    },
    categories: {
      eyebrow: 'تصفح حسب القسم',
      title: 'ابدأ بنوع الرعاية التي تحتاجها',
      subtitle: 'بطاقات هادئة تربط فقط بالمسارات العامة المعتمدة.',
      cards: [
        { title: 'الأطباء', description: 'اكتشاف الأطباء والتخصصات.', slug: 'doctors', tone: 'teal' },
        { title: 'العيادات والمراكز', description: 'العيادات والمراكز الطبية.', slug: 'centers', tone: 'mint' },
        { title: 'الصيدليات', description: 'اكتشاف الصيدليات.', slug: 'pharmacies', tone: 'gold' },
        { title: 'المختبرات', description: 'اكتشاف المختبرات.', slug: 'labs', tone: 'aqua' },
        { title: 'الأسنان', description: 'خدمات رعاية الأسنان.', slug: 'services', tone: 'soft' },
        { title: 'عيادات التجميل', description: 'رعاية التجميل والعناية.', slug: 'services', tone: 'gold' },
        { title: 'العناية والصحة', description: 'العافية والرعاية الوقائية.', slug: 'services', tone: 'mint' },
        { title: 'العلاج الطبيعي', description: 'رعاية الحركة والتأهيل.', slug: 'services', tone: 'teal' },
        { title: 'التغذية', description: 'التغذية ونمط الحياة.', slug: 'services', tone: 'soft' },
        { title: 'عيادات العيون', description: 'اكتشاف رعاية العيون.', slug: 'services', tone: 'aqua' },
        { title: 'الجلدية', description: 'خدمات العناية بالبشرة.', slug: 'services', tone: 'gold' },
        { title: 'طب الأطفال', description: 'اكتشاف رعاية الأطفال.', slug: 'doctors', tone: 'mint' },
        { title: 'صحة المرأة', description: 'رعاية موجهة للمرأة.', slug: 'services', tone: 'teal' },
        { title: 'العيادات البيطرية', description: 'اكتشاف العيادات البيطرية.', slug: 'services', tone: 'soft' }
      ]
    },
    areas: {
      eyebrow: 'ابحث حسب المنطقة',
      title: 'تصفح الرعاية حول أماكن مألوفة',
      subtitle: 'بطاقات المناطق إشارات تنقل هادئة ولا تدعي تغطية أو أعداد مقدمي خدمة.',
      exploreLabel: 'استكشف المنطقة',
      areas: ['مسقط', 'الخوير', 'القرم', 'العذيبة', 'السيب', 'صحار', 'صلالة', 'نزوى']
    },
    articles: {
      eyebrow: 'أدلة صحية من دكتور مسقط',
      title: 'تعرّف قبل اختيار الرعاية',
      subtitle: 'تبقى الأدلة التعليمية أسفل البحث حتى يظل اكتشاف الرعاية هو الإجراء الرئيسي.',
      disclaimer: 'الأدلة للتثقيف العام فقط ولا تستبدل الاستشارة الطبية المتخصصة.',
      cards: [
        { category: 'دليل', title: 'كيف تختار عيادة في عُمان', description: 'قائمة تحقق عامة لمقارنة معلومات العيادات المنشورة بأمان.', readTime: '٤ دقائق قراءة' },
        { category: 'قائمة تحقق', title: 'الاستعداد لزيارة مختبر', description: 'أسئلة عامة يمكن التفكير فيها قبل زيارة مختبر أو مزود فحوصات.', readTime: '٣ دقائق قراءة' },
        { category: 'شرح', title: 'اكتشاف الأسنان والتجميل والعناية', description: 'طريقة مراجعة معلومات الخدمات دون الاعتماد على ادعاءات غير مدعومة.', readTime: '٥ دقائق قراءة' }
      ]
    },
    safety: {
      eyebrow: 'دليل واضح وثنائي اللغة للرعاية الصحية في عُمان',
      title: 'مصمم للثقة العامة دون ادعاءات غير آمنة',
      subtitle: 'ينظم دكتور مسقط معلومات الرعاية الصحية العامة مع بقاء القرارات الطبية لدى المختصين المؤهلين.',
      points: ['لا تشخيص أو نتائج مضمونة', 'لا تقييمات أو مراجعات أو أعداد وهمية', 'لا بيانات خاصة على الصفحة الرئيسية']
    },
    faq: {
      eyebrow: 'الأسئلة الشائعة',
      title: 'أسئلة متكررة',
      items: [
        { question: 'هل يمكنني حجز موعد هنا؟', answer: 'ليس في هذه المرحلة. الصفحة الرئيسية تربط فقط بالمسارات العامة المعتمدة.' },
        { question: 'هل تظهر تقييمات؟', answer: 'لا. لا تظهر التقييمات والمراجعات إلا إذا دعمتها مرحلة بيانات ومراجعة معتمدة مستقبلاً.' },
        { question: 'ما الدول المتاحة؟', answer: 'عُمان متاحة حالياً. الإمارات والسعودية وقطر والبحرين والكويت وإيران قريبة الإطلاق.' }
      ]
    },
    disclaimer: 'دكتور مسقط منصة عامة لاكتشاف الرعاية الصحية. ليست بديلاً عن النصيحة الطبية أو الطوارئ أو التشخيص أو العلاج.',
    providerCta: {
      eyebrow: 'لمقدمي الرعاية',
      title: 'جهّز حضوراً عاماً أوضح لعيادتك أو مركزك.',
      subtitle: 'يمكن للعيادات والمراكز التعرف على اتجاه الانضمام المستقبلي لملفات عامة تتم مراجعتها في عُمان.',
      cta: 'لمقدمي الرعاية',
      note: 'لا تتم إضافة بوابة دفع أو دردشة ذكاء اصطناعي أو بحث خلفي أو لوحة مقدمي خدمة هنا.'
    },
    floating: { whatsapp: 'مساعدة واتساب', ai: 'مساعد الذكاء', whatsappTitle: 'معاينة دعم واتساب', whatsappBody: 'معاينة دعم واتساب. سيتم ربط رقم حقيقي لاحقاً.', whatsappCta: 'فتح معاينة واتساب', aiTitle: 'مساعد دكتور مسقط', aiBody: 'معاينة مساعد الذكاء الاصطناعي. سيساعد المستخدمين في العثور على الرعاية ومقارنة الخيارات وطرح الأسئلة.', aiPlaceholder: 'معاينة فقط — الكتابة معطلة', send: 'إرسال', close: 'إغلاق', disclaimer: 'مساعدة عامة للاكتشاف فقط وليست نصيحة طبية.' }
  }
};
