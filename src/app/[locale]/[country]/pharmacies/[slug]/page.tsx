import { generateImportProfileMetadata, renderImportProfileRoute } from "../../_lib/import-profile-route";

type PageProps = {
  params: Promise<{ locale: string; country: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  return generateImportProfileMetadata({ params, family: "pharmacies" });
}

export default async function PharmacyProfilePage({ params }: PageProps) {
  return renderImportProfileRoute({ params, family: "pharmacies" });
}
