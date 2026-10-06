import type { HTMLAttributes } from 'react';

type ChipVariant = 'default' | 'active' | 'premium';

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: ChipVariant;
};

export function Chip({ variant = 'default', className, ...props }: ChipProps) {
  const classes = ['ui-chip', variant === 'default' ? null : `ui-chip--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes} {...props} />;
}
