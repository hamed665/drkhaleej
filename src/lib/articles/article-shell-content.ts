import type { SupportedLocale } from '@/lib/i18n/config';

export type ArticleCategoryIcon = 'dental' | 'beauty' | 'clinic' | 'wellness' | 'lab';
export type ArticleMediaTone = 'teal' | 'gold' | 'rose' | 'mint';

export type ArticleShellCard = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readingTime: string;
  mediaLabel: string;
  contentLabel: string;
  tone: ArticleMediaTone;
};

export type ArticleShellFaq = {
  question: string;
  answer: string;
};

export type ArticleShellCategory = {
  title: string;
  description: string;
  icon: ArticleCategoryIcon;
};

export type ArticleShellCopy = {
  eyebrow: string;
  heroTitle: string;
  heroIntro: string;
  primaryCta: string;
  secondaryCta: string;
  trustNote: string;
  filterLabel: string;
  categories: readonly ArticleShellCategory[];
  featuredLabel: string;
  latestLabel: string;
  sectionLabel: string;
  categorySectionTitle: string;
  listFooterTitle: string;
  listFooterBody: string;
  listFooterCta: string;
  faqEyebrow: string;
  faqTitle: string;
  faqIntro: string;
  faqs: readonly ArticleShellFaq[];
  updatesEyebrow: string;
  newsletterTitle: string;
  newsletterBody: string;
  disclaimerTitle: string;
  disclaimerBody: string;
  viewGuide: string;
  readGuide: string;
  imageReady: string;
  videoReady: string;
  cards: readonly ArticleShellCard[];
  detail: {
    badge: string;
    titlePrefix: string;
    excerpt: string;
    authorLabel: string;
    authorValue: string;
    reviewerLabel: string;
    reviewerValue: string;
    updatedLabel: string;
    updatedValue: string;
    readingLabel: string;
    readingValue: string;
    heroImage: string;
    heroCaption: string;
    videoTitle: string;
    videoBody: string;
    tocTitle: string;
    bodyTitle: string;
    bodyLead: string;
    bodySections: readonly string[];
    inlineImage: string;
    inlineCaption: string;
    relatedSectionTitle: string;
    relatedDoctors: string;
    relatedDoctorsBody: string;
    relatedCenters: string;
    relatedCentersBody: string;
    sponsored: string;
    featuredClinic: string;
    promotedDoctor: string;
    sponsoredBody: string;
    faqTitle: string;
    relatedArticles: string;
    backToArticles: string;
  };
};

const articleCardsEn: readonly ArticleShellCard[] = [
  {
    slug: 'how-to-choose-a-dental-clinic-in-muscat',
    category: 'Dental',
    title: 'How to choose a dental clinic in Muscat',
    excerpt: 'A practical guide format for comparing clinic information, location, services, and questions to ask before booking.',
    readingTime: '5 min read',
    mediaLabel: 'Guide preview',
    contentLabel: 'Guide',
    tone: 'teal'
  },
  {
    slug: 'what-to-check-before-booking-dermatology',
    category: 'Dermatology / Beauty',
    title: 'What to check before booking a dermatology consultation',
    excerpt: 'A clear guide format for preparing for a dermatology consultation and reviewing provider information.',
    readingTime: '4 min read',
    mediaLabel: 'Video guide area',
    contentLabel: 'Video-ready',
    tone: 'rose'
  },
  {
    slug: 'understanding-clinic-services-in-oman',
    category: 'Clinics & Hospitals',
    title: 'Understanding clinic services in Oman',
    excerpt: 'A service explainer format for understanding clinic pages, service details, and practical care options.',
    readingTime: '6 min read',
    mediaLabel: 'Editorial media',
    contentLabel: 'Guide',
    tone: 'gold'
  },
  {
    slug: 'questions-before-a-wellness-treatment',
    category: 'Wellness',
    title: 'Questions to ask before a wellness treatment',
    excerpt: 'An appointment-preparation format for wellness services without treatment instructions or outcome claims.',
    readingTime: '4 min read',
    mediaLabel: 'Visual guide area',
    contentLabel: 'Guide',
    tone: 'mint'
  }
];

const articleCardsAr: readonly ArticleShellCard[] = [
  {
    slug: 'how-to-choose-a-dental-clinic-in-muscat',
    category: 'الأسنان',
    title: 'كيف تختار عيادة أسنان في مسقط',
    excerpt: 'صيغة دليل عملية لمقارنة معلومات العيادات والموقع والخدمات والأسئلة قبل الحجز.',
    readingTime: '٥ دقائق قراءة',
    mediaLabel: 'معاينة الدليل',
    contentLabel: 'دليل',
    tone: 'teal'
  },
  {
    slug: 'what-to-check-before-booking-dermatology',
    category: 'الجلدية / التجميل',
    title: 'ما الذي يمكن التحقق منه قبل حجز استشارة جلدية',
    excerpt: 'صيغة واضحة للتحضير لاستشارة جلدية ومراجعة معلومات مقدم الخدمة.',
    readingTime: '٤ دقائق قراءة',
    mediaLabel: 'مساحة فيديو',
    contentLabel: 'جاهز للفيديو',
    tone: 'rose'
  },
  {
    slug: 'understanding-clinic-services-in-oman',
    category: 'العيادات والمستشفيات',
    title: 'فهم خدمات العيادات في عُمان',
    excerpt: 'صيغة شرح لفهم صفحات العيادات وتفاصيل الخدمات وخيارات الرعاية العملية.',
    readingTime: '٦ دقائق قراءة',
    mediaLabel: 'وسائط تحريرية',
    contentLabel: 'دليل',
    tone: 'gold'
  },
  {
    slug: 'questions-before-a-wellness-treatment',
    category: 'الرفاهية',
    title: 'أسئلة قبل اختيار خدمة رفاهية',
    excerpt: 'صيغة تحضير للموعد في خدمات الرفاهية دون تعليمات علاجية أو وعود بنتائج.',
    readingTime: '٤ دقائق قراءة',
    mediaLabel: 'مساحة مرئية',
    contentLabel: 'دليل',
    tone: 'mint'
  }
];

export const articleShellContent: Record<SupportedLocale, ArticleShellCopy> = {
  en: {
    eyebrow: 'DrKhaleej Articles',
    heroTitle: 'Practical health guides for choosing care in Oman',
    heroIntro:
      'Browse clear, locally focused guides about clinics, beauty, wellness, pharmacies, and labs. Content is informational and does not replace professional medical advice.',
    primaryCta: 'Explore guides',
    secondaryCta: 'View featured guide',
    trustNote: 'Articles are designed for clear decision support and require editorial review before publication.',
    filterLabel: 'Browse by topic',
    categories: [
      { title: 'Dental', description: 'Clinic-choice questions, service pages, and booking preparation.', icon: 'dental' },
      { title: 'Dermatology / Beauty', description: 'Consultation preparation and service-type research guides.', icon: 'beauty' },
      { title: 'Clinics & Hospitals', description: 'How to compare services, locations, and practical care options.', icon: 'clinic' },
      { title: 'Wellness', description: 'Clear appointment-prep prompts for wellness services.', icon: 'wellness' },
      { title: 'Pharmacies / Labs', description: 'Practical explainers for service discovery in Oman.', icon: 'lab' }
    ],
    featuredLabel: 'Featured guide',
    latestLabel: 'Latest health guides',
    sectionLabel: 'Health guides',
    categorySectionTitle: 'Browse by topic',
    listFooterTitle: 'Explore more guides as the library grows',
    listFooterBody: 'The grid stays easy to scan as the DrKhaleej library grows, with room for category browsing and more guide navigation.',
    listFooterCta: 'Browse all guides',
    faqEyebrow: 'Articles FAQ',
    faqTitle: 'Helpful answers before you read',
    faqIntro: 'Clear notes on how DrKhaleej articles support informed care decisions without replacing professional medical advice.',
    faqs: [
      { question: 'Are DrKhaleej articles medical advice?', answer: 'No. They are informational guides and do not replace advice from a qualified healthcare professional.' },
      { question: 'Will articles include doctors and clinics?', answer: 'Article pages can connect to related doctors, centers, offers, and clearly labeled sponsored placements when available.' },
      { question: 'Will videos be included?', answer: 'Yes. Article pages are designed to support YouTube and short video guides when editorial media is available.' },
      { question: 'Are sponsored placements labeled?', answer: 'Yes. Sponsored or promoted placements should always be clearly labeled.' }
    ],
    updatesEyebrow: 'Editorial updates',
    newsletterTitle: 'Follow upcoming guides',
    newsletterBody: 'Readers will be able to follow upcoming guides when article updates are available on DrKhaleej.',
    disclaimerTitle: 'Medical disclaimer',
    disclaimerBody:
      'These article pages are informational only. They do not diagnose, treat, prescribe, rank providers, or replace advice from a qualified healthcare professional.',
    viewGuide: 'View featured guide',
    readGuide: 'Read guide',
    imageReady: 'Editorial image area',
    videoReady: 'Video-ready',
    cards: articleCardsEn,
    detail: {
      badge: 'Health guide',
      titlePrefix: '',
      excerpt: 'A polished health guide format for reviewed information, editorial media, related care options, and clearly labeled sponsored placements without publishing medical advice.',
      authorLabel: 'By',
      authorValue: 'DrKhaleej editorial team',
      reviewerLabel: 'Medical reviewer',
      reviewerValue: 'Reviewer to be assigned',
      updatedLabel: 'Last updated',
      updatedValue: 'Added when the guide is published',
      readingLabel: 'Reading time',
      readingValue: '5 min read',
      heroImage: 'Editorial image area',
      heroCaption: 'Image area prepared for editorial media with alt text and caption support.',
      videoTitle: 'Video guide area',
      videoBody: 'Designed for a YouTube embed or thumbnail preview when an editorial video is available.',
      tocTitle: 'In this guide',
      bodyTitle: 'Guide preview',
      bodyLead: 'Editorial guides can explain how to compare provider information, what questions to prepare, and when to speak directly with a qualified professional.',
      bodySections: ['Provider information checklist', 'Questions to prepare before booking', 'When to contact a qualified professional'],
      inlineImage: 'Editorial media area',
      inlineCaption: 'Inline image area prepared for reviewed media and captions.',
      relatedSectionTitle: 'Related doctors and centers',
      relatedDoctors: 'Related doctors',
      relatedDoctorsBody: 'Related provider links can appear here when available. No recommendations are active yet.',
      relatedCenters: 'Related centers',
      relatedCentersBody: 'Related center links can appear here when available. No clinic recommendations are active yet.',
      sponsored: 'Sponsored',
      featuredClinic: 'Featured clinic',
      promotedDoctor: 'Promoted doctor',
      sponsoredBody: 'Sponsored placements must remain clearly labeled and visually separated from editorial guidance.',
      faqTitle: 'Article FAQ',
      relatedArticles: 'Related articles can appear here when more guides are available.',
      backToArticles: 'Back to articles'
    }
  },
  ar: {
    eyebrow: 'مقالات DrKhaleej',
    heroTitle: 'أدلة صحية تساعدك على اختيار الرعاية في عُمان',
    heroIntro:
      'تصفح أدلة واضحة ومحلية عن العيادات والتجميل والرفاهية والصيدليات والمختبرات. المحتوى معلوماتي ولا يغني عن المشورة الطبية المتخصصة.',
    primaryCta: 'استكشف الأدلة',
    secondaryCta: 'عرض الدليل المميز',
    trustNote: 'تهدف المقالات إلى دعم القرار بوضوح وتحتاج مراجعة تحريرية قبل النشر.',
    filterLabel: 'تصفح حسب الموضوع',
    categories: [
      { title: 'الأسنان', description: 'أسئلة اختيار العيادات والخدمات والتحضير للحجز.', icon: 'dental' },
      { title: 'الجلدية / التجميل', description: 'تحضير الاستشارة وفهم أنواع الخدمات قبل الحجز.', icon: 'beauty' },
      { title: 'العيادات والمستشفيات', description: 'مقارنة الخدمات والمواقع وخيارات الرعاية العملية.', icon: 'clinic' },
      { title: 'الرفاهية', description: 'أسئلة تحضير آمنة لخدمات الرفاهية.', icon: 'wellness' },
      { title: 'الصيدليات / المختبرات', description: 'شروحات عملية لاكتشاف الخدمات في عُمان.', icon: 'lab' }
    ],
    featuredLabel: 'دليل مميز',
    latestLabel: 'أحدث الأدلة الصحية',
    sectionLabel: 'الأدلة الصحية',
    categorySectionTitle: 'تصفح حسب الموضوع',
    listFooterTitle: 'استكشف المزيد من الأدلة مع نمو المكتبة',
    listFooterBody: 'يبقى العرض شبكياً وسهل التصفح مع نمو مكتبة DrKhaleej، مع مساحة لتصفح الموضوعات والمزيد من الأدلة.',
    listFooterCta: 'تصفح كل الأدلة',
    faqEyebrow: 'أسئلة المقالات',
    faqTitle: 'إجابات مفيدة قبل القراءة',
    faqIntro: 'ملاحظات واضحة حول دور مقالات DrKhaleej في دعم قراراتك دون أن تكون بديلاً عن الاستشارة الطبية المتخصصة.',
    faqs: [
      { question: 'هل مقالات DrKhaleej نصيحة طبية؟', answer: 'لا. هي أدلة معلوماتية ولا تغني عن استشارة مختص صحي مؤهل.' },
      { question: 'هل ستتضمن المقالات أطباء وعيادات؟', answer: 'يمكن لصفحات المقالات ربط أطباء ومراكز وعروض ومساحات رعاية واضحة عند توفرها.' },
      { question: 'هل ستتوفر فيديوهات؟', answer: 'نعم. صفحات المقالات مصممة لدعم فيديوهات YouTube والمقاطع القصيرة عند توفر الوسائط التحريرية.' },
      { question: 'هل يتم توضيح المحتوى الممول؟', answer: 'نعم. يجب دائماً تمييز أي مساحة رعاية أو ترويج بوضوح.' }
    ],
    updatesEyebrow: 'تحديثات تحريرية',
    newsletterTitle: 'تابع الأدلة القادمة',
    newsletterBody: 'يمكن للقراء متابعة الأدلة القادمة عند توفر تحديثات المقالات على DrKhaleej.',
    disclaimerTitle: 'تنبيه طبي',
    disclaimerBody:
      'هذه الصفحات معلوماتية فقط. لا تقدم تشخيصاً أو علاجاً أو وصفات أو ترتيباً لمقدمي الخدمة، ولا تغني عن استشارة مختص مؤهل.',
    viewGuide: 'عرض الدليل المميز',
    readGuide: 'اقرأ الدليل',
    imageReady: 'مساحة صورة تحريرية',
    videoReady: 'جاهز للفيديو',
    cards: articleCardsAr,
    detail: {
      badge: 'دليل صحي',
      titlePrefix: '',
      excerpt: 'صيغة دليل صحية مصقولة للمعلومات المراجعة والوسائط التحريرية وخيارات الرعاية ذات الصلة ومساحات الرعاية الواضحة دون نشر نصائح طبية.',
      authorLabel: 'بقلم',
      authorValue: 'فريق DrKhaleej التحريري',
      reviewerLabel: 'المراجع الطبي',
      reviewerValue: 'يحدد عند تجهيز الدليل',
      updatedLabel: 'آخر تحديث',
      updatedValue: 'يضاف عند نشر الدليل',
      readingLabel: 'مدة القراءة',
      readingValue: '٥ دقائق قراءة',
      heroImage: 'مساحة صورة تحريرية',
      heroCaption: 'مساحة صورة مجهزة لوسائط تحريرية مع نص بديل وتعليق.',
      videoTitle: 'مساحة فيديو إرشادي',
      videoBody: 'مجهزة لتضمين YouTube أو معاينة مصغرة عند توفر فيديو تحريري.',
      tocTitle: 'داخل هذا الدليل',
      bodyTitle: 'معاينة الدليل',
      bodyLead: 'يمكن للأدلة التحريرية توضيح كيفية مقارنة معلومات مقدمي الخدمة والأسئلة المناسبة ومتى يجب التواصل مع مختص مؤهل.',
      bodySections: ['قائمة تحقق لمعلومات مقدم الخدمة', 'أسئلة للتحضير قبل الحجز', 'متى تتواصل مع مختص مؤهل'],
      inlineImage: 'مساحة وسائط تحريرية',
      inlineCaption: 'مساحة صورة داخلية مجهزة لوسائط تحريرية وتعليقات.',
      relatedSectionTitle: 'أطباء ومراكز ذات صلة',
      relatedDoctors: 'أطباء ذو صلة',
      relatedDoctorsBody: 'يمكن ظهور روابط أطباء ذات صلة عند توفرها. لا توجد توصيات نشطة حالياً.',
      relatedCenters: 'مراكز ذات صلة',
      relatedCentersBody: 'يمكن ظهور روابط مراكز ذات صلة عند توفرها. لا توجد توصيات عيادات نشطة حالياً.',
      sponsored: 'Sponsored',
      featuredClinic: 'Featured clinic',
      promotedDoctor: 'Promoted doctor',
      sponsoredBody: 'يجب أن تبقى مساحات الرعاية واضحة ومنفصلة بصرياً عن الإرشاد التحريري.',
      faqTitle: 'أسئلة شائعة عن المقال',
      relatedArticles: 'يمكن عرض مقالات ذات صلة هنا عند توفر المزيد من الأدلة.',
      backToArticles: 'العودة إلى المقالات'
    }
  }
};

export function findArticleShellCard(locale: SupportedLocale, slug: string): ArticleShellCard | undefined {
  return articleShellContent[locale].cards.find((card) => card.slug === slug);
}

export function getArticleShellCard(locale: SupportedLocale, slug: string): ArticleShellCard {
  const fallback = articleShellContent[locale].cards[0];

  if (!fallback) {
    throw new Error('Article shell content requires at least one shell card.');
  }

  return findArticleShellCard(locale, slug) ?? fallback;
}
