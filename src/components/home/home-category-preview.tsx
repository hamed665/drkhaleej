import Link from 'next/link';

type HomeCategoryPreviewProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  categories: readonly {
    key: string;
    label: string;
    description: string;
    accentClass: string;
    href?: string;
  }[];
  dir: 'ltr' | 'rtl';
};

export function HomeCategoryPreview({ eyebrow, title, subtitle, categories, dir }: HomeCategoryPreviewProps) {
  return (
    <section className="home-categories" dir={dir} aria-labelledby="home-categories-title">
      <div className="home-section-head home-categories__head">
        <p className="home-section-eyebrow">{eyebrow}</p>
        <h2 id="home-categories-title">{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="home-categories__grid">
        {categories.map((category) => {
          const className = `home-categories__card ${category.accentClass}`;
          const content = (
            <>
              <span className="home-categories__icon" aria-hidden="true" />
              <span className="home-categories__label-row">
                <h3>{category.label}</h3>
                <span className="home-categories__arrow" aria-hidden="true">
                  {dir === 'rtl' ? '←' : '→'}
                </span>
              </span>
              <p>{category.description}</p>
            </>
          );

          if (!category.href) {
            return (
              <article key={category.key} className={className}>
                {content}
              </article>
            );
          }

          return (
            <Link key={category.key} href={category.href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
