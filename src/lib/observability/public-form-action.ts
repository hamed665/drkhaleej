import {
  recordPublicAction,
  type RecordPublicActionResult,
} from './public-action';
import type { PublicActionPayloadInput } from './public-action-names';

export type PublicFormActionKind = 'provider' | 'contact';

export type PublicFormActionContext = Readonly<{
  kind: PublicFormActionKind;
  locale?: 'en' | 'ar';
  country?: 'om';
}>;

const formActionByKind = {
  provider: 'provider_form_submit',
  contact: 'contact_form_submit',
} as const satisfies Record<PublicFormActionKind, PublicActionPayloadInput['name']>;

const routeFamilyByKind = {
  provider: 'provider_onboarding',
  contact: 'directory',
} as const satisfies Record<PublicFormActionKind, NonNullable<PublicActionPayloadInput['routeFamily']>>;

export function recordPublicFormAction(context: PublicFormActionContext): RecordPublicActionResult {
  return recordPublicAction({
    name: formActionByKind[context.kind],
    routeFamily: routeFamilyByKind[context.kind],
    ...(context.locale === undefined ? {} : { locale: context.locale }),
    ...(context.country === undefined ? {} : { country: context.country }),
  });
}
