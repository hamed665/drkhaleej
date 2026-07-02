import { describe, expect, it } from 'vitest';

import {
  buildPublicContactActions,
  normalizePublicEmailHref,
  normalizePublicWebsiteHref,
  normalizePublicWhatsAppDigits,
} from './public-contact';

describe('public contact actions', () => {
  it('builds approved visible public contact actions in deterministic order', () => {
    const actions = buildPublicContactActions({
      contactReviewStatus: 'approved',
      country: 'om',
      primaryPhone: '+968 24 123456',
      whatsappPhone: '91234567',
      email: 'info@example.com',
      websiteUrl: 'example.com',
      publicPrimaryPhoneVisible: true,
      publicWhatsappPhoneVisible: true,
      publicEmailVisible: true,
    });

    expect(actions.map((action) => action.kind)).toEqual(['call', 'whatsapp', 'email', 'website']);
    expect(actions.map((action) => action.href)).toEqual([
      'tel:+96824123456',
      'https://wa.me/96891234567',
      'mailto:info@example.com',
      'https://example.com/',
    ]);
  });

  it('keeps unapproved, hidden, and malformed public contact values out of public actions', () => {
    expect(
      buildPublicContactActions({
        contactReviewStatus: 'pending_review',
        email: 'info@example.com',
        websiteUrl: 'https://example.com',
        publicEmailVisible: true,
      }),
    ).toEqual([]);

    expect(
      buildPublicContactActions({
        contactReviewStatus: 'approved',
        email: 'info@example.com',
        websiteUrl: 'https://example.com',
        publicEmailVisible: false,
      }).map((action) => action.kind),
    ).toEqual(['website']);
  });

  it('normalizes safe email, website, and Oman WhatsApp values', () => {
    expect(normalizePublicEmailHref('INFO@example.com')).toBe('mailto:INFO@example.com');
    expect(normalizePublicWebsiteHref('https://example.com/contact')).toBe('https://example.com/contact');
    expect(normalizePublicWebsiteHref('example.com')).toBe('https://example.com/');
    expect(normalizePublicWhatsAppDigits('91234567', 'om')).toBe('96891234567');
  });

  it('rejects unsafe public email and website values', () => {
    const scriptScheme = ['java', 'script:alert(1)'].join('');
    const dataScheme = ['da', 'ta:text/html,unsafe'].join('');

    expect(normalizePublicEmailHref('bad email@example.com')).toBeNull();
    expect(normalizePublicEmailHref('info@example')).toBeNull();
    expect(normalizePublicWebsiteHref(scriptScheme)).toBeNull();
    expect(normalizePublicWebsiteHref(dataScheme)).toBeNull();
    expect(normalizePublicWebsiteHref('https://user:pass@example.com')).toBeNull();
  });
});
