type SchemaContext = 'https://schema.org';

type BaseJsonLd<TType extends string> = {
  '@context': SchemaContext;
  '@type': TType;
};

export type OrganizationJsonLd = BaseJsonLd<'Organization'> & {
  name: string;
  url?: string;
  logo?: string;
};

export type WebsiteJsonLd = BaseJsonLd<'WebSite'> & {
  name: string;
  url: string;
  inLanguage?: string;
};

export type BreadcrumbListJsonLd = BaseJsonLd<'BreadcrumbList'> & {
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
};

export type FaqPageJsonLd = BaseJsonLd<'FAQPage'> & {
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
};

export type PhysicianJsonLd = BaseJsonLd<'Physician'> & {
  name: string;
  medicalSpecialty?: string;
  url?: string;
};

export type MedicalClinicJsonLd = BaseJsonLd<'MedicalClinic'> & {
  name: string;
  url?: string;
  medicalSpecialty?: string;
};

export type MedicalOrganizationJsonLd = BaseJsonLd<'MedicalOrganization'> & {
  name: string;
  url?: string;
};

export type SupportedJsonLd =
  | OrganizationJsonLd
  | WebsiteJsonLd
  | BreadcrumbListJsonLd
  | FaqPageJsonLd
  | PhysicianJsonLd
  | MedicalClinicJsonLd
  | MedicalOrganizationJsonLd;

export function createJsonLd<T extends SupportedJsonLd>(schema: T): T {
  return schema;
}
