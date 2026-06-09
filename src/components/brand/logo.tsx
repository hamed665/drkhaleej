import Image from 'next/image';
import type { HTMLAttributes } from 'react';

type LogoVariant = 'full' | 'compact';

type LogoProps = HTMLAttributes<HTMLDivElement> & {
  variant?: LogoVariant;
  /**
   * Future-ready visual slot for an admin/CMS-provided logo asset.
   * This component does not fetch, upload, or persist logo images.
   */
  imageSrc?: string;
  imageAlt?: string;
};

const DEFAULT_LOGO_MARK_SRC = '/brand/drmuscat-logo-mark.svg';

export function Logo({ variant = 'full', className, imageSrc, imageAlt, ...props }: LogoProps) {
  const accessibleName = imageAlt ?? 'DrMuscat';
  const classes = ['dm-logo', 'dm-logo--has-image', className].filter(Boolean).join(' ');
  const markSrc = imageSrc ?? DEFAULT_LOGO_MARK_SRC;

  return (
    <div className={classes} {...props}>
      <span className="dm-logo__mark" aria-hidden="true">
        <Image src={markSrc} alt="" width={44} height={44} sizes="44px" className="dm-logo__image" priority={false} />
      </span>
      {variant === 'full' ? <span className="dm-logo__wordmark" aria-hidden="true">DrMuscat</span> : null}
      <span className="sr-only">{accessibleName}</span>
    </div>
  );
}
