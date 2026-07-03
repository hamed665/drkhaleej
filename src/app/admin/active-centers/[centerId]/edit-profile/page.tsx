import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";
import { updateActiveCenterBasicProfileDetails } from "@/server/admin/active-center-basic-profile-actions";
import { requireAdminPermission } from "@/server/admin/permissions";

type CenterRow = Database["public"]["Tables"]["centers"]["Row"];

type ActiveCenterBasicProfileRow = Pick<
  CenterRow,
  | "id"
  | "name_en"
  | "name_ar"
  | "slug"
  | "default_country"
  | "short_description_en"
  | "short_description_ar"
  | "description_en"
  | "description_ar"
>;

type ActiveCenterBasicProfileDetails = {
  id: string;
  nameEn: string;
  nameAr: string | null;
  slug: string;
  defaultCountry: string;
  shortDescriptionEn: string | null;
  shortDescriptionAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  publicPathEn: string;
  publicPathAr: string;
};

type ActiveCenterBasicProfileResult =
  | { ok: true; center: ActiveCenterBasicProfileDetails }
  | { ok: false; reason: "not_found" | "unavailable" };

type PageProps = {
  params: Promise<{
    centerId: string;
  }>;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function publicCenterPath(locale: "en" | "ar", country: string, slug: string): string {
  return `/${locale}/${country.toLowerCase()}/center/${slug}`;
}

function inputClassName(): string {
  return "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100";
}

function textareaClassName(): string {
  return "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100";
}

async function getActiveCenterBasicProfileDetails(centerId: string): Promise<ActiveCenterBasicProfileResult> {
  await requireAdminPermission("active_centers.public_state.update");

  if (!isUuid(centerId)) return { ok: false, reason: "not_found" };

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("centers")
    .select("id,name_en,name_ar,slug,default_country,short_description_en,short_description_ar,description_en,description_ar")
    .eq("id", centerId)
    .eq("status", "active")
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error !== null) return { ok: false, reason: "unavailable" };
  if (data === null) return { ok: false, reason: "not_found" };

  const row = data as ActiveCenterBasicProfileRow;
  const country = row.default_country.toLowerCase();

  return {
    ok: true,
    center: {
      id: row.id,
      nameEn: row.name_en,
      nameAr: row.name_ar,
      slug: row.slug,
      defaultCountry: country,
      shortDescriptionEn: row.short_description_en,
      shortDescriptionAr: row.short_description_ar,
      descriptionEn: row.description_en,
      descriptionAr: row.description_ar,
      publicPathEn: publicCenterPath("en", country, row.slug),
      publicPathAr: publicCenterPath("ar", country, row.slug),
    },
  };
}

export default async function AdminActiveCenterBasicProfileEditPage({ params }: PageProps) {
  const { centerId } = await params;
  const result = await getActiveCenterBasicProfileDetails(centerId);

  if (!result.ok) {
    if (result.reason === "not_found") notFound();

    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-xl font-bold">Active center profile edit unavailable</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6">
          This active center profile edit surface could not be loaded right now. No raw database error is exposed here.
        </p>
      </section>
    );
  }

  const { center } = result;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-cyan-50/40 to-white p-6 shadow-sm ring-1 ring-white/80">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 shadow-sm">
              ACTIVE_CENTER_BASIC_PROFILE_EDIT
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-slate-950">Edit basic profile info</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
              Controlled edit surface for public profile names and descriptions only. Contact, location, taxonomy, media, claim, verification, billing, and commercial state are not editable here.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
            <Link
              href="/admin/active-centers"
              className="inline-flex justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Back to active centers
            </Link>
            <Link
              href={`/admin/active-centers/${center.id}/edit-contact`}
              className="inline-flex justify-center rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-900 transition hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Edit public contact info
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-3xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm text-cyan-950 md:grid-cols-3">
        <div>
          <p className="font-bold">Center</p>
          <p className="mt-1">{center.nameEn}</p>
          {center.nameAr ? <p className="mt-1 text-xs font-semibold">{center.nameAr}</p> : null}
        </div>
        <div>
          <p className="font-bold">Public routes</p>
          <div className="mt-1 flex flex-col gap-1">
            <Link href={center.publicPathEn} className="break-all font-semibold text-cyan-800 hover:text-cyan-950">
              {center.publicPathEn}
            </Link>
            <Link href={center.publicPathAr} className="break-all font-semibold text-cyan-800 hover:text-cyan-950">
              {center.publicPathAr}
            </Link>
          </div>
        </div>
        <div>
          <p className="font-bold">Locked here</p>
          <p className="mt-1">No contact, location, taxonomy, media, claim, verification, billing, or commercial edits.</p>
        </div>
      </section>

      <form action={updateActiveCenterBasicProfileDetails} className="space-y-6">
        <input type="hidden" name="centerId" value={center.id} />

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Basic profile details</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                These fields update public profile copy only. Keep claims factual and avoid best/top/rating/open-now/booking/insurance/MOH claims unless a separate evidence workflow exists.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              6 fields only
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-800">
              English name
              <input name="nameEn" defaultValue={center.nameEn} maxLength={160} required className={inputClassName()} />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Arabic name
              <input name="nameAr" defaultValue={center.nameAr ?? ""} maxLength={160} className={inputClassName()} />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Short description EN
              <textarea
                name="shortDescriptionEn"
                defaultValue={center.shortDescriptionEn ?? ""}
                rows={3}
                maxLength={240}
                className={textareaClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Short description AR
              <textarea
                name="shortDescriptionAr"
                defaultValue={center.shortDescriptionAr ?? ""}
                rows={3}
                maxLength={240}
                className={textareaClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Description EN
              <textarea
                name="descriptionEn"
                defaultValue={center.descriptionEn ?? ""}
                rows={7}
                maxLength={4000}
                className={textareaClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Description AR
              <textarea
                name="descriptionAr"
                defaultValue={center.descriptionAr ?? ""}
                rows={7}
                maxLength={4000}
                className={textareaClassName()}
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-100 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950">
          <h3 className="font-bold">Save behavior</h3>
          <p className="mt-2 max-w-3xl">
            Saving writes an audit event and revalidates English and Arabic public profiles. It does not edit contact actions, locations, taxonomy, media, claim state, verification state, billing, or commercial placement.
          </p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            className="inline-flex justify-center rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            Save basic profile info
          </button>
          <Link href={`/admin/active-centers/${center.id}`} className="text-sm font-bold text-cyan-700 hover:text-cyan-900">
            Check public state readiness
          </Link>
        </div>
      </form>
    </div>
  );
}
