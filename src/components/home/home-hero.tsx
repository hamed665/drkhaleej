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
    <section className="home-hero" dir={dir} aria-labelledby="home-hero-title">
      <div className="home-hero__content">
        <Badge variant="trust">{copy.announcement}</Badge>
        <h1 id="home-hero-title" className="home-hero__title">
          {copy.title}
        </h1>
        <p className="home-hero__subtitle">{copy.subtitle}</p>
        <div className="home-hero__actions" aria-label="Primary actions">
          <Button variant="primary" size="lg" type="button">
            {copy.findCare}
          </Button>
          <Button variant="secondary" size="lg" type="button">
            {copy.forClinics}
          </Button>
        </div>
        <p className="home-hero__note">{copy.note}</p>
      </div>

      <div className="home-hero__visual ui-card ui-card--glass scan-line" aria-hidden="true">
        <div className="home-hero__pulse medical-pulse" />
        <div className="home-hero__orbit" />
        <svg className="home-hero__ecg" viewBox="0 0 320 88" role="presentation" focusable="false">
          <path
            d="M0 44 H68 L88 44 L102 26 L116 62 L136 16 L156 68 L176 44 H320"
            fill="none"
            pathLength="100"
          />
        </svg>
      </div>
    </section>
  );
}
