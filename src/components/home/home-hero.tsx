import { Badge } from '@/components/ui/badge';
import { HomePopularSearches } from '@/components/home/home-popular-searches';
import { HomeSearchCommand } from '@/components/home/home-search-command';

type HomeHeroCopy = {
  announcement: string;
  title: string;
  subtitle: string;
  note: string;
  search: {
    primaryPlaceholder: string;
    servicePlaceholder: string;
    locationPlaceholder: string;
    ctaLabel: string;
    categories: readonly string[];
  };
  popularSearchLabel: string;
  popularSearches: readonly string[];
  visualTags: readonly string[];
};

type HomeHeroProps = {
  copy: HomeHeroCopy;
  dir: 'ltr' | 'rtl';
};

export function HomeHero({ copy, dir }: HomeHeroProps) {
  return (
    <section className="home-hero" dir={dir} aria-labelledby="home-hero-title">
      <div className="home-hero__content glass-soft">
        <Badge variant="trust">{copy.announcement}</Badge>
        <h1 id="home-hero-title" className="home-hero__title">
          {copy.title}
        </h1>
        <p className="home-hero__subtitle">{copy.subtitle}</p>

        <HomeSearchCommand copy={copy.search} dir={dir} />
        <HomePopularSearches label={copy.popularSearchLabel} items={copy.popularSearches} dir={dir} />

        <p className="home-hero__note">{copy.note}</p>
      </div>

      <aside className="home-hero__visual glass-soft" aria-hidden="true">
        <div className="hero-arch">
          <div className="hero-arch__inner">
            <div className="hero-arch__panel hero-arch__panel--top" />
            <div className="hero-arch__panel hero-arch__panel--left" />
            <div className="hero-arch__panel hero-arch__panel--right" />
          </div>
        </div>

        <div className="hero-visual-card hero-visual-card--primary">
          <span className="hero-visual-card__title">Healthcare discovery</span>
          <div className="hero-visual-card__line" />
          <div className="hero-visual-card__line hero-visual-card__line--soft" />
        </div>

        <div className="hero-visual-tags">
          {copy.visualTags.map((tag) => (
            <span key={tag} className="hero-visual-tag">
              {tag}
            </span>
          ))}
        </div>
      </aside>
    </section>
  );
}
