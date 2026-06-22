import type { DoctorLevel } from './types';

export const taxonomyDoctorLevels = [
  { slug: 'consultant', labelEn: 'Consultant', labelAr: 'استشاري', descriptionEn: 'Senior consultant doctor level.', descriptionAr: 'درجة طبيب استشاري بخبرة متقدمة.', rank: 1 },
  { slug: 'specialist', labelEn: 'Specialist', labelAr: 'اختصاصي', descriptionEn: 'Specialist doctor level.', descriptionAr: 'درجة طبيب اختصاصي في مجال طبي محدد.', rank: 2 },
  { slug: 'general-practitioner', labelEn: 'General Practitioner', labelAr: 'طبيب عام', descriptionEn: 'General practitioner doctor level.', descriptionAr: 'درجة طبيب عام يقدم الرعاية الأولية.', rank: 3 },
  { slug: 'dentist', labelEn: 'Dentist', labelAr: 'طبيب أسنان', descriptionEn: 'Licensed dentist level.', descriptionAr: 'درجة طبيب أسنان مرخص.', rank: 4 }
] as const satisfies readonly DoctorLevel[];
