import Link from 'next/link';

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
    filters: ['All', 'Guides', 'Local discovery', 'Video'],
    read: 'Read guide',
    disclaimer: 'General discovery help only. This content does not diagnose, treat, or replace professional medical advice.',
    updated: 'Updated June 2026',
    toc: 'On this page',
    sections: ['Search by need', 'Choose city and area', 'Contact providers safely'],
    relatedProviders: 'Related discovery links',
    comments: 'Comments are moderated before public display. No reviews are published from this placeholder.',
    video: 'Video placeholder',
  },
  ar: {
    title: 'أدلة ومقالات صحية',
    lead: 'محتوى عام من دكتور مسقط يساعد على اكتشاف خيارات الرعاية الصحية في عُمان. ليس نصيحة طبية.',
    filters: ['الكل', 'أدلة', 'اكتشاف محلي', 'فيديو'],
    read: 'قراءة الدليل',
    disclaimer: 'مساعدة عامة للاكتشاف فقط. لا يشخص هذا المحتوى أو يعالج أو يستبدل النصيحة الطبية المتخصصة.',
    updated: 'تم التحديث في يونيو 2026',
    toc: 'في هذه الصفحة',
    sections: ['البحث حسب الحاجة', 'اختيار المدينة والمنطقة', 'التواصل مع مقدمي الرعاية بأمان'],
    relatedProviders: 'روابط اكتشاف ذات صلة',
    comments: 'تتم مراجعة التعليقات قبل عرضها للعامة. لا تُنشر مراجعات من هذا العنصر التمهيدي.',
    video: 'موضع فيديو تمهيدي',
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
        <div className="dm2026-filter-row" aria-label={locale === 'ar' ? 'مرشحات المقالات' : 'Article filters'}>
          {copy.filters.map((filter) => (
            <button key={filter} type="button">{filter}</button>
          ))}
        </div>
      </section>
      <section className="dm2026-article-grid" aria-label={copy.title}>
        {articles.map((article) => (
          <article key={article.slug} className="dm2026-article-preview-card">
            <div className="dm2026-article-media" aria-hidden="true"><span>{copy.video}</span></div>
            <p className="dm2026-eyebrow">{article.category}</p>
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <div className="dm2026-article-meta"><span>{article.readTime}</span><span>{article.author}</span></div>
            <Link href={publicArticleDetailRoute(locale, country, article.slug)}>{copy.read}</Link>
          </article>
        ))}
      </section>
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
        {copy.sections.map((section) => (
          <section key={section}>
            <h2>{section}</h2>
            <p>{copy.lead}</p>
          </section>
        ))}
        <section className="dm2026-related-box">
          <h2>{copy.relatedProviders}</h2>
          <Link href={publicDiscoveryRoute(locale, country, 'search')}>{locale === 'ar' ? 'ابدأ البحث' : 'Start searching'}</Link>
        </section>
        <section className="dm2026-comments-box">
          <h2>{locale === 'ar' ? 'التعليقات' : 'Comments'}</h2>
          <p>{copy.comments}</p>
        </section>
        <p className="dm2026-disclaimer-note">{copy.disclaimer}</p>
      </article>
    </main>
  );
}
