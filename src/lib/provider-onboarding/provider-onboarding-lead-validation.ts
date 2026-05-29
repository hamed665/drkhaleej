export type ProviderOnboardingLeadProviderType =
  | 'clinic'
  | 'medical_center'
  | 'dental_clinic'
  | 'pharmacy'
  | 'lab'
  | 'wellness'
  | 'other';

export type NormalizedProviderOnboardingLeadPayload = {
  centerName: string;
  contactName: string;
  phone: string;
  email: string | null;
  whatsapp: string | null;
  providerType: ProviderOnboardingLeadProviderType;
  areaText: string | null;
  cityText: string | null;
  preferredLanguage: string | null;
  message: string | null;
  locale: 'en' | 'ar';
  countryCode: 'om';
  consentToContact: true;
  requestSource: 'for_providers_page';
};

export type ProviderOnboardingLeadValidationErrorReason =
  | 'invalid_request'
  | 'invalid_center_name'
  | 'invalid_contact_name'
  | 'invalid_phone'
  | 'invalid_email'
  | 'invalid_whatsapp'
  | 'invalid_provider_type'
  | 'invalid_area_text'
  | 'invalid_city_text'
  | 'invalid_preferred_language'
  | 'invalid_message'
  | 'invalid_locale'
  | 'invalid_country_code'
  | 'invalid_consent'
  | 'spam';

export type ProviderOnboardingLeadValidationResult =
  | { ok: true; value: NormalizedProviderOnboardingLeadPayload }
  | { ok: false; reason: ProviderOnboardingLeadValidationErrorReason; status: 400 | 202 };

const HTML_LIKE_TAG_REGEX = /<[^>]+>/;
const PHONE_SAFE_REGEX = /^[\d\s+\-()]+$/;
const EMAIL_BASIC_REGEX = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

const ALLOWED_PROVIDER_TYPES = new Set<ProviderOnboardingLeadProviderType>([
  'clinic',
  'medical_center',
  'dental_clinic',
  'pharmacy',
  'lab',
  'wellness',
  'other'
]);

type ProviderOnboardingLeadInputRecord = Record<string, unknown>;

function isRecord(input: unknown): input is ProviderOnboardingLeadInputRecord {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function normalizeString(value: string): string {
  return value.normalize('NFKC').trim();
}

function normalizeRequiredPlainText(value: unknown, minLength: number, maxLength: number): string | null {
  if (typeof value !== 'string') return null;

  const normalized = normalizeString(value);
  if (normalized.length < minLength || normalized.length > maxLength) return null;
  if (HTML_LIKE_TAG_REGEX.test(normalized)) return null;

  return normalized;
}

function normalizeOptionalPlainText(value: unknown, minLength: number, maxLength: number): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return undefined;

  const normalized = normalizeString(value);
  if (normalized.length === 0) return null;
  if (normalized.length < minLength || normalized.length > maxLength) return undefined;
  if (HTML_LIKE_TAG_REGEX.test(normalized)) return undefined;

  return normalized;
}

function normalizeOptionalMessage(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return undefined;

  const normalized = normalizeString(value);
  if (normalized.length === 0) return null;
  if (normalized.length > 1000) return undefined;
  if (HTML_LIKE_TAG_REGEX.test(normalized)) return undefined;

  return normalized;
}

function normalizeRequiredPhone(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const normalized = normalizeString(value);
  if (normalized.length < 6 || normalized.length > 32) return null;
  if (!PHONE_SAFE_REGEX.test(normalized)) return null;

  return normalized;
}

function normalizeOptionalPhone(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return undefined;

  const normalized = normalizeString(value);
  if (normalized.length === 0) return null;
  if (normalized.length < 6 || normalized.length > 32) return undefined;
  if (!PHONE_SAFE_REGEX.test(normalized)) return undefined;

  return normalized;
}

function normalizeOptionalEmail(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return undefined;

  const normalized = normalizeString(value).toLowerCase();
  if (normalized.length === 0) return null;
  if (normalized.length < 5 || normalized.length > 254) return undefined;
  if (!EMAIL_BASIC_REGEX.test(normalized)) return undefined;

  return normalized;
}

function normalizeProviderType(value: unknown): ProviderOnboardingLeadProviderType | null {
  if (value === undefined || value === null) return 'other';
  if (typeof value !== 'string') return null;

  const normalized = normalizeString(value);
  if (!ALLOWED_PROVIDER_TYPES.has(normalized as ProviderOnboardingLeadProviderType)) return null;

  return normalized as ProviderOnboardingLeadProviderType;
}

export function validateProviderOnboardingLeadPayload(input: unknown): ProviderOnboardingLeadValidationResult {
  if (!isRecord(input)) return { ok: false, reason: 'invalid_request', status: 400 };

  if (input.honeypot !== undefined && input.honeypot !== null && typeof input.honeypot !== 'string') {
    return { ok: false, reason: 'invalid_request', status: 400 };
  }

  const honeypot = typeof input.honeypot === 'string' ? normalizeString(input.honeypot) : '';
  if (honeypot.length > 0) return { ok: false, reason: 'spam', status: 202 };

  const centerName = normalizeRequiredPlainText(input.centerName, 2, 160);
  if (centerName === null) return { ok: false, reason: 'invalid_center_name', status: 400 };

  const contactName = normalizeRequiredPlainText(input.contactName, 2, 120);
  if (contactName === null) return { ok: false, reason: 'invalid_contact_name', status: 400 };

  const phone = normalizeRequiredPhone(input.phone);
  if (phone === null) return { ok: false, reason: 'invalid_phone', status: 400 };

  const email = normalizeOptionalEmail(input.email);
  if (email === undefined) return { ok: false, reason: 'invalid_email', status: 400 };

  const whatsapp = normalizeOptionalPhone(input.whatsapp);
  if (whatsapp === undefined) return { ok: false, reason: 'invalid_whatsapp', status: 400 };

  const providerType = normalizeProviderType(input.providerType);
  if (providerType === null) return { ok: false, reason: 'invalid_provider_type', status: 400 };

  const areaText = normalizeOptionalPlainText(input.areaText, 2, 120);
  if (areaText === undefined) return { ok: false, reason: 'invalid_area_text', status: 400 };

  const cityText = normalizeOptionalPlainText(input.cityText, 2, 120);
  if (cityText === undefined) return { ok: false, reason: 'invalid_city_text', status: 400 };

  const preferredLanguage = normalizeOptionalPlainText(input.preferredLanguage, 2, 40);
  if (preferredLanguage === undefined) return { ok: false, reason: 'invalid_preferred_language', status: 400 };

  const message = normalizeOptionalMessage(input.message);
  if (message === undefined) return { ok: false, reason: 'invalid_message', status: 400 };

  if (input.locale !== 'en' && input.locale !== 'ar') return { ok: false, reason: 'invalid_locale', status: 400 };
  if (input.countryCode !== 'om') return { ok: false, reason: 'invalid_country_code', status: 400 };
  if (input.consentToContact !== true) return { ok: false, reason: 'invalid_consent', status: 400 };

  return {
    ok: true,
    value: {
      centerName,
      contactName,
      phone,
      email,
      whatsapp,
      providerType,
      areaText,
      cityText,
      preferredLanguage,
      message,
      locale: input.locale,
      countryCode: input.countryCode,
      consentToContact: true,
      requestSource: 'for_providers_page'
    }
  };
}
