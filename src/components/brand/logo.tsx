import type { HTMLAttributes } from 'react';

type LogoVariant = 'full' | 'compact';

type LogoProps = HTMLAttributes<HTMLDivElement> & {
  variant?: LogoVariant;
};

export function Logo({ variant = 'full', className, ...props }: LogoProps) {
  const classes = ['dm-logo', className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      <span className="dm-logo__mark" aria-hidden="true">
        DM
      </span>
      {variant === 'full' ? <span className="dm-logo__wordmark">DrMuscat</span> : null}
      <span className="sr-only">DrMuscat</span>
    </div>
  );
}
