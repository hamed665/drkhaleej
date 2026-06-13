'use client';

import { useMemo, useState } from 'react';

export type BillingPeriodId = 'three' | 'six' | 'twelve';

export type ProviderPricingPlan = {
  id: 'free' | 'starter' | 'growth' | 'premium';
  name: string;
  description: string;
  bestForLabel: string;
  bestFor: string;
  cta: string;
  note: string;
  recommendedLabel?: string;
  prices: Record<BillingPeriodId, string>;
  periodNotes: Record<BillingPeriodId, string>;
  savings: Record<BillingPeriodId, string>;
  features: readonly string[];
};

export type ProviderPricingCopy = {
  badge: string;
  title: string;
  subtitle: string;
  selectorLabel: string;
  periods: readonly { id: BillingPeriodId; label: string }[];
  plans: readonly ProviderPricingPlan[];
  disclaimer: string;
};

type ProviderPricingPlansProps = {
  copy: ProviderPricingCopy;
};

export function ProviderPricingPlans({ copy }: ProviderPricingPlansProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriodId>('three');
  const selectedPeriodLabel = useMemo(
    () => copy.periods.find((period) => period.id === selectedPeriod)?.label ?? copy.periods[0]?.label ?? '',
    [copy.periods, selectedPeriod]
  );

  return (
    <section className="dm2026-section provider-onboarding-section provider-onboarding-pricing" aria-labelledby="provider-pricing-title">
      <div className="dm2026-container">
        <div className="provider-onboarding-pricing__topline">
          <header className="dm2026-section-header provider-onboarding-section__header provider-onboarding-pricing__header">
            <span className="dm2026-badge">{copy.badge}</span>
            <h2 id="provider-pricing-title">{copy.title}</h2>
            <p>{copy.subtitle}</p>
          </header>

          <div className="provider-onboarding-pricing__selector" aria-label={copy.selectorLabel}>
            <span>{copy.selectorLabel}</span>
            <div className="provider-onboarding-pricing__segments" role="radiogroup" aria-label={copy.selectorLabel}>
              {copy.periods.map((period) => (
                <button
                  aria-checked={period.id === selectedPeriod}
                  className="provider-onboarding-pricing__segment"
                  data-active={period.id === selectedPeriod ? 'true' : 'false'}
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  role="radio"
                  type="button"
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="provider-onboarding-pricing-grid" data-selected-period={selectedPeriod}>
          {copy.plans.map((plan) => (
            <article className="dm2026-card-glass provider-onboarding-plan" data-recommended={plan.recommendedLabel ? 'true' : 'false'} key={plan.id}>
              <div className="provider-onboarding-plan__head">
                <div>
                  {plan.recommendedLabel ? <span className="provider-onboarding-plan__recommended">{plan.recommendedLabel}</span> : null}
                  <h3>{plan.name}</h3>
                </div>
                <span className="provider-onboarding-plan__saving">{plan.savings[selectedPeriod]}</span>
              </div>

              <p className="provider-onboarding-plan__description">{plan.description}</p>

              <div className="provider-onboarding-plan__price" aria-label={`${plan.name} ${selectedPeriodLabel}`}>
                <strong>{plan.prices[selectedPeriod]}</strong>
                <span>{selectedPeriodLabel}</span>
              </div>
              <p className="provider-onboarding-plan__period-note">{plan.periodNotes[selectedPeriod]}</p>

              <div className="provider-onboarding-plan__best-for">
                <span>{plan.bestForLabel}</span>
                <p>{plan.bestFor}</p>
              </div>

              <ul className="provider-onboarding-plan__features" aria-label={plan.name}>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="provider-onboarding-plan__footer">
                <a className="dm2026-button dm2026-button-secondary provider-onboarding-plan__button" href="#provider-onboarding-form">
                  {plan.cta}
                </a>
                <p>{plan.note}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="dm2026-card-soft provider-onboarding-pricing-note">{copy.disclaimer}</p>
      </div>
    </section>
  );
}
