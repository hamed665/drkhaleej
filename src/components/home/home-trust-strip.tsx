type HomeTrustStripProps = {
  items: readonly string[];
  dir: 'ltr' | 'rtl';
};

export function HomeTrustStrip({ items, dir }: HomeTrustStripProps) {
  return (
    <section className="home-trust" dir={dir} aria-label="Trust principles">
      <ul className="home-trust__list">
        {items.map((item) => (
          <li key={item} className="home-trust__item ui-card ui-card--default">
            <span className="home-trust__dot trust-ring" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
