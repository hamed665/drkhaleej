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

export function Logo({ variant = 'full', className, imageAlt, ...props }: LogoProps) {
  const accessibleName = imageAlt ?? 'DrKhaleej';
  const isCompact = variant === 'compact';
  const classes = ['dm-logo', `dm-logo--${variant}`, 'dm-logo--inline', className].filter(Boolean).join(' ');
  const iconSize = isCompact ? 44 : 42;
  const gradientId = isCompact ? 'dmLogoGreenCompact' : 'dmLogoGreenFull';

  return (
    <div
      className={classes}
      dir="ltr"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isCompact ? 0 : '0.48rem',
        inlineSize: isCompact ? '44px' : 'auto',
        blockSize: isCompact ? '44px' : '42px',
        overflow: 'visible',
        flexShrink: 0,
        background: 'transparent',
        direction: 'ltr'
      }}
      {...props}
    >
      <LogoMark size={iconSize} gradientId={gradientId} />
      {!isCompact ? <LogoWordmark /> : null}
      <span className="sr-only">{accessibleName}</span>
    </div>
  );
}

function LogoWordmark() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        lineHeight: 1,
        letterSpacing: '-0.045em',
        fontFamily: 'Avenir Next, Nunito Sans, Inter, Segoe UI, Arial, sans-serif',
        fontSize: 'clamp(1.36rem, 1.9vw, 1.58rem)',
        fontWeight: 760,
        whiteSpace: 'nowrap',
        direction: 'ltr'
      }}
    >
      <span style={{ color: '#111827' }}>Dr</span>
      <span style={{ color: '#0FA869' }}>Khaleej</span>
    </span>
  );
}

function LogoMark({ size, gradientId }: { size: number; gradientId: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 180 180"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', inlineSize: `${size}px`, blockSize: `${size}px`, background: 'transparent', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradientId} x1="90" y1="16" x2="90" y2="164" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#20D184" />
          <stop offset="0.48" stopColor="#12AE6B" />
          <stop offset="1" stopColor="#08724F" />
        </linearGradient>
      </defs>
      <path
        d="M38 150 V80 C38 26 142 26 142 80 V150"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="30"
        strokeLinecap="butt"
        strokeLinejoin="round"
      />
      <path
        d="M52 98 H76 L86 75 L103 125 L118 98 H142"
        fill="none"
        stroke="#16C978"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
