export type PublicContactActionKind = 'call' | 'whatsapp';

export type PublicContactAction = {
  kind: PublicContactActionKind;
  href: string;
  labelEn: string;
  labelAr: string;
  ariaLabelEn: string;
  ariaLabelAr: string;
};

type PublicContactCountry = 'om' | (string & {});

type PublicContactActionLabels = {
  callEn?: string | undefined;
  callAr?: string | undefined;
  whatsappEn?: string | undefined;
  whatsappAr?: string | undefined;
};

type PublicContactSource = PublicContactActionLabels & {
  contactReviewStatus?: string | null;
  country?: PublicContactCountry | null;
  primaryPhone?: string | null;
  secondaryPhone?: string | null;
  whatsappPhone?: string | null;
  publicPrimaryPhoneVisible?: boolean | null;
  publicSecondaryPhoneVisible?: boolean | null;
  publicWhatsappPhoneVisible?: boolean | null;
};

export type PublicContactVisibilityInput = {
  contactReviewStatus?: string | null | undefined;
  isVisible?: boolean | null | undefined;
  locationActive?: boolean | null | undefined;
  providerPublicEligible?: boolean | null | undefined;
  value?: string | null | undefined;
};

const DEFAULT_CALL_LABEL_EN = 'Call center';
const DEFAULT_CALL_LABEL_AR = 'الاتصال بالمركز';
const DEFAULT_WHATSAPP_LABEL_EN = 'WhatsApp center';
const DEFAULT_WHATSAPP_LABEL_AR = 'واتساب المركز';
const VISUAL_PHONE_SEPARATORS = /[\s+\-().\u00a0\u2000-\u200d\u202f\u2060]/g;

function stripPublicPhoneSeparators(value: string): string {
  return value.normalize('NFKC').trim().replace(VISUAL_PHONE_SEPARATORS, '');
}

type ResolvedPublicContactActionLabels = {
  callEn: string;
  callAr: string;
  whatsappEn: string;
  whatsappAr: string;
};

function createPublicContactAction(
  kind: PublicContactActionKind,
  href: string,
  labels: ResolvedPublicContactActionLabels
): PublicContactAction {
  const labelEn = kind === 'call' ? labels.callEn : labels.whatsappEn;
  const labelAr = kind === 'call' ? labels.callAr : labels.whatsappAr;

  return {
    kind,
    href,
    labelEn,
    labelAr,
    ariaLabelEn: labelEn,
    ariaLabelAr: labelAr
  };
}

function resolvePublicContactLabels(labels: PublicContactActionLabels = {}): ResolvedPublicContactActionLabels {
  return {
    callEn: labels.callEn ?? DEFAULT_CALL_LABEL_EN,
    callAr: labels.callAr ?? DEFAULT_CALL_LABEL_AR,
    whatsappEn: labels.whatsappEn ?? DEFAULT_WHATSAPP_LABEL_EN,
    whatsappAr: labels.whatsappAr ?? DEFAULT_WHATSAPP_LABEL_AR
  };
}

function hasPublicContactValue(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isApprovedPublicContact(contactReviewStatus: string | null | undefined): boolean {
  return contactReviewStatus === 'approved';
}

export function isPublicContactVisible(input: PublicContactVisibilityInput): boolean {
  if (input.providerPublicEligible === false) return false;
  if (input.locationActive === false) return false;
  if (input.isVisible !== true) return false;
  if (!hasPublicContactValue(input.value)) return false;

  return isApprovedPublicContact(input.contactReviewStatus);
}

export function normalizePublicTelHref(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmedValue = value.normalize('NFKC').trim();
  if (!trimmedValue) return null;

  const hasLeadingPlus = trimmedValue.startsWith('+');
  const strippedValue = stripPublicPhoneSeparators(trimmedValue);
  const normalizedValue = hasLeadingPlus ? `+${strippedValue.replace(/^\+/, '')}` : strippedValue;

  if (!/^\+?\d{6,15}$/.test(normalizedValue)) return null;

  return `tel:${normalizedValue}`;
}

export function normalizePublicWhatsAppDigits(
  value: string | null | undefined,
  country: PublicContactCountry | null | undefined
): string | null {
  if (!value) return null;

  const digits = stripPublicPhoneSeparators(value);
  if (!/^\d{8,15}$/.test(digits)) return null;

  if (country === 'om' && /^[79]\d{7}$/.test(digits)) {
    return `968${digits}`;
  }

  return digits;
}

export function buildPublicCallAction(
  value: string | null | undefined,
  isVisible: boolean | null | undefined,
  contactReviewStatus: string | null | undefined,
  labels?: PublicContactActionLabels
): PublicContactAction | null {
  if (!isPublicContactVisible({ contactReviewStatus, isVisible, value })) return null;

  const href = normalizePublicTelHref(value);
  if (!href) return null;

  return createPublicContactAction('call', href, resolvePublicContactLabels(labels));
}

export function buildPublicWhatsAppAction(
  value: string | null | undefined,
  isVisible: boolean | null | undefined,
  contactReviewStatus: string | null | undefined,
  country: PublicContactCountry | null | undefined,
  labels?: PublicContactActionLabels
): PublicContactAction | null {
  if (!isPublicContactVisible({ contactReviewStatus, isVisible, value })) return null;

  const digits = normalizePublicWhatsAppDigits(value, country);
  if (!digits) return null;

  return createPublicContactAction('whatsapp', `https://wa.me/${digits}`, resolvePublicContactLabels(labels));
}

export function buildPublicContactActions(source: PublicContactSource): PublicContactAction[] {
  if (!isApprovedPublicContact(source.contactReviewStatus)) return [];

  const labels = resolvePublicContactLabels({
    callEn: source.callEn,
    callAr: source.callAr,
    whatsappEn: source.whatsappEn,
    whatsappAr: source.whatsappAr
  });

  const candidates = [
    buildPublicCallAction(source.primaryPhone, source.publicPrimaryPhoneVisible, source.contactReviewStatus, labels),
    buildPublicCallAction(source.secondaryPhone, source.publicSecondaryPhoneVisible, source.contactReviewStatus, labels),
    buildPublicWhatsAppAction(source.whatsappPhone, source.publicWhatsappPhoneVisible, source.contactReviewStatus, source.country, labels)
  ];

  const seenActions = new Set<string>();
  const actions: PublicContactAction[] = [];

  for (const action of candidates) {
    if (!action) continue;
    const actionKey = `${action.kind}:${action.href}`;
    if (seenActions.has(actionKey)) continue;
    seenActions.add(actionKey);
    actions.push(action);
  }

  return actions;
}
