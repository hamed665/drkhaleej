'use client';

import { useMemo, useState } from 'react';

export type BillingPeriodId = 'month' | 'three' | 'six' | 'twelve';

export type ProviderPricingPlan = {
  id: 'free' | 'starter' | 'growth' | 'premium';
  name: string;
  badge: string;
  description: string;
  bestForLabel: string;
  bestFor: string;
  cta: string;
  monthlyReferenceCta?: string;
  note: string;
  recommendedLabel?: string;
  supportLabel?: string;
  baseMonthlyOmr?: number;
  annualDiscount?: 0.18 | 0.25;
  prices?: Record<BillingPeriodId, string>;
  periodNotes?: Record<BillingPeriodId, string>;
  savings?: Record<BillingPeriodId, string>;
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

const periodMonths: Record<Exclude<BillingPeriodId, 'month'>, number> = {
  three: 3,
  six: 6,
  twelve: 12
};

const periodDiscounts: Record<Exclude<BillingPeriodId, 'month'>, number> = {
  three: 0,
  six: 0.05,
  twelve: 0
};

function formatAmount(amount: number) {
  return Number(amount.toFixed(2)).toString();
}

function getPlanPricing(plan: ProviderPricingPlan, period: BillingPeriodId, isArabic: boolean) {
  if (plan.baseMonthlyOmr === undefined) {
    return {
      periodNote: plan.periodNotes?.[period] ?? '',
      price: plan.prices?.[period] ?? '',
      saving: plan.savings?.[period] ?? ''
    };
  }

  if (plan.baseMonthlyOmr === 0) {
    return {
      periodNote: period === 'month' ? (isArabic ? 'مرجع شهري فقط' : 'Monthly reference only') : isArabic ? 'لا يتطلب دفعاً للفترة المحددة' : 'No payment required for the selected period',
      price: isArabic ? 'مجاني / شهرياً' : 'Free / month',
      saving: isArabic ? 'مجاني دائماً' : 'Always free'
    };
  }

  if (period === 'month') {
    return {
      periodNote: isArabic ? 'الدفع الشهري غير مفعّل. اختر 3 أشهر أو 6 أشهر أو 12 شهراً.' : 'Monthly billing is not active. Select 3, 6, or 12 months.',
      price: isArabic ? `${formatAmount(plan.baseMonthlyOmr)} ر.ع / شهرياً` : `${formatAmount(plan.baseMonthlyOmr)} OMR / month`,
      saving: isArabic ? 'مرجع شهري' : 'Monthly reference'
    };
  }

  const months = periodMonths[period];
  const discount = period === 'twelve' ? plan.annualDiscount ?? 0 : periodDiscounts[period];
  const monthlyEquivalent = plan.baseMonthlyOmr * (1 - discount);
  const total = monthlyEquivalent * months;
  const formattedMonthly = formatAmount(monthlyEquivalent);
  const formattedTotal = formatAmount(total);

  if (period === 'three') {
    return {
      periodNote: isArabic ? `تُدفع ${formattedTotal} ر.ع كل 3 أشهر` : `Billed ${formattedTotal} OMR every 3 months`,
      price: isArabic ? `${formattedMonthly} ر.ع / شهرياً` : `${formattedMonthly} OMR / month`,
      saving: plan.id === 'growth' ? (isArabic ? 'أقوى قيمة' : 'Strongest value') : plan.id === 'premium' ? (isArabic ? 'جاهزية مميزة' : 'Premium readiness') : isArabic ? 'مقارنة باقات الإطلاق' : 'Launch comparison'
    };
  }

  if (period === 'six') {
    return {
      periodNote: isArabic ? `تُدفع ${formattedTotal} ر.ع كل 6 أشهر` : `Billed ${formattedTotal} OMR every 6 months`,
      price: isArabic ? `${formattedMonthly} ر.ع / شهرياً` : `${formattedMonthly} OMR / month`,
      saving: isArabic ? 'وفر 5%' : 'Save 5%'
    };
  }

  return {
    periodNote: isArabic ? `تُدفع ${formattedTotal} ر.ع سنوياً` : `Billed ${formattedTotal} OMR yearly`,
    price: isArabic ? `${formattedMonthly} ر.ع / شهرياً` : `${formattedMonthly} OMR / month`,
    saving: isArabic ? `وفر ${Math.round((plan.annualDiscount ?? 0) * 100)}%` : `Save ${Math.round((plan.annualDiscount ?? 0) * 100)}%`
  };
}

export function ProviderPricingPlans({ copy }: ProviderPricingPlansProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriodId>('month');
  const selectedPeriodLabel = useMemo(
    () => copy.periods.find((period) => period.id === selectedPeriod)?.label ?? copy.periods[0]?.label ?? '',
    [copy.periods, selectedPeriod]
  );
  const isArabic = copy.selectorLabel.includes('اختر');

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
          {copy.plans.map((plan) => {
            const isMonthlyReference = selectedPeriod === 'month' && plan.id !== 'free';
            const ctaLabel = isMonthlyReference ? plan.monthlyReferenceCta ?? plan.cta : plan.cta;
            const selectedPricing = getPlanPricing(plan, selectedPeriod, isArabic);

            return (
              <article
                className="dm2026-card-glass provider-onboarding-plan"
                data-monthly-reference={isMonthlyReference ? 'true' : 'false'}
                data-plan={plan.id}
                data-recommended={plan.recommendedLabel ? 'true' : 'false'}
                key={plan.id}
              >
                <div className="provider-onboarding-plan__head">
                  <span className="provider-onboarding-plan__badge">{plan.badge}</span>
                  {plan.recommendedLabel ? <span className="provider-onboarding-plan__recommended">{plan.recommendedLabel}</span> : null}
                </div>

                <div className="provider-onboarding-plan__name-row">
                  <h3>{plan.name}</h3>
                  {plan.supportLabel ? <span>{plan.supportLabel}</span> : null}
                </div>

                <p className="provider-onboarding-plan__description">{plan.description}</p>

                <div className="provider-onboarding-plan__price-block">
                  <div className="provider-onboarding-plan__price" aria-label={`${plan.name} ${selectedPeriodLabel}`}>
                    <strong>{selectedPricing.price}</strong>
                  </div>
                  <p className="provider-onboarding-plan__period-note">{selectedPricing.periodNote}</p>
                  <span className="provider-onboarding-plan__saving">{selectedPricing.saving}</span>
                </div>

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
                  {isMonthlyReference ? (
                    <button className="dm2026-button dm2026-button-secondary provider-onboarding-plan__button" disabled type="button">
                      {ctaLabel}
                    </button>
                  ) : (
                    <a className="dm2026-button dm2026-button-secondary provider-onboarding-plan__button" href="#provider-onboarding-form">
                      {ctaLabel}
                    </a>
                  )}
                  <p>{plan.note}</p>
                </div>
              </article>
            );
          })}
        </div>

        <p className="dm2026-card-soft provider-onboarding-pricing-note">{copy.disclaimer}</p>
      </div>
    </section>
  );
}
