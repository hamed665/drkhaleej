'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { PublicDiscoverySearch2026 } from './PublicDiscoverySearch2026';
import type { PublicDiscoveryPageConfig } from './publicDiscoveryPageConfig';

type Props = { config: PublicDiscoveryPageConfig; whatsAppHref: string | null };

export function PublicDiscoveryHero2026({ config, whatsAppHref }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const fallbackSlide = config.visual.slides[0] ?? { src: '/images/home/provider-cta-healthcare-platform-preview.jpg', alt: config.title, caption: config.subtitle };
  const activeSlide = config.visual.slides[activeIndex] ?? fallbackSlide;
  const goToPrevious = () => setActiveIndex((current) => (current === 0 ? config.visual.slides.length - 1 : current - 1));
  const goToNext = () => setActiveIndex((current) => (current + 1) % config.visual.slides.length);
  const shouldRenderWhatsApp = config.showWhatsApp !== false && Boolean(config.whatsAppCta);
  const whatsAppUnavailable = config.whatsAppUnavailable ?? config.whatsAppCta;

  return (
    <section className="dm2026-doctors-first-fold dm2026-container dm2026-public-discovery-first-fold" aria-labelledby={`dm2026-${config.categoryType}-title`}>
      <div className="dm2026-doctors-hero-shell dm2026-public-discovery-hero-shell dm2026-search-surface">
        <div className="dm2026-doctors-hero-content dm2026-public-discovery-hero-content">
          <div className="dm2026-doctors-hero__copy dm2026-public-discovery-hero__copy">
            <span className="dm2026-badge">{config.badge}</span>
            <h1 id={`dm2026-${config.categoryType}-title`}>{config.title}</h1>
            <p>{config.subtitle}</p>
          </div>
          <div className="dm2026-doctors-hero__actions dm2026-public-discovery-hero__actions" aria-label={config.badge}>
            <Link className="dm2026-button dm2026-button-secondary" href={`/${config.locale}/${config.country}/for-providers`}>{config.providerCta}</Link>
            {shouldRenderWhatsApp ? (whatsAppHref ? <a className="dm2026-button dm2026-button-ghost" href={whatsAppHref} target="_blank" rel="noopener noreferrer">{config.whatsAppCta}</a> : <span className="dm2026-button dm2026-button-ghost" aria-disabled="true" title={whatsAppUnavailable}>{config.whatsAppCta}</span>) : null}
          </div>
          <div id={config.searchId} className="dm2026-doctors-hero__search dm2026-public-discovery-hero__search">
            <PublicDiscoverySearch2026 config={config} />
          </div>
        </div>

        <aside className="dm2026-doctors-carousel dm2026-public-discovery-visual" dir={config.dir} aria-label={config.visual.label}>
          <div className="dm2026-doctors-carousel__media">
            <Image key={activeSlide.src} src={activeSlide.src} alt={activeSlide.alt} width={1180} height={856} sizes="(max-width: 900px) 100vw, 38vw" priority />
            <div className="dm2026-doctors-carousel__caption"><span>{activeSlide.caption}</span></div>
          </div>
          <div className="dm2026-doctors-carousel__controls">
            <button type="button" className="dm2026-doctors-carousel__arrow" onClick={goToPrevious} aria-label={config.visual.previous}>‹</button>
            <div className="dm2026-doctors-carousel__dots" aria-label={config.visual.label}>
              {config.visual.slides.map((slide, index) => <button key={slide.src} type="button" className="dm2026-doctors-carousel__dot" aria-label={`${config.visual.slideLabel} ${index + 1}`} aria-current={index === activeIndex ? 'true' : undefined} onClick={() => setActiveIndex(index)} />)}
            </div>
            <button type="button" className="dm2026-doctors-carousel__arrow" onClick={goToNext} aria-label={config.visual.next}>›</button>
          </div>
        </aside>
      </div>
    </section>
  );
}
