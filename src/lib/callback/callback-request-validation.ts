export type NormalizedCallbackRequestInput = {
  centerId: string;
  centerLocationId: string | null;
  doctorId: string | null;
  doctorPracticeLocationId: string | null;
  requesterName: string;
  requesterPhone: string;
  preferredLanguage: string | null;
  message: string | null;
  locale: 'en' | 'ar';
  countryCode: 'om';
  consentToContact: true;
};

export type CallbackRequestValidationResult =
  | { ok: true; value: NormalizedCallbackRequestInput }
  | { ok: false; reason: 'invalid_request' | 'spam_detected' };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HTML_LIKE_TAG_REGEX = /<[^>]+>/;
const PHONE_VISUAL_SEPARATOR_REGEX = /[\s\u00a0\u200b\u200c\u200d\ufeff\-().]/g;
const NORMALIZED_PHONE_REGEX = /^\+?\d{6,15}$/;

type CallbackRequestInputRecord = Record<string, unknown>;

function isRecord(input: unknown): input is CallbackRequestInputRecord {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function normalizeRequiredText(value: unknown, minLength: number, maxLength: number): string | null {
  if (typeof value !== 'string') return null;

  const normalized = value.normalize('NFKC').trim();
  if (normalized.length < minLength || normalized.length > maxLength) return null;

  return normalized;
}

function normalizeOptionalText(value: unknown, minLength: number, maxLength: number): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return null;

  const normalized = value.normalize('NFKC').trim();
  if (normalized.length === 0) return null;
  if (normalized.length < minLength || normalized.length > maxLength) return null;

  return normalized;
}

function normalizeOptionalUuid(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return undefined;

  const normalized = value.normalize('NFKC').trim();
  if (normalized.length === 0) return null;
  if (!UUID_REGEX.test(normalized)) return undefined;

  return normalized;
}

function normalizeRequiredUuid(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const normalized = value.normalize('NFKC').trim();
  if (!UUID_REGEX.test(normalized)) return null;

  return normalized;
}

export function normalizeCallbackRequesterPhone(value: string): string | null {
  const trimmed = value.normalize('NFKC').trim();
  if (trimmed.length < 6 || trimmed.length > 32) return null;

  const hasLeadingPlus = trimmed.startsWith('+');
  const withoutLeadingPlus = hasLeadingPlus ? trimmed.slice(1) : trimmed;
  if (withoutLeadingPlus.includes('+')) return null;

  const digitsOnly = withoutLeadingPlus.replace(PHONE_VISUAL_SEPARATOR_REGEX, '');
  const normalized = `${hasLeadingPlus ? '+' : ''}${digitsOnly}`;

  if (!NORMALIZED_PHONE_REGEX.test(normalized)) return null;

  return normalized;
}

export function normalizeCallbackPlainText(value: unknown, maxLength: number): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return null;

  const normalized = value.normalize('NFKC').trim();
  if (normalized.length === 0) return null;
  if (normalized.length > maxLength) return null;
  if (HTML_LIKE_TAG_REGEX.test(normalized)) return null;

  return normalized;
}

export function validateCallbackRequestInput(input: unknown): CallbackRequestValidationResult {
  if (!isRecord(input)) return { ok: false, reason: 'invalid_request' };

  if (input.honeypot !== undefined && input.honeypot !== null && typeof input.honeypot !== 'string') {
    return { ok: false, reason: 'invalid_request' };
  }

  const honeypot = typeof input.honeypot === 'string' ? input.honeypot.normalize('NFKC').trim() : '';
  if (honeypot.length > 0) return { ok: false, reason: 'spam_detected' };

  const centerId = normalizeRequiredUuid(input.centerId);
  const centerLocationId = normalizeOptionalUuid(input.centerLocationId);
  const doctorId = normalizeOptionalUuid(input.doctorId);
  const doctorPracticeLocationId = normalizeOptionalUuid(input.doctorPracticeLocationId);
  const requesterName = normalizeRequiredText(input.requesterName, 2, 120);
  const requesterPhone = typeof input.requesterPhone === 'string' ? normalizeCallbackRequesterPhone(input.requesterPhone) : null;
  const preferredLanguage = normalizeOptionalText(input.preferredLanguage, 2, 40);
  const message = normalizeCallbackPlainText(input.message, 500);
  const countryCode = input.countryCode === undefined || input.countryCode === null ? 'om' : input.countryCode;

  if (
    centerId === null ||
    centerLocationId === undefined ||
    doctorId === undefined ||
    doctorPracticeLocationId === undefined ||
    requesterName === null ||
    requesterPhone === null ||
    (input.preferredLanguage !== undefined && input.preferredLanguage !== null && preferredLanguage === null) ||
    (input.message !== undefined && input.message !== null && message === null) ||
    (input.locale !== 'en' && input.locale !== 'ar') ||
    countryCode !== 'om' ||
    input.consentToContact !== true
  ) {
    return { ok: false, reason: 'invalid_request' };
  }

  return {
    ok: true,
    value: {
      centerId,
      centerLocationId,
      doctorId,
      doctorPracticeLocationId,
      requesterName,
      requesterPhone,
      preferredLanguage,
      message,
      locale: input.locale,
      countryCode,
      consentToContact: true
    }
  };
}
