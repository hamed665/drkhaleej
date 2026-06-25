import { generateImportProfileMetadata, renderImportProfileRoute } from "../../_lib/import-profile-route";

type PageProps = {
  params: Promise<{ locale: string; country: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  return generateImportProfileMetadata({ params, family: "clinics" });
}

export default async function ClinicProfilePage({ params }: PageProps) {
  return renderImportProfileRoute({ params, family: "clinics" });
}
