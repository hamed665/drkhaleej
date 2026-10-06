import type { HTMLAttributes, ReactNode } from 'react';

type ContainerSize = 'default' | 'compact' | 'content' | 'wide' | 'full';

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  size?: ContainerSize;
};

export function Container({ children, className, size = 'default', ...props }: ContainerProps) {
  const classes = ['ui-container', size === 'default' ? null : `ui-container--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
