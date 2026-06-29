import { describe, expect, it } from 'vitest';

import { recordPublicFormAction } from './public-form-action';

describe('recordPublicFormAction', () => {
  it('records provider form context as a provider form submit action', () => {
    expect(recordPublicFormAction({ kind: 'provider', locale: 'en', country: 'om' })).toEqual({
      ok: true,
      payload: {
        name: 'provider_form_submit',
        locale: 'en',
        country: 'om',
        routeFamily: 'provider_onboarding',
      },
      mode: 'local_only',
    });
  });

  it('records contact form context as a contact form submit action', () => {
    expect(recordPublicFormAction({ kind: 'contact', locale: 'ar', country: 'om' })).toEqual({
      ok: true,
      payload: {
        name: 'contact_form_submit',
        locale: 'ar',
        country: 'om',
        routeFamily: 'directory',
      },
      mode: 'local_only',
    });
  });
});
