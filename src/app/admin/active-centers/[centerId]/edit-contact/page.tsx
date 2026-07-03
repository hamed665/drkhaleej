import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";
import { updateActiveCenterPublicContactDetails } from "@/server/admin/active-center-contact-edit-actions";
import { requireAdminPermission } from "@/server/admin/permissions";

type CenterRow = Database["public"]["Tables"]["centers"]["Row"];
type CenterLocationRow = Database["public"]["Tables"]["center_locations"]["Row"];

type ActiveCenterContactEditRow = Pick<
  CenterRow,
  | "id"
  | "name_en"
  | "name_ar"
  | "slug"
  | "default_country"
  | "primary_phone"
  | "secondary_phone"
  | "whatsapp_phone"
  | "email"
  | "website_url"
>;

type ActiveCenterPrimaryLocationRow = Pick<CenterLocationRow, "id" | "map_url">;

type ActiveCenterContactEditDetails = {
  id: string;
  nameEn: string;
  nameAr: string | null;
  slug: string;
  defaultCountry: string;
  primaryPhone: string | null;
  secondaryPhone: string | null;
  whatsappPhone: string | null;
  email: string | null;
  websiteUrl: string | null;
  primaryLocationId: string | null;
  mapUrl: string | null;
  publicPathEn: string;
  publicPathAr: string;
};

type ActiveCenterContactEditResult =
  | { ok: true; center: ActiveCenterContactEditDetails }
  | { ok: false; reason: "not_found" | "unavailable" };

type PageProps = {
  params: Promise<{
    centerId: string;
  }>;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function publicCenterPath(locale: "en" | "ar", country: string, slug: string): string {
  return `/${locale}/${country.toLowerCase()}/center/${slug}`;
}

function inputClassName(): string {
  return "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100";
}

async function getPrimaryActiveLocation(centerId: string): Promise<ActiveCenterPrimaryLocationRow | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("center_locations")
    .select("id,map_url")
    .eq("center_id", centerId)
    .eq("is_active", true)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error !== null || data === null) return null;
  return data as ActiveCenterPrimaryLocationRow;
}

async function getActiveCenterContactEditDetails(centerId: string): Promise<ActiveCenterContactEditResult> {
  await requireAdminPermission("active_centers.public_state.update");

  if (!isUuid(centerId)) return { ok: false, reason: "not_found" };

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("centers")
    .select("id,name_en,name_ar,slug,default_country,primary_phone,secondary_phone,whatsapp_phone,email,website_url")
    .eq("id", centerId)
    .eq("status", "active")
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error !== null) return { ok: false, reason: "unavailable" };
  if (data === null) return { ok: false, reason: "not_found" };

  const row = data as ActiveCenterContactEditRow;
  const country = row.default_country.toLowerCase();
  const location = await getPrimaryActiveLocation(centerId);

  return {
    ok: true,
    center: {
      id: row.id,
      nameEn: row.name_en,
      nameAr: row.name_ar,
      slug: row.slug,
      defaultCountry: country,
      primaryPhone: row.primary_phone,
      secondaryPhone: row.secondary_phone,
      whatsappPhone: row.whatsapp_phone,
      email: row.email,
      websiteUrl: row.website_url,
      primaryLocationId: location?.id ?? null,
      mapUrl: location?.map_url ?? null,
      publicPathEn: publicCenterPath("en", country, row.slug),
      publicPathAr: publicCenterPath("ar", country, row.slug),
    },
  };
}

export default async function AdminActiveCenterContactEditPage({ params }: PageProps) {
  const { centerId } = await params;
  const result = await getActiveCenterContactEditDetails(centerId);

  if (!result.ok) {
    if (result.reason === "not_found") notFound();

    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-xl font-bold">Active center contact edit unavailable</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6">
          This active center contact edit surface could not be loaded right now. No raw database error is exposed here.
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
              ACTIVE_CENTER_CONTACT_EDIT
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-slate-950">Edit public contact info</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
              Controlled edit surface for an already-active center. This form only updates public contact details and the primary active location map URL.
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
              href={`/admin/active-centers/${center.id}/gates`}
              className="inline-flex justify-center rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-900 transition hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              View public action gates
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
          <p className="font-bold">Primary active location</p>
          <p className="mt-1 break-all">{center.primaryLocationId ?? "missing"}</p>
          <p className="mt-1 text-xs font-semibold text-cyan-900">
            Map URL saves only when an active location exists.
          </p>
        </div>
      </section>

      <form action={updateActiveCenterPublicContactDetails} className="space-y-6">
        <input type="hidden" name="centerId" value={center.id} />

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Public contact details</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Empty fields are saved as empty and will not be marked visible. This form does not edit verification, billing, claim, taxonomy, descriptions, media, services, or commercial state.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              6 fields only
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="block text-sm font-semibold text-slate-800">
              Primary phone
              <input
                name="primaryPhone"
                defaultValue={center.primaryPhone ?? ""}
                inputMode="tel"
                autoComplete="tel"
                maxLength={64}
                className={inputClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Secondary phone
              <input
                name="secondaryPhone"
                defaultValue={center.secondaryPhone ?? ""}
                inputMode="tel"
                maxLength={64}
                className={inputClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              WhatsApp phone
              <input
                name="whatsappPhone"
                defaultValue={center.whatsappPhone ?? ""}
                inputMode="tel"
                maxLength={64}
                className={inputClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800">
              Email
              <input
                name="email"
                type="email"
                defaultValue={center.email ?? ""}
                autoComplete="email"
                maxLength={254}
                className={inputClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800 md:col-span-2">
              Website URL
              <input
                name="websiteUrl"
                type="url"
                defaultValue={center.websiteUrl ?? ""}
                maxLength={2048}
                placeholder="https://example.com"
                className={inputClassName()}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-800 md:col-span-2 xl:col-span-3">
              Map URL
              <input
                name="mapUrl"
                type="url"
                defaultValue={center.mapUrl ?? ""}
                maxLength={2048}
                placeholder="https://maps.google.com/..."
                className={inputClassName()}
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                This updates the current primary active location map URL. Do not guess it from the address.
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-100 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950">
          <h3 className="font-bold">Save behavior</h3>
          <p className="mt-2 max-w-3xl">
            Saving approves contact review, turns visibility on only for fields that have real values, revalidates English and Arabic public profiles, revalidates sitemap, and writes an audit event.
          </p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            className="inline-flex justify-center rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            Save public contact details
          </button>
          <Link href={`/admin/active-centers/${center.id}/gates`} className="text-sm font-bold text-cyan-700 hover:text-cyan-900">
            Check gates after saving
          </Link>
        </div>
      </form>
    </div>
  );
}
