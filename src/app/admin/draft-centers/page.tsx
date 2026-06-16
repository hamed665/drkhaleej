import { DraftCentersList } from "@/components/admin/draft-centers-list";
import { listAdminDraftCenters } from "@/server/admin/draft-centers";

export default async function AdminDraftCentersPage() {
  const result = await listAdminDraftCenters();

  return <DraftCentersList result={result} />;
}
