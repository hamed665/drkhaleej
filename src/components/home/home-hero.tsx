import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type HomeHeroCopy = {
  announcement: string;
  title: string;
  subtitle: string;
  findCare: string;
  forClinics: string;
  note: string;
  chips: readonly string[];
};

type HomeHeroProps = {
  copy: HomeHeroCopy;
  dir: 'ltr' | 'rtl';
};

export function HomeHero({ copy, dir }: HomeHeroProps) {
  return (
    <section className="home-hero hero-aura" dir={dir} aria-labelledby="home-hero-title">
      <div className="home-hero__content glass-soft">
        <Badge variant="trust">{copy.announcement}</Badge>
        <h1 id="home-hero-title" className="home-hero__title">
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

      <div className="home-hero__visual glass-strong" aria-hidden="true">
        <div className="home-hero__layers">
          <span className="hero-orb__aura" />
          <span className="hero-orb__halo hero-orb__halo--one" />
          <span className="hero-orb__halo hero-orb__halo--two" />
          <span className="hero-orb__halo hero-orb__halo--three" />
          <span className="hero-orb__core" />

          <span className="hero-particle hero-particle--one" />
          <span className="hero-particle hero-particle--two" />
          <span className="hero-particle hero-particle--three" />
          <span className="hero-particle hero-particle--four" />
          <span className="hero-particle hero-particle--five" />

          <svg className="hero-network" viewBox="0 0 420 280" role="presentation" focusable="false">
            <path d="M62 160 C110 110, 165 102, 206 145" />
            <path d="M206 145 C252 180, 308 178, 352 134" />
            <path d="M102 220 C154 205, 242 210, 316 236" />
            <circle cx="62" cy="160" r="4" />
            <circle cx="206" cy="145" r="5" />
            <circle cx="352" cy="134" r="4" />
            <circle cx="102" cy="220" r="3.5" />
            <circle cx="316" cy="236" r="3.5" />
          </svg>

          {copy.chips.map((chip, index) => (
            <span key={chip} className={`hero-chip hero-chip--${index + 1}`}>
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
