import Link from 'next/link';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { articleShellContent, getArticleShellCard } from '@/lib/articles/article-shell-content';

type ArticleDetailShellProps = {
  locale: SupportedLocale;
  country: SupportedCountry;
  slug: string;
  dir: 'ltr' | 'rtl';
};

export function ArticleDetailShell({ locale, country, slug, dir }: ArticleDetailShellProps) {
  const copy = articleShellContent[locale];
  const detail = copy.detail;
  const card = getArticleShellCard(locale, slug);

  return (
    <main className="articles-shell article-detail-shell" dir={dir} data-locale={locale} data-country={country}>
      <article>
        <section className="articles-hero article-detail-hero" aria-labelledby="article-title">
          <div className="articles-container article-detail-hero__grid">
            <div className="articles-hero__copy">
              <span className="articles-badge">{detail.badge}</span>
              <h1 id="article-title">{detail.titlePrefix} {card.title}</h1>
              <p>{detail.excerpt}</p>
              <dl className="article-meta">
                {[detail.author, detail.reviewer, detail.updated, detail.readingTime].map((item) => (
                  <div key={item}><dt>{locale === 'ar' ? 'تفصيل' : 'Detail'}</dt><dd>{item}</dd></div>
                ))}
              </dl>
            </div>
            <figure className="media-placeholder hero-media-placeholder">
              <div aria-hidden="true" />
              <figcaption>{detail.heroImage}</figcaption>
            </figure>
          </div>
        </section>

        <div className="articles-container article-layout">
          <aside className="article-sidebar" aria-labelledby="toc-title">
            <h2 id="toc-title">{detail.tocTitle}</h2>
            <ol>
              <li>{detail.videoTitle}</li>
              <li>{detail.bodyTitle}</li>
              <li>{detail.relatedDoctors}</li>
              <li>{detail.faq}</li>
            </ol>
          </aside>

          <div className="article-content-stack">
            <section className="video-placeholder" aria-labelledby="video-title">
              <div className="video-placeholder__preview" aria-hidden="true"><span>▶</span></div>
              <div>
                <span className="articles-badge">YouTube</span>
                <h2 id="video-title">{detail.videoTitle}</h2>
                <p>{detail.videoBody}</p>
              </div>
            </section>

            <section className="article-body-card" aria-labelledby="body-title">
              <h2 id="body-title">{detail.bodyTitle}</h2>
              <p>{detail.bodyLead}</p>
              <div className="body-placeholder-lines" aria-hidden="true"><span /><span /><span /></div>
              <figure className="media-placeholder inline-media-placeholder">
                <div aria-hidden="true" />
                <figcaption>{detail.inlineImage}</figcaption>
              </figure>
            </section>

            <section className="related-grid" aria-label={locale === 'ar' ? 'مساحات ذات صلة' : 'Related placeholders'}>
              <article><span>{locale === 'ar' ? 'أطباء' : 'Doctors'}</span><h3>{detail.relatedDoctors}</h3></article>
              <article><span>{locale === 'ar' ? 'مراكز' : 'Centers'}</span><h3>{detail.relatedCenters}</h3></article>
              <article className="sponsored-card"><span>Sponsored</span><strong>{detail.sponsored}</strong><p>{detail.featuredClinic}</p><p>{detail.promotedDoctor}</p></article>
            </section>

            <section className="faq-card" aria-labelledby="faq-title">
              <h2 id="faq-title">{locale === 'ar' ? 'أسئلة شائعة' : 'FAQ'}</h2>
              <p>{detail.faq}</p>
            </section>

            <section className="related-articles-card" aria-labelledby="related-articles-title">
              <h2 id="related-articles-title">{locale === 'ar' ? 'مقالات ذات صلة' : 'Related articles'}</h2>
              <p>{detail.relatedArticles}</p>
              <Link href={`/${locale}/${country}/articles`}>{locale === 'ar' ? 'العودة إلى المقالات' : 'Back to articles'}</Link>
            </section>
          </div>
        </div>
      </article>

      <section className="articles-container articles-disclaimer" aria-labelledby="article-disclaimer-title">
        <h2 id="article-disclaimer-title">{copy.disclaimerTitle}</h2>
        <p>{copy.disclaimerBody}</p>
      </section>
    </main>
  );
}
