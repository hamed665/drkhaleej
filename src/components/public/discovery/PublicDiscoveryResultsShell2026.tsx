import type { ReactNode } from 'react';
import type { PublicDiscoveryPageConfig } from './publicDiscoveryPageConfig';

type Props = { config: PublicDiscoveryPageConfig; children: ReactNode };

export function PublicDiscoveryResultsShell2026({ config, children }: Props) {
  return (
    <section id={config.resultsId} className="dm2026-container dm2026-doctors-listings dm2026-public-discovery-listings" aria-labelledby={`${config.resultsId}-title`}>
      <div className="dm2026-doctors-results-header dm2026-public-discovery-results-header dm2026-card-soft">
        <h2 id={`${config.resultsId}-title`}>{config.results.title}</h2>
        <p>{config.results.emptyText}</p>
      </div>
      {children}
    </section>
  );
}
