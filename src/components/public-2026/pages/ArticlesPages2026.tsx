import Link from "next/link";

import { drMuscatSupportWhatsAppUrl } from "@/components/public-2026/home/support-contact-2026";
import { ModeratedComments2026 } from "@/components/public-2026/ui/ModeratedComments2026";
import type { SupportedCountry, SupportedLocale } from "@/lib/i18n/config";
import {
  homeRoute,
  publicArticleDetailRoute,
  publicArticlesRoute,
  publicDiscoveryRoute,
  publicListYourCenterRoute,
} from "@/lib/routes/public";

type ArticlesPageProps = { locale: SupportedLocale; country: SupportedCountry };
type ArticleDetailPageProps = ArticlesPageProps & { slug: string };
type ProviderRoute =
  | "doctors"
  | "centers"
  | "pharmacies"
  | "labs"
  | "services"
  | "search";
type Topic =
  | "general"
  | "clinics"
  | "dental"
  | "labs"
  | "pharmacy"
  | "pet"
  | "wellness";
type Article = {
  slug: string;
  topic: Topic;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  updated: string;
  related: string;
  video?: boolean;
  checklist?: readonly string[];
};
type ProviderLead = {
  title: string;
  category: string;
  location: string;
  body: string;
  tags: readonly string[];
  route: ProviderRoute;
};

const articles: Record<SupportedLocale, readonly Article[]> = {
  en: [
    {
      slug: "health-guide",
      topic: "general",
      category: "Health guides",
      title: "How to use DrMuscat to find healthcare in Oman",
      excerpt:
        "A practical discovery guide for browsing doctors, clinics, pharmacies, labs, services, cities, and areas without medical ranking claims.",
      readTime: "4 min read",
      updated: "Updated June 2026",
      related: "Healthcare discovery",
      checklist: [
        "Choose the provider type first.",
        "Filter by city and area.",
        "Confirm every detail directly before visiting.",
      ],
    },
    {
      slug: "choosing-a-clinic-area",
      topic: "clinics",
      category: "Clinics guide",
      title: "Choosing an area before comparing clinics",
      excerpt:
        "Use city and area filters to narrow healthcare discovery, then confirm location and services directly with the provider.",
      readTime: "3 min read",
      updated: "Updated June 2026",
      related: "Clinics and centers",
      checklist: [
        "Start with Muscat, Seeb, Bausher, or your nearest city.",
        "Compare practical access, not medical superiority.",
        "Call the center before relying on hours.",
      ],
    },
    {
      slug: "dental-clinic-checklist",
      topic: "dental",
      category: "Dental care",
      title: "What to check before visiting a dental clinic",
      excerpt:
        "A general checklist for confirming location, services, hours, and practical details before a clinic visit.",
      readTime: "5 min read",
      updated: "Updated June 2026",
      related: "Dental clinics",
      checklist: [
        "Confirm the dental service is offered.",
        "Ask about appointment rules.",
        "Verify location and parking before visiting.",
      ],
    },
    {
      slug: "lab-test-listings",
      topic: "labs",
      category: "Lab tests",
      title: "Understanding common lab test listings",
      excerpt:
        "Learn how to read laboratory discovery information and why preparation instructions must be confirmed directly.",
      readTime: "4 min read",
      updated: "Updated June 2026",
      related: "Laboratories",
      video: true,
      checklist: [
        "Confirm preparation instructions directly.",
        "Ask about timing and reporting process.",
        "Do not use listings as diagnostic advice.",
      ],
    },
    {
      slug: "pharmacy-delivery-options",
      topic: "pharmacy",
      category: "Pharmacy guide",
      title: "Finding pharmacies and delivery options in Oman",
      excerpt:
        "A discovery guide for pharmacy services, opening hours, delivery notes, and medicine availability confirmation.",
      readTime: "4 min read",
      updated: "Updated June 2026",
      related: "Pharmacies",
      checklist: [
        "Call to confirm medicine availability.",
        "Ask whether delivery is available now.",
        "Confirm prescription requirements.",
      ],
    },
    {
      slug: "pet-clinic-checklist",
      topic: "pet",
      category: "Pet care",
      title: "Pet clinic visit checklist",
      excerpt:
        "A calm preparation checklist for discovering veterinary providers and confirming practical visit information.",
      readTime: "3 min read",
      updated: "Updated June 2026",
      related: "Pet care",
      video: true,
      checklist: [
        "Confirm the pet clinic service directly.",
        "Ask about appointment rules.",
        "Bring relevant pet records if requested.",
      ],
    },
  ],
  ar: [
    {
      slug: "health-guide",
      topic: "general",
      category: "أدلة صحية",
      title: "كيف تستخدم دكتور مسقط للعثور على الرعاية الصحية في عُمان",
      excerpt:
        "دليل عملي لاكتشاف الأطباء والعيادات والصيدليات والمختبرات والخدمات والمدن والمناطق دون ادعاءات ترتيب طبي.",
      readTime: "٤ دقائق قراءة",
      updated: "تم التحديث في يونيو 2026",
      related: "اكتشاف الرعاية الصحية",
      checklist: [
        "اختر نوع مقدم الرعاية أولاً.",
        "صفِّ حسب المدينة والمنطقة.",
        "أكد كل التفاصيل مباشرة قبل الزيارة.",
      ],
    },
    {
      slug: "choosing-a-clinic-area",
      topic: "clinics",
      category: "دليل العيادات",
      title: "اختيار المنطقة قبل مقارنة العيادات",
      excerpt:
        "استخدم مرشحات المدينة والمنطقة لتضييق نطاق الاكتشاف، ثم أكد الموقع والخدمات مباشرة مع مقدم الرعاية.",
      readTime: "٣ دقائق قراءة",
      updated: "تم التحديث في يونيو 2026",
      related: "العيادات والمراكز",
      checklist: [
        "ابدأ بمسقط أو السيب أو بوشر أو أقرب مدينة لك.",
        "قارن سهولة الوصول العملية وليس التفوق الطبي.",
        "اتصل بالمركز قبل الاعتماد على الساعات.",
      ],
    },
    {
      slug: "dental-clinic-checklist",
      topic: "dental",
      category: "العناية بالأسنان",
      title: "ما الذي يجب التحقق منه قبل زيارة عيادة أسنان",
      excerpt:
        "قائمة عامة لتأكيد الموقع والخدمات والساعات والتفاصيل العملية قبل زيارة العيادة.",
      readTime: "٥ دقائق قراءة",
      updated: "تم التحديث في يونيو 2026",
      related: "عيادات الأسنان",
      checklist: [
        "أكد توفر خدمة الأسنان المطلوبة.",
        "اسأل عن قواعد المواعيد.",
        "تحقق من الموقع ومواقف السيارات قبل الزيارة.",
      ],
    },
    {
      slug: "lab-test-listings",
      topic: "labs",
      category: "فحوصات المختبر",
      title: "فهم قوائم فحوصات المختبر الشائعة",
      excerpt:
        "تعرف على كيفية قراءة معلومات اكتشاف المختبر ولماذا يجب تأكيد تعليمات التحضير مباشرة.",
      readTime: "٤ دقائق قراءة",
      updated: "تم التحديث في يونيو 2026",
      related: "المختبرات",
      video: true,
      checklist: [
        "أكد تعليمات التحضير مباشرة.",
        "اسأل عن التوقيت وطريقة استلام النتائج.",
        "لا تستخدم القوائم كنصيحة تشخيصية.",
      ],
    },
    {
      slug: "pharmacy-delivery-options",
      topic: "pharmacy",
      category: "دليل الصيدليات",
      title: "العثور على الصيدليات وخيارات التوصيل في عُمان",
      excerpt:
        "دليل اكتشاف لخدمات الصيدليات وساعات العمل وملاحظات التوصيل وتأكيد توفر الدواء.",
      readTime: "٤ دقائق قراءة",
      updated: "تم التحديث في يونيو 2026",
      related: "الصيدليات",
      checklist: [
        "اتصل لتأكيد توفر الدواء.",
        "اسأل هل التوصيل متاح حالياً.",
        "أكد متطلبات الوصفة الطبية.",
      ],
    },
    {
      slug: "pet-clinic-checklist",
      topic: "pet",
      category: "رعاية الحيوانات",
      title: "قائمة تحضير لزيارة العيادة البيطرية",
      excerpt:
        "قائمة هادئة لاكتشاف مقدمي الرعاية البيطرية وتأكيد معلومات الزيارة العملية.",
      readTime: "٣ دقائق قراءة",
      updated: "تم التحديث في يونيو 2026",
      related: "الرعاية البيطرية",
      video: true,
      checklist: [
        "أكد خدمة العيادة البيطرية مباشرة.",
        "اسأل عن قواعد المواعيد.",
        "أحضر سجلات الحيوان إذا طُلبت.",
      ],
    },
  ],
};

const copy = {
  en: {
    home: "Home",
    articles: "Articles & health guides",
    eyebrow: "DRMUSCAT HEALTH GUIDES",
    title: "Health guides and articles",
    subtitle:
      "Practical discovery guides for finding doctors, clinics, pharmacies, labs, and healthcare services in Oman. General information only — not medical advice.",
    search: "Search articles, provider types, areas, or healthcare topics",
    trust:
      "Reviewed for clarity before publishing. Medical claims are avoided unless reviewed.",
    featured: "Featured guide",
    read: "Read guide",
    browseDoctors: "Browse doctors",
    findCenters: "Find centers",
    video: "Video",
    videoGuide: "Video guide",
    categoriesTitle: "Explore editorial categories",
    providerPreviewTitle: "Related provider discovery",
    providerPreviewBody:
      "Article readers can move into safe provider discovery paths without medical ranking claims.",
    ctaSearch: "Search providers",
    contributeTitle: "Provider content contributions",
    contributeBody:
      "Providers may request to contribute educational content after approval. DrMuscat avoids medical claims unless reviewed.",
    contributeCta: "Request listing review",
    faqTitle: "Article FAQ",
    seoTitle: "Healthcare discovery guides for Oman",
    seoBody:
      "DrMuscat articles support Oman-first healthcare discovery across doctors, clinics, pharmacies, labs, services, cities, and areas. Guides are general discovery information and should not be used as diagnosis, treatment, emergency advice, or a replacement for professional medical guidance.",
    finalCtaTitle: "Need help finding the right place?",
    finalCtaBody:
      "Use DrMuscat search, browse provider categories, or contact DrMuscat support on WhatsApp.",
    whatsapp: "WhatsApp support",
    disclaimer:
      "General discovery help only. This content does not diagnose, treat, rank medical quality, guarantee availability, or replace professional medical advice.",
    share: "Share preview",
    byline: "DrMuscat editorial preview",
    onThisPage: "On this page",
    introTitle: "How this guide helps discovery",
    providerLeadTitle: "Need care related to this guide?",
    relatedProviders: "Related providers in Oman",
    relatedEmpty: "Related providers will appear here after review.",
    sponsored: "Sponsored",
    relatedProvidersLabel: "Related providers",
    sponsoredDisclaimer:
      "Sponsored placement is paid visibility, not medical advice or medical quality ranking. Always confirm details directly with the provider.",
    viewProfile: "View profile",
    call: "Call",
    directions: "Directions",
    inlineAdTitle: "Provider visibility related to this topic",
    bodyTitleOne: "Use this guide as a discovery starting point",
    bodyTitleTwo: "Confirm details directly with providers",
    checklist: "Practical checklist",
    safety: "Medical safety note",
    safetyBody:
      "This article is general discovery information only. It does not diagnose, treat, provide emergency guidance, or recommend a provider based on medical quality. Confirm provider details directly.",
    relatedArticles: "Related articles",
    articleFaq: "Guide FAQ",
    seoLinks: "Related discovery links",
    noRatings: "No reviews or ratings are shown in article provider previews.",
    commentsTitle: "Comments",
    articleProviderEmpty:
      "Provider cards are frontend previews and do not represent live availability.",
  },
  ar: {
    home: "الرئيسية",
    articles: "المقالات والأدلة الصحية",
    eyebrow: "أدلة دكتور مسقط الصحية",
    title: "أدلة ومقالات صحية",
    subtitle:
      "أدلة عملية لاكتشاف الأطباء والعيادات والصيدليات والمختبرات وخدمات الرعاية الصحية في عُمان. معلومات عامة فقط — وليست نصيحة طبية.",
    search:
      "ابحث في المقالات أو أنواع مقدمي الرعاية أو المناطق أو المواضيع الصحية",
    trust:
      "تتم مراجعة الوضوح قبل النشر. يتم تجنب الادعاءات الطبية ما لم تتم مراجعتها.",
    featured: "دليل مميز",
    read: "اقرأ الدليل",
    browseDoctors: "تصفح الأطباء",
    findCenters: "ابحث عن المراكز",
    video: "فيديو",
    videoGuide: "دليل فيديو",
    categoriesTitle: "استكشف الفئات التحريرية",
    providerPreviewTitle: "اكتشاف مقدمي الرعاية المرتبطين",
    providerPreviewBody:
      "يمكن لقراء المقالات الانتقال إلى مسارات اكتشاف آمنة لمقدمي الرعاية دون ادعاءات ترتيب طبي.",
    ctaSearch: "ابحث عن مقدمي الرعاية",
    contributeTitle: "مساهمات المحتوى من مقدمي الرعاية",
    contributeBody:
      "يمكن لمقدمي الرعاية طلب المساهمة بمحتوى تعليمي بعد الاعتماد. يتجنب دكتور مسقط الادعاءات الطبية ما لم تتم مراجعتها.",
    contributeCta: "اطلب مراجعة القائمة",
    faqTitle: "أسئلة المقالات",
    seoTitle: "أدلة اكتشاف الرعاية الصحية في عُمان",
    seoBody:
      "تدعم مقالات دكتور مسقط اكتشاف الرعاية الصحية في عُمان عبر الأطباء والعيادات والصيدليات والمختبرات والخدمات والمدن والمناطق. الأدلة معلومات عامة للاكتشاف ولا ينبغي استخدامها كتشخيص أو علاج أو إرشاد طارئ أو بديل عن الإرشاد الطبي المهني.",
    finalCtaTitle: "هل تحتاج مساعدة في العثور على المكان المناسب؟",
    finalCtaBody:
      "استخدم بحث دكتور مسقط أو تصفح فئات مقدمي الرعاية أو تواصل مع دعم دكتور مسقط عبر واتساب.",
    whatsapp: "دعم واتساب",
    disclaimer:
      "مساعدة عامة للاكتشاف فقط. هذا المحتوى لا يشخص أو يعالج أو يصنف جودة الرعاية الطبية أو يضمن التوفر أو يستبدل النصيحة الطبية المهنية.",
    share: "مشاركة المعاينة",
    byline: "معاينة تحريرية من دكتور مسقط",
    onThisPage: "في هذه الصفحة",
    introTitle: "كيف يساعد هذا الدليل في الاكتشاف",
    providerLeadTitle: "هل تحتاج إلى رعاية مرتبطة بهذا الدليل؟",
    relatedProviders: "مقدمو رعاية مرتبطون في عُمان",
    relatedEmpty: "سيظهر مقدمو الرعاية المرتبطون هنا بعد المراجعة.",
    sponsored: "ممَوّل",
    relatedProvidersLabel: "مقدمو رعاية مرتبطون",
    sponsoredDisclaimer:
      "الموضع الممول يعني ظهوراً مدفوعاً، ولا يُعد نصيحة طبية أو تصنيفاً لجودة الرعاية. يرجى دائماً تأكيد التفاصيل مباشرة مع مقدم الخدمة.",
    viewProfile: "عرض الملف",
    call: "اتصال",
    directions: "الاتجاهات",
    inlineAdTitle: "ظهور مقدمي رعاية مرتبط بهذا الموضوع",
    bodyTitleOne: "استخدم هذا الدليل كبداية للاكتشاف",
    bodyTitleTwo: "أكد التفاصيل مباشرة مع مقدمي الرعاية",
    checklist: "قائمة تحقق عملية",
    safety: "ملاحظة سلامة طبية",
    safetyBody:
      "هذا المقال معلومات عامة للاكتشاف فقط. لا يشخص أو يعالج أو يقدم إرشاداً للطوارئ أو يوصي بمقدم رعاية بناءً على جودة طبية. أكد تفاصيل مقدم الرعاية مباشرة.",
    relatedArticles: "مقالات ذات صلة",
    articleFaq: "أسئلة الدليل",
    seoLinks: "روابط اكتشاف ذات صلة",
    noRatings:
      "لا يتم عرض مراجعات أو تقييمات في معاينات مقدمي الرعاية داخل المقالات.",
    commentsTitle: "التعليقات",
    articleProviderEmpty:
      "بطاقات مقدمي الرعاية معاينات أمامية ولا تمثل توفراً مباشراً.",
  },
} as const;

const categoryChips = {
  en: [
    "All",
    "Health guides",
    "Dental care",
    "Lab tests",
    "Pharmacy guide",
    "Clinics guide",
    "Wellness",
    "Pet care",
    "Care checklists",
  ],
  ar: [
    "الكل",
    "أدلة صحية",
    "العناية بالأسنان",
    "فحوصات المختبر",
    "دليل الصيدليات",
    "دليل العيادات",
    "العافية",
    "رعاية الحيوانات",
    "قوائم التحقق",
  ],
} as const;

const indexFaq = {
  en: [
    [
      "Are DrMuscat articles medical advice?",
      "No. Articles are general discovery information and do not diagnose, treat, or replace professional medical advice.",
    ],
    [
      "Who writes the guides?",
      "They are presented as DrMuscat editorial previews and should be reviewed for clarity before publishing.",
    ],
    [
      "Can providers contribute articles?",
      "Providers can request contribution after approval; medical claims should be reviewed before publication.",
    ],
    [
      "Are videos supported?",
      "Yes. Article cards and detail pages support polished video placeholders or safe embeds when a real URL exists.",
    ],
    [
      "How are related providers selected?",
      "Related provider blocks are frontend-safe topic mappings, not medical rankings or endorsements.",
    ],
  ],
  ar: [
    [
      "هل مقالات دكتور مسقط نصيحة طبية؟",
      "لا. المقالات معلومات عامة للاكتشاف ولا تشخص أو تعالج أو تستبدل النصيحة الطبية المهنية.",
    ],
    [
      "من يكتب الأدلة؟",
      "تُعرض كمعاينات تحريرية من دكتور مسقط وينبغي مراجعتها للوضوح قبل النشر.",
    ],
    [
      "هل يمكن لمقدمي الرعاية المساهمة بمقالات؟",
      "يمكن لمقدمي الرعاية طلب المساهمة بعد الاعتماد، ويجب مراجعة الادعاءات الطبية قبل النشر.",
    ],
    [
      "هل يتم دعم الفيديو؟",
      "نعم. تدعم بطاقات وتفاصيل المقالات معاينات فيديو مصقولة أو تضمينات آمنة عند وجود رابط حقيقي.",
    ],
    [
      "كيف يتم اختيار مقدمي الرعاية المرتبطين؟",
      "كتل مقدمي الرعاية المرتبطين خرائط موضوعية آمنة أمامياً وليست تصنيفات أو توصيات طبية.",
    ],
  ],
} as const;

const detailFaq = {
  en: [
    [
      "Is this guide medical advice?",
      "No. It is general discovery information only.",
    ],
    [
      "How do I confirm provider details?",
      "Use the provider contact actions and confirm location, hours, services, and requirements directly.",
    ],
    [
      "Can I rely on listed availability?",
      "No. Availability and service details can change and must be confirmed with the provider.",
    ],
    [
      "Are comments published immediately?",
      "No. Comments are reviewed before public display and should not include private medical information.",
    ],
    [
      "Why do related providers appear on this article?",
      "They help readers move from a topic to safe provider discovery paths; they are not medical rankings.",
    ],
  ],
  ar: [
    ["هل هذا الدليل نصيحة طبية؟", "لا. هو معلومات عامة للاكتشاف فقط."],
    [
      "كيف أؤكد تفاصيل مقدم الرعاية؟",
      "استخدم إجراءات التواصل وأكد الموقع والساعات والخدمات والمتطلبات مباشرة.",
    ],
    [
      "هل يمكنني الاعتماد على التوفر المعروض؟",
      "لا. قد تتغير تفاصيل التوفر والخدمات ويجب تأكيدها مع مقدم الرعاية.",
    ],
    [
      "هل تُنشر التعليقات فوراً؟",
      "لا. تتم مراجعة التعليقات قبل عرضها للعامة ويجب ألا تتضمن معلومات طبية خاصة.",
    ],
    [
      "لماذا يظهر مقدمو رعاية مرتبطون في هذا المقال؟",
      "يساعدون القراء على الانتقال من الموضوع إلى مسارات اكتشاف آمنة؛ وليست تصنيفات طبية.",
    ],
  ],
} as const;

const providerLeads: Record<
  SupportedLocale,
  Record<Topic, readonly ProviderLead[]>
> = {
  en: {
    general: [
      {
        title: "Doctor discovery preview",
        category: "Doctors",
        location: "Oman · City and area filters",
        body: "Browse approved doctor profiles when available and confirm every detail directly.",
        tags: ["No reviews yet", "Specialty filters"],
        route: "doctors",
      },
      {
        title: "Clinic discovery preview",
        category: "Clinics and centers",
        location: "Muscat and Oman",
        body: "Move from guide reading to center discovery by category, city, and area.",
        tags: ["Center profiles", "Directions"],
        route: "centers",
      },
      {
        title: "Lab and pharmacy discovery",
        category: "Labs / Pharmacies",
        location: "Oman",
        body: "Find practical discovery routes for labs and pharmacies without availability claims.",
        tags: ["Confirm directly", "No medical ranking"],
        route: "search",
      },
    ],
    clinics: [
      {
        title: "Clinic profile preview",
        category: "Medical centers",
        location: "Muscat · Al Khuwair",
        body: "Related center previews help readers compare practical access and services after review.",
        tags: ["Claim profile later", "No reviews yet"],
        route: "centers",
      },
      {
        title: "Family medicine preview",
        category: "Doctors and centers",
        location: "Oman",
        body: "Use provider discovery to confirm services, languages, and hours directly.",
        tags: ["City filters", "Area filters"],
        route: "doctors",
      },
    ],
    dental: [
      {
        title: "Dental clinic preview",
        category: "Dental clinics",
        location: "Bausher · Al Ghubrah",
        body: "Find dental clinic profiles and confirm services, appointment rules, and location directly.",
        tags: ["Dental care", "No ratings yet"],
        route: "centers",
      },
      {
        title: "Dentist profile preview",
        category: "Dentists",
        location: "Muscat · Qurum",
        body: "Doctor discovery can support dentist profiles after review without fake ranking.",
        tags: ["Doctor profile", "Confirm clinic"],
        route: "doctors",
      },
    ],
    labs: [
      {
        title: "Laboratory preview",
        category: "Medical laboratories",
        location: "Muscat · Al Khuwair",
        body: "Find lab profiles and confirm preparation instructions, pricing, and reporting details directly.",
        tags: ["Blood tests", "Preparation note"],
        route: "labs",
      },
      {
        title: "Diagnostic center preview",
        category: "Diagnostics",
        location: "Bausher · Ghala",
        body: "Use lab discovery as a starting point, not diagnostic advice.",
        tags: ["Imaging label", "Confirm directly"],
        route: "labs",
      },
    ],
    pharmacy: [
      {
        title: "Pharmacy preview",
        category: "Pharmacies",
        location: "Muscat · Al Khuwair",
        body: "Confirm medicine availability, delivery, hours, and prescription requirements directly.",
        tags: ["Call first", "Delivery label preview"],
        route: "pharmacies",
      },
      {
        title: "Area pharmacy discovery",
        category: "Pharmacy guide",
        location: "Seeb · Al Hail",
        body: "Use area filters to discover pharmacy profiles without stock guarantees.",
        tags: ["No availability claim", "Directions"],
        route: "pharmacies",
      },
    ],
    pet: [
      {
        title: "Pet clinic preview",
        category: "Veterinary / pet clinics",
        location: "Muscat · Qurum",
        body: "Discover pet care providers and confirm appointment rules directly.",
        tags: ["Pet care", "Clinic profile"],
        route: "centers",
      },
      {
        title: "Veterinary service discovery",
        category: "Services",
        location: "Oman",
        body: "Service discovery can connect pet owners to relevant provider categories after review.",
        tags: ["Services", "No ranking"],
        route: "services",
      },
    ],
    wellness: [
      {
        title: "Wellness center preview",
        category: "Wellness and beauty",
        location: "Seeb · Al Hail",
        body: "Browse wellness and beauty provider profiles after review and confirm details directly.",
        tags: ["Wellness", "No medical claim"],
        route: "centers",
      },
      {
        title: "Physiotherapy service preview",
        category: "Services",
        location: "Oman",
        body: "Use service filters to discover physiotherapy and nutrition providers safely.",
        tags: ["Service filters", "Confirm directly"],
        route: "services",
      },
    ],
  },
  ar: {
    general: [
      {
        title: "معاينة اكتشاف الأطباء",
        category: "الأطباء",
        location: "عُمان · مرشحات مدينة ومنطقة",
        body: "تصفح ملفات الأطباء المعتمدة عند توفرها وأكد كل التفاصيل مباشرة.",
        tags: ["لا توجد مراجعات بعد", "مرشحات تخصص"],
        route: "doctors",
      },
      {
        title: "معاينة اكتشاف العيادات",
        category: "العيادات والمراكز",
        location: "مسقط وعُمان",
        body: "انتقل من قراءة الدليل إلى اكتشاف المراكز حسب الفئة والمدينة والمنطقة.",
        tags: ["ملفات مراكز", "اتجاهات"],
        route: "centers",
      },
      {
        title: "اكتشاف المختبرات والصيدليات",
        category: "مختبرات / صيدليات",
        location: "عُمان",
        body: "اعثر على مسارات اكتشاف عملية للمختبرات والصيدليات دون ادعاءات توفر.",
        tags: ["أكد مباشرة", "لا ترتيب طبي"],
        route: "search",
      },
    ],
    clinics: [
      {
        title: "معاينة ملف عيادة",
        category: "مراكز طبية",
        location: "مسقط · الخوير",
        body: "تساعد معاينات المراكز المرتبطة القراء على مقارنة الوصول العملي والخدمات بعد المراجعة.",
        tags: ["مطالبة لاحقاً", "لا توجد مراجعات بعد"],
        route: "centers",
      },
      {
        title: "معاينة طب أسرة",
        category: "أطباء ومراكز",
        location: "عُمان",
        body: "استخدم اكتشاف مقدمي الرعاية لتأكيد الخدمات واللغات والساعات مباشرة.",
        tags: ["مرشحات مدينة", "مرشحات منطقة"],
        route: "doctors",
      },
    ],
    dental: [
      {
        title: "معاينة عيادة أسنان",
        category: "عيادات أسنان",
        location: "بوشر · الغبرة",
        body: "اعثر على ملفات عيادات الأسنان وأكد الخدمات وقواعد المواعيد والموقع مباشرة.",
        tags: ["رعاية الأسنان", "لا تقييمات بعد"],
        route: "centers",
      },
      {
        title: "معاينة ملف طبيب أسنان",
        category: "أطباء أسنان",
        location: "مسقط · القرم",
        body: "يمكن لاكتشاف الأطباء دعم ملفات أطباء الأسنان بعد المراجعة دون ترتيب مزيف.",
        tags: ["ملف طبيب", "أكد العيادة"],
        route: "doctors",
      },
    ],
    labs: [
      {
        title: "معاينة مختبر",
        category: "مختبرات طبية",
        location: "مسقط · الخوير",
        body: "اعثر على ملفات المختبرات وأكد تعليمات التحضير والأسعار وتفاصيل النتائج مباشرة.",
        tags: ["تحاليل دم", "ملاحظة تحضير"],
        route: "labs",
      },
      {
        title: "معاينة مركز تشخيص",
        category: "تشخيص",
        location: "بوشر · غلا",
        body: "استخدم اكتشاف المختبرات كبداية وليس كنصيحة تشخيصية.",
        tags: ["وسم تصوير", "أكد مباشرة"],
        route: "labs",
      },
    ],
    pharmacy: [
      {
        title: "معاينة صيدلية",
        category: "صيدليات",
        location: "مسقط · الخوير",
        body: "أكد توفر الدواء والتوصيل والساعات ومتطلبات الوصفة مباشرة.",
        tags: ["اتصل أولاً", "معاينة وسم توصيل"],
        route: "pharmacies",
      },
      {
        title: "اكتشاف صيدليات حسب المنطقة",
        category: "دليل الصيدليات",
        location: "السيب · الحيل",
        body: "استخدم مرشحات المنطقة لاكتشاف ملفات الصيدليات دون ضمانات مخزون.",
        tags: ["لا ادعاء توفر", "اتجاهات"],
        route: "pharmacies",
      },
    ],
    pet: [
      {
        title: "معاينة عيادة بيطرية",
        category: "عيادات بيطرية",
        location: "مسقط · القرم",
        body: "اكتشف مقدمي رعاية الحيوانات وأكد قواعد المواعيد مباشرة.",
        tags: ["رعاية الحيوانات", "ملف عيادة"],
        route: "centers",
      },
      {
        title: "اكتشاف خدمات بيطرية",
        category: "الخدمات",
        location: "عُمان",
        body: "يمكن لاكتشاف الخدمات ربط أصحاب الحيوانات بفئات مقدمي الرعاية ذات الصلة بعد المراجعة.",
        tags: ["خدمات", "لا ترتيب"],
        route: "services",
      },
    ],
    wellness: [
      {
        title: "معاينة مركز عافية",
        category: "العافية والتجميل",
        location: "السيب · الحيل",
        body: "تصفح ملفات مقدمي العافية والتجميل بعد المراجعة وأكد التفاصيل مباشرة.",
        tags: ["عافية", "لا ادعاء طبي"],
        route: "centers",
      },
      {
        title: "معاينة خدمة علاج طبيعي",
        category: "الخدمات",
        location: "عُمان",
        body: "استخدم مرشحات الخدمات لاكتشاف مقدمي العلاج الطبيعي والتغذية بأمان.",
        tags: ["مرشحات خدمة", "أكد مباشرة"],
        route: "services",
      },
    ],
  },
};

function articleBySlug(locale: SupportedLocale, slug: string): Article {
  const fallback = articles[locale][0];
  if (!fallback) throw new Error("Article preview data is missing");
  return articles[locale].find((item) => item.slug === slug) ?? fallback;
}

export function ArticlesIndexPage2026({ locale, country }: ArticlesPageProps) {
  const text = copy[locale];
  const list = articles[locale];
  const featured = list[0]!;
  const isArabic = locale === "ar";
  const supportHref = drMuscatSupportWhatsAppUrl(locale);

  return (
    <main dir={isArabic ? "rtl" : "ltr"} className="bg-slate-50 text-slate-950">
      <section className="bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),linear-gradient(135deg,#f8fafc,#ffffff_46%,#ecfeff)] px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            locale={locale}
            country={country}
            current={text.articles}
          />
          <div className="grid gap-8 lg:grid-cols-[1fr_26rem] lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
                {text.eyebrow}
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                {text.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-650">
                {text.subtitle}
              </p>
              <p className="mt-4 max-w-3xl rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-950">
                {text.trust}
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-2xl shadow-emerald-900/10">
              <label
                className="text-sm font-black text-slate-700"
                htmlFor="article-search"
              >
                {isArabic ? "بحث المقالات" : "Article search"}
              </label>
              <input
                id="article-search"
                type="search"
                placeholder={text.search}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {categoryChips[locale].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <article className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-xl shadow-emerald-900/10 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-800">
              {text.featured}
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              {featured.title}
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-650">
              {featured.excerpt}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-slate-500">
              <span>{featured.updated}</span>
              <span>{featured.readTime}</span>
              <span>{featured.related}</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={publicArticleDetailRoute(locale, country, featured.slug)}
                className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-black text-white hover:bg-emerald-900"
              >
                {text.read}
              </Link>
              <Link
                href={publicDiscoveryRoute(locale, country, "doctors")}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                {text.browseDoctors}
              </Link>
              <Link
                href={publicDiscoveryRoute(locale, country, "centers")}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                {text.findCenters}
              </Link>
            </div>
          </div>
          <EditorialMedia label={featured.category} large />
        </article>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              locale={locale}
              country={country}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-10 lg:grid-cols-[1fr_0.9fr]">
        <InfoPanel
          title={text.providerPreviewTitle}
          body={text.providerPreviewBody}
          links={[
            ["Doctors", "doctors"],
            ["Centers", "centers"],
            ["Labs", "labs"],
            ["Pharmacies", "pharmacies"],
            ["Services", "services"],
          ]}
          locale={locale}
          country={country}
        />
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">{text.contributeTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-650">
            {text.contributeBody}
          </p>
          <Link
            href={publicListYourCenterRoute(locale, country)}
            className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800"
          >
            {text.contributeCta}
          </Link>
        </div>
      </section>

      <SeoHub locale={locale} country={country} />
      <FaqBlock title={text.faqTitle} items={indexFaq[locale]} />
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20 sm:p-8 lg:flex lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-black">{text.finalCtaTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              {text.finalCtaBody}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 lg:mt-0">
            <Link
              href={publicDiscoveryRoute(locale, country, "search")}
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950"
            >
              {text.ctaSearch}
            </Link>
            <a
              href={supportHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-black text-white"
            >
              {text.whatsapp}
            </a>
          </div>
        </div>
      </section>
      <p className="mx-auto max-w-7xl px-4 pb-16 text-sm font-semibold leading-7 text-slate-500">
        {text.disclaimer}
      </p>
    </main>
  );
}

export function ArticleDetailPage2026({
  locale,
  country,
  slug,
}: ArticleDetailPageProps) {
  const text = copy[locale];
  const article = articleBySlug(locale, slug);
  const isArabic = locale === "ar";
  const supportHref = drMuscatSupportWhatsAppUrl(locale);
  const leads = providerLeads[locale][article.topic];
  const related = articles[locale]
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);
  const discoveryLinks: readonly ProviderRoute[] =
    article.topic === "labs"
      ? ["labs", "services", "search"]
      : article.topic === "pharmacy"
        ? ["pharmacies", "services", "search"]
        : article.topic === "dental"
          ? ["doctors", "centers", "services", "search"]
          : ["doctors", "centers", "pharmacies", "labs", "services", "search"];

  return (
    <main dir={isArabic ? "rtl" : "ltr"} className="bg-slate-50 text-slate-950">
      <article>
        <section className="bg-white px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-7xl">
            <Breadcrumb
              locale={locale}
              country={country}
              current={article.title}
              article
            />
            <div className="grid gap-8 lg:grid-cols-[1fr_26rem] lg:items-start">
              <div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-800">
                  {article.category}
                </span>
                <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
                  {article.title}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-650">
                  {article.excerpt}
                </p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-slate-500">
                  <span>{text.byline}</span>
                  <span>{article.updated}</span>
                  <span>{article.readTime}</span>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={publicDiscoveryRoute(locale, country, "search")}
                    className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-black text-white hover:bg-emerald-900"
                  >
                    {text.ctaSearch}
                  </Link>
                  <a
                    href={supportHref}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
                  >
                    {text.share}
                  </a>
                </div>
              </div>
              <EditorialMedia
                label={article.video ? text.videoGuide : article.category}
                large
                video={!!article.video}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8">
          <ProviderLeadBlock
            title={text.providerLeadTitle}
            leads={leads.slice(0, 3)}
            locale={locale}
            country={country}
            label={text.relatedProvidersLabel}
            text={text}
          />
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-black">{text.introTitle}</h2>
              <p className="mt-4 text-base leading-8 text-slate-650">
                {article.excerpt}{" "}
                {locale === "ar"
                  ? "يركز هذا الدليل على الاكتشاف الآمن في عُمان، وربط القارئ بصفحات مقدمي الرعاية ذات الصلة دون ادعاءات طبية أو تصنيفات جودة."
                  : "This guide focuses on safe discovery in Oman, connecting readers to relevant provider pages without medical claims or quality rankings."}
              </p>
            </section>
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-black">{text.bodyTitleOne}</h2>
              <p className="mt-4 text-base leading-8 text-slate-650">
                {locale === "ar"
                  ? "ابدأ بتحديد نوع مقدم الرعاية أو الخدمة أو المنطقة. استخدم المقال لتجهيز أسئلتك، وليس لاتخاذ قرار طبي أو افتراض توفر خدمة."
                  : "Start by identifying the provider type, service, or area. Use the article to prepare questions, not to make a medical decision or assume a service is available."}
              </p>
              <div className="mt-6">
                <EditorialMedia label={article.category} />
              </div>
            </section>
            <section className="rounded-[2rem] border border-dashed border-emerald-300 bg-emerald-50 p-5 shadow-sm">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-800">
                {text.sponsored}
              </span>
              <h2 className="mt-3 text-2xl font-black">{text.inlineAdTitle}</h2>
              <p className="mt-2 text-sm font-semibold leading-7 text-emerald-950">
                {text.sponsoredDisclaimer}
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {leads.slice(0, 2).map((lead) => (
                  <ProviderLeadCard
                    key={lead.title}
                    lead={lead}
                    locale={locale}
                    country={country}
                    text={text}
                    compact
                    sponsored
                  />
                ))}
              </div>
            </section>
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-black">{text.bodyTitleTwo}</h2>
              <p className="mt-4 text-base leading-8 text-slate-650">
                {locale === "ar"
                  ? "قبل زيارة طبيب أو عيادة أو مختبر أو صيدلية، أكد الموقع والساعات والخدمات والأسعار والمتطلبات مباشرة. لا تعتمد على المقالات أو بطاقات المعاينة كدليل توفر مباشر."
                  : "Before visiting a doctor, clinic, lab, or pharmacy, confirm the location, hours, services, pricing, and requirements directly. Do not rely on articles or preview cards as live availability."}
              </p>
              <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                <h3 className="font-black text-emerald-950">
                  {text.checklist}
                </h3>
                <ul className="mt-3 space-y-2 text-sm font-semibold leading-7 text-emerald-900">
                  {(article.checklist ?? []).map((item) => (
                    <li key={item}>✓ {item}</li>
                  ))}
                </ul>
              </div>
            </section>
            <section className="rounded-[2rem] border border-amber-100 bg-amber-50 p-6">
              <h2 className="text-2xl font-black text-amber-950">
                {text.safety}
              </h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-amber-900">
                {text.safetyBody}
              </p>
            </section>
          </div>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black">{text.onThisPage}</h2>
              <ol className="mt-4 space-y-3 text-sm font-bold text-emerald-800">
                <li>{text.introTitle}</li>
                <li>{text.providerLeadTitle}</li>
                <li>{text.bodyTitleTwo}</li>
                <li>{text.relatedProviders}</li>
                <li>{text.articleFaq}</li>
              </ol>
            </div>
            <InfoPanel
              title={text.seoLinks}
              body={text.noRatings}
              links={discoveryLinks.map((route) => [route, route] as const)}
              locale={locale}
              country={country}
              compact
            />
          </aside>
        </div>

        <section className="mx-auto max-w-7xl px-4 pb-12">
          <ProviderLeadBlock
            title={text.relatedProviders}
            leads={leads}
            locale={locale}
            country={country}
            label={text.relatedProvidersLabel}
            text={text}
            empty={text.relatedEmpty}
          />
        </section>
        <section className="mx-auto max-w-7xl px-4 pb-12">
          <h2 className="text-3xl font-black">{text.relatedArticles}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <ArticleCard
                key={item.slug}
                article={item}
                locale={locale}
                country={country}
              />
            ))}
          </div>
        </section>
        <FaqBlock title={text.articleFaq} items={detailFaq[locale]} />
        <section className="mx-auto max-w-4xl px-4 pb-12">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <ModeratedComments2026 locale={locale} />
          </div>
        </section>
        <p className="mx-auto max-w-7xl px-4 pb-16 text-sm font-semibold leading-7 text-slate-500">
          {text.disclaimer}
        </p>
      </article>
    </main>
  );
}

function Breadcrumb({
  locale,
  country,
  current,
  article = false,
}: {
  locale: SupportedLocale;
  country: SupportedCountry;
  current: string;
  article?: boolean;
}) {
  const text = copy[locale];
  return (
    <nav
      aria-label={locale === "ar" ? "مسار الصفحة" : "Breadcrumb"}
      className="mb-6 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500"
    >
      <Link
        href={homeRoute(locale, country)}
        className="hover:text-emerald-700"
      >
        {text.home}
      </Link>
      <span>/</span>
      {article ? (
        <>
          <Link
            href={publicArticlesRoute(locale, country)}
            className="hover:text-emerald-700"
          >
            {text.articles}
          </Link>
          <span>/</span>
        </>
      ) : null}
      <span className="text-slate-800">{current}</span>
    </nav>
  );
}

function ArticleCard({
  article,
  locale,
  country,
}: {
  article: Article;
  locale: SupportedLocale;
  country: SupportedCountry;
}) {
  const text = copy[locale];
  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/10">
      <EditorialMedia
        label={article.video ? text.videoGuide : article.category}
        video={!!article.video}
      />
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
            {article.category}
          </span>
          {article.video ? (
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800">
              ▶ {text.video}
            </span>
          ) : null}
        </div>
        <h2 className="mt-3 text-xl font-black leading-8">{article.title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-650">
          {article.excerpt}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
          <span>{article.updated}</span>
          <span>{article.readTime}</span>
          <span>{article.related}</span>
        </div>
        <Link
          href={publicArticleDetailRoute(locale, country, article.slug)}
          className="mt-5 inline-flex rounded-full bg-emerald-800 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-900"
        >
          {text.read}
        </Link>
      </div>
    </article>
  );
}

function ProviderLeadBlock({
  title,
  leads,
  locale,
  country,
  label,
  text,
  empty,
}: {
  title: string;
  leads: readonly ProviderLead[];
  locale: SupportedLocale;
  country: SupportedCountry;
  label: string;
  text: typeof copy.en | typeof copy.ar;
  empty?: string;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-800">
            {label}
          </span>
          <h2 className="mt-3 text-3xl font-black">{title}</h2>
          <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
            {text.articleProviderEmpty}
          </p>
        </div>
      </div>
      {leads.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {leads.map((lead) => (
            <ProviderLeadCard
              key={lead.title}
              lead={lead}
              locale={locale}
              country={country}
              text={text}
            />
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
          {empty}
        </p>
      )}
    </section>
  );
}

function ProviderLeadCard({
  lead,
  locale,
  country,
  text,
  compact = false,
  sponsored = false,
}: {
  lead: ProviderLead;
  locale: SupportedLocale;
  country: SupportedCountry;
  text: typeof copy.en | typeof copy.ar;
  compact?: boolean;
  sponsored?: boolean;
}) {
  const supportHref = drMuscatSupportWhatsAppUrl(locale);
  return (
    <article
      className={`rounded-3xl border ${sponsored ? "border-emerald-200 bg-white" : "border-slate-200 bg-slate-50"} p-5`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-800">
          {sponsored ? text.sponsored : text.relatedProvidersLabel}
        </span>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-900">
          {text.noRatings}
        </span>
      </div>
      <h3 className={`${compact ? "text-lg" : "text-xl"} mt-4 font-black`}>
        {lead.title}
      </h3>
      <p className="mt-2 text-sm font-bold text-slate-500">
        {lead.category} · {lead.location}
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-650">{lead.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {lead.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link
          href={publicDiscoveryRoute(locale, country, lead.route)}
          className="rounded-full bg-emerald-800 px-3 py-2 text-center text-sm font-black text-white"
        >
          {text.viewProfile}
        </Link>
        <a
          href={supportHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-emerald-600 px-3 py-2 text-center text-sm font-black text-white"
        >
          WhatsApp
        </a>
        <Link
          href={publicDiscoveryRoute(locale, country, "search")}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-center text-sm font-black text-slate-700"
        >
          {text.call}
        </Link>
        <Link
          href={publicDiscoveryRoute(locale, country, "search")}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-center text-sm font-black text-slate-700"
        >
          {text.directions}
        </Link>
      </div>
    </article>
  );
}

function InfoPanel({
  title,
  body,
  links,
  locale,
  country,
  compact = false,
}: {
  title: string;
  body: string;
  links: readonly (readonly [string, ProviderRoute])[];
  locale: SupportedLocale;
  country: SupportedCountry;
  compact?: boolean;
}) {
  const labels: Record<SupportedLocale, Record<ProviderRoute, string>> = {
    en: {
      doctors: "Doctors",
      centers: "Centers",
      pharmacies: "Pharmacies",
      labs: "Labs",
      services: "Services",
      search: "Search",
    },
    ar: {
      doctors: "الأطباء",
      centers: "المراكز",
      pharmacies: "الصيدليات",
      labs: "المختبرات",
      services: "الخدمات",
      search: "البحث",
    },
  };
  return (
    <div
      className={`rounded-[2rem] border border-slate-200 bg-white ${compact ? "p-5" : "p-6"} shadow-sm`}
    >
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-650">{body}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {links.map(([, route]) => (
          <Link
            key={route}
            href={publicDiscoveryRoute(locale, country, route)}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
          >
            {labels[locale][route]}
          </Link>
        ))}
      </div>
    </div>
  );
}

function discoveryLabel(locale: SupportedLocale, route: ProviderRoute) {
  const labels: Record<SupportedLocale, Record<ProviderRoute, string>> = {
    en: {
      doctors: "Doctors",
      centers: "Centers",
      pharmacies: "Pharmacies",
      labs: "Labs",
      services: "Services",
      search: "Search",
    },
    ar: {
      doctors: "الأطباء",
      centers: "المراكز",
      pharmacies: "الصيدليات",
      labs: "المختبرات",
      services: "الخدمات",
      search: "البحث",
    },
  };
  return labels[locale][route];
}

function SeoHub({ locale, country }: ArticlesPageProps) {
  const text = copy[locale];
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-3xl font-black">{text.seoTitle}</h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-650">
          {text.seoBody}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(
            [
              "doctors",
              "centers",
              "pharmacies",
              "labs",
              "services",
              "search",
            ] as const
          ).map((route) => (
            <Link
              key={route}
              href={publicDiscoveryRoute(locale, country, route)}
              className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800 hover:bg-emerald-100"
            >
              {discoveryLabel(locale, route)}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function EditorialMedia({
  label,
  large = false,
  video = false,
}: {
  label: string;
  large?: boolean;
  video?: boolean;
}) {
  return (
    <div
      aria-label={label}
      role="img"
      className={`relative flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.85),transparent_25%),linear-gradient(135deg,#d1fae5,#ccfbf1_55%,#e0f2fe)] ${large ? "min-h-72 rounded-[2rem] lg:min-h-full" : "aspect-[16/10]"}`}
    >
      <div className="absolute -end-10 -top-10 h-36 w-36 rounded-full bg-emerald-300/30" />
      <div className="absolute -bottom-10 -start-10 h-40 w-40 rounded-full bg-cyan-300/30" />
      <div className="relative text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/85 text-2xl text-emerald-800 shadow-lg">
          {video ? "▶" : "✦"}
        </span>
        <p className="mt-4 px-4 text-sm font-black text-emerald-950">{label}</p>
        {video ? (
          <p className="mt-2 text-xs font-bold text-emerald-800">
            16:9 video guide preview
          </p>
        ) : null}
      </div>
    </div>
  );
}

function FaqBlock({
  title,
  items,
}: {
  title: string;
  items: readonly (readonly [string, string])[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <h2 className="text-3xl font-black">{title}</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {items.map(([question, answer]) => (
            <details
              key={question}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 open:border-emerald-200 open:bg-emerald-50"
            >
              <summary className="cursor-pointer list-none font-black text-slate-950 marker:hidden">
                {question}
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
