import Link from 'next/link';
import { HomeWhatsAppFloat2026 } from '@/components/home/HomeSupportContact2026';
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
  const articleMeta = [
    { label: detail.authorLabel, value: detail.authorValue },
    { label: detail.reviewerLabel, value: detail.reviewerValue },
    { label: detail.updatedLabel, value: detail.updatedValue },
    { label: detail.readingLabel, value: detail.readingValue }
  ];

  return (
    <main className="articles-surface article-detail-surface" dir={dir} data-locale={locale} data-country={country}>
      <article>
        <section className="articles-hero article-detail-hero" aria-labelledby="article-title">
          <div className="articles-container article-detail-hero__grid">
            <div className="articles-hero__copy">
              <span className="articles-badge">{detail.badge}</span>
              <h1 id="article-title">{detail.titlePrefix ? `${detail.titlePrefix} ${card.title}` : card.title}</h1>
              <p>{detail.excerpt}</p>
              <dl className="article-meta">
                {articleMeta.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <figure className="media-frame hero-media-frame">
              <div className="media-frame__art" aria-hidden="true">
                <span className="articles-badge">{detail.heroImage}</span>
              </div>
              <figcaption>{detail.heroCaption}</figcaption>
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
              <li>{detail.relatedCenters}</li>
              <li>{detail.sponsored}</li>
              <li>{detail.faqTitle}</li>
            </ol>
          </aside>

          <div className="article-content-stack">
            <section className="video-guide" aria-labelledby="video-title">
              <div className="video-guide__preview" aria-hidden="true"><span>▶</span></div>
              <div>
                <span className="articles-badge">YouTube</span>
                <h2 id="video-title">{detail.videoTitle}</h2>
                <p>{detail.videoBody}</p>
              </div>
            </section>

            <section className="article-body-card" aria-labelledby="body-title">
              <h2 id="body-title">{detail.bodyTitle}</h2>
              <p>{detail.bodyLead}</p>
              <ul className="article-section-list">
                {detail.bodySections.map((section) => (
                  <li key={section}>{section}</li>
                ))}
              </ul>
              <figure className="media-frame inline-media-frame">
                <div className="media-frame__art" aria-hidden="true">
                  <span className="articles-badge">{detail.inlineImage}</span>
                </div>
                <figcaption>{detail.inlineCaption}</figcaption>
              </figure>
            </section>

            <section className="related-care-section" aria-labelledby="related-care-title">
              <h2 id="related-care-title">{detail.relatedSectionTitle}</h2>
              <div className="related-grid">
                <article>
                <span>{locale === 'ar' ? 'أطباء' : 'Doctors'}</span>
                <h3>{detail.relatedDoctors}</h3>
                <p>{detail.relatedDoctorsBody}</p>
                </article>
                <article>
                <span>{locale === 'ar' ? 'مراكز' : 'Centers'}</span>
                <h3>{detail.relatedCenters}</h3>
                <p>{detail.relatedCentersBody}</p>
                </article>
                <article className="sponsored-card">
                <span>{detail.sponsored}</span>
                <h3>{detail.featuredClinic}</h3>
                <p>{detail.promotedDoctor}</p>
                <p>{detail.sponsoredBody}</p>
                </article>
              </div>
            </section>

            <section className="faq-card" aria-labelledby="faq-title">
              <h2 id="faq-title">{detail.faqTitle}</h2>
              <div className="articles-faq-list">
                {copy.faqs.map((faq, index) => (
                  <details className="faq-item" key={faq.question} open={index === 0}>
                    <summary><span>{faq.question}</span><span className="faq-item__indicator" aria-hidden="true"><span className="faq-item__plus">+</span><span className="faq-item__minus">−</span></span></summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>

            <section className="related-articles-card" aria-labelledby="related-articles-title">
              <h2 id="related-articles-title">{locale === 'ar' ? 'مقالات ذات صلة' : 'Related articles'}</h2>
              <p>{detail.relatedArticles}</p>
              <Link href={`/${locale}/${country}/articles`}>{detail.backToArticles}</Link>
            </section>
          </div>
        </div>
      </article>

      <section className="articles-container articles-disclaimer" aria-labelledby="article-disclaimer-title">
        <h2 id="article-disclaimer-title">{copy.disclaimerTitle}</h2>
        <p>{copy.disclaimerBody}</p>
      </section>
      <HomeWhatsAppFloat2026 locale={locale} dir={dir} />
    </main>
  );
}
