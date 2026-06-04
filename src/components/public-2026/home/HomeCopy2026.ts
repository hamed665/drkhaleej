import type { SupportedLocale } from '@/lib/i18n/config';
import type { PublicDiscoverySlug } from '@/lib/routes/public';

export type Home2026Copy = {
  metadataTitle: string;
  metadataDescription: string;
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
  };
  trustBar: readonly string[];
  featured: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: readonly { title: string; description: string; label: string; slug: PublicDiscoverySlug }[];
  };
  categories: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: readonly { title: string; description: string; slug: PublicDiscoverySlug; tone: 'teal' | 'mint' | 'gold' | 'blue' }[];
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
    cards: readonly { title: string; description: string; label: string }[];
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
};

export const home2026CopyByLocale: Record<SupportedLocale, Home2026Copy> = {
  en: {
    metadataTitle: 'DrMuscat Oman | Healthcare Discovery Foundation',
    metadataDescription:
      'Find healthcare options in Oman, faster. DrMuscat is building a bilingual healthcare discovery foundation for patients and providers across Oman.',
    hero: {
      eyebrow: 'Oman-first healthcare discovery',
      title: 'Find trusted healthcare in Oman.',
      subtitle: 'Search doctors, clinics, pharmacies, labs, pet clinics, dental, beauty and wellness in Oman.',
      searchLabel: 'Search healthcare services',
      searchPlaceholder: 'Search doctors, clinics, services, areas or guides',
      searchButton: 'Search',
      locationLabel: 'Choose location',
      suggestionTitle: 'Explore suggestions',
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
        { title: 'Providers', items: ['Public profile previews coming soon'] },
        { title: 'Services', items: ['Dental', 'Beauty and wellness', 'Diagnostics'] },
        { title: 'Areas', items: ['Muscat', 'Seeb', 'Bausher'] },
        { title: 'Articles', items: ['Health guides preview'] }
      ]
    },
    location: {
      country: 'Country',
      city: 'City',
      area: 'Area',
      countryHelp: 'Oman is active. Other countries are marked coming soon.',
      comingSoon: 'Coming soon',
      allAreas: 'All areas'
    },
    trustBar: ['Bilingual English and Arabic', 'No fake ratings or review counts', 'SEO-safe public discovery'],
    featured: {
      eyebrow: 'Featured providers preview',
      title: 'Provider visibility is being prepared carefully',
      subtitle: 'Real featured provider cards will appear only after approved profile, review, and data phases are connected.',
      cards: [
        { title: 'Doctors', description: 'Explore the approved doctor discovery route without fake rankings.', label: 'Explore doctors', slug: 'doctors' },
        { title: 'Clinics and centers', description: 'Browse clinic and center discovery while richer profiles are prepared.', label: 'Explore centers', slug: 'centers' },
        { title: 'Pharmacies and labs', description: 'Use approved public discovery routes for pharmacy and lab categories.', label: 'Explore services', slug: 'services' }
      ]
    },
    categories: {
      eyebrow: 'Browse by category',
      title: 'Start with the type of care you need',
      subtitle: 'Clean category paths link only to existing approved public routes.',
      cards: [
        { title: 'Doctors', description: 'Specialty-first discovery for doctor profiles.', slug: 'doctors', tone: 'teal' },
        { title: 'Clinics', description: 'Clinic and medical center discovery.', slug: 'centers', tone: 'mint' },
        { title: 'Pharmacies', description: 'Public pharmacy discovery route.', slug: 'pharmacies', tone: 'gold' },
        { title: 'Labs', description: 'Laboratory discovery route for diagnostics surfaces.', slug: 'labs', tone: 'blue' },
        { title: 'Services', description: 'Browse healthcare, dental, beauty and wellness services.', slug: 'services', tone: 'teal' },
        { title: 'Search', description: 'Open the approved public search route.', slug: 'search', tone: 'mint' }
      ]
    },
    areas: {
      eyebrow: 'Browse by area',
      title: 'Explore familiar Oman areas',
      subtitle: 'Area cards are navigation prompts only and do not claim provider coverage or counts.',
      exploreLabel: 'Explore',
      areas: ['Muscat', 'Seeb', 'Bausher', 'Muttrah', 'Sohar', 'Salalah']
    },
    articles: {
      eyebrow: 'Health guides / Articles',
      title: 'Helpful guides will stay below search',
      subtitle: 'Article previews are honest placeholders until approved editorial content is connected.',
      cards: [
        { title: 'Choosing a clinic in Oman', description: 'Preview guide placeholder for future approved editorial content.', label: 'Preview' },
        { title: 'Preparing for a lab visit', description: 'Preview guide placeholder with no medical advice or claims.', label: 'Preview' },
        { title: 'Dental and wellness discovery', description: 'Preview guide placeholder for safe public education content.', label: 'Preview' }
      ]
    },
    safety: {
      eyebrow: 'Trust and safety',
      title: 'Designed for careful public healthcare discovery',
      subtitle: 'DrMuscat organizes public-facing healthcare information without replacing professional consultation.',
      points: ['No diagnosis or guaranteed outcomes', 'No fake ratings, reviews, or provider counts', 'No private data exposed on the homepage']
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Common questions',
      items: [
        { question: 'Can I book an appointment here?', answer: 'Not in this phase. The homepage links to approved public discovery routes only.' },
        { question: 'Are ratings shown?', answer: 'No. Ratings and reviews are not shown unless a future approved data and moderation phase supports them.' },
        { question: 'Which countries are active?', answer: 'Oman is active. UAE, Saudi Arabia, Qatar, Bahrain, Kuwait and Iran are marked coming soon.' }
      ]
    },
    disclaimer: 'DrMuscat is a public healthcare discovery platform. It is not a substitute for medical advice, emergency care, diagnosis, or treatment.',
    providerCta: {
      eyebrow: 'For providers',
      title: 'Prepare a clearer public presence for your clinic or center.',
      subtitle: 'Providers can learn about future onboarding without payments, dashboards, or claim approvals being added in this phase.',
      cta: 'For providers',
      note: 'No payment gateway, AI chat, backend search, or provider dashboard feature is added here.'
    }
  },
  ar: {
    metadataTitle: 'DrMuscat عُمان | أساس اكتشاف الرعاية الصحية',
    metadataDescription:
      'اعثر على خيارات الرعاية الصحية في عُمان بسرعة أكبر. يبني DrMuscat أساساً ثنائي اللغة لاكتشاف الرعاية الصحية للمرضى ومقدمي الخدمة في عُمان.',
    hero: {
      eyebrow: 'اكتشاف الرعاية الصحية في عُمان أولاً',
      title: 'ابحث عن رعاية صحية موثوقة في عُمان',
      subtitle: 'ابحث عن أطباء، عيادات، صيدليات، مختبرات، عيادات بيطرية، أسنان، تجميل وعناية في عُمان',
      searchLabel: 'ابحث في خدمات الرعاية الصحية',
      searchPlaceholder: 'ابحث عن أطباء، عيادات، خدمات، مناطق أو أدلة',
      searchButton: 'بحث',
      locationLabel: 'اختر الموقع',
      suggestionTitle: 'اقتراحات للتصفح',
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
        { title: 'مقدمو الخدمة', items: ['معاينات الملفات العامة قريباً'] },
        { title: 'الخدمات', items: ['الأسنان', 'التجميل والعناية', 'الفحوصات'] },
        { title: 'المناطق', items: ['مسقط', 'السيب', 'بوشر'] },
        { title: 'المقالات', items: ['معاينة أدلة صحية'] }
      ]
    },
    location: {
      country: 'الدولة',
      city: 'المدينة',
      area: 'المنطقة',
      countryHelp: 'عُمان متاحة حالياً. الدول الأخرى موضحة كقريبة الإطلاق.',
      comingSoon: 'قريباً',
      allAreas: 'كل المناطق'
    },
    trustBar: ['العربية والإنجليزية', 'دون تقييمات أو أعداد مراجعات وهمية', 'اكتشاف عام آمن للسيو'],
    featured: {
      eyebrow: 'معاينة مقدمي الخدمة',
      title: 'يتم تجهيز ظهور مقدمي الخدمة بعناية',
      subtitle: 'ستظهر البطاقات المميزة الحقيقية فقط بعد ربط مراحل الملفات والمراجعة والبيانات المعتمدة.',
      cards: [
        { title: 'الأطباء', description: 'استكشف مسار الأطباء المعتمد دون ترتيب وهمي.', label: 'تصفح الأطباء', slug: 'doctors' },
        { title: 'العيادات والمراكز', description: 'تصفح العيادات والمراكز بينما يتم إعداد ملفات أعمق.', label: 'تصفح المراكز', slug: 'centers' },
        { title: 'الصيدليات والمختبرات', description: 'استخدم مسارات الاكتشاف العامة المعتمدة للفئات الحالية.', label: 'تصفح الخدمات', slug: 'services' }
      ]
    },
    categories: {
      eyebrow: 'تصفح حسب الفئة',
      title: 'ابدأ بنوع الرعاية التي تحتاجها',
      subtitle: 'روابط الفئات النظيفة تذهب فقط إلى المسارات العامة المعتمدة حالياً.',
      cards: [
        { title: 'الأطباء', description: 'اكتشاف الأطباء حسب التخصص.', slug: 'doctors', tone: 'teal' },
        { title: 'العيادات', description: 'اكتشاف العيادات والمراكز الطبية.', slug: 'centers', tone: 'mint' },
        { title: 'الصيدليات', description: 'مسار اكتشاف الصيدليات العام.', slug: 'pharmacies', tone: 'gold' },
        { title: 'المختبرات', description: 'مسار المختبرات لواجهات الفحوصات.', slug: 'labs', tone: 'blue' },
        { title: 'الخدمات', description: 'تصفح خدمات الصحة والأسنان والتجميل والعناية.', slug: 'services', tone: 'teal' },
        { title: 'البحث', description: 'افتح مسار البحث العام المعتمد.', slug: 'search', tone: 'mint' }
      ]
    },
    areas: {
      eyebrow: 'تصفح حسب المنطقة',
      title: 'استكشف مناطق مألوفة في عُمان',
      subtitle: 'بطاقات المناطق إشارات تنقل فقط ولا تعرض تغطية أو أعداد مقدمي خدمة.',
      exploreLabel: 'استكشف',
      areas: ['مسقط', 'السيب', 'بوشر', 'مطرح', 'صحار', 'صلالة']
    },
    articles: {
      eyebrow: 'أدلة صحية / مقالات',
      title: 'تبقى الأدلة المفيدة أسفل البحث',
      subtitle: 'معاينات المقالات صادقة حتى يتم ربط محتوى تحريري معتمد.',
      cards: [
        { title: 'اختيار عيادة في عُمان', description: 'معاينة دليل لمحتوى تحريري معتمد مستقبلاً.', label: 'معاينة' },
        { title: 'الاستعداد لزيارة مختبر', description: 'معاينة دليل دون نصيحة أو ادعاء طبي.', label: 'معاينة' },
        { title: 'اكتشاف الأسنان والعناية', description: 'معاينة دليل لتثقيف عام آمن مستقبلاً.', label: 'معاينة' }
      ]
    },
    safety: {
      eyebrow: 'الثقة والسلامة',
      title: 'مصممة لاكتشاف الرعاية العامة بعناية',
      subtitle: 'ينظم DrMuscat معلومات الرعاية الصحية العامة دون أن يستبدل الاستشارة المهنية.',
      points: ['لا تشخيص أو نتائج مضمونة', 'لا تقييمات أو مراجعات أو أعداد وهمية', 'لا بيانات خاصة على الصفحة الرئيسية']
    },
    faq: {
      eyebrow: 'الأسئلة الشائعة',
      title: 'أسئلة متكررة',
      items: [
        { question: 'هل يمكنني حجز موعد هنا؟', answer: 'ليس في هذه المرحلة. الصفحة الرئيسية تربط فقط بالمسارات العامة المعتمدة.' },
        { question: 'هل تظهر تقييمات؟', answer: 'لا. لا تظهر التقييمات والمراجعات إلا إذا دعمتها مرحلة بيانات ومراجعة معتمدة مستقبلاً.' },
        { question: 'ما الدول المتاحة؟', answer: 'عُمان متاحة حالياً. الإمارات والسعودية وقطر والبحرين والكويت وإيران موضحة كقريبة الإطلاق.' }
      ]
    },
    disclaimer: 'DrMuscat منصة عامة لاكتشاف الرعاية الصحية. ليست بديلاً عن النصيحة الطبية أو الطوارئ أو التشخيص أو العلاج.',
    providerCta: {
      eyebrow: 'لمقدمي الرعاية',
      title: 'جهّز حضوراً عاماً أوضح لعيادتك أو مركزك.',
      subtitle: 'يمكن لمقدمي الخدمة التعرف على مسار الانضمام المستقبلي دون إضافة مدفوعات أو لوحات تحكم أو اعتماد مطالبات في هذه المرحلة.',
      cta: 'لمقدمي الرعاية',
      note: 'لا تتم إضافة بوابة دفع أو دردشة ذكاء اصطناعي أو بحث خلفي أو لوحة مقدمي خدمة هنا.'
    }
  }
};
