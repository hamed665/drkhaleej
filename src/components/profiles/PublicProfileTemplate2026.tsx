import type { ReactNode } from 'react';
import type { PublicProfileEntityType, PublicProfilePublicationDecision } from '@/lib/profiles/public-profile-guards';
import type { InternalLinkDefinition } from '@/lib/seo/internal-linking';

type PublicProfileTemplateLocale = 'en' | 'ar';

type PublicProfileTemplateContact = {
  phone?: string | null;
  website?: string | null;
  whatsappHref?: string | null;
};

type PublicProfileTemplateLocation = {
  address?: string | null;
  area?: string | null;
  city?: string | null;
  country?: string | null;
};

export type PublicProfileTemplate2026Props = {
  locale: PublicProfileTemplateLocale;
  dir: 'ltr' | 'rtl';
  entityType: PublicProfileEntityType;
  displayName: string;
  categoryLabel?: string | null;
  description?: string | null;
  services?: readonly string[];
  contact?: PublicProfileTemplateContact;
  location?: PublicProfileTemplateLocation;
  publicationDecision: PublicProfilePublicationDecision;
  internalLinks?: readonly InternalLinkDefinition[];
  children?: ReactNode;
};

const profileCopy: Record<
  PublicProfileTemplateLocale,
  {
    profileStatus: string;
    draftProfile: string;
    publicProfile: string;
    contact: string;
    location: string;
    services: string;
    safetyNote: string;
    notMedicalAdvice: string;
    publicationBlocked: string;
    publicationReady: string;
    call: string;
    website: string;
    whatsapp: string;
    relatedLinks: string;
  }
> = {
  en: {
    profileStatus: 'Profile status',
    draftProfile: 'Draft profile',
    publicProfile: 'Public profile',
    contact: 'Contact',
    location: 'Location',
    services: 'Services',
    safetyNote: 'Safety note',
    notMedicalAdvice: 'DrKhaleej does not provide medical advice, diagnosis, emergency care, MOH verification, booking confirmation or insurance confirmation.',
    publicationBlocked: 'This profile is not eligible for public indexing yet.',
    publicationReady: 'This profile passed the public publication guard.',
    call: 'Call',
    website: 'Website',
    whatsapp: 'WhatsApp',
    relatedLinks: 'Related links'
  },
  ar: {
    profileStatus: 'حالة الملف',
    draftProfile: 'ملف مسودة',
    publicProfile: 'ملف عام',
    contact: 'التواصل',
    location: 'الموقع',
    services: 'الخدمات',
    safetyNote: 'ملاحظة أمان',
    notMedicalAdvice: 'دكتور خليج لا يقدم نصائح طبية أو تشخيصاً أو رعاية طارئة أو تحققاً من وزارة الصحة أو تأكيد حجز أو تأكيد تأمين.',
    publicationBlocked: 'هذا الملف غير مؤهل للفهرسة العامة حالياً.',
    publicationReady: 'هذا الملف اجتاز بوابة النشر العامة.',
    call: 'اتصال',
    website: 'الموقع',
    whatsapp: 'واتساب',
    relatedLinks: 'روابط ذات صلة'
  }
};

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function filteredServices(services: readonly string[] | undefined): string[] {
  return (services ?? []).filter(hasText);
}

function locationText(location: PublicProfileTemplateLocation | undefined): string | null {
  const parts = [location?.address, location?.area, location?.city, location?.country].filter(hasText);

  return parts.length > 0 ? parts.join(', ') : null;
}

function ProfileInternalLinks({
  links,
  copy
}: {
  links: readonly InternalLinkDefinition[];
  copy: (typeof profileCopy)[PublicProfileTemplateLocale];
}) {
  if (links.length === 0) {
    return null;
  }

  return (
    <nav className="dm2026-public-profile__internal-links" aria-label={copy.relatedLinks}>
      <strong>{copy.relatedLinks}</strong>
      <ul>
        {links.map((link) => (
          <li key={link.key} data-intent={link.intent} data-priority={link.priority}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function PublicProfileTemplate2026({
  locale,
  dir,
  entityType,
  displayName,
  categoryLabel = null,
  description = null,
  services = [],
  contact,
  location,
  publicationDecision,
  internalLinks = [],
  children
}: PublicProfileTemplate2026Props) {
  const copy = profileCopy[locale];
  const serviceItems = filteredServices(services);
  const resolvedLocation = locationText(location);
  const statusLabel = publicationDecision.isPublic ? copy.publicProfile : copy.draftProfile;
  const statusBody = publicationDecision.isPublic ? copy.publicationReady : copy.publicationBlocked;
  const profileState = publicationDecision.isPublic ? 'public' : 'blocked';

  return (
    <article className="dm2026-public-profile" dir={dir} data-profile-state={profileState} data-entity-type={entityType}>
      <header className="dm2026-public-profile__hero">
        <div className="dm2026-public-profile__identity">
          <span className="dm2026-public-profile__eyebrow">{categoryLabel ?? entityType}</span>
          <h1>{displayName}</h1>
          {hasText(description) ? <p>{description}</p> : null}
        </div>
        <aside className="dm2026-public-profile__status" aria-label={copy.profileStatus}>
          <strong>{statusLabel}</strong>
          <span>{statusBody}</span>
        </aside>
      </header>

      <section className="dm2026-public-profile__safety" aria-label={copy.safetyNote}>
        <strong>{copy.safetyNote}</strong>
        <p>{copy.notMedicalAdvice}</p>
      </section>

      <ProfileInternalLinks links={internalLinks} copy={copy} />

      <div className="dm2026-public-profile__grid">
        <section className="dm2026-public-profile__panel" aria-label={copy.contact}>
          <h2>{copy.contact}</h2>
          <div className="dm2026-public-profile__actions">
            {hasText(contact?.phone) ? <a href={`tel:${contact.phone}`}>{copy.call}</a> : null}
            {hasText(contact?.website) ? (
              <a href={contact.website} target="_blank" rel="noopener noreferrer">
                {copy.website}
              </a>
            ) : null}
            {hasText(contact?.whatsappHref) ? (
              <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer">
                {copy.whatsapp}
              </a>
            ) : null}
          </div>
        </section>

        {resolvedLocation ? (
          <section className="dm2026-public-profile__panel" aria-label={copy.location}>
            <h2>{copy.location}</h2>
            <p>{resolvedLocation}</p>
          </section>
        ) : null}

        {serviceItems.length > 0 ? (
          <section className="dm2026-public-profile__panel dm2026-public-profile__panel--wide" aria-label={copy.services}>
            <h2>{copy.services}</h2>
            <ul>
              {serviceItems.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {publicationDecision.blockers.length > 0 ? (
          <section className="dm2026-public-profile__panel dm2026-public-profile__panel--wide" aria-label={copy.profileStatus}>
            <h2>{copy.profileStatus}</h2>
            <ul>
              {publicationDecision.blockers.map((blocker) => (
                <li key={blocker.key}>{blocker.message}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {children}
    </article>
  );
}
