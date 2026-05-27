type HomeTrustStripProps = {
  items: readonly string[];
  dir: 'ltr' | 'rtl';
};

export function HomeTrustStrip({ items, dir }: HomeTrustStripProps) {
  return (
    <section className="home-trust" dir={dir} aria-label="Trust principles">
      <ul className="home-trust__list">
        {items.map((item) => (
          <li key={item} className="home-trust__item glass-soft">
            <span className="home-trust__dot" aria-hidden="true" />
            <span className="home-trust__text">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
