import type { ReactNode } from 'react';

type PublicRouteHeroVariant = 'default' | 'profile';

type PublicRouteHeroProps = {
  badge: string;
  title: string;
  description: string;
  dir: 'ltr' | 'rtl';
  actions?: ReactNode;
  meta?: ReactNode;
  variant?: PublicRouteHeroVariant;
};

export function PublicRouteHero({ badge, title, description, dir, actions, meta, variant = 'default' }: PublicRouteHeroProps) {
  const sectionClassName = variant === 'profile' ? 'public-route-hero public-route-hero--profile' : 'public-route-hero';

  return (
    <section className={sectionClassName} dir={dir}>
      <div className="public-route-hero__inner">
        <p className="public-route-hero__badge">{badge}</p>
        <h1 className="public-route-hero__title">{title}</h1>
        <p className="public-route-hero__description">{description}</p>
        {meta ? <div className="public-route-hero__meta">{meta}</div> : null}
        {actions ? <div className="public-route-hero__actions">{actions}</div> : null}
      </div>
    </section>
  );
}
