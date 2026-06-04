'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { SupportedCountry, SupportedLocale } from '@/lib/i18n/config';
import { localeDirection } from '@/lib/i18n/config';
import { publicDiscoveryRoute } from '@/lib/routes/public';
import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';
import { SectionHeader2026 } from '@/components/public-2026/ui/SectionHeader2026';

type FeaturedCentersCarousel2026Props = {
  locale: SupportedLocale;
  country: SupportedCountry;
  copy: Home2026Copy['carousel'];
  actions: Home2026Copy['actions'];
};

export function FeaturedCentersCarousel2026({ locale, country, copy, actions }: FeaturedCentersCarousel2026Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const dir = localeDirection(locale);
  const providers = copy.providers;
  const visibleProviders = useMemo(
    () => [0, 1, 2].map((offset) => providers[(activeIndex + offset) % providers.length]!),
    [activeIndex, providers]
  );

  useEffect(() => {
    if (isPaused) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % providers.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [isPaused, providers.length]);

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + providers.length) % providers.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % providers.length);
  };

  return (
    <section
      className="dm2026-carousel py-10 sm:py-12"
      aria-labelledby="dm2026-carousel-title"
      aria-roledescription="carousel"
      aria-label={copy.pauseLabel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      dir={dir}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <SectionHeader2026 id="dm2026-carousel-title" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle} />
        <div className="flex gap-2 lg:justify-end">
          <button type="button" onClick={goToPrevious} className="dm2026-carousel-control" aria-label={copy.previous}>
            {dir === 'rtl' ? '›' : '‹'}
          </button>
          <button type="button" onClick={goToNext} className="dm2026-carousel-control" aria-label={copy.next}>
            {dir === 'rtl' ? '‹' : '›'}
          </button>
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleProviders.map((provider, index) => (
          <article key={`${provider.name}-${activeIndex}-${index}`} className="dm2026-carousel-card">
            <div className="dm2026-carousel-card__cover">
              <span>{copy.sampleLabel}</span>
            </div>
            <div className="grid flex-1 gap-4 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-dm-accent-gold">{provider.category}</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-dm-text">{provider.name}</h3>
                <p className="mt-2 text-sm font-semibold text-dm-brand-strong">{provider.location}</p>
                <p className="mt-1 text-sm text-dm-text-muted">{provider.hours}</p>
                <p className="mt-3 text-sm leading-6 text-dm-text-soft">{provider.description}</p>
              </div>
              <div className="dm2026-carousel-actions">
                <Link href={publicDiscoveryRoute(locale, country, provider.route)} className="dm2026-carousel-action dm2026-carousel-action--profile">
                  {actions.viewProfile}
                </Link>
                <button type="button" className="dm2026-carousel-action dm2026-carousel-action--whatsapp" aria-label={`${actions.whatsapp} — ${provider.name}`}>
                  {actions.whatsapp}
                </button>
                <button type="button" className="dm2026-carousel-action" aria-label={`${actions.call} — ${provider.name}`}>
                  {actions.call}
                </button>
                <button type="button" className="dm2026-carousel-action" aria-label={`${actions.directions} — ${provider.name}`}>
                  {actions.directions}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label={copy.pauseLabel}>
        {providers.map((provider, index) => (
          <button
            key={provider.name}
            type="button"
            className={`dm2026-carousel-dot${index === activeIndex ? ' dm2026-carousel-dot--active' : ''}`}
            aria-label={`${copy.sampleLabel}: ${provider.name}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}
