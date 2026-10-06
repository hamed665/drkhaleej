import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const globals = readFileSync(new URL('../../styles/globals.css', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../../styles/dm2026-foundation.css', import.meta.url), 'utf8');

describe('premium public design foundation', () => {
  it('keeps one canonical dm token system with bilingual typography tokens', () => {
    expect(globals).toContain('--dm-font-display:');
    expect(globals).toContain('--dm-font-arabic-display:');
    expect(globals).toContain('--dm-surface-muted:');
    expect(globals).toContain('--dm-border-strong:');
    expect(globals).not.toMatch(/@import\s+url\(/i);
  });

  it('exposes the required primitive variants without a new design-system prefix', () => {
    expect(globals).toContain('.ui-button--accent');
    expect(globals).toContain('.ui-card--interactive');
    expect(globals).toContain('.ui-card--editorial');
    expect(globals).toContain('.ui-badge--premium');
    expect(globals).toContain('.ui-chip');
    expect(globals).toContain('.ui-section-header');
    expect(foundation).toContain('.dm2026-card-interactive');
    expect(foundation).not.toContain('dm2027-');
  });

  it('keeps RTL and reduced-motion behavior in the shared foundation', () => {
    expect(globals).toContain("[dir='rtl'] :where(h1, h2, h3, h4)");
    expect(globals).toContain('@media (prefers-reduced-motion: reduce)');
    expect(foundation).toContain('@media (prefers-reduced-motion: reduce)');
    expect(foundation.indexOf('@media (prefers-reduced-motion: reduce)')).toBeGreaterThan(
      foundation.indexOf('@media (hover: hover) and (pointer: fine)')
    );
    expect(foundation).toContain('.dm2026-media-frame--editorial');
  });
});
