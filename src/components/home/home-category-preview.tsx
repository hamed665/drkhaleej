type HomeCategoryPreviewProps = {
  title: string;
  subtitle: string;
  categories: readonly {
    key: string;
    label: string;
    description: string;
    accentClass: string;
  }[];
  dir: 'ltr' | 'rtl';
};

export function HomeCategoryPreview({ title, subtitle, categories, dir }: HomeCategoryPreviewProps) {
  return (
    <section className="home-categories" dir={dir} aria-labelledby="home-categories-title">
      <div className="home-categories__head">
        <h2 id="home-categories-title">{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="home-categories__grid">
        {categories.map((category) => (
          <article key={category.key} className={`home-categories__card glass-soft ${category.accentClass}`}>
            <span className="home-categories__icon" aria-hidden="true" />
            <h3>{category.label}</h3>
            <p>{category.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
