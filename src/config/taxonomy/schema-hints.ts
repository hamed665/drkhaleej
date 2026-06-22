import type { SchemaHintSlug } from './types';

export type SchemaHint = {
  readonly slug: SchemaHintSlug;
  readonly labelEn: string;
  readonly descriptionEn: string;
};

export const schemaHints = [
  { slug: 'person', labelEn: 'Person', descriptionEn: 'Hint for individual people profiles only.' },
  { slug: 'physician', labelEn: 'Physician', descriptionEn: 'Hint for licensed medical doctor profiles.' },
  { slug: 'dentist', labelEn: 'Dentist', descriptionEn: 'Hint for licensed dental practitioner profiles.' },
  { slug: 'hospital', labelEn: 'Hospital', descriptionEn: 'Hint for hospital and specialty hospital entities.' },
  { slug: 'medical-clinic', labelEn: 'Medical Clinic', descriptionEn: 'Hint for clinic-like medical organizations.' },
  { slug: 'medical-organization', labelEn: 'Medical Organization', descriptionEn: 'General hint for regulated healthcare organizations.' },
  { slug: 'pharmacy', labelEn: 'Pharmacy', descriptionEn: 'Hint for licensed pharmacy entities.' },
  { slug: 'diagnostic-lab', labelEn: 'Diagnostic Lab', descriptionEn: 'Hint for laboratory and diagnostic testing entities.' },
  { slug: 'medical-test', labelEn: 'Medical Test', descriptionEn: 'Hint for diagnostic or medical testing service pages.' },
  { slug: 'local-business', labelEn: 'Local Business', descriptionEn: 'General local business hint for non-medical or mixed entities.' },
  { slug: 'beauty-salon', labelEn: 'Beauty Salon', descriptionEn: 'Hint for deferred non-medical beauty businesses.' },
  { slug: 'health-and-beauty-business', labelEn: 'Health and Beauty Business', descriptionEn: 'Hint for health-adjacent beauty businesses.' },
  { slug: 'health-club', labelEn: 'Health Club', descriptionEn: 'Hint for deferred fitness and gym entities.' },
  { slug: 'veterinary-care', labelEn: 'Veterinary Care', descriptionEn: 'Hint for veterinary and pet clinic entities.' },
  { slug: 'pet-store', labelEn: 'Pet Store', descriptionEn: 'Hint for deferred pet retail entities.' },
  { slug: 'breadcrumb-list', labelEn: 'Breadcrumb List', descriptionEn: 'Hint for future navigational breadcrumb schema.' },
  { slug: 'faq-page', labelEn: 'FAQ Page', descriptionEn: 'Hint for future FAQ schema when approved.' },
] as const satisfies readonly SchemaHint[];
