import Link from 'next/link';
import { HomeWhatsAppFloat2026 } from '@/components/home/HomeSupportContact2026';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { articleShellContent, getArticleShellCard, type ArticleCategoryIcon } from '@/lib/articles/article-shell-content';


function ArticleCategoryIconGlyph({ icon }: { icon: ArticleCategoryIcon }) {
  if (icon === 'dental') {
    return (
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M8.2 3.6c1.4-.7 2.7.2 3.8.2s2.4-.9 3.8-.2c2 .9 3 3.2 2.4 6.4-.8 4.6-2.2 8.8-4 9.7-1 .5-1.4-.7-2.2-.7s-1.2 1.2-2.2.7c-1.8-.9-3.2-5.1-4-9.7-.6-3.2.4-5.5 2.4-6.4Z" />
        <path d="M10.2 6.2c.8.3 1.3.4 1.8.4s1-.1 1.8-.4" />
      </svg>
    );
  }

  if (icon === 'beauty') {
    return (
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M12 3.5c1.3 3 3.4 5.1 6.5 6.5-3.1 1.4-5.2 3.5-6.5 6.5-1.3-3-3.4-5.1-6.5-6.5C8.6 8.6 10.7 6.5 12 3.5Z" />
        <path d="M18.4 14.4c.5 1.1 1.2 1.9 2.3 2.4-1.1.5-1.8 1.3-2.3 2.4-.5-1.1-1.2-1.9-2.3-2.4 1.1-.5 1.8-1.3 2.3-2.4Z" />
      </svg>
    );
  }

  if (icon === 'clinic') {
    return (
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M4.5 20V7.5L12 4l7.5 3.5V20" />
        <path d="M9 20v-6h6v6M12 8.2v4M10 10.2h4" />
      </svg>
    );
  }

  if (icon === 'wellness') {
    return (
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M12 20c-3.6-2.7-6-5.2-6-8.3 0-2 1.3-3.7 3.2-3.7 1.2 0 2.2.6 2.8 1.6.6-1 1.6-1.6 2.8-1.6 1.9 0 3.2 1.7 3.2 3.7 0 3.1-2.4 5.6-6 8.3Z" />
        <path d="M4 13h3l1.2-2.2 2.1 4.7 1.3-2.5H15" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M9 3.8h6M10 3.8v5.1l-4.2 7.4A2.6 2.6 0 0 0 8.1 20h7.8a2.6 2.6 0 0 0 2.3-3.7L14 8.9V3.8" />
      <path d="M7.4 15.5h9.2" />
    </svg>
  );
}

type ArticlesHubShellProps = {
  locale: SupportedLocale;
  country: SupportedCountry;
  dir: 'ltr' | 'rtl';
};

export function ArticlesHubShell({ locale, country, dir }: ArticlesHubShellProps) {
  const copy = articleShellContent[locale];
  const basePath = `/${locale}/${country}/articles`;
  const featuredCard = getArticleShellCard(locale, 'how-to-choose-a-dental-clinic-in-muscat');

  return (
    <main className="articles-surface" dir={dir} data-locale={locale} data-country={country}>
      <section className="articles-hero" aria-labelledby="articles-title">
        <div className="articles-container articles-hero__grid">
          <div className="articles-hero__copy">
            <span className="articles-badge">{copy.eyebrow}</span>
            <h1 id="articles-title">{copy.heroTitle}</h1>
            <p>{copy.heroIntro}</p>
            <div className="articles-hero__actions">
              <Link className="articles-button articles-button--primary" href="#latest-guides-title">{copy.primaryCta}</Link>
              <Link className="articles-button articles-button--ghost" href={`${basePath}/${featuredCard.slug}`}>{copy.secondaryCta}</Link>
            </div>
            <p className="articles-trust-note">{copy.trustNote}</p>
          </div>

          <aside className="articles-feature-card" aria-labelledby="featured-guide-title">
            <div className="articles-feature-card__media" aria-hidden="true">
              <span>{copy.imageReady}</span><span className="articles-media-sheen" />
            </div>
            <div className="articles-feature-card__body">
              <span className="articles-badge articles-badge--light">{copy.featuredLabel}</span>
              <h2 id="featured-guide-title">{featuredCard.title}</h2>
              <p>{featuredCard.excerpt}</p>
              <Link className="articles-feature-card__link" href={`${basePath}/${featuredCard.slug}`}>{copy.viewGuide}</Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="articles-section articles-section--tight" aria-labelledby="article-categories-title">
        <div className="articles-container">
          <header className="articles-section__header">
            <span className="articles-badge">{copy.filterLabel}</span>
            <h2 id="article-categories-title">{copy.categorySectionTitle}</h2>
          </header>
          <div className="areas-grid">
            {copy.categories.map((category) => (
              <article className="area-card" key={category.title}>
                <span className="area-card__mark" aria-hidden="true"><ArticleCategoryIconGlyph icon={category.icon} /></span>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="articles-section" aria-labelledby="latest-guides-title">
        <div className="articles-container">
          <header className="articles-section__header articles-section__header--split">
            <div>
              <span className="articles-badge">{copy.latestLabel}</span>
              <h2 id="latest-guides-title">{copy.sectionLabel}</h2>
            </div>
          </header>
          <div className="articles-grid">
            {copy.cards.map((card) => (
              <article className="article-card" key={card.slug}>
                <Link className={`article-card__cover-link article-card__cover-link--${card.tone}`} href={`${basePath}/${card.slug}`} aria-label={`${copy.readGuide}: ${card.title}`}>
                  <span className="article-card__media" aria-hidden="true">
                    <span className="article-card__media-label">{card.mediaLabel}</span>
                    <span className="article-card__media-orb article-card__media-orb--one" />
                    <span className="article-card__media-orb article-card__media-orb--two" />
                  </span>
                  <span className="article-card__content">
                    <span className="article-card__topline">
                      <span className="articles-badge">{card.category}</span>
                      <span className="article-card__format">{card.contentLabel}</span>
                    </span>
                    <h3>{card.title}</h3>
                    <p>{card.excerpt}</p>
                    <span className="article-card__footer">
                      <span>{copy.readGuide}</span>
                      <span aria-hidden="true">→</span>
                    </span>
                  </span>
                </Link>
              </article>
            ))}
          </div>
          <div className="articles-list-footer">
            <div>
              <h3>{copy.listFooterTitle}</h3>
              <p>{copy.listFooterBody}</p>
            </div>
            <Link className="articles-list-footer__link" href="#latest-guides-title">{copy.listFooterCta}</Link>
          </div>
        </div>
      </section>

      <section className="articles-section" aria-labelledby="articles-faq-title">
        <div className="articles-container articles-faq-panel">
          <div className="articles-faq-panel__intro">
            <span className="articles-badge">{copy.faqEyebrow}</span>
            <h2 id="articles-faq-title">{copy.faqTitle}</h2>
            <p>{copy.faqIntro}</p>
          </div>
          <div className="articles-faq-list">
            {copy.faqs.map((faq, index) => (
              <details className="faq-item" key={faq.question} open={index === 0}>
                <summary><span>{faq.question}</span><span className="faq-item__indicator" aria-hidden="true"><span className="faq-item__plus">+</span><span className="faq-item__minus">−</span></span></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="articles-section articles-container articles-cta" aria-labelledby="articles-updates-title">
        <div>
          <span className="articles-badge">{copy.updatesEyebrow}</span>
          <h2 id="articles-updates-title">{copy.newsletterTitle}</h2>
          <p>{copy.newsletterBody}</p>
        </div>
      </section>

      <section className="articles-container articles-disclaimer" aria-labelledby="articles-disclaimer-title">
        <h2 id="articles-disclaimer-title">{copy.disclaimerTitle}</h2>
        <p>{copy.disclaimerBody}</p>
      </section>
      <HomeWhatsAppFloat2026 locale={locale} dir={dir} />
    </main>
  );
}

export function ArticlesShellStyles() {
  return (
    <style>{`
      .articles-surface { min-height: 100vh; background: radial-gradient(circle at 12% 0%, rgba(14,116,105,.18), transparent 28rem), radial-gradient(circle at 88% 14%, rgba(217,164,65,.14), transparent 24rem), linear-gradient(180deg, #f7fffc 0%, #f0f8f5 42%, #ffffff 100%); color: #12312d; padding-bottom: 4rem; }
      .articles-container { width: min(1120px, calc(100% - 2rem)); margin: 0 auto; }
      .articles-hero { padding: clamp(2rem, 4vw, 3.5rem) 0 1rem; }
      .articles-hero__grid, .article-detail-hero__grid { display: grid; grid-template-columns: minmax(0, 1.03fr) minmax(320px, .97fr); gap: clamp(1rem, 2vw, 1.5rem); align-items: stretch; }
      .articles-hero__copy, .articles-feature-card, .article-body-card, .article-sidebar, .video-guide, .faq-card, .related-articles-card, .articles-cta, .articles-disclaimer, .media-frame, .related-grid article, .articles-faq-panel, .related-care-section { border: 1px solid rgba(14,116,105,.13); background: rgba(255,255,255,.78); box-shadow: 0 22px 58px rgba(15, 68, 60, .10); backdrop-filter: blur(18px); border-radius: 28px; }
      .articles-hero__copy { padding: clamp(1.35rem, 3vw, 2.4rem); display: flex; flex-direction: column; justify-content: center; }
      .articles-badge { display: inline-flex; width: fit-content; align-items: center; border-radius: 999px; padding: .42rem .72rem; background: rgba(14,116,105,.1); color: #0e7469; font-weight: 850; font-size: .76rem; letter-spacing: .03em; }
      .articles-badge--light { background: rgba(255,255,255,.16); color: #d7fff7; }
      .articles-hero h1, .article-detail-hero h1 { margin: .9rem 0; font-size: clamp(2.15rem, 4.25vw, 3.5rem); line-height: 1.04; letter-spacing: -.04em; color: #092f2a; max-width: 13ch; font-weight: 900; }
      .articles-hero p, .article-body-card p, .articles-disclaimer p, .articles-cta p, .articles-faq-panel p { color: #45615d; font-size: 1rem; line-height: 1.7; }
      .articles-trust-note { margin: 1rem 0 0; font-size: .9rem !important; color: #607b76 !important; }
      .articles-hero__actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.35rem; }
      .articles-button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; border-radius: 999px; padding: .75rem 1rem; font-weight: 850; text-decoration: none; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
      .articles-button:hover, .article-card__cover-link:hover, .articles-feature-card__link:hover { transform: translateY(-2px); }
      .articles-button:focus-visible, .article-card__cover-link:focus-visible, .articles-feature-card__link:focus-visible { outline: 3px solid rgba(217,164,65,.5); outline-offset: 3px; }
      .articles-button--primary { background: #0e7469; color: white; box-shadow: 0 14px 32px rgba(14,116,105,.22); }
      .articles-button--ghost { border: 1px solid rgba(14,116,105,.2); color: #0e7469; background: rgba(255,255,255,.72); }
      .articles-feature-card { padding: 1rem; display: grid; grid-template-rows: minmax(165px, 1fr) auto; gap: 1rem; background: linear-gradient(145deg, rgba(9,47,42,.96), rgba(14,116,105,.92)); color: white; min-height: 390px; overflow: hidden; position: relative; }
      .articles-feature-card__media, .article-card__media, .media-frame__art, .video-guide__preview { border-radius: 24px; background: radial-gradient(circle at 25% 20%, rgba(255,255,255,.28), transparent 8rem), linear-gradient(135deg, rgba(217,164,65,.42), rgba(25,151,137,.28)), repeating-linear-gradient(135deg, rgba(255,255,255,.08) 0 10px, transparent 10px 20px); display: grid; place-items: end start; padding: 1rem; overflow: hidden; }
      .articles-feature-card__media > span:first-child, .article-card__media-label { position: relative; z-index: 2; border-radius: 999px; background: rgba(255,255,255,.88); color: #0b4e47; font-size: .76rem; font-weight: 850; padding: .4rem .65rem; box-shadow: 0 10px 28px rgba(9,47,42,.12); }
      .articles-feature-card__body { padding: .2rem .35rem .35rem; }
      .articles-feature-card h2 { font-size: clamp(1.45rem, 2.5vw, 2rem); line-height: 1.08; margin: .75rem 0; letter-spacing: -.03em; }
      .articles-feature-card p { color: rgba(255,255,255,.78); line-height: 1.65; }
      .articles-feature-card__link, .article-card a, .related-articles-card a { color: inherit; font-weight: 900; text-decoration: none; }
      .articles-feature-card__link { display: inline-flex; margin-top: .35rem; color: white; }
      .articles-section { padding: 1.85rem 0; }
      .articles-section--tight { padding-top: 1rem; }
      .articles-section__header { margin-bottom: 1.1rem; max-width: 760px; }
      .articles-section__header--split { display: flex; justify-content: space-between; gap: 1rem; align-items: end; }
      .articles-section__header h2, .articles-cta h2, .articles-disclaimer h2, .article-body-card h2, .article-sidebar h2, .video-guide h2, .faq-card h2, .related-articles-card h2, .articles-faq-panel h2, .related-care-section h2 { color: #092f2a; font-size: clamp(1.75rem, 3vw, 2.6rem); line-height: 1.04; margin: .65rem 0; letter-spacing: -.045em; font-weight: 950; }
      .articles-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.05rem; }
      .areas-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .9rem; }
      .article-card, .area-card { min-height: 100%; }
      .article-card__cover-link, .area-card { border: 1px solid rgba(14,116,105,.13); background: linear-gradient(180deg, rgba(255,255,255,.94), rgba(247,255,252,.82)); border-radius: 24px; box-shadow: 0 16px 42px rgba(15,68,60,.075); overflow: hidden; text-decoration: none; color: inherit; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; height: 100%; }
      .article-card__cover-link { display: flex; flex-direction: column; }
      .article-card__cover-link:hover { border-color: rgba(14,116,105,.26); box-shadow: 0 20px 54px rgba(15,68,60,.12); }
      .article-card__media { min-height: 158px; border-radius: 0; position: relative; isolation: isolate; align-items: end; }

      .articles-media-sheen { position: absolute; width: 42%; aspect-ratio: 1; border-radius: 999px; inset-inline-end: 8%; top: 18%; background: rgba(255,255,255,.16) !important; filter: blur(.2px); }
      .article-card__media-orb { position: absolute; z-index: 1; border-radius: 999px; padding: 0 !important; background: rgba(255,255,255,.18) !important; box-shadow: none !important; }
      .article-card__media-orb--one { width: 86px; height: 86px; inset-inline-end: 14px; top: 18px; }
      .article-card__media-orb--two { width: 52px; height: 52px; inset-inline-start: 18px; bottom: 22px; background: rgba(255,255,255,.12) !important; }
      .article-card__cover-link--teal .article-card__media { background: radial-gradient(circle at 78% 22%, rgba(255,255,255,.28), transparent 7rem), linear-gradient(135deg, rgba(14,116,105,.42), rgba(217,164,65,.25)); }
      .article-card__cover-link--gold .article-card__media { background: radial-gradient(circle at 78% 22%, rgba(255,255,255,.26), transparent 7rem), linear-gradient(135deg, rgba(217,164,65,.58), rgba(14,116,105,.22)); }
      .article-card__cover-link--rose .article-card__media { background: radial-gradient(circle at 78% 22%, rgba(255,255,255,.26), transparent 7rem), linear-gradient(135deg, rgba(190,93,126,.34), rgba(14,116,105,.28)); }
      .article-card__cover-link--mint .article-card__media { background: radial-gradient(circle at 78% 22%, rgba(255,255,255,.26), transparent 7rem), linear-gradient(135deg, rgba(92,197,171,.38), rgba(217,164,65,.25)); }
      .article-card__format { border-radius: 999px; padding: .38rem .62rem; background: rgba(217,164,65,.14); color: #8a6217; font-size: .73rem; font-weight: 900; }
      .article-card__content { display: flex; flex: 1; flex-direction: column; padding: 1.1rem; }
      .article-card__topline { display: flex; align-items: center; justify-content: space-between; gap: .75rem; color: #6a817d; font-size: .78rem; font-weight: 800; }
      .article-card h3, .area-card h3 { color: #113b35; font-size: 1.08rem; line-height: 1.22; margin: .8rem 0 .45rem; letter-spacing: -.015em; font-weight: 900; }
      .article-card p, .area-card p, .related-grid p, .faq-card p, .related-articles-card p, .faq-item p { color: #55706b; line-height: 1.62; font-size: .92rem; }
      .article-card__footer { margin-top: auto; padding-top: 1rem; display: flex; align-items: center; justify-content: space-between; color: #0e7469; font-weight: 900; }
      .area-card { padding: 1.15rem; position: relative; overflow: hidden; display: grid; gap: .35rem; }
      .area-card::after { content: ''; position: absolute; inset-inline-end: -18px; top: -22px; width: 72px; height: 72px; border-radius: 999px; background: radial-gradient(circle, rgba(217,164,65,.14), rgba(14,116,105,.06)); }
      .area-card__mark { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 18px; background: linear-gradient(135deg, rgba(14,116,105,.16), rgba(217,164,65,.22)); color: #0e7469; box-shadow: inset 0 1px 12px rgba(255,255,255,.8), 0 14px 30px rgba(15,68,60,.08); }
      .area-card__mark svg { width: 25px; height: 25px; stroke: currentColor; fill: none; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
      .articles-faq-panel { padding: clamp(1.25rem, 3.2vw, 2.25rem); display: grid; grid-template-columns: .82fr 1.18fr; gap: 1.25rem; background: radial-gradient(circle at 8% 10%, rgba(217,164,65,.2), transparent 18rem), radial-gradient(circle at 98% 88%, rgba(14,116,105,.13), transparent 16rem), rgba(255,255,255,.86); position: relative; overflow: hidden; border-color: rgba(14,116,105,.18); }
      .articles-faq-panel::before { content: ''; position: absolute; inset-inline-start: 1.2rem; top: 1.2rem; width: 54px; height: 5px; border-radius: 999px; background: linear-gradient(90deg, #0e7469, #d9a441); }
      .articles-faq-panel__intro { padding-top: 1rem; }
      .articles-faq-list { display: grid; gap: .75rem; }
      .faq-item { border: 1px solid rgba(14,116,105,.13); border-radius: 22px; padding: 0; background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(247,255,252,.82)); box-shadow: 0 12px 30px rgba(15,68,60,.06); overflow: hidden; transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
      .faq-item[open] { border-color: rgba(14,116,105,.26); box-shadow: 0 18px 42px rgba(15,68,60,.1); }
      .faq-item:hover { transform: translateY(-1px); border-color: rgba(217,164,65,.34); }
      .faq-item summary { cursor: pointer; list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.08rem 1.12rem; color: #103a35; font-weight: 950; }
      .faq-item summary:focus-visible { outline: 3px solid rgba(217,164,65,.45); outline-offset: -3px; border-radius: 18px; }
      .faq-item summary::-webkit-details-marker { display: none; }
      .faq-item__indicator { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 999px; background: linear-gradient(135deg, rgba(14,116,105,.12), rgba(217,164,65,.18)); color: #0e7469; flex: 0 0 auto; font-size: 1.05rem; line-height: 1; }
      .faq-item__minus { display: none; }
      .faq-item[open] .faq-item__plus { display: none; }
      .faq-item[open] .faq-item__minus { display: inline; }
      .faq-item p { padding: 0 1.12rem 1.12rem; margin: 0; color: #3f5f5a; }
      .faq-item h3 { margin: 0 0 .35rem; color: #103a35; font-size: 1rem; }
      .articles-list-footer { margin-top: 1.1rem; border: 1px solid rgba(14,116,105,.12); background: rgba(255,255,255,.72); border-radius: 24px; padding: 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; box-shadow: 0 16px 42px rgba(15,68,60,.07); }
      .articles-list-footer h3 { margin: 0 0 .25rem; color: #103a35; font-size: 1.05rem; font-weight: 950; }
      .articles-list-footer p { margin: 0; color: #55706b; line-height: 1.55; font-size: .93rem; }
      .articles-list-footer__link { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; min-height: 42px; border-radius: 999px; padding: .7rem 1rem; background: #0e7469; color: white; font-weight: 900; text-decoration: none; box-shadow: 0 14px 30px rgba(14,116,105,.18); }
      .articles-cta, .articles-disclaimer { padding: 1.35rem; margin-top: 1rem; }
      .articles-disclaimer { background: #fff9ea; border-color: rgba(217,164,65,.28); }
      .article-meta { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .65rem; margin-top: 1.2rem; }
      .article-meta div { border: 1px solid rgba(14,116,105,.12); background: rgba(255,255,255,.58); border-radius: 16px; padding: .8rem; }
      .article-meta dt { font-size: .68rem; text-transform: uppercase; color: #6a8782; font-weight: 850; letter-spacing: .04em; }
      .article-meta dd { margin: .2rem 0 0; color: #173d38; font-weight: 750; font-size: .9rem; line-height: 1.35; }
      .media-frame { min-height: 360px; padding: 1rem; display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden; }
      .media-frame__art { flex: 1; min-height: 250px; align-items: end; color: #0b4e47; }
      .media-frame figcaption { margin-top: .8rem; color: #55706b; font-weight: 750; line-height: 1.5; }
      .article-layout { display: grid; grid-template-columns: 270px minmax(0, 1fr); gap: 1rem; align-items: start; padding: 1.85rem 0; }
      .article-sidebar { padding: 1.1rem; position: sticky; top: 1rem; }
      .article-sidebar ol { color: #45615d; line-height: 1.85; padding-inline-start: 1.15rem; font-weight: 700; }
      .article-content-stack { display: grid; gap: 1rem; }
      .video-guide { padding: 1rem; display: grid; grid-template-columns: 230px minmax(0, 1fr); gap: 1rem; align-items: center; }
      .video-guide__preview { min-height: 150px; place-items: center; background: radial-gradient(circle at 25% 20%, rgba(255,255,255,.22), transparent 8rem), linear-gradient(135deg, #092f2a, #0e7469); color: white; font-size: 2.1rem; }
      .video-guide__preview span { display: grid; place-items: center; width: 58px; height: 58px; border-radius: 999px; background: rgba(255,255,255,.18); }
      .article-body-card, .faq-card, .related-articles-card { padding: 1.35rem; }
      .article-section-list { display: grid; gap: .7rem; margin: 1rem 0; padding: 0; list-style: none; }
      .article-section-list li { border: 1px solid rgba(14,116,105,.1); border-radius: 16px; padding: .85rem; background: rgba(247,255,252,.72); color: #284d48; font-weight: 750; }
      .inline-media-frame { min-height: 260px; box-shadow: none; margin-top: 1rem; }
      .related-care-section { padding: 1.25rem; }
      .related-care-section h2 { margin-top: 0; }
      .related-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
      .related-grid article { padding: 1.1rem; min-height: 180px; }
      .related-grid span { display: inline-flex; width: fit-content; border-radius: 999px; padding: .4rem .65rem; background: rgba(14,116,105,.1); color: #0e7469; font-weight: 850; font-size: .76rem; }
      .related-grid h3 { margin: .85rem 0 .5rem; color: #103a35; }
      .sponsored-card { border-color: rgba(217,164,65,.42) !important; background: linear-gradient(180deg, #fff8e8, rgba(255,255,255,.86)) !important; }
      .sponsored-card span { background: rgba(217,164,65,.22); color: #8a6217; }
      [dir='rtl'] .articles-surface { text-align: right; }
      [dir='rtl'] .article-card__footer span:last-child { transform: rotate(180deg); }
      [dir='rtl'] .article-sidebar ol { padding-inline-start: 0; padding-inline-end: 1.15rem; }
      @media (max-width: 1040px) { .articles-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .areas-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } .article-meta { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (max-width: 900px) { .articles-hero__grid, .article-detail-hero__grid, .article-layout, .video-guide, .articles-faq-panel { grid-template-columns: 1fr; } .article-sidebar { position: static; } .articles-feature-card { min-height: 0; } .articles-hero h1, .article-detail-hero h1 { max-width: none; } }
      @media (max-width: 560px) { .articles-list-footer { display: grid; } .articles-list-footer__link { width: 100%; } .articles-container { width: min(100% - 1rem, 1120px); } .articles-hero__copy, .articles-feature-card, .article-body-card, .article-sidebar, .video-guide, .faq-card, .related-articles-card, .articles-cta, .articles-disclaimer, .articles-faq-panel, .related-care-section { border-radius: 22px; } .articles-grid, .areas-grid, .article-meta, .related-grid { grid-template-columns: 1fr; } .articles-hero { padding-top: 1.25rem; } .articles-hero h1, .article-detail-hero h1 { font-size: clamp(2.05rem, 11vw, 2.65rem); } .articles-section__header--split { display: block; } }
    `}</style>
  );
}
