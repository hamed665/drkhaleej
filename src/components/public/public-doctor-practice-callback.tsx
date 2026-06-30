import type { PublicCatalogLocale, PublicDoctorDetail } from '@/lib/catalog/public-types';

import { PublicCallbackRequestForm } from './public-callback-request-form';

type PublicDoctorPracticeCallbackProps = {
  locale: PublicCatalogLocale;
  doctor: PublicDoctorDetail;
  practiceLocation: PublicDoctorDetail['practiceLocations'][number];
};

export function PublicDoctorPracticeCallback({
  locale,
  doctor,
  practiceLocation
}: PublicDoctorPracticeCallbackProps) {
  if (practiceLocation.contactActions.length === 0) return null;

  return (
    <div className="mt-4">
      <PublicCallbackRequestForm
        locale={locale}
        countryCode={doctor.defaultCountry}
        centerId={practiceLocation.center.id}
        centerLocationId={practiceLocation.location?.id ?? null}
        doctorId={doctor.id}
        doctorPracticeLocationId={practiceLocation.id}
        variant="practice"
      />
    </div>
  );
}
