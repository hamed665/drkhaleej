import { NextResponse } from "next/server";
import { isSupportedCountry, isSupportedLocale } from "@/lib/i18n/config";
import { getPublicImportHospitalProfile } from "@/server/public/import-hospital-profile-guard";

type Params = { locale: string; country: string; hospitalSlug: string };

function notFoundResponse(): Response {
  return NextResponse.json(
    { ok: false },
    {
      status: 404,
      headers: {
        "cache-control": "no-store, private",
      },
    },
  );
}

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { locale, country, hospitalSlug } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return notFoundResponse();

  const result = await getPublicImportHospitalProfile({ locale, country, hospitalSlug });
  if (!result.ok) return notFoundResponse();

  return NextResponse.json(
    { ok: true, profile: result.profile },
    {
      headers: {
        "cache-control": "no-store, private",
      },
    },
  );
}
