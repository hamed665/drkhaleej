import type { SupportedLocale } from '@/lib/i18n/config';

export type ArticleShellCard = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readingTime: string;
};

export type ArticleShellCopy = {
  eyebrow: string;
  heroTitle: string;
  heroIntro: string;
  trustNote: string;
  filterLabel: string;
  categories: readonly string[];
  featuredLabel: string;
  latestLabel: string;
  sectionLabel: string;
  newsletterTitle: string;
  newsletterBody: string;
  disclaimerTitle: string;
  disclaimerBody: string;
  cards: readonly ArticleShellCard[];
  detail: {
    badge: string;
    titlePrefix: string;
    excerpt: string;
    author: string;
    reviewer: string;
    updated: string;
    readingTime: string;
    heroImage: string;
    videoTitle: string;
    videoBody: string;
    tocTitle: string;
    bodyTitle: string;
    bodyLead: string;
    inlineImage: string;
    relatedDoctors: string;
    relatedCenters: string;
    sponsored: string;
    featuredClinic: string;
    promotedDoctor: string;
    faq: string;
    relatedArticles: string;
  };
};

export const articleShellContent: Record<SupportedLocale, ArticleShellCopy> = {
  en: {
    eyebrow: 'DrMuscat guides',
    heroTitle: 'Health, beauty, clinic, and wellness guides for Oman',
    heroIntro:
      'Editorial guide shells will help people understand provider options before choosing where to book. This phase creates the route and design contract only; it is not medical advice.',
    trustNote: 'Future articles will require human editorial review before publication.',
    filterLabel: 'Browse guide themes',
    categories: ['Dental', 'Dermatology / Beauty', 'Clinics & Hospitals', 'Wellness', 'Pharmacies / Labs'],
    featuredLabel: 'Featured guide shell',
    latestLabel: 'Latest guide shells',
    sectionLabel: 'Editorial areas prepared for future content',
    newsletterTitle: 'Article updates placeholder',
    newsletterBody: 'A future contact or newsletter experience can connect here after an approved backend phase. No subscription backend is active in this shell.',
    disclaimerTitle: 'Medical disclaimer',
    disclaimerBody:
      'These article pages are informational placeholders only. They do not diagnose, treat, prescribe, rank providers, or replace advice from a qualified healthcare professional.',
    cards: [
      {
        slug: 'how-to-choose-a-dental-clinic-in-muscat',
        category: 'Dental',
        title: 'How to choose a dental clinic in Muscat',
        excerpt: 'A future editorial checklist shell for comparing clinic information, location, services, and questions to ask before booking.',
        readingTime: '5 min shell'
      },
      {
        slug: 'what-to-check-before-booking-dermatology',
        category: 'Dermatology / Beauty',
        title: 'What to check before booking a dermatology consultation',
        excerpt: 'A safe structure for future non-diagnostic guidance about credentials, consultation goals, and provider information.',
        readingTime: '4 min shell'
      },
      {
        slug: 'understanding-clinic-services-in-oman',
        category: 'Clinics & Hospitals',
        title: 'Understanding clinic services in Oman',
        excerpt: 'A future explainer shell for helping users read service pages and prepare practical questions for providers.',
        readingTime: '6 min shell'
      },
      {
        slug: 'questions-before-a-wellness-treatment',
        category: 'Wellness',
        title: 'Questions to ask before a wellness treatment',
        excerpt: 'A placeholder guide pattern for appointment preparation without treatment instructions or outcome claims.',
        readingTime: '4 min shell'
      }
    ],
    detail: {
      badge: 'Article shell',
      titlePrefix: 'Guide shell:',
      excerpt: 'This page is a future-ready editorial shell. It reserves safe areas for reviewed copy, media, provider context, and sponsorship labels without publishing medical advice.',
      author: 'Author placeholder: DrMuscat editorial team',
      reviewer: 'Medical reviewer placeholder: pending approved workflow',
      updated: 'Last updated placeholder: to be set when real content is approved',
      readingTime: 'Reading time placeholder: 5 min',
      heroImage: 'Hero image placeholder with future alt text and caption support',
      videoTitle: 'Video guide coming soon',
      videoBody: 'Future YouTube embed or preview slot. No video API integration is active.',
      tocTitle: 'Table of contents placeholder',
      bodyTitle: 'Future article body sections',
      bodyLead: 'Approved editorial content can later explain how to compare provider information, what questions to prepare, and when to speak directly with a qualified professional.',
      inlineImage: 'Inline image placeholder with caption and alt-text-ready structure',
      relatedDoctors: 'Related doctors placeholder — no provider recommendations are active yet.',
      relatedCenters: 'Related centers placeholder — no clinic recommendations are active yet.',
      sponsored: 'Sponsored placement placeholder',
      featuredClinic: 'Featured clinic placeholder',
      promotedDoctor: 'Promoted doctor placeholder',
      faq: 'FAQ placeholder for future approved editorial questions.',
      relatedArticles: 'Related article placeholders for future data-backed content.'
    }
  },
  ar: {
    eyebrow: 'أدلة DrMuscat',
    heroTitle: 'أدلة صحية وتجميلية وعيادية ورفاهية في عُمان',
    heroIntro:
      'هذه صفحات هيكلية مستقبلية لمساعدة المستخدمين على فهم الخيارات قبل اختيار مقدم الخدمة. هذه المرحلة تنشئ مساراً وتصميماً فقط وليست نصيحة طبية.',
    trustNote: 'أي مقالات فعلية لاحقاً تحتاج مراجعة تحريرية بشرية قبل النشر.',
    filterLabel: 'تصفح محاور الأدلة',
    categories: ['الأسنان', 'الجلدية / التجميل', 'العيادات والمستشفيات', 'الرفاهية', 'الصيدليات / المختبرات'],
    featuredLabel: 'هيكل دليل مميز',
    latestLabel: 'أحدث هياكل الأدلة',
    sectionLabel: 'محاور تحريرية مجهزة للمحتوى المستقبلي',
    newsletterTitle: 'تنبيهات المقالات لاحقاً',
    newsletterBody: 'يمكن ربط تجربة تواصل أو نشرة بريدية هنا في مرحلة خلفية معتمدة لاحقاً. لا توجد خدمة اشتراك مفعّلة في هذا الهيكل.',
    disclaimerTitle: 'تنبيه طبي',
    disclaimerBody:
      'هذه الصفحات هياكل معلوماتية فقط. لا تقدم تشخيصاً أو علاجاً أو وصفات أو ترتيباً لمقدمي الخدمة، ولا تغني عن استشارة مختص مؤهل.',
    cards: [
      {
        slug: 'how-to-choose-a-dental-clinic-in-muscat',
        category: 'الأسنان',
        title: 'كيف تختار عيادة أسنان في مسقط',
        excerpt: 'هيكل تحريري مستقبلي للمقارنة بين معلومات العيادات والموقع والخدمات والأسئلة قبل الحجز.',
        readingTime: 'هيكل ٥ دقائق'
      },
      {
        slug: 'what-to-check-before-booking-dermatology',
        category: 'الجلدية / التجميل',
        title: 'ما الذي يمكن التحقق منه قبل حجز استشارة جلدية',
        excerpt: 'بنية آمنة لمحتوى مستقبلي غير تشخيصي حول معلومات مقدم الخدمة وأهداف الاستشارة.',
        readingTime: 'هيكل ٤ دقائق'
      },
      {
        slug: 'understanding-clinic-services-in-oman',
        category: 'العيادات والمستشفيات',
        title: 'فهم خدمات العيادات في عُمان',
        excerpt: 'هيكل شرح مستقبلي يساعد المستخدمين على قراءة صفحات الخدمات وتجهيز أسئلة عملية.',
        readingTime: 'هيكل ٦ دقائق'
      },
      {
        slug: 'questions-before-a-wellness-treatment',
        category: 'الرفاهية',
        title: 'أسئلة قبل اختيار خدمة رفاهية',
        excerpt: 'نمط إرشادي مبدئي للتحضير للموعد دون تعليمات علاجية أو وعود بنتائج.',
        readingTime: 'هيكل ٤ دقائق'
      }
    ],
    detail: {
      badge: 'هيكل مقال',
      titlePrefix: 'هيكل دليل:',
      excerpt: 'هذه صفحة تحريرية مستقبلية تحجز أماكن آمنة للنصوص المعتمدة والوسائط وسياق مقدمي الخدمة وعلامات الرعاية دون نشر نصائح طبية.',
      author: 'المؤلف: فريق DrMuscat التحريري',
      reviewer: 'المراجع الطبي: بانتظار مسار اعتماد لاحق',
      updated: 'آخر تحديث: يحدد عند اعتماد محتوى فعلي',
      readingTime: 'مدة القراءة: ٥ دقائق',
      heroImage: 'مساحة صورة رئيسية مع دعم لاحق للنص البديل والتعليق',
      videoTitle: 'فيديو إرشادي قريباً',
      videoBody: 'مساحة مستقبلية لتضمين YouTube أو معاينة. لا يوجد تكامل API للفيديو حالياً.',
      tocTitle: 'فهرس محتوى مبدئي',
      bodyTitle: 'أقسام المقال المستقبلية',
      bodyLead: 'يمكن للمحتوى المعتمد لاحقاً شرح كيفية مقارنة معلومات مقدمي الخدمة والأسئلة العملية ومتى يجب التواصل مع مختص مؤهل.',
      inlineImage: 'مساحة صورة داخلية مع بنية جاهزة للتعليق والنص البديل',
      relatedDoctors: 'مساحة أطباء ذوي صلة — لا توجد توصيات نشطة حالياً.',
      relatedCenters: 'مساحة مراكز ذات صلة — لا توجد توصيات عيادات نشطة حالياً.',
      sponsored: 'مساحة رعاية معلنة',
      featuredClinic: 'عيادة مميزة - مساحة مستقبلية',
      promotedDoctor: 'طبيب مروّج - مساحة مستقبلية',
      faq: 'أسئلة شائعة مستقبلية بعد اعتماد المحتوى.',
      relatedArticles: 'مقالات ذات صلة لاحقاً عند توفر محتوى فعلي.'
    }
  }
};

export function getArticleShellCard(locale: SupportedLocale, slug: string): ArticleShellCard {
  const fallback = articleShellContent[locale].cards[0];

  if (!fallback) {
    throw new Error('Article shell content requires at least one shell card.');
  }

  return articleShellContent[locale].cards.find((card) => card.slug === slug) ?? fallback;
}
