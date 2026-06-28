import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

function readJson(path: string): { scripts: Record<string, string> } {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf8')) as { scripts: Record<string, string> };
}

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

describe('final route gate wiring', () => {
  it('keeps the final gate in the seo check chain', () => {
    const packageJson = readJson('package.json');
    const scriptName = ['seo:location', 'candidate', 'route', 'readiness', 'final:validate'].join('-');
    const scriptFile = ['scripts/seo/check-location', 'candidate-route-readiness-final-gate.mjs'].join('-');

    expect(packageJson.scripts[scriptName]).toBe(`node ${scriptFile}`);
    expect(packageJson.scripts['seo:check']).toContain(`pnpm ${scriptName}`);
  });

  it('keeps the added chain covered by the final gate', () => {
    const finalGate = readText('scripts/seo/check-location-candidate-route-readiness-final-gate.mjs');

    const requiredTokens = [
      'manualGateContract',
      'manualGateRuntime',
      'manualGateTest',
      'manualGateIntegration',
      'location-candidate-manual',
      '-gate-contract.ts',
      '-gate.ts',
      '-gate.test.ts',
      '-gate-integration.mjs',
      'candidate-manual-gate-contract-only',
      'candidate-manual-gate-runtime-disabled',
      'seo:location-candidate-manual-gate-integration:validate',
    ];

    for (const token of requiredTokens) {
      expect(finalGate).toContain(token);
    }
  });
});
