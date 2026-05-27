'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

type SiteHeaderClientProps = {
  children: ReactNode;
};

export function SiteHeaderClient({ children }: SiteHeaderClientProps) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      requestAnimationFrame(() => {
        setIsCompact(window.scrollY > 24);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className={isCompact ? 'site-header-client site-header-client--compact' : 'site-header-client'}>{children}</div>
  );
}
