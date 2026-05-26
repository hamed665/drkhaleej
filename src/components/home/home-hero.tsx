import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type HomeHeroCopy = {
  announcement: string;
  title: string;
  subtitle: string;
  findCare: string;
  forClinics: string;
  note: string;
};

type HomeHeroProps = {
  copy: HomeHeroCopy;
  dir: 'ltr' | 'rtl';
};

export function HomeHero({ copy, dir }: HomeHeroProps) {
  return (
    <section className="home-hero hero-aura gradient-mesh-soft" dir={dir} aria-labelledby="home-hero-title">
      <div className="home-hero__content glass-soft">
        <Badge variant="trust">{copy.announcement}</Badge>
        <h1 id="home-hero-title" className="home-hero__title neon-glow">
          {copy.title}
        </h1>
        <p className="home-hero__subtitle">{copy.subtitle}</p>
        <div className="home-hero__actions" aria-label="Primary actions">
          <Button variant="primary" size="lg" type="button" className="home-hero__cta home-hero__cta--primary">
            {copy.findCare}
          </Button>
          <Button variant="secondary" size="lg" type="button" className="home-hero__cta home-hero__cta--secondary">
            {copy.forClinics}
          </Button>
        </div>
        <p className="home-hero__note">{copy.note}</p>
      </div>

      <div className="home-hero__visual glass-strong card-shimmer" aria-hidden="true">
        <div className="home-hero__layers">
          <span className="pulse-ring" />
          <span className="orbit-node orbit-node--one" />
          <span className="orbit-node orbit-node--two" />
          <span className="scan-sweep" />
          <span className="beam-glow" />
        </div>
        <svg className="home-hero__ecg ecg-line-animated" viewBox="0 0 420 120" role="presentation" focusable="false">
          <path d="M0 64 H72 L95 64 L110 34 L128 92 L150 22 L174 97 L196 64 H240 L260 64 L272 44 L286 82 L308 36 L326 86 L348 64 H420" fill="none" pathLength="100" />
        </svg>
      </div>
    </section>
  );
}
