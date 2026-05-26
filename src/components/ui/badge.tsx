import type { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'trust' | 'verified' | 'featured' | 'medical' | 'pharmacy' | 'laboratory';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  const classes = ['ui-badge', `ui-badge--${variant}`, className].filter(Boolean).join(' ');
  return <span className={classes} {...props} />;
}
