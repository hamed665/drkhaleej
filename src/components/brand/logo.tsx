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
  const accessibleName = imageAlt ?? 'DrMuscat';
  const isCompact = variant === 'compact';
  const classes = ['dm-logo', `dm-logo--${variant}`, 'dm-logo--inline', className].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        inlineSize: isCompact ? '44px' : '180px',
        blockSize: isCompact ? '44px' : '45px',
        overflow: 'visible',
        flexShrink: 0,
        background: 'transparent'
      }}
      {...props}
    >
      {isCompact ? <CompactLogoMark /> : <FullLogoLockup />}
      <span className="sr-only">{accessibleName}</span>
    </div>
  );
}

function FullLogoLockup() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="180"
      height="45"
      viewBox="0 0 720 180"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', inlineSize: '180px', blockSize: '45px', background: 'transparent' }}
    >
      <defs>
        <linearGradient id="dmLogoGreenFull" x1="70" y1="20" x2="70" y2="156" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#20D184" />
          <stop offset="0.48" stopColor="#12AE6B" />
          <stop offset="1" stopColor="#08724F" />
        </linearGradient>
        <linearGradient id="dmWordGreenFull" x1="260" y1="38" x2="690" y2="138" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#18C779" />
          <stop offset="0.55" stopColor="#0FA869" />
          <stop offset="1" stopColor="#087A54" />
        </linearGradient>
      </defs>
      <g transform="translate(18 16)">
        <path
          d="M34 146 V76 C34 24 126 24 126 76 V146"
          fill="none"
          stroke="url(#dmLogoGreenFull)"
          strokeWidth="30"
          strokeLinecap="butt"
          strokeLinejoin="round"
        />
        <path
          d="M48 96 H75 L85 73 L103 125 L118 96 H144"
          fill="none"
          stroke="#16C978"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <text
        x="185"
        y="114"
        fontFamily="Avenir Next, Nunito Sans, Inter, Segoe UI, Arial, sans-serif"
        fontSize="92"
        fontWeight="700"
        letterSpacing="-4"
      >
        <tspan fill="#111827">Dr</tspan>
        <tspan fill="url(#dmWordGreenFull)">Muscat</tspan>
      </text>
    </svg>
  );
}

function CompactLogoMark() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="44"
      height="44"
      viewBox="0 0 180 180"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', inlineSize: '44px', blockSize: '44px', background: 'transparent' }}
    >
      <defs>
        <linearGradient id="dmLogoGreenCompact" x1="90" y1="16" x2="90" y2="164" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#20D184" />
          <stop offset="0.48" stopColor="#12AE6B" />
          <stop offset="1" stopColor="#08724F" />
        </linearGradient>
      </defs>
      <path
        d="M38 150 V80 C38 26 142 26 142 80 V150"
        fill="none"
        stroke="url(#dmLogoGreenCompact)"
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
