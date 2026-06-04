'use client';

import { useEffect, useState } from 'react';
import type { SupportedLocale } from '@/lib/i18n/config';
import { localeDirection } from '@/lib/i18n/config';
import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';

type FloatingActions2026Props = {
  locale: SupportedLocale;
  copy: Home2026Copy['floating'];
};

type OpenPanel = 'whatsapp' | 'ai' | null;

export function FloatingActions2026({ locale, copy }: FloatingActions2026Props) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const dir = localeDirection(locale);
  const sideClass = dir === 'rtl' ? 'left-4' : 'right-4';

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPanel(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className={`dm2026-floating fixed bottom-4 z-30 grid gap-2 ${sideClass}`} dir={dir}>
      {openPanel ? (
        <section className="dm2026-floating-panel" aria-live="polite">
          <button type="button" className="dm2026-floating-close" onClick={() => setOpenPanel(null)} aria-label={copy.close}>
            ×
          </button>
          {openPanel === 'whatsapp' ? (
            <div className="grid gap-3">
              <h2>{copy.whatsappTitle}</h2>
              <p>{copy.whatsappBody}</p>
              <a
                href="https://wa.me/?text=DrMuscat%20support%20preview"
                target="_blank"
                rel="noreferrer"
                className="dm2026-floating-link dm2026-floating-link--whatsapp"
              >
                {copy.whatsappCta}
              </a>
            </div>
          ) : (
            <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
              <h2>{copy.aiTitle}</h2>
              <p>{copy.aiBody}</p>
              <textarea className="dm2026-floating-textarea" rows={3} placeholder={copy.aiPlaceholder} />
              <div className="flex flex-wrap gap-2">
                <button type="submit" className="dm2026-floating-link dm2026-floating-link--primary">{copy.send}</button>
                <button type="button" className="dm2026-floating-link" onClick={() => setOpenPanel(null)}>{copy.close}</button>
              </div>
              <p className="dm2026-floating-disclaimer">{copy.disclaimer}</p>
            </form>
          )}
        </section>
      ) : null}

      <button type="button" className="dm2026-floating-button dm2026-floating-button--whatsapp" onClick={() => setOpenPanel(openPanel === 'whatsapp' ? null : 'whatsapp')} aria-expanded={openPanel === 'whatsapp'}>
        {copy.whatsapp}
      </button>
      <button type="button" className="dm2026-floating-button dm2026-floating-button--ai" onClick={() => setOpenPanel(openPanel === 'ai' ? null : 'ai')} aria-expanded={openPanel === 'ai'}>
        {copy.ai}
      </button>
    </div>
  );
}
