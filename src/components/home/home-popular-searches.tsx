type HomePopularSearchesProps = {
  label: string;
  items: readonly string[];
  dir: 'ltr' | 'rtl';
};

export function HomePopularSearches({ label, items, dir }: HomePopularSearchesProps) {
  return (
    <section className="home-popular-searches" dir={dir} aria-label={label}>
      <p className="home-popular-searches__label">{label}</p>
      <ul className="home-popular-searches__list">
        {items.map((item) => (
          <li key={item}>
            <span className="home-popular-searches__chip">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
