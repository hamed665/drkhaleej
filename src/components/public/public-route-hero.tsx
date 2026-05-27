import type { ReactNode } from 'react';

type PublicRouteHeroProps = {
  badge: string;
  title: string;
  description: string;
  dir: 'ltr' | 'rtl';
  actions?: ReactNode;
};

export function PublicRouteHero({ badge, title, description, dir, actions }: PublicRouteHeroProps) {
  return (
    <section className="public-route-hero" dir={dir}>
      <div className="public-route-hero__inner">
        <p className="public-route-hero__badge">{badge}</p>
        <h1 className="public-route-hero__title">{title}</h1>
        <p className="public-route-hero__description">{description}</p>
        {actions ? <div className="public-route-hero__actions">{actions}</div> : null}
      </div>
    </section>
  );
}
