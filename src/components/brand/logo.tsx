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

const DEFAULT_LOGO_LOCKUP_SRC = '/brand/drmuscat-logo-lockup.svg?v=final-20260610';
const DEFAULT_LOGO_MARK_SRC = '/brand/drmuscat-logo-mark.svg?v=final-20260610';

export function Logo({ variant = 'full', className, imageSrc, imageAlt, ...props }: LogoProps) {
  const accessibleName = imageAlt ?? 'DrMuscat';
  const isCompact = variant === 'compact';
  const classes = ['dm-logo', `dm-logo--${variant}`, 'dm-logo--has-image', className].filter(Boolean).join(' ');
  const logoSrc = imageSrc ?? (isCompact ? DEFAULT_LOGO_MARK_SRC : DEFAULT_LOGO_LOCKUP_SRC);
  const width = isCompact ? 44 : 180;
  const height = isCompact ? 44 : 45;

  return (
    <div
      className={classes}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        inlineSize: isCompact ? '44px' : '180px',
        blockSize: isCompact ? '44px' : '45px',
        overflow: 'visible',
        flexShrink: 0
      }}
      {...props}
    >
      <span
        className="dm-logo__mark"
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          inlineSize: isCompact ? '44px' : '180px',
          blockSize: isCompact ? '44px' : '45px',
          overflow: 'visible',
          flexShrink: 0
        }}
      >
        <Image
          src={logoSrc}
          alt=""
          width={width}
          height={height}
          sizes={isCompact ? '44px' : '180px'}
          className="dm-logo__image"
          priority={false}
          style={{
            display: 'block',
            inlineSize: isCompact ? '44px' : '180px',
            blockSize: isCompact ? '44px' : '45px',
            maxInlineSize: 'none',
            objectFit: 'contain'
          }}
        />
      </span>
      <span className="sr-only">{accessibleName}</span>
    </div>
  );
}
