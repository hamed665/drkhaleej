import type { HTMLAttributes, ReactNode } from 'react';

import { Container } from '@/components/ui/container';

type SectionTone = 'default' | 'soft' | 'contrast';
type SectionHeading = 'h2' | 'h3';

type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  tone?: SectionTone;
  contained?: boolean;
};

type SectionHeaderProps = HTMLAttributes<HTMLDivElement> & {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  headingAs?: SectionHeading;
};

export function Section({ children, className, tone = 'default', contained = true, ...props }: SectionProps) {
  const classes = ['ui-section', tone === 'default' ? null : `ui-section--${tone}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes} {...props}>
      {contained ? <Container>{children}</Container> : children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  headingAs = 'h2',
  className,
  ...props
}: SectionHeaderProps) {
  const Heading = headingAs;

  return (
    <div className={['ui-section-header', className].filter(Boolean).join(' ')} {...props}>
      {eyebrow ? <p className="ui-section-header__eyebrow">{eyebrow}</p> : null}
      <Heading className="ui-section-header__title">{title}</Heading>
      {description ? <p className="ui-section-header__description">{description}</p> : null}
      {actions ? <div className="ui-section-header__actions">{actions}</div> : null}
    </div>
  );
}
