import type { ReactNode } from 'react';
import type { PublicDiscoveryPageConfig } from './publicDiscoveryPageConfig';

type Props = {
  config: PublicDiscoveryPageConfig;
  children: ReactNode;
  isEmpty?: boolean;
  hasActiveQuery?: boolean;
  compactEmptyText?: string;
  compactEmptySearchText?: string;
  compactEmptySearchHint?: string;
};

export function PublicDiscoveryResultsShell2026({
  config,
  children,
  isEmpty = false,
  hasActiveQuery = false,
  compactEmptyText,
  compactEmptySearchText,
  compactEmptySearchHint,
}: Props) {
  const shouldShowCompactEmpty = isEmpty && Boolean(compactEmptyText);
  const compactText = hasActiveQuery && compactEmptySearchText ? compactEmptySearchText : compactEmptyText;

  return (
    <section
      id={config.resultsId}
      className={
        shouldShowCompactEmpty
          ? 'dm2026-container dm2026-doctors-listings dm2026-public-discovery-listings dm2026-public-discovery-listings--compact-empty'
          : 'dm2026-container dm2026-doctors-listings dm2026-public-discovery-listings'
      }
      aria-labelledby={`${config.resultsId}-title`}
    >
      {shouldShowCompactEmpty ? (
        <div
          className="dm2026-public-discovery-empty-compact dm2026-card-soft"
          role="status"
          aria-live="polite"
        >
          <h2 id={`${config.resultsId}-title`}>{compactText}</h2>
          {hasActiveQuery && compactEmptySearchHint ? <p>{compactEmptySearchHint}</p> : null}
        </div>
      ) : (
        <>
          <div className="dm2026-doctors-results-header dm2026-public-discovery-results-header dm2026-card-soft">
            <h2 id={`${config.resultsId}-title`}>{config.results.title}</h2>
            <p>{config.results.emptyText}</p>
          </div>
          {children}
        </>
      )}
    </section>
  );
}
