import type { ReactNode } from 'react';

type PublicCenterDetailSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function PublicCenterDetailSection({ title, description, children }: PublicCenterDetailSectionProps) {
  return (
    <section className="dm2026-profile-section">
      <div className="dm2026-profile-section__header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="dm2026-profile-section__body">{children}</div>
    </section>
  );
}
