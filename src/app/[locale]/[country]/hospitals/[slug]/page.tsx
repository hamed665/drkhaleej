import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  isSupportedCountry,
  isSupportedLocale,
} from "@/lib/i18n/config";
import { buildProfileNoindexMetadata } from "@/lib/seo/profile-metadata-index-gate";

type Params = { locale: string; country: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};

  return buildProfileNoindexMetadata({
    title: "Hospital profile unavailable | DrKhaleej",
    description: "This imported hospital profile is temporarily unavailable while public discovery is being prepared.",
  });
}

export default async function ImportedHospitalDetailPublicHoldPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  notFound();
}
