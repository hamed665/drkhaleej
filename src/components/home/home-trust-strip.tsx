type HomeTrustStripProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: readonly string[];
  dir: 'ltr' | 'rtl';
};

export function HomeTrustStrip({ eyebrow, title, subtitle, items, dir }: HomeTrustStripProps) {
  return (
    <section className="home-trust" dir={dir} aria-labelledby="home-trust-title">
      <div className="home-trust__steps" aria-hidden="true">
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </div>
      <div className="home-section-head home-trust__head">
        <p className="home-section-eyebrow">{eyebrow}</p>
        <h2 id="home-trust-title">{title}</h2>
        <p>{subtitle}</p>
      </div>
      <ul className="home-trust__list">
        {items.map((item) => (
          <li key={item} className="home-trust__item">
            <span className="home-trust__dot" aria-hidden="true" />
            <span className="home-trust__text">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
