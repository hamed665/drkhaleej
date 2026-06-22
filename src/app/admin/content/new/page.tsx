import { CmsContentForm } from "@/components/admin/cms/cms-content-form";
import { requireAdminPermission } from "@/server/admin/permissions";
export default async function NewCmsContentPage() { await requireAdminPermission("content.create"); return <div className="space-y-4"><h2 className="text-2xl font-bold text-slate-950">New CMS draft entry</h2><p className="text-sm text-slate-600">Creates an internal draft only. It will not publish or change public rendering.</p><CmsContentForm /></div>; }
