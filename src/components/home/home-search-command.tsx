type HomeSearchCommandCopy = {
  primaryPlaceholder: string;
  servicePlaceholder: string;
  locationPlaceholder: string;
  categories: readonly string[];
  ctaLabel: string;
};

type HomeSearchCommandProps = {
  copy: HomeSearchCommandCopy;
  dir: 'ltr' | 'rtl';
};

export function HomeSearchCommand({ copy, dir }: HomeSearchCommandProps) {
  return (
    <section className="home-search-command" dir={dir} aria-label="Homepage search">
      <div className="home-search-command__shell">
        <div className="home-search-command__row" role="group" aria-label="Search fields">
          <div className="home-search-command__field home-search-command__field--main" aria-hidden="true">
            <span className="home-search-command__icon">⌕</span>
            <span>{copy.primaryPlaceholder}</span>
          </div>
          <div className="home-search-command__field" aria-hidden="true">
            <span>{copy.servicePlaceholder}</span>
          </div>
          <div className="home-search-command__field" aria-hidden="true">
            <span>{copy.locationPlaceholder}</span>
          </div>
          <button type="button" className="home-search-command__cta">
            {copy.ctaLabel}
          </button>
        </div>

        <ul className="home-search-command__suggestions" aria-label="Generic healthcare categories">
          {copy.categories.map((item) => (
            <li key={item}>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
