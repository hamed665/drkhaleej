import type { SchemaHint } from './types';

export const taxonomySchemaHints = [
  { slug: 'medical-service', labelEn: 'Medical Service', labelAr: 'خدمة طبية', descriptionEn: 'Schema hint for a healthcare service item.', descriptionAr: 'إشارة مخطط لخدمة رعاية صحية.', schemaType: 'MedicalProcedure' },
  { slug: 'diagnostic-test', labelEn: 'Diagnostic Test', labelAr: 'فحص تشخيصي', descriptionEn: 'Schema hint for diagnostic tests.', descriptionAr: 'إشارة مخطط للفحوصات التشخيصية.', schemaType: 'MedicalTest' },
  { slug: 'dental-service', labelEn: 'Dental Service', labelAr: 'خدمة أسنان', descriptionEn: 'Schema hint for dental services.', descriptionAr: 'إشارة مخطط لخدمات الأسنان.', schemaType: 'MedicalProcedure' }
] as const satisfies readonly SchemaHint[];
