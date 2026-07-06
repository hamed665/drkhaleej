import type { NextApiRequest, NextApiResponse } from "next";

import { isSupportedCountry, isSupportedLocale } from "@/lib/i18n/config";
import {
  getPublicImportHospitalProfile,
  type PublicImportHospitalProfile,
} from "@/server/public/import-hospital-profile-guard";

type HospitalProfileResponse =
  | { ok: true; profile: PublicImportHospitalProfile }
  | { ok: false };

function singleParam(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function notFoundResponse(response: NextApiResponse<HospitalProfileResponse>): void {
  response.setHeader("cache-control", "no-store, private");
  response.status(404).json({ ok: false });
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<HospitalProfileResponse>,
): Promise<void> {
  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    response.status(405).json({ ok: false });
    return;
  }

  const locale = singleParam(request.query.locale);
  const country = singleParam(request.query.country);
  const hospitalSlug = singleParam(request.query.hospitalSlug);

  if (
    locale === null ||
    country === null ||
    hospitalSlug === null ||
    !isSupportedLocale(locale) ||
    !isSupportedCountry(country)
  ) {
    notFoundResponse(response);
    return;
  }

  const result = await getPublicImportHospitalProfile({ locale, country, hospitalSlug });
  if (!result.ok) {
    notFoundResponse(response);
    return;
  }

  response.setHeader("cache-control", "no-store, private");
  response.status(200).json({ ok: true, profile: result.profile });
}
