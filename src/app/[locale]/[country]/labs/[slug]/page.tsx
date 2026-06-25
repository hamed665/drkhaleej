import { generateImportProfileMetadata, renderImportProfileRoute } from "../../_lib/import-profile-route";

type PageProps = {
  params: Promise<{ locale: string; country: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  return generateImportProfileMetadata({ params, family: "labs" });
}

export default async function LaboratoryProfilePage({ params }: PageProps) {
  return renderImportProfileRoute({ params, family: "labs" });
}
