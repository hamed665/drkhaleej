import {
  isPublicActionPayload,
  type PublicActionPayload,
  type PublicActionPayloadInput,
} from './public-action-names';

export type PublicActionResult = Readonly<
  | {
      ok: true;
      payload: PublicActionPayload;
      mode: 'local_only';
    }
  | {
      ok: false;
      reason: 'invalid_payload';
      mode: 'local_only';
    }
>;

export function createPublicActionResult(input: PublicActionPayloadInput): PublicActionResult {
  if (!isPublicActionPayload(input)) {
    return {
      ok: false,
      reason: 'invalid_payload',
      mode: 'local_only',
    };
  }

  return {
    ok: true,
    payload: input,
    mode: 'local_only',
  };
}
