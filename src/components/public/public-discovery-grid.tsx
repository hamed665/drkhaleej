type PublicDiscoveryGridProps = {
  title: string;
  items: readonly string[];
};

export function PublicDiscoveryGrid({ title, items }: PublicDiscoveryGridProps) {
  return (
    <section className="public-discovery-grid" aria-label={title}>
      <h2 className="public-discovery-grid__title">{title}</h2>
      <ul className="public-discovery-grid__list">
        {items.map((item) => (
          <li key={item} className="public-discovery-grid__item">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
