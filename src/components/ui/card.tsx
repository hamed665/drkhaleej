import type { HTMLAttributes } from 'react';

type CardVariant = 'default' | 'glass' | 'elevated';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

export function Card({ variant = 'default', className, ...props }: CardProps) {
  const classes = ['ui-card', `ui-card--${variant}`, className].filter(Boolean).join(' ');
  return <div className={classes} {...props} />;
}
