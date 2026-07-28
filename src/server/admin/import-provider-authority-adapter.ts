import "server-only";

import {
  getPublicEntityFamilyRegistryEntry,
  type PublicEntityFamilyCapabilities,
  type PublicProviderEntityFamily,
} from "@/lib/catalog/public-entity-family-registry";
import type {
  PublicProviderEntityType,
  PublicProviderFamily,
} from "@/lib/catalog/public-provider-projection";
import {
  resolvePublicProviderCanonicalRoute,
  type PublicProviderRouteFamily,
  type PublicProviderRouteReason,
} from "@/lib/catalog/public-provider-route-resolver";
import {
  resolveImportStagingEntityType,
  type ImportEntityType,
} from "@/server/admin/import-entity-domain";

export type ImportProviderAuthorityStatus =
  | "supported"
  | "planned"
  | "disabled"
  | "unsupported";

export type ImportProviderStorageAuthority =
  | "doctors"
  | "centers"
  | "import_entity_candidates/import_publish_queue";

export type ImportProviderProjectionAuthority = {
  entityType: PublicProviderEntityType;
  family: PublicProviderFamily;
};

export type ImportProviderRouteRelease = {
  family: PublicProviderRouteFamily | null;
  status: ImportProviderAuthorityStatus;
  publicRouteEnabled: boolean;
  reason: PublicProviderRouteReason | "no_public_family";
};

export type ImportProviderAuthority = {
  entityType: ImportEntityType;
  publicFamily: PublicProviderEntityFamily | null;
  publicFamilyStatus: ImportProviderAuthorityStatus;
  publicProjection: ImportProviderProjectionAuthority | null;
  storageAuthority: ImportProviderStorageAuthority;
  storageStatus: ImportProviderAuthorityStatus;
  potentialCapabilities: PublicEntityFamilyCapabilities | null;
  routeRelease: ImportProviderRouteRelease;
};

export type ImportProviderAuthorityResolution =
  | { ok: true; authority: ImportProviderAuthority }
  | {
      ok: false;
      reason: "unsupported_entity_type" | "public_family_registry_missing";
      entityType: ImportEntityType | null;
    };

const PUBLIC_FAMILY_BY_IMPORT_ENTITY_TYPE = {
  doctor: "doctor",
  hospital: "hospital",
  clinic: "clinic",
  pharmacy: "pharmacy",
  lab: "lab",
  imaging_center: "imaging_center",
  dental_clinic: "dental_clinic",
  dentist: "dentist",
  dermatologist: "doctor",
  gynecologist: "doctor",
  fertility_clinic: "clinic",
  ivf_center: "clinic",
  reproductive_medicine_doctor: "doctor",
  embryology_lab: "lab",
  andrology_lab: "lab",
  hair_transplant_clinic: "beauty_clinic",
  hair_transplant_doctor: "doctor",
  plastic_surgeon: "doctor",
  aesthetic_doctor: "doctor",
  medical_beauty_clinic: "beauty_clinic",
  salon: null,
  spa: null,
  gym: null,
  fitness_center: null,
  personal_trainer: null,
  yoga_studio: null,
  pilates_studio: null,
  sports_medicine_doctor: "doctor",
  physiotherapy: "clinic",
  wellness_center: null,
  vet_doctor: null,
  pet_clinic: "pet_clinic",
  pet_pharmacy: null,
  pet_shop: "pet_shop",
  pet_grooming: null,
  pet_boarding: null,
} as const satisfies Record<ImportEntityType, PublicProviderEntityFamily | null>;

const PUBLIC_PROJECTION_BY_FAMILY: Partial<
  Record<PublicProviderEntityFamily, ImportProviderProjectionAuthority>
> = {
  doctor: { entityType: "doctor", family: "doctors" },
  hospital: { entityType: "hospital", family: "hospitals" },
  clinic: { entityType: "clinic", family: "centers" },
  pharmacy: { entityType: "pharmacy", family: "pharmacies" },
  lab: { entityType: "lab", family: "labs" },
  imaging_center: { entityType: "radiology", family: "radiology" },
  dental_clinic: { entityType: "dentistry", family: "dentistry" },
  dentist: { entityType: "dentistry", family: "dentistry" },
  beauty_clinic: { entityType: "beauty", family: "beauty" },
};

function storageAuthority(entityType: ImportEntityType): {
  authority: ImportProviderStorageAuthority;
  status: ImportProviderAuthorityStatus;
} {
  if (entityType === "doctor") {
    return { authority: "doctors", status: "supported" };
  }
  if (entityType === "clinic" || entityType === "pharmacy") {
    return { authority: "centers", status: "supported" };
  }
  return {
    authority: "import_entity_candidates/import_publish_queue",
    status: "planned",
  };
}

function routeRelease(
  entityType: ImportEntityType,
  routeFamily: PublicProviderRouteFamily | null,
): ImportProviderRouteRelease {
  if (routeFamily === null) {
    return {
      family: null,
      status: "unsupported",
      publicRouteEnabled: false,
      reason: "no_public_family",
    };
  }

  const resolved = resolvePublicProviderCanonicalRoute({
    family: routeFamily,
    slug: "registry-convergence-probe",
    locale: "en",
    country: "om",
  });

  return {
    family: routeFamily,
    status: resolved.publicRouteEnabled
      ? entityType === routeFamily
        ? "supported"
        : "planned"
      : resolved.reason === "route_disabled"
        ? "disabled"
        : "unsupported",
    publicRouteEnabled: resolved.publicRouteEnabled,
    reason: resolved.reason,
  };
}

export function resolveImportProviderAuthority(
  value: string | null | undefined,
): ImportProviderAuthorityResolution {
  const entityType = resolveImportStagingEntityType(value);
  if (entityType === null) {
    return { ok: false, reason: "unsupported_entity_type", entityType: null };
  }

  const publicFamily = PUBLIC_FAMILY_BY_IMPORT_ENTITY_TYPE[entityType];
  if (publicFamily === null) {
    const storage = storageAuthority(entityType);
    return {
      ok: true,
      authority: {
        entityType,
        publicFamily: null,
        publicFamilyStatus: "unsupported",
        publicProjection: null,
        storageAuthority: storage.authority,
        storageStatus: storage.status,
        potentialCapabilities: null,
        routeRelease: routeRelease(entityType, null),
      },
    };
  }

  const registryEntry = getPublicEntityFamilyRegistryEntry(publicFamily);
  if (registryEntry === null) {
    return {
      ok: false,
      reason: "public_family_registry_missing",
      entityType,
    };
  }

  const storage = storageAuthority(entityType);
  return {
    ok: true,
    authority: {
      entityType,
      publicFamily,
      publicFamilyStatus: publicFamily === entityType ? "supported" : "planned",
      publicProjection: PUBLIC_PROJECTION_BY_FAMILY[publicFamily] ?? null,
      storageAuthority: storage.authority,
      storageStatus: storage.status,
      potentialCapabilities: registryEntry.capabilities,
      routeRelease: routeRelease(entityType, registryEntry.routeFamily),
    },
  };
}
