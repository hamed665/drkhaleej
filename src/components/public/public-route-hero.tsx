import type { ReactNode } from 'react';

export type PublicRouteHeroMedia = {
  url: string;
  altText: string;
  width?: number | null;
  height?: number | null;
};

type PublicRouteHeroProps = {
  badge: string;
  title: string;
  description: string;
  dir: 'ltr' | 'rtl';
  actions?: ReactNode;
  media?: PublicRouteHeroMedia | null;
};

export function PublicRouteHero({ badge, title, description, dir, actions, media }: PublicRouteHeroProps) {
  return (
    <section className="public-route-hero" dir={dir}>
      {media ? (
        <div className="mx-auto mb-5 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-slate-100 shadow-xl shadow-emerald-950/10">
            <div className="aspect-[16/9] max-h-[520px] w-full overflow-hidden bg-slate-100 sm:aspect-[21/9]">
              <img
                src={media.url}
                alt={media.altText}
                width={media.width ?? undefined}
                height={media.height ?? undefined}
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto mb-5 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-950 via-emerald-800 to-cyan-700 shadow-xl shadow-emerald-950/10">
            <div className="flex min-h-64 items-end p-6 sm:min-h-80 sm:p-10">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-100">{badge}</p>
                <p className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">{title}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="public-route-hero__inner">
        <p className="public-route-hero__badge">{badge}</p>
        <h1 className="public-route-hero__title">{title}</h1>
        <p className="public-route-hero__description">{description}</p>
        {actions ? <div className="public-route-hero__actions">{actions}</div> : null}
      </div>
    </section>
  );
}
