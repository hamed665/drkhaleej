import { notFound } from "next/navigation";

import { getActiveCenterContactReadiness } from "@/server/admin/active-center-contact-readiness";

type PageProps = { params: Promise<{ centerId: string }> };

function yn(value: boolean): string {
  return value ? "yes" : "no";
}

export default async function AdminActiveCenterGatesPage({ params }: PageProps) {
  const { centerId } = await params;
  const result = await getActiveCenterContactReadiness(centerId);

  if (!result.ok) {
    if (result.reason === "not_found") notFound();
    return <p>Unavailable</p>;
  }

  const item = result.readiness;

  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-950">Public action gates</h2>
      <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div><dt>Review</dt><dd>{item.contactReviewStatus ?? "missing"}</dd></div>
        <div><dt>Actions</dt><dd>{item.centerRenderableActionCount}</dd></div>
        <div><dt>Phone value</dt><dd>{yn(item.hasPrimaryPhone || item.hasSecondaryPhone)}</dd></div>
        <div><dt>Phone visible</dt><dd>{yn(item.publicPrimaryPhoneVisible || item.publicSecondaryPhoneVisible)}</dd></div>
        <div><dt>WhatsApp value</dt><dd>{yn(item.hasWhatsappPhone)}</dd></div>
        <div><dt>WhatsApp visible</dt><dd>{yn(item.publicWhatsappPhoneVisible)}</dd></div>
        <div><dt>Email value</dt><dd>{yn(item.hasEmail)}</dd></div>
        <div><dt>Email visible</dt><dd>{yn(item.publicEmailVisible)}</dd></div>
        <div><dt>Website value</dt><dd>{yn(item.hasWebsite)}</dd></div>
        <div><dt>Map URL</dt><dd>{yn(item.hasPrimaryLocationMapUrl)}</dd></div>
        <div><dt>Location ID</dt><dd>{item.primaryLocationId ?? "missing"}</dd></div>
      </dl>
    </main>
  );
}
