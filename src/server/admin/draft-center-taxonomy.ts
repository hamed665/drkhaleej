import "server-only";

import { requireAdminPermission } from "@/server/admin/permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

type QueryError = { message?: string };
type QueryResponse<T> = { data: T | null; error: QueryError | null };

type QueryBuilder<T> = PromiseLike<QueryResponse<T>> & {
  eq(column: string, value: unknown): QueryBuilder<T>;
  is(column: string, value: boolean | null): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  maybeSingle(): Promise<QueryResponse<T>>;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T>;
  select(columns: string): QueryBuilder<T>;
};

type UntypedSupabaseClient = {
  from<T>(table: string): QueryBuilder<T>;
};

type CenterCategoryRow = {
  default_center_type: string | null;
  description_ar: string | null;
  description_en: string | null;
  id: string;
  is_active: boolean;
  name_ar: string;
  name_en: string;
  public_directory_enabled: boolean;
  public_profile_enabled: boolean;
  slug: string;
  sort_order: number;
  vertical_id: string;
};

type HealthcareVerticalRow = {
  id: string;
  is_active: boolean;
  name_ar: string;
  name_en: string;
  public_directory_enabled: boolean;
  public_profile_enabled: boolean;
  slug: string;
  sort_order: number;
};

type CenterCategoryAssignmentRow = {
  category_id: string;
  id: string;
  is_primary: boolean;
  is_public: boolean;
  review_status: string;
  vertical_id: string;
};

export type AdminCenterCategoryOption = {
  categoryId: string;
  categoryNameAr: string;
  categoryNameEn: string;
  categorySlug: string;
  defaultCenterType: string | null;
  verticalId: string;
  verticalNameAr: string;
  verticalNameEn: string;
  verticalSlug: string;
};

export type AdminCenterCategoryAssignment = {
  assignmentId: string;
  categoryId: string;
  isPrimary: boolean;
  isPublic: boolean;
  reviewStatus: string;
  verticalId: string;
};

export type AdminDraftCenterTaxonomyResult =
  | {
      ok: true;
      assignment: AdminCenterCategoryAssignment | null;
      categoryOptions: AdminCenterCategoryOption[];
    }
  | { ok: false; reason: "unavailable"; assignment: null; categoryOptions: [] };

function adminTaxonomyClient(): UntypedSupabaseClient {
  return createSupabaseServiceRoleClient() as unknown as UntypedSupabaseClient;
}

function mapAssignment(row: CenterCategoryAssignmentRow): AdminCenterCategoryAssignment {
  return {
    assignmentId: row.id,
    categoryId: row.category_id,
    isPrimary: row.is_primary,
    isPublic: row.is_public,
    reviewStatus: row.review_status,
    verticalId: row.vertical_id,
  };
}

function mapCategoryOptions(
  categories: CenterCategoryRow[],
  verticals: HealthcareVerticalRow[],
): AdminCenterCategoryOption[] {
  const verticalById = new Map(verticals.map((vertical) => [vertical.id, vertical]));

  return categories
    .map((category) => {
      const vertical = verticalById.get(category.vertical_id);
      if (vertical === undefined) return null;

      return {
        categoryId: category.id,
        categoryNameAr: category.name_ar,
        categoryNameEn: category.name_en,
        categorySlug: category.slug,
        defaultCenterType: category.default_center_type,
        verticalId: vertical.id,
        verticalNameAr: vertical.name_ar,
        verticalNameEn: vertical.name_en,
        verticalSlug: vertical.slug,
      } satisfies AdminCenterCategoryOption;
    })
    .filter((option): option is AdminCenterCategoryOption => option !== null)
    .sort((left, right) => {
      const verticalCompare = left.verticalNameEn.localeCompare(right.verticalNameEn, "en");
      if (verticalCompare !== 0) return verticalCompare;

      return left.categoryNameEn.localeCompare(right.categoryNameEn, "en");
    });
}

export async function getAdminDraftCenterTaxonomy(
  centerId: string,
): Promise<AdminDraftCenterTaxonomyResult> {
  await requireAdminPermission("draft_centers.read");

  const supabase = adminTaxonomyClient();

  const [{ data: verticals, error: verticalsError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase
        .from<HealthcareVerticalRow[]>("healthcare_verticals")
        .select("id, slug, name_en, name_ar, is_active, public_directory_enabled, public_profile_enabled, sort_order")
        .eq("is_active", true)
        .eq("public_profile_enabled", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true }),
      supabase
        .from<CenterCategoryRow[]>("center_categories")
        .select("id, vertical_id, slug, name_en, name_ar, description_en, description_ar, default_center_type, is_active, public_directory_enabled, public_profile_enabled, sort_order")
        .eq("is_active", true)
        .eq("public_profile_enabled", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true }),
    ]);

  if (verticalsError !== null || categoriesError !== null || verticals === null || categories === null) {
    return { ok: false, reason: "unavailable", assignment: null, categoryOptions: [] };
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from<CenterCategoryAssignmentRow>("center_category_assignments")
    .select("id, category_id, vertical_id, is_primary, is_public, review_status")
    .eq("center_id", centerId)
    .eq("is_primary", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (assignmentError !== null) {
    return { ok: false, reason: "unavailable", assignment: null, categoryOptions: [] };
  }

  return {
    ok: true,
    assignment: assignment === null ? null : mapAssignment(assignment),
    categoryOptions: mapCategoryOptions(categories, verticals),
  };
}
