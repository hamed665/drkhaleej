import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

type HomeHeroCopy = {
  announcement: string;
  title: string;
  subtitle: string;
  findCare: string;
  forClinics: string;
  note: string;
  actionsLabel: string;
  highlightsLabel: string;
  chips: readonly string[];
  highlights: readonly string[];
};

type HomeHeroProps = {
  copy: HomeHeroCopy;
  dir: 'ltr' | 'rtl';
  primaryHref: string;
  secondaryHref: string;
};

export function HomeHero({ copy, dir, primaryHref, secondaryHref }: HomeHeroProps) {
  return (
    <section className="home-hero" dir={dir} aria-labelledby="home-hero-title">
      <div className="home-hero__content">
        <div className="home-hero__headline">
          <Badge variant="trust">{copy.announcement}</Badge>
          <h1 id="home-hero-title" className="home-hero__title">
            {copy.title}
          </h1>
          <p className="home-hero__subtitle">{copy.subtitle}</p>
        </div>

        <div className="home-hero__actions" aria-label={copy.actionsLabel}>
          <Link href={primaryHref} className="ui-button ui-button--primary ui-button--lg home-hero__cta home-hero__cta--primary">
            {copy.findCare}
          </Link>
          <Link href={secondaryHref} className="ui-button ui-button--secondary ui-button--lg home-hero__cta home-hero__cta--secondary">
            {copy.forClinics}
          </Link>
        </div>

        <div className="home-hero__chips" aria-label={copy.highlightsLabel}>
          {copy.chips.map((chip) => (
            <span key={chip} className="home-hero__chip">
              {chip}
            </span>
          ))}
        </div>

        <ul className="home-hero__highlights" aria-label={copy.highlightsLabel}>
          {copy.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <p className="home-hero__note">{copy.note}</p>
      </div>

      <div className="home-hero__visual" aria-hidden="true">
        <div className="home-hero__figure home-hero__figure--tall">
          <span className="home-hero__figure-mark" />
          <span className="home-hero__figure-line" />
          <span className="home-hero__figure-line home-hero__figure-line--short" />
        </div>
        <div className="home-hero__figure home-hero__figure--top">
          <span className="home-hero__figure-dot" />
          <span className="home-hero__figure-line" />
        </div>
        <div className="home-hero__figure home-hero__figure--bottom">
          <span className="home-hero__figure-line" />
          <span className="home-hero__figure-pill" />
        </div>
      </div>
    </section>
  );
}
