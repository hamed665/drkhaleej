import { ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
};

export function Container({ children }: ContainerProps) {
  return <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>{children}</div>;
}
