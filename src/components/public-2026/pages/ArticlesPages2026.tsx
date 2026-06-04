import Link from 'next/link';

import { ModeratedComments2026 } from '@/components/public-2026/ui/ModeratedComments2026';

import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { publicArticleDetailRoute, publicArticlesRoute, publicDiscoveryRoute } from '@/lib/routes/public';

type ArticlesPageProps = {
  locale: SupportedLocale;
  country: SupportedCountry;
};

type ArticleDetailPageProps = ArticlesPageProps & {
  slug: string;
};

const articleSamples = {
  en: [
    {
      slug: 'health-guide',
      category: 'Guide',
      title: 'How to use DrMuscat to find healthcare in Oman',
      description: 'A general discovery guide for searching doctors, clinics, pharmacies, labs, and care areas without medical advice claims.',
      readTime: '4 min read',
      author: 'DrMuscat editorial preview',
    },
    {
      slug: 'choosing-a-clinic-area',
      category: 'Local discovery',
      title: 'Choosing an area before comparing clinics',
      description: 'Use city and area filters to narrow public healthcare discovery in a calm, bilingual way.',
      readTime: '3 min read',
      author: 'DrMuscat editorial preview',
    },
  ],
  ar: [
    {
      slug: 'health-guide',
      category: 'دليل',
      title: 'كيف تستخدم دكتور مسقط للعثور على الرعاية الصحية في عُمان',
      description: 'دليل عام للاكتشاف يساعدك على البحث عن أطباء وعيادات وصيدليات ومختبرات ومناطق رعاية دون ادعاءات طبية.',
      readTime: '٤ دقائق قراءة',
      author: 'معاينة تحريرية من دكتور مسقط',
    },
    {
      slug: 'choosing-a-clinic-area',
      category: 'اكتشاف محلي',
      title: 'اختيار المنطقة قبل مقارنة العيادات',
      description: 'استخدم مرشحات المدينة والمنطقة لتضييق اكتشاف الرعاية الصحية العامة بطريقة هادئة وثنائية اللغة.',
      readTime: '٣ دقائق قراءة',
      author: 'معاينة تحريرية من دكتور مسقط',
    },
  ],
} as const;

const articlesCopy = {
  en: {
    title: 'Health guides and articles',
    lead: 'General DrMuscat discovery content for navigating healthcare options in Oman. Not medical advice.',
    filters: ['All', 'Health guides', 'Dental care', 'Lab tests', 'Pet care', 'Wellness', 'Clinics guide', 'Pharmacy guide'],
    search: 'Search articles and guides', featured: 'Featured guide', updatedLabel: 'Updated', inlineImage: 'Inline image placeholder',
    read: 'Read guide',
    disclaimer: 'General discovery help only. This content does not diagnose, treat, or replace professional medical advice.',
    updated: 'Updated June 2026',
    toc: 'On this page',
    sections: ['Search by need', 'Choose city and area', 'Contact providers safely'],
    faqTitle: 'FAQ',
    faq: ['Is this medical advice?', 'Can I use this to compare areas?', 'Are comments published immediately?'],
    relatedArticles: 'Related articles',
    relatedProviders: 'Related providers and discovery links',
    comments: 'Comments are moderated before public display. No reviews are published from this placeholder.',
    video: 'Video placeholder',
    indexFaq: [['Are articles medical advice?', 'No. Articles are general information only.'], ['Who writes the guides?', 'DrMuscat editorial previews are prepared for discovery and should be reviewed before publishing.'], ['Can providers contribute articles?', 'Future provider contributions should be reviewed before public display.'], ['Are videos supported?', 'The article layout supports a clearly labeled video placeholder.']],
    seoTitle: 'Healthcare discovery guides for Oman',
    seoBody: 'DrMuscat articles help users understand how to discover doctors, clinics, pharmacies, laboratories, services, cities, and areas in Oman. They do not replace advice from a qualified healthcare professional.',
  },
  ar: {
    title: 'أدلة ومقالات صحية',
    lead: 'محتوى عام من دكتور مسقط يساعد على اكتشاف خيارات الرعاية الصحية في عُمان. ليس نصيحة طبية.',
    filters: ['الكل', 'أدلة صحية', 'العناية بالأسنان', 'فحوصات المختبر', 'رعاية الحيوانات', 'العافية', 'دليل العيادات', 'دليل الصيدليات'],
    search: 'ابحث في المقالات والأدلة', featured: 'دليل مميز', updatedLabel: 'تم التحديث', inlineImage: 'موضع صورة داخلية',
    read: 'قراءة الدليل',
    disclaimer: 'مساعدة عامة للاكتشاف فقط. لا يشخص هذا المحتوى أو يعالج أو يستبدل النصيحة الطبية المتخصصة.',
    updated: 'تم التحديث في يونيو 2026',
    toc: 'في هذه الصفحة',
    sections: ['البحث حسب الحاجة', 'اختيار المدينة والمنطقة', 'التواصل مع مقدمي الرعاية بأمان'],
    faqTitle: 'الأسئلة الشائعة',
    faq: ['هل هذه نصيحة طبية؟', 'هل يمكنني استخدام هذا لمقارنة المناطق؟', 'هل تُنشر التعليقات فورًا؟'],
    relatedArticles: 'مقالات ذات صلة',
    relatedProviders: 'مقدمو رعاية وروابط اكتشاف ذات صلة',
    comments: 'تتم مراجعة التعليقات قبل عرضها للعامة. لا تُنشر مراجعات من هذا العنصر التمهيدي.',
    video: 'موضع فيديو تمهيدي',
    indexFaq: [['هل المقالات نصيحة طبية؟', 'لا. المقالات معلومات عامة فقط.'], ['من يكتب الأدلة؟', 'يتم إعداد المعاينات التحريرية من دكتور مسقط للاكتشاف وينبغي مراجعتها قبل النشر.'], ['هل يمكن لمقدمي الرعاية المساهمة بمقالات؟', 'ينبغي مراجعة أي مساهمات مستقبلية قبل عرضها للعامة.'], ['هل يتم دعم الفيديو؟', 'يدعم تخطيط المقال موضع فيديو واضح التسمية.']],
    seoTitle: 'أدلة اكتشاف الرعاية الصحية في عُمان',
    seoBody: 'تساعد مقالات دكتور مسقط المستخدمين على فهم كيفية اكتشاف الأطباء والعيادات والصيدليات والمختبرات والخدمات والمدن والمناطق في عُمان. ولا تستبدل نصيحة مقدم رعاية صحي مؤهل.',
  },
} as const;

export function ArticlesIndexPage2026({ locale, country }: ArticlesPageProps) {
  const copy = articlesCopy[locale];
  const articles = articleSamples[locale];

  return (
    <main className="dm2026-page dm2026-articles-page" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <section className="dm2026-articles-hero">
        <p className="dm2026-eyebrow">DrMuscat</p>
        <h1>{copy.title}</h1>
        <p>{copy.lead}</p>
        <label className="sr-only" htmlFor="article-search">{copy.search}</label>
        <input id="article-search" className="mt-6 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white px-5 py-3 text-slate-950 shadow-sm outline-none focus:border-emerald-500" placeholder={copy.search} />
        <div className="dm2026-filter-row" aria-label={locale === 'ar' ? 'مرشحات المقالات' : 'Article filters'}>
          {copy.filters.map((filter) => (
            <button key={filter} type="button">{filter}</button>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pt-10"><article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm sm:p-8"><p className="dm2026-eyebrow">{copy.featured}</p><h2 className="mt-2 text-2xl font-bold text-slate-950">{articles[0].title}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{articles[0].description}</p><div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-500"><span>{articles[0].author}</span><span>{copy.updated}</span><span>{articles[0].readTime}</span></div><Link className="mt-5 inline-flex rounded-full bg-emerald-800 px-5 py-3 text-sm font-bold text-white" href={publicArticleDetailRoute(locale, country, articles[0].slug)}>{copy.read}</Link></article></section>
      <section className="dm2026-article-grid" aria-label={copy.title}>
        {articles.map((article) => (
          <article key={article.slug} className="dm2026-article-preview-card">
            <div className="dm2026-article-media" aria-hidden="true"><span>{copy.video}</span></div>
            <p className="dm2026-eyebrow">{article.category}</p>
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <div className="dm2026-article-meta"><span>{article.readTime}</span><span>{article.author}</span><span>{copy.updated}</span></div>
            <Link href={publicArticleDetailRoute(locale, country, article.slug)}>{copy.read}</Link>
          </article>
        ))}
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-10"><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-bold text-slate-950">{copy.faqTitle}</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{copy.indexFaq.map(([question, answer]) => <details key={question} className="rounded-2xl border border-slate-200 p-4"><summary className="cursor-pointer font-bold text-slate-950">{question}</summary><p className="mt-2 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div></div></section>
      <section className="mx-auto max-w-7xl px-4 pb-10"><div className="rounded-3xl bg-emerald-950 p-6 text-white sm:p-8"><h2 className="text-2xl font-bold">{copy.seoTitle}</h2><p className="mt-3 max-w-4xl text-sm leading-7 text-emerald-50">{copy.seoBody}</p><div className="mt-5 flex flex-wrap gap-3"><Link className="rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-950" href={publicDiscoveryRoute(locale, country, 'doctors')}>{locale === 'ar' ? 'الأطباء' : 'Doctors'}</Link><Link className="rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-950" href={publicDiscoveryRoute(locale, country, 'centers')}>{locale === 'ar' ? 'المراكز' : 'Centers'}</Link><Link className="rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-950" href={publicDiscoveryRoute(locale, country, 'services')}>{locale === 'ar' ? 'الخدمات' : 'Services'}</Link></div></div></section>
      <p className="dm2026-disclaimer-note">{copy.disclaimer}</p>
    </main>
  );
}

export function ArticleDetailPage2026({ locale, country, slug }: ArticleDetailPageProps) {
  const copy = articlesCopy[locale];
  const article = articleSamples[locale].find((item) => item.slug === slug) ?? articleSamples[locale][0];

  return (
    <main className="dm2026-page dm2026-article-detail" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <article className="dm2026-article-detail-card">
        <Link className="dm2026-back-link" href={publicArticlesRoute(locale, country)}>{copy.title}</Link>
        <p className="dm2026-eyebrow">{article.category}</p>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <div className="dm2026-article-meta"><span>{article.author}</span><span>{copy.updated}</span><span>{article.readTime}</span></div>
        <div className="dm2026-article-media dm2026-article-media--large" aria-hidden="true"><span>{copy.video}</span></div>
        <aside className="dm2026-toc">
          <h2>{copy.toc}</h2>
          <ol>{copy.sections.map((section) => <li key={section}>{section}</li>)}</ol>
        </aside>
        {copy.sections.map((section, index) => (
          <section key={section}>
            <h2>{section}</h2>
            <p>{copy.lead}</p>
            {index === 0 ? <div className="dm2026-article-media" aria-hidden="true"><span>{copy.inlineImage}</span></div> : null}
          </section>
        ))}
        <section className="dm2026-related-box">
          <h2>{copy.faqTitle}</h2>
          <ul>{copy.faq.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section className="dm2026-related-box">
          <h2>{copy.relatedArticles}</h2>
          <Link href={publicArticleDetailRoute(locale, country, articleSamples[locale][1]?.slug ?? 'health-guide')}>{articleSamples[locale][1]?.title ?? copy.title}</Link>
        </section>
        <section className="dm2026-related-box">
          <h2>{copy.relatedProviders}</h2>
          <Link href={publicDiscoveryRoute(locale, country, 'search')}>{locale === 'ar' ? 'ابدأ البحث' : 'Start searching'}</Link>
        </section>
        <section className="dm2026-comments-box">
          <ModeratedComments2026 locale={locale} />
        </section>
        <p className="dm2026-disclaimer-note">{copy.disclaimer}</p>
      </article>
    </main>
  );
}
