import "server-only";

import { requireAdminPermission } from "@/server/admin/permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/supabase/types";

export type CommercialAddOnType = "homepage_ads" | "special_offer_placement";
export type CommercialAddOnTerm = "weekly" | "monthly" | "quarterly";

type CenterRow = Database["public"]["Tables"]["centers"]["Row"];
type CampaignRow = Database["public"]["Tables"]["sponsored_campaigns"]["Row"];

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue | undefined };

type JsonObject = { [key: string]: JsonValue | undefined };

export type AdminCommercialAddOnCenterOption = Pick<
  CenterRow,
  "id" | "name_en" | "slug" | "status" | "verification_status"
>;

type CampaignSelectedRow = Pick<
  CampaignRow,
  | "id"
  | "center_id"
  | "title_en"
  | "status"
  | "starts_at"
  | "ends_at"
  | "budget_amount"
  | "currency_code"
  | "metadata"
  | "created_at"
  | "updated_at"
>;

export type AdminCommercialAddOnItem = {
  id: string;
  center: AdminCommercialAddOnCenterOption | null;
  addOnType: CommercialAddOnType | "unknown";
  term: CommercialAddOnTerm | "unknown";
  status: CampaignRow["status"];
  titleEn: string;
  budgetAmount: number | null;
  currencyCode: string;
  startsAt: string | null;
  endsAt: string | null;
  placementKey: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCommercialAddOnsResult =
  | {
      ok: true;
      centers: AdminCommercialAddOnCenterOption[];
      items: AdminCommercialAddOnItem[];
      limit: number;
    }
  | {
      ok: false;
      centers: [];
      items: [];
      limit: number;
      reason: "unavailable";
    };

const fixedLimit = 100;
const centerSelectColumns = "id, name_en, slug, status, verification_status";
const campaignSelectColumns =
  "id, center_id, title_en, status, starts_at, ends_at, budget_amount, currency_code, metadata, created_at, updated_at";

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function metadataString(metadata: unknown, key: string): string | null {
  if (!isJsonObject(metadata)) return null;

  const value = metadata[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function normalizeAddOnType(value: string | null): CommercialAddOnType | "unknown" {
  if (value === "homepage_ads" || value === "special_offer_placement") {
    return value;
  }

  return "unknown";
}

function normalizeTerm(value: string | null): CommercialAddOnTerm | "unknown" {
  if (value === "weekly" || value === "monthly" || value === "quarterly") {
    return value;
  }

  return "unknown";
}

function buildItems(
  campaigns: CampaignSelectedRow[],
  centers: AdminCommercialAddOnCenterOption[],
): AdminCommercialAddOnItem[] {
  const centersById = new Map(centers.map((center) => [center.id, center]));

  return campaigns
    .map((campaign): AdminCommercialAddOnItem | null => {
      const addOnType = normalizeAddOnType(
        metadataString(campaign.metadata, "commercial_add_on_type"),
      );
      const term = normalizeTerm(
        metadataString(campaign.metadata, "commercial_add_on_term"),
      );

      if (addOnType === "unknown" || term === "unknown") {
        return null;
      }

      return {
        id: campaign.id,
        center: centersById.get(campaign.center_id) ?? null,
        addOnType,
        term,
        status: campaign.status,
        titleEn: campaign.title_en,
        budgetAmount: campaign.budget_amount,
        currencyCode: campaign.currency_code,
        startsAt: campaign.starts_at,
        endsAt: campaign.ends_at,
        placementKey: metadataString(campaign.metadata, "placement_key"),
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at,
      };
    })
    .filter((item): item is AdminCommercialAddOnItem => item !== null);
}

export async function listAdminCommercialAddOns(): Promise<AdminCommercialAddOnsResult> {
  await requireAdminPermission("commercial_addons.read");

  const supabase = createSupabaseServiceRoleClient();

  const [centersResult, campaignsResult] = await Promise.all([
    supabase
      .from("centers")
      .select(centerSelectColumns)
      .is("deleted_at", null)
      .order("name_en", { ascending: true })
      .limit(fixedLimit),
    supabase
      .from("sponsored_campaigns")
      .select(campaignSelectColumns)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(fixedLimit),
  ]);

  if (
    centersResult.error !== null ||
    centersResult.data === null ||
    campaignsResult.error !== null ||
    campaignsResult.data === null
  ) {
    return {
      ok: false,
      centers: [],
      items: [],
      limit: fixedLimit,
      reason: "unavailable",
    };
  }

  const centers: AdminCommercialAddOnCenterOption[] = centersResult.data;
  const campaigns: CampaignSelectedRow[] = campaignsResult.data;

  return {
    ok: true,
    centers,
    items: buildItems(campaigns, centers),
    limit: fixedLimit,
  };
}
