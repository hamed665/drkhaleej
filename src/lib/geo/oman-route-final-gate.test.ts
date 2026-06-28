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

  it('keeps the manual gate chain covered by the final gate', () => {
    const finalGate = readText('scripts/seo/check-location-candidate-route-readiness-final-gate.mjs');

    expect(finalGate).toContain(['location-candidate-manual', '-gate-contract.ts'].join(''));
    expect(finalGate).toContain(['oman-location-candidate-manual', '-gate.ts'].join(''));
    expect(finalGate).toContain(['oman-location-candidate-manual', '-gate.test.ts'].join(''));
    expect(finalGate).toContain(['check-location-candidate-manual', '-gate-integration.mjs'].join(''));
    expect(finalGate).toContain('candidate-manual-gate-contract-only');
    expect(finalGate).toContain('candidate-manual-gate-runtime-disabled');
    expect(finalGate).toContain('seo:location-candidate-manual-gate-integration:validate');
  });
});
