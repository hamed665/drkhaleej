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

export function Logo({ variant = 'full', className, imageSrc, imageAlt, ...props }: LogoProps) {
  const hasImage = Boolean(imageSrc);
  const accessibleName = imageAlt ?? 'DrMuscat';
  const classes = ['dm-logo', hasImage ? 'dm-logo--has-image' : null, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      <span className="dm-logo__mark" aria-hidden="true">
        {hasImage ? <Image src={imageSrc ?? ''} alt="" fill sizes="44px" className="dm-logo__image" /> : 'DM'}
      </span>
      {variant === 'full' ? <span className="dm-logo__wordmark" aria-hidden="true">DrMuscat</span> : null}
      <span className="sr-only">{accessibleName}</span>
    </div>
  );
}
