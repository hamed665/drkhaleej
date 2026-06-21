import "server-only";

import { redirect } from "next/navigation";

import { adminRoles, type AdminPermissionKey, type AdminRoleKey } from "@/lib/admin/permissions";
import { requirePlatformAdmin, type PlatformAdminProfile } from "@/lib/permissions/admin";

export type CurrentAdminContext = {
  profile: PlatformAdminProfile;
  role: AdminRoleKey;
  permissions: readonly AdminPermissionKey[];
};

export async function getCurrentAdminContext(): Promise<CurrentAdminContext> {
  const profile = await requirePlatformAdmin();
  const role: AdminRoleKey = "super_admin";
  return { profile, role, permissions: adminRoles[role].permissions };
}

export async function getCurrentAdminPermissions(): Promise<readonly AdminPermissionKey[]> {
  const context = await getCurrentAdminContext();
  return context.permissions;
}

export async function requireAdminPermission(permissionKey: AdminPermissionKey): Promise<CurrentAdminContext> {
  const context = await getCurrentAdminContext();
  if (!context.permissions.includes(permissionKey)) {
    redirect("/admin");
  }
  return context;
}
