import {
  limitPublicProfileRelations,
  PUBLIC_DOCTOR_PROFILE_PRACTICE_LOCATION_LIMIT,
  PUBLIC_DOCTOR_PROFILE_SERVICE_LIMIT,
} from '@/lib/catalog/public-profile-relation-limits';
import type { PublicCatalogLocale, PublicDoctorDetail as PublicDoctorDetailData } from '@/lib/catalog/public-types';

import { PublicDoctorDetail } from './public-doctor-detail';

type PublicDoctorDetailLimitedProps = {
  locale: PublicCatalogLocale;
  doctor: PublicDoctorDetailData;
};

export function PublicDoctorDetailLimited({ locale, doctor }: PublicDoctorDetailLimitedProps) {
  const limitedDoctor: PublicDoctorDetailData = {
    ...doctor,
    services: limitPublicProfileRelations(doctor.services, PUBLIC_DOCTOR_PROFILE_SERVICE_LIMIT),
    practiceLocations: limitPublicProfileRelations(
      doctor.practiceLocations,
      PUBLIC_DOCTOR_PROFILE_PRACTICE_LOCATION_LIMIT,
    ),
  };

  return <PublicDoctorDetail locale={locale} doctor={limitedDoctor} />;
}
