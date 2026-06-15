import Link from 'next/link';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { articleShellContent, getArticleShellCard } from '@/lib/articles/article-shell-content';

type ArticlesHubShellProps = {
  locale: SupportedLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
};

export function ArticlesHubShell({ locale, country, dir }: ArticlesHubShellProps) {
  const copy = articleShellContent[locale];
  const basePath = `/${locale}/${country}/articles`;
  const featuredCard = getArticleShellCard(locale, 'how-to-choose-a-dental-clinic-in-muscat');
  const editorialAreas = copy.categories.map((category) => ({
    category,
    body:
      locale === 'ar'
        ? 'مساحة مستقبلية لمقالات موثوقة ومراجعة، دون نصائح علاجية أو ادعاءات طبية.'
        : 'Prepared for future reviewed articles without treatment instructions or clinical claims.'
  }));

  return (
    <main className="articles-shell" dir={dir} data-locale={locale} data-country={country}>
      <section className="articles-hero" aria-labelledby="articles-title">
        <div className="articles-container articles-hero__grid">
          <div className="articles-hero__copy">
            <span className="articles-badge">{copy.eyebrow}</span>
            <h1 id="articles-title">{copy.heroTitle}</h1>
            <p>{copy.heroIntro}</p>
            <div className="articles-hero__chips" aria-label={copy.filterLabel}>
              {copy.categories.map((category) => (
                <span key={category}>{category}</span>
              ))}
            </div>
            <small>{copy.trustNote}</small>
          </div>
          <aside className="articles-feature-card" aria-labelledby="featured-guide-title">
            <span>{copy.featuredLabel}</span>
            <h2 id="featured-guide-title">{featuredCard.title}</h2>
            <p>{featuredCard.excerpt}</p>
            <Link href={`${basePath}/${featuredCard.slug}`}>{locale === 'ar' ? 'فتح هيكل الدليل' : 'Open guide shell'}</Link>
          </aside>
        </div>
      </section>

      <section className="articles-section" aria-labelledby="latest-guides-title">
        <div className="articles-container">
          <header className="articles-section__header">
            <span className="articles-badge">{copy.latestLabel}</span>
            <h2 id="latest-guides-title">{copy.sectionLabel}</h2>
          </header>
          <div className="articles-grid">
            {copy.cards.map((card) => (
              <article className="article-card" key={card.slug}>
                <span>{card.category}</span>
                <h3>{card.title}</h3>
                <p>{card.excerpt}</p>
                <div className="article-card__footer">
                  <small>{card.readingTime}</small>
                  <Link href={`${basePath}/${card.slug}`}>{locale === 'ar' ? 'عرض الهيكل' : 'View shell'}</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="articles-section" aria-labelledby="article-areas-title">
        <div className="articles-container areas-grid">
          {editorialAreas.map((area) => (
            <article className="area-card" key={area.category}>
              <div aria-hidden="true" />
              <h3>{area.category}</h3>
              <p>{area.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="articles-section articles-container articles-cta" aria-labelledby="articles-updates-title">
        <div>
          <span className="articles-badge">{locale === 'ar' ? 'مستقبلي' : 'Future slot'}</span>
          <h2 id="articles-updates-title">{copy.newsletterTitle}</h2>
          <p>{copy.newsletterBody}</p>
        </div>
      </section>

      <section className="articles-container articles-disclaimer" aria-labelledby="articles-disclaimer-title">
        <h2 id="articles-disclaimer-title">{copy.disclaimerTitle}</h2>
        <p>{copy.disclaimerBody}</p>
      </section>
    </main>
  );
}

export function ArticlesShellStyles() {
  return (
    <style>{`
      .articles-shell { min-height: 100vh; background: radial-gradient(circle at top left, rgba(14,116,105,.18), transparent 34rem), linear-gradient(180deg, #f6fffc 0%, #eef8f5 44%, #ffffff 100%); color: #12312d; padding-bottom: 4rem; }
      .articles-container { width: min(1120px, calc(100% - 2rem)); margin: 0 auto; }
      .articles-hero { padding: clamp(3rem, 7vw, 6rem) 0 2rem; }
      .articles-hero__grid, .article-detail-hero__grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(280px, .75fr); gap: 1.5rem; align-items: stretch; }
      .articles-hero__copy, .articles-feature-card, .article-body-card, .article-sidebar, .video-placeholder, .faq-card, .related-articles-card, .articles-cta, .articles-disclaimer, .media-placeholder, .related-grid article { border: 1px solid rgba(14,116,105,.14); background: rgba(255,255,255,.74); box-shadow: 0 24px 70px rgba(15, 68, 60, .12); backdrop-filter: blur(18px); border-radius: 32px; }
      .articles-hero__copy { padding: clamp(1.5rem, 4vw, 3rem); }
      .articles-badge, .article-card > span, .area-card h3, .related-grid span { display: inline-flex; width: fit-content; border-radius: 999px; padding: .45rem .75rem; background: rgba(14,116,105,.1); color: #0e7469; font-weight: 800; font-size: .78rem; letter-spacing: .04em; }
      .articles-hero h1, .article-detail-hero h1 { margin: 1rem 0; font-size: clamp(2.25rem, 6vw, 5.2rem); line-height: .94; letter-spacing: -.06em; color: #092f2a; }
      .articles-hero p, .article-body-card p, .articles-disclaimer p, .articles-cta p { color: #45615d; font-size: 1.05rem; line-height: 1.75; }
      .articles-hero__chips { display: flex; flex-wrap: wrap; gap: .65rem; margin: 1.5rem 0; }
      .articles-hero__chips span { border: 1px solid rgba(14,116,105,.16); background: rgba(255,255,255,.64); border-radius: 999px; padding: .6rem .85rem; font-weight: 700; color: #274d48; }
      .articles-feature-card { padding: 1.5rem; display: flex; flex-direction: column; justify-content: flex-end; background: linear-gradient(145deg, rgba(14,116,105,.9), rgba(8,70,64,.92)); color: white; min-height: 360px; position: relative; overflow: hidden; }
      .articles-feature-card::before { content: ''; position: absolute; inset: 1rem; border-radius: 26px; border: 1px solid rgba(255,255,255,.18); background: radial-gradient(circle at top, rgba(255,255,255,.22), transparent 18rem); }
      .articles-feature-card > * { position: relative; z-index: 1; }
      .articles-feature-card span { color: #c8fff4; font-weight: 800; }
      .articles-feature-card h2 { font-size: clamp(1.6rem, 3vw, 2.35rem); line-height: 1; margin: .9rem 0; }
      .articles-feature-card p { color: rgba(255,255,255,.82); }
      .articles-feature-card a, .article-card a, .related-articles-card a { color: #0e7469; font-weight: 900; text-decoration: none; }
      .articles-feature-card a { color: white; }
      .articles-section { padding: 2rem 0; }
      .articles-section__header { margin-bottom: 1rem; }
      .articles-section__header h2, .articles-cta h2, .articles-disclaimer h2, .article-body-card h2, .article-sidebar h2, .video-placeholder h2, .faq-card h2, .related-articles-card h2 { color: #092f2a; font-size: clamp(1.55rem, 3vw, 2.4rem); margin: .75rem 0; letter-spacing: -.03em; }
      .articles-grid, .areas-grid, .related-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
      .article-card, .area-card { border: 1px solid rgba(14,116,105,.12); background: rgba(255,255,255,.82); border-radius: 28px; padding: 1.25rem; box-shadow: 0 18px 50px rgba(15,68,60,.08); }
      .article-card h3, .area-card h3 { color: #113b35; font-size: 1.2rem; line-height: 1.15; }
      .article-card p, .area-card p, .related-grid p, .related-grid h3, .faq-card p, .related-articles-card p { color: #55706b; line-height: 1.65; }
      .article-card__footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1rem; }
      .area-card div { width: 48px; height: 48px; border-radius: 18px; background: linear-gradient(135deg, #0e7469, #d9a441); box-shadow: inset 0 1px 12px rgba(255,255,255,.38); }
      .articles-cta, .articles-disclaimer { padding: 1.5rem; margin-top: 1rem; }
      .articles-disclaimer { background: #fff8e8; border-color: rgba(217,164,65,.28); }
      .article-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; margin-top: 1.25rem; }
      .article-meta div { border: 1px solid rgba(14,116,105,.12); background: rgba(255,255,255,.58); border-radius: 18px; padding: .8rem; }
      .article-meta dt { font-size: .7rem; text-transform: uppercase; color: #6a8782; font-weight: 800; }
      .article-meta dd { margin: .2rem 0 0; color: #173d38; font-weight: 700; }
      .media-placeholder { min-height: 340px; padding: 1rem; display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden; }
      .media-placeholder div { flex: 1; border-radius: 24px; background: linear-gradient(135deg, rgba(14,116,105,.12), rgba(217,164,65,.22)), repeating-linear-gradient(45deg, rgba(14,116,105,.08) 0 12px, transparent 12px 24px); }
      .media-placeholder figcaption { margin-top: .8rem; color: #55706b; font-weight: 700; }
      .article-layout { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 1rem; align-items: start; padding: 2rem 0; }
      .article-sidebar { padding: 1.25rem; position: sticky; top: 1rem; }
      .article-sidebar ol { color: #45615d; line-height: 1.85; padding-inline-start: 1.2rem; }
      .article-content-stack { display: grid; gap: 1rem; }
      .video-placeholder { padding: 1.25rem; display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 1rem; align-items: center; }
      .video-placeholder__preview { min-height: 140px; border-radius: 24px; display: grid; place-items: center; background: linear-gradient(135deg, #092f2a, #0e7469); color: white; font-size: 2rem; }
      .article-body-card, .faq-card, .related-articles-card { padding: 1.5rem; }
      .body-placeholder-lines { display: grid; gap: .75rem; margin: 1.5rem 0; }
      .body-placeholder-lines span { height: 14px; border-radius: 999px; background: linear-gradient(90deg, rgba(14,116,105,.16), rgba(217,164,65,.16)); }
      .inline-media-placeholder { min-height: 240px; box-shadow: none; }
      .related-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .related-grid article { padding: 1.2rem; min-height: 170px; }
      .sponsored-card { border-color: rgba(217,164,65,.42) !important; background: linear-gradient(180deg, #fff8e8, rgba(255,255,255,.82)) !important; }
      .sponsored-card span { background: rgba(217,164,65,.2); color: #8a6217; }
      [dir='rtl'] .articles-shell { text-align: right; }
      [dir='rtl'] .article-sidebar ol { padding-inline-start: 0; padding-inline-end: 1.2rem; }
      @media (max-width: 900px) { .articles-hero__grid, .article-detail-hero__grid, .article-layout, .video-placeholder { grid-template-columns: 1fr; } .articles-grid, .areas-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .related-grid { grid-template-columns: 1fr; } .article-sidebar { position: static; } }
      @media (max-width: 560px) { .articles-container { width: min(100% - 1rem, 1120px); } .articles-hero__copy, .articles-feature-card, .article-body-card, .article-sidebar, .video-placeholder, .faq-card, .related-articles-card, .articles-cta, .articles-disclaimer { border-radius: 24px; } .articles-grid, .areas-grid, .article-meta { grid-template-columns: 1fr; } .articles-hero { padding-top: 2rem; } }
    `}</style>
  );
}
