import { describe, expect, it } from 'vitest';

import {
  buildPublicContactActions,
  normalizePublicEmailHref,
  normalizePublicWebsiteHref,
} from './public-contact';

describe('public contact actions', () => {
  it('builds reviewed visible email and website actions with neutral labels', () => {
    const actions = buildPublicContactActions({
      contactReviewStatus: 'approved',
      country: 'om',
      primaryPhone: '+968 2412 3456',
      whatsappPhone: '91234567',
      email: 'INFO@EXAMPLE.COM',
      websiteUrl: 'example.com',
      publicPrimaryPhoneVisible: true,
      publicWhatsappPhoneVisible: true,
      publicEmailVisible: true,
    });

    expect(actions.map((action) => action.kind)).toEqual(['call', 'whatsapp', 'email', 'website']);
    expect(actions.find((action) => action.kind === 'email')?.href).toBe('mailto:info@example.com');
    expect(actions.find((action) => action.kind === 'website')?.href).toBe('https://example.com/');
    expect(actions.find((action) => action.kind === 'email')?.labelEn).toBe('Email center');
    expect(actions.find((action) => action.kind === 'website')?.labelEn).toBe('Visit website');
  });

  it('keeps email hidden until the reviewed visibility flag is true', () => {
    const actions = buildPublicContactActions({
      contactReviewStatus: 'approved',
      email: 'info@example.com',
      publicEmailVisible: false,
    });

    expect(actions).toEqual([]);
  });

  it('blocks all actions before contact review approval', () => {
    const actions = buildPublicContactActions({
      contactReviewStatus: 'pending',
      primaryPhone: '+968 2412 3456',
      whatsappPhone: '91234567',
      email: 'info@example.com',
      websiteUrl: 'https://example.com',
      publicPrimaryPhoneVisible: true,
      publicWhatsappPhoneVisible: true,
      publicEmailVisible: true,
    });

    expect(actions).toEqual([]);
  });

  it('normalizes only safe public email and website hrefs', () => {
    expect(normalizePublicEmailHref(' info@example.com ')).toBe('mailto:info@example.com');
    expect(normalizePublicEmailHref('not-an-email')).toBeNull();
    expect(normalizePublicWebsiteHref('example.com')).toBe('https://example.com/');
    expect(normalizePublicWebsiteHref('ftp://example.com')).toBeNull();
  });
});
