'use client';

import { useEffect, useState } from 'react';
import type { SupportedLocale } from '@/lib/i18n/config';
import { localeDirection } from '@/lib/i18n/config';
import type { Home2026Copy } from '@/components/public-2026/home/HomeCopy2026';
import { drMuscatSupportWhatsAppUrl } from '@/components/public-2026/home/support-contact-2026';

type FloatingActions2026Props = {
  locale: SupportedLocale;
  copy: Home2026Copy['floating'];
};

type OpenPanel = 'ai' | null;

export function FloatingActions2026({ locale, copy }: FloatingActions2026Props) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const dir = localeDirection(locale);
  const sideClass = dir === 'rtl' ? 'left-4' : 'right-4';
  const whatsappHref = drMuscatSupportWhatsAppUrl(locale);

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
        <section className="dm2026-floating-panel" aria-live="polite" role="dialog" aria-label={copy.aiTitle}>
          <button type="button" className="dm2026-floating-close" onClick={() => setOpenPanel(null)} aria-label={copy.close}>
            ×
          </button>
          <div className="grid gap-3">
            <h2>{copy.aiTitle}</h2>
            <p>{copy.aiBody}</p>
            <button type="button" className="dm2026-floating-link dm2026-floating-link--primary" onClick={() => setOpenPanel(null)}>{copy.close}</button>
            <p className="dm2026-floating-disclaimer">{copy.disclaimer}</p>
          </div>
        </section>
      ) : null}

      <a className="dm2026-floating-button dm2026-floating-button--whatsapp" href={whatsappHref} target="_blank" rel="noreferrer" aria-label={copy.whatsapp}>
        <span aria-hidden="true">☘</span>
        {copy.whatsapp}
      </a>
      <button type="button" className="dm2026-floating-button dm2026-floating-button--ai" onClick={() => setOpenPanel(openPanel === 'ai' ? null : 'ai')} aria-expanded={openPanel === 'ai'} aria-label={copy.ai}>
        <span aria-hidden="true">✦</span>
        {copy.ai}
      </button>
    </div>
  );
}
