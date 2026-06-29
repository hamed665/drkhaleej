import { notFound } from "next/navigation";

import { DraftCenterEditForm } from "@/components/admin/draft-center-edit-form";
import { DraftCenterLocationCreateForm } from "@/components/admin/draft-center-location-create-form";
import { DraftCenterLocationPanel } from "@/components/admin/draft-center-location-panel";
import { DraftCenterQualityPanel } from "@/components/admin/draft-center-quality-panel";
import { DraftCenterTaxonomyPanel } from "@/components/admin/draft-center-taxonomy-panel";
import { DraftCenterWorkflowPanel } from "@/components/admin/draft-center-workflow-panel";
import { getAdminDraftCenterById } from "@/server/admin/draft-centers";
import { getDraftLocationOptions } from "@/server/admin/draft-center-location-options";
import { listAdminDraftCenterLocations } from "@/server/admin/draft-center-locations";
import { getAdminDraftCenterQuality } from "@/server/admin/draft-center-quality";
import { getAdminDraftCenterTaxonomy } from "@/server/admin/draft-center-taxonomy";

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

  const taxonomy = await getAdminDraftCenterTaxonomy(centerId);
  const locationOptions = await getDraftLocationOptions();
  const locations = await listAdminDraftCenterLocations(centerId);
  const quality = await getAdminDraftCenterQuality(
    centerId,
    result.center,
    taxonomy.ok ? taxonomy.assignment : null,
    taxonomy.ok,
  );

  return (
    <div className="space-y-6">
      <DraftCenterWorkflowPanel center={result.center} />
      {taxonomy.ok ? (
        <DraftCenterTaxonomyPanel
          assignment={taxonomy.assignment}
          categoryOptions={taxonomy.categoryOptions}
          center={result.center}
        />
      ) : (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <h3 className="text-lg font-bold">Category assignment unavailable</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6">
            Taxonomy categories could not be loaded right now. You can still edit
            the draft center details. No public state changed.
          </p>
        </section>
      )}
      {locationOptions.ok ? (
        <DraftCenterLocationCreateForm centerId={centerId} options={locationOptions.options} />
      ) : null}
      {locations.ok ? <DraftCenterLocationPanel locations={locations.locations} /> : null}
      {quality.ok ? (
        <DraftCenterQualityPanel report={quality.report} />
      ) : (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <h3 className="text-lg font-bold">Quality gate unavailable</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6">
            Draft center quality checks could not be loaded right now. This does
            not change any public state.
          </p>
        </section>
      )}
      <DraftCenterEditForm center={result.center} />
    </div>
  );
}
