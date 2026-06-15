'use client';

import { FormEvent, useId, useState } from 'react';

import type { SupportedLocale } from '@/lib/i18n/config';
import type { ProviderOnboardingLeadProviderType } from '@/lib/provider-onboarding/provider-onboarding-lead-validation';

type ProviderFormCopy = {
  title: string;
  description: string;
  labels: {
    centerName: string;
    contactName: string;
    phone: string;
    whatsapp: string;
    email: string;
    providerType: string;
    cityText: string;
    areaText: string;
    preferredLanguage: string;
    message: string;
    consent: string;
    honeypot: string;
  };
  placeholders: {
    centerName: string;
    contactName: string;
    phone: string;
    whatsapp: string;
    email: string;
    providerType: string;
    cityText: string;
    areaText: string;
    preferredLanguage: string;
    message: string;
  };
  providerTypeOptions: readonly { value: ProviderOnboardingLeadProviderType; label: string }[];
  cityOptions: readonly string[];
  languageOptions: readonly { value: string; label: string }[];
  submit: string;
  submitting: string;
  success: string;
  error: string;
  requiredNote: string;
};

type ProviderOnboardingFormProps = {
  locale: SupportedLocale;
  copy: ProviderFormCopy;
};

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

type ProviderOnboardingLeadApiResponse =
  | { ok: true; message?: string }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

function stringValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export function ProviderOnboardingForm({ locale, copy }: ProviderOnboardingFormProps) {
  const formId = useId();
  const [status, setStatus] = useState<FormStatus>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === 'submitting') return;

    const form = event.currentTarget;
    setStatus('submitting');

    const formData = new FormData(form);
    const payload = {
      centerName: stringValue(formData, 'centerName'),
      contactName: stringValue(formData, 'contactName'),
      phone: stringValue(formData, 'phone'),
      whatsapp: stringValue(formData, 'whatsapp'),
      email: stringValue(formData, 'email'),
      providerType: stringValue(formData, 'providerType'),
      cityText: stringValue(formData, 'cityText'),
      areaText: stringValue(formData, 'areaText'),
      preferredLanguage: stringValue(formData, 'preferredLanguage'),
      message: stringValue(formData, 'message'),
      honeypot: stringValue(formData, 'website'),
      locale,
      countryCode: 'om',
      consentToContact: formData.get('consentToContact') === 'on'
    };

    try {
      const response = await fetch('/api/provider-onboarding-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let responseBody: ProviderOnboardingLeadApiResponse | null = null;

      try {
        responseBody = (await response.json()) as ProviderOnboardingLeadApiResponse;
      } catch {
        responseBody = null;
      }

      if (!response.ok || responseBody?.ok !== true) {
        setStatus('error');
        return;
      }

      form.reset();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form className="dm2026-card-glass provider-onboarding-form" onSubmit={handleSubmit} aria-describedby={`${formId}-note ${formId}-status`}>
      <div className="provider-onboarding-form__intro">
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
        <span id={`${formId}-note`}>{copy.requiredNote}</span>
      </div>

      <div className="provider-onboarding-form__grid">
        <label>
          <span>{copy.labels.centerName}</span>
          <input className="dm2026-input" name="centerName" type="text" required minLength={2} maxLength={160} placeholder={copy.placeholders.centerName} autoComplete="organization" />
        </label>
        <label>
          <span>{copy.labels.contactName}</span>
          <input className="dm2026-input" name="contactName" type="text" required minLength={2} maxLength={120} placeholder={copy.placeholders.contactName} autoComplete="name" />
        </label>
        <label>
          <span>{copy.labels.phone}</span>
          <input className="dm2026-input" name="phone" type="tel" required minLength={6} maxLength={32} placeholder={copy.placeholders.phone} autoComplete="tel" />
        </label>
        <label>
          <span>{copy.labels.whatsapp}</span>
          <input className="dm2026-input" name="whatsapp" type="tel" minLength={6} maxLength={32} placeholder={copy.placeholders.whatsapp} autoComplete="tel" />
        </label>
        <label>
          <span>{copy.labels.email}</span>
          <input className="dm2026-input" name="email" type="email" maxLength={254} placeholder={copy.placeholders.email} autoComplete="email" />
        </label>
        <label>
          <span>{copy.labels.providerType}</span>
          <select className="dm2026-select" name="providerType" required defaultValue="">
            <option value="" disabled>
              {copy.placeholders.providerType}
            </option>
            {copy.providerTypeOptions.map((option) => (
              <option key={`${option.value}-${option.label}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{copy.labels.cityText}</span>
          <select className="dm2026-select" name="cityText" required defaultValue="" autoComplete="address-level2">
            <option value="" disabled>
              {copy.placeholders.cityText}
            </option>
            {copy.cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{copy.labels.areaText}</span>
          <input className="dm2026-input" name="areaText" type="text" minLength={2} maxLength={120} placeholder={copy.placeholders.areaText} autoComplete="address-level3" />
        </label>
        <label>
          <span>{copy.labels.preferredLanguage}</span>
          <select className="dm2026-select" name="preferredLanguage" required defaultValue="">
            <option value="" disabled>
              {copy.placeholders.preferredLanguage}
            </option>
            {copy.languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="provider-onboarding-form__message">
        <span>{copy.labels.message}</span>
        <textarea className="dm2026-input" name="message" maxLength={1000} rows={5} placeholder={copy.placeholders.message} />
      </label>

      <label className="provider-onboarding-form__consent">
        <input name="consentToContact" type="checkbox" required />
        <span>{copy.labels.consent}</span>
      </label>

      <label className="provider-onboarding-form__website" aria-hidden="true">
        <span>{copy.labels.honeypot}</span>
        <input className="dm2026-input" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      <button className="dm2026-button dm2026-button-primary provider-onboarding-form__submit" type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? copy.submitting : copy.submit}
      </button>

      <p id={`${formId}-status`} className={`provider-onboarding-form__status provider-onboarding-form__status--${status}`} role="status" aria-live="polite">
        {status === 'success' ? copy.success : null}
        {status === 'error' ? copy.error : null}
      </p>
    </form>
  );
}

export type { ProviderFormCopy };
