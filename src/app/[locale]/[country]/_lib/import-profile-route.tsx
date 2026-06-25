import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuardedImportProfilePage } from "@/components/public/import-profile/GuardedImportProfilePage";
import { siteConfig } from "@/lib/seo/site";
import { getPublicImportProfile, type PublicImportProfileFamily } from "@/server/public/import-profile-guard";

type Params = { locale: string; country: string; slug: string };

type ImportProfileRouteInput = {
  params: Promise<Params>;
  family: PublicImportProfileFamily;
};

function descriptionForProfile(name: string): string {
  return `${name} on DrMuscat. Public healthcare discovery in Oman only; not medical advice, booking, or emergency care.`;
}

export async function generateImportProfileMetadata({
  params,
  family,
}: ImportProfileRouteInput): Promise<Metadata> {
  const { locale, country, slug } = await params;
  const result = await getPublicImportProfile({ locale, country, family, slug });
  if (!result.ok) return {};

  const { profile } = result;
  const canonicalUrl = new URL(profile.canonicalPath, siteConfig.baseUrl).toString();

  return {
    title: `${profile.name} | DrMuscat`,
    description: descriptionForProfile(profile.name),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export async function renderImportProfileRoute({ params, family }: ImportProfileRouteInput) {
  const { locale, country, slug } = await params;
  const result = await getPublicImportProfile({ locale, country, family, slug });
  if (!result.ok) notFound();

  return (
    <GuardedImportProfilePage
      profile={result.profile}
      locale={locale === "ar" ? "ar" : "en"}
    />
  );
}
