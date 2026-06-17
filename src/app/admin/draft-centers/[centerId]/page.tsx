import { notFound } from "next/navigation";

import { DraftCenterEditForm } from "@/components/admin/draft-center-edit-form";
import { getAdminDraftCenterById } from "@/server/admin/draft-centers";

type AdminDraftCenterEditPageProps = {
  params: Promise<{
    centerId: string;
  }>;
};

export default async function AdminDraftCenterEditPage({
  params,
}: AdminDraftCenterEditPageProps) {
  const { centerId } = await params;
  const result = await getAdminDraftCenterById(centerId);

  if (!result.ok) {
    if (result.reason === "not_found") {
      notFound();
    }

    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-xl font-bold">Draft center unavailable</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6">
          This draft center could not be loaded right now. No raw database error
          is exposed here.
        </p>
      </section>
    );
  }

  return <DraftCenterEditForm center={result.center} />;
}
