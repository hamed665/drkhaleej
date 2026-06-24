import "server-only";

export type ImportJsonPrimitive = string | number | boolean | null;
export type ImportJsonValue = unknown;

type ImportJsonRecord = Record<string, unknown>;
type RawImportValues = Record<string, ImportJsonPrimitive>;

export type NormalizedImportPayload = {
  normalizedAt: string;
  sourceSheet: string | null;
  sourceRowNumber: number | null;
  values: RawImportValues;
  identity: {
    externalId: string | null;
    primaryName: string | null;
    nameEn: string | null;
    nameAr: string | null;
    slugCandidate: string | null;
  };
  contact: {
    phoneE164: string | null;
    whatsappE164: string | null;
    email: string | null;
    websiteUrl: string | null;
    googleMapsUrl: string | null;
    directionUrl: string | null;
  };
  geo: {
    countryCode: string;
    governorate: string | null;
    wilayat: string | null;
    area: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  taxonomy: {
    primarySpecialty: string | null;
    subspecialty: string | null;
    services: string[];
    departments: string[];
  };
  languages: string[];
  source: {
    sourceName: string | null;
    sourceUrl: string | null;
    lastCheckedAt: string | null;
  };
  quality: {
    score: number;
    flags: string[];
  };
};

export type ImportRowNormalizationResult = {
  normalizedPayload: NormalizedImportPayload;
  qualityScore: number;
  readyForReview: boolean;
};

const arabicIndicDigitMap: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

const languageAliases: Record<string, string> = {
  arabic: "ar",
  عربي: "ar",
  ar: "ar",
  english: "en",
  en: "en",
  hindi: "hi",
  hi: "hi",
  urdu: "ur",
  ur: "ur",
  malayalam: "ml",
  ml: "ml",
  tagalog: "tl",
  filipino: "tl",
  tl: "tl",
  persian: "fa",
  farsi: "fa",
  fa: "fa",
};

export function normalizeImportRawPayload(
  rawPayload: ImportJsonValue,
  fallbackExternalId: string | null,
  fallbackSourceUrl: string | null,
  fallbackLastCheckedAt: string | null,
): ImportRowNormalizationResult {
  const values = extractValues(rawPayload);
  const cleanedValues = normalizeValues(values);
  const sourceSheet = readStringFromRecord(rawPayload, "sheet_name");
  const sourceRowNumber = readNumberFromRecord(rawPayload, "source_row_number");
  const nameEn = firstText(cleanedValues, [
    "full_name_en",
    "display_name_en",
    "doctor_name_en",
    "pharmacy_name_en",
    "hospital_name_en",
    "name_en",
  ]);
  const nameAr = firstText(cleanedValues, [
    "full_name_ar",
    "display_name_ar",
    "doctor_name_ar",
    "pharmacy_name_ar",
    "hospital_name_ar",
    "name_ar",
  ]);
  const primaryName = nameEn ?? nameAr;
  const externalId = firstText(cleanedValues, [
    "doctor_external_id",
    "pharmacy_external_id",
    "hospital_external_id",
    "facility_external_id",
    "external_id",
    "doctor_id",
    "pharmacy_id",
    "hospital_id",
  ]) ?? normalizeFreeText(fallbackExternalId);
  const phoneE164 = normalizeOmanPhone(firstText(cleanedValues, [
    "phone_e164",
    "phone_display",
    "primary_phone",
    "phone",
    "telephone",
  ]));
  const whatsappE164 = normalizeOmanPhone(firstText(cleanedValues, [
    "whatsapp_e164",
    "whatsapp_phone",
    "whatsapp",
    "generated_whatsapp_url",
  ]) ?? phoneE164);
  const latitude = normalizeCoordinate(firstText(cleanedValues, ["latitude", "lat", "direction_latitude"]), -90, 90);
  const longitude = normalizeCoordinate(firstText(cleanedValues, ["longitude", "lng", "lon", "direction_longitude"]), -180, 180);
  const googleMapsUrl = normalizeUrl(firstText(cleanedValues, ["google_maps_url", "maps_url", "map_url"]));
  const sourceUrl = normalizeUrl(firstText(cleanedValues, [
    "source_url",
    "license_source_url",
    "accreditation_source_url",
  ]) ?? fallbackSourceUrl);
  const lastCheckedAt = normalizeDate(firstText(cleanedValues, [
    "last_checked_at",
    "last_checked",
    "last_verified_at",
  ]) ?? fallbackLastCheckedAt);
  const services = normalizeList(firstText(cleanedValues, ["services", "service_names", "services_csv", "doctor_services"]));
  const departments = normalizeList(firstText(cleanedValues, ["departments", "department_names", "units"]));
  const languages = normalizeLanguages(firstText(cleanedValues, [
    "languages_spoken",
    "consultation_languages",
    "languages_csv",
    "staff_languages",
    "languages",
  ]));
  const sourceName = firstText(cleanedValues, ["source_name", "data_source", "license_source", "accreditation_source"]);
  const directionUrl = buildDirectionUrl(latitude, longitude, googleMapsUrl);
  const slugCandidate = slugify(primaryName);
  const flags: string[] = [];

  if (primaryName === null) flags.push("missing_name");
  if (externalId === null) flags.push("missing_external_id");
  if (sourceUrl === null && sourceName === null) flags.push("missing_source");
  if (lastCheckedAt === null) flags.push("missing_last_checked_at");
  if (phoneE164 === null && whatsappE164 === null && googleMapsUrl === null && directionUrl === null) flags.push("missing_contact_or_map");
  if (latitude === null || longitude === null) flags.push("missing_coordinates");

  const qualityScore = calculateQualityScore({
    primaryName,
    externalId,
    sourceUrl,
    sourceName,
    lastCheckedAt,
    phoneE164,
    whatsappE164,
    googleMapsUrl,
    directionUrl,
    latitude,
    longitude,
    services,
    departments,
    languages,
  });

  const normalizedPayload: NormalizedImportPayload = {
    normalizedAt: new Date().toISOString(),
    sourceSheet,
    sourceRowNumber,
    values: cleanedValues,
    identity: {
      externalId,
      primaryName,
      nameEn,
      nameAr,
      slugCandidate,
    },
    contact: {
      phoneE164,
      whatsappE164,
      email: normalizeEmail(firstText(cleanedValues, ["email", "email_address", "contact_email"])),
      websiteUrl: normalizeUrl(firstText(cleanedValues, ["website_url", "website", "url"])),
      googleMapsUrl,
      directionUrl,
    },
    geo: {
      countryCode: "om",
      governorate: firstText(cleanedValues, ["governorate", "governorate_en", "governorate_ar"]),
      wilayat: firstText(cleanedValues, ["wilayat", "wilayat_en", "wilayat_ar", "city"]),
      area: firstText(cleanedValues, ["area", "area_en", "area_ar", "neighborhood", "district"]),
      latitude,
      longitude,
    },
    taxonomy: {
      primarySpecialty: firstText(cleanedValues, ["primary_specialty", "specialty", "main_specialty"]),
      subspecialty: firstText(cleanedValues, ["subspecialty", "sub_specialty"]),
      services,
      departments,
    },
    languages,
    source: {
      sourceName,
      sourceUrl,
      lastCheckedAt,
    },
    quality: {
      score: qualityScore,
      flags,
    },
  };

  return {
    normalizedPayload,
    qualityScore,
    readyForReview: qualityScore >= 60 && !flags.includes("missing_name") && !flags.includes("missing_source"),
  };
}

function isRecord(value: ImportJsonValue): value is ImportJsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractValues(rawPayload: ImportJsonValue): RawImportValues {
  if (!isRecord(rawPayload)) return {};
  const values = rawPayload.values;
  if (!isRecord(values)) return {};

  const record: RawImportValues = {};
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
      record[key] = value;
    }
  }
  return record;
}

function readStringFromRecord(rawPayload: ImportJsonValue, key: string): string | null {
  if (!isRecord(rawPayload)) return null;
  const value = rawPayload[key];
  if (typeof value !== "string") return null;
  return normalizeFreeText(value);
}

function readNumberFromRecord(rawPayload: ImportJsonValue, key: string): number | null {
  if (!isRecord(rawPayload)) return null;
  const value = rawPayload[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeValues(values: RawImportValues): RawImportValues {
  const normalized: RawImportValues = {};
  for (const [key, value] of Object.entries(values)) {
    const normalizedKey = normalizeKey(key);
    if (typeof value === "string") normalized[normalizedKey] = normalizeDigits(value).trim().replace(/\s+/g, " ");
    else normalized[normalizedKey] = value;
  }
  return normalized;
}

function normalizeKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[\s\-\/]+/g, "_")
    .replace(/[^a-z0-9_\u0600-\u06ff]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function firstText(values: RawImportValues, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = normalizeFreeText(values[key]);
    if (value !== null) return value;
  }
  return null;
}

function normalizeFreeText(value: ImportJsonPrimitive | undefined): string | null {
  if (value === null || value === undefined) return null;
  const text = normalizeDigits(String(value)).trim().replace(/\s+/g, " ");
  return text.length > 0 ? text : null;
}

function normalizeDigits(value: string): string {
  return Array.from(value).map((char) => arabicIndicDigitMap[char] ?? char).join("");
}

function normalizeOmanPhone(value: string | null): string | null {
  if (value === null) return null;
  let digits = normalizeDigits(value).replace(/[^0-9+]/g, "");
  if (digits.startsWith("00")) digits = `+${digits.slice(2)}`;
  if (digits.startsWith("+968")) digits = digits.slice(4);
  if (digits.startsWith("968") && digits.length === 11) digits = digits.slice(3);
  digits = digits.replace(/[^0-9]/g, "");
  if (digits.length !== 8) return null;
  if (!/^[279]/.test(digits)) return null;
  return `+968${digits}`;
}

function normalizeCoordinate(value: string | null, min: number, max: number): number | null {
  if (value === null) return null;
  const parsed = Number(value.replace(/,/g, "."));
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return Number(parsed.toFixed(7));
}

function normalizeUrl(value: string | null): string | null {
  if (value === null) return null;
  const text = value.trim();
  if (text.length === 0) return null;
  const withScheme = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withScheme);
    if (!/^https?:$/.test(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeEmail(value: string | null): string | null {
  if (value === null) return null;
  const text = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? text : null;
}

function normalizeDate(value: string | null): string | null {
  if (value === null) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function normalizeList(value: string | null): string[] {
  if (value === null) return [];
  return value
    .split(/[;,|\n]+/g)
    .map((item) => item.trim())
    .filter((item, index, all) => item.length > 0 && all.indexOf(item) === index)
    .slice(0, 30);
}

function normalizeLanguages(value: string | null): string[] {
  return normalizeList(value)
    .map((language) => languageAliases[language.toLowerCase()] ?? language.toLowerCase())
    .filter((language, index, all) => /^[a-z]{2,3}$/.test(language) && all.indexOf(language) === index)
    .slice(0, 12);
}

function buildDirectionUrl(latitude: number | null, longitude: number | null, googleMapsUrl: string | null): string | null {
  if (latitude !== null && longitude !== null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  return googleMapsUrl;
}

function slugify(value: string | null): string | null {
  if (value === null) return null;
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  return slug.length > 0 ? slug : null;
}

function calculateQualityScore(input: {
  primaryName: string | null;
  externalId: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  lastCheckedAt: string | null;
  phoneE164: string | null;
  whatsappE164: string | null;
  googleMapsUrl: string | null;
  directionUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  services: string[];
  departments: string[];
  languages: string[];
}): number {
  let score = 0;
  if (input.primaryName !== null) score += 20;
  if (input.externalId !== null) score += 10;
  if (input.sourceUrl !== null || input.sourceName !== null) score += 15;
  if (input.lastCheckedAt !== null) score += 10;
  if (input.phoneE164 !== null || input.whatsappE164 !== null) score += 10;
  if (input.googleMapsUrl !== null || input.directionUrl !== null) score += 10;
  if (input.latitude !== null && input.longitude !== null) score += 10;
  if (input.services.length > 0 || input.departments.length > 0) score += 10;
  if (input.languages.length > 0) score += 5;
  return Math.min(score, 100);
}
