import type { ReactNode } from "react";
import { headers } from "next/headers";

import { AdminShell } from "@/components/admin/admin-shell";
import { requirePlatformAdmin } from "@/lib/permissions/admin";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

function isAdminLoginRequestPath(path: string | null): boolean {
  return path === "/admin/login" || path?.startsWith("/admin/login?") === true;
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const requestHeaders = await headers();
  const requestPath =
    requestHeaders.get("x-next-url") ??
    requestHeaders.get("x-matched-path") ??
    requestHeaders.get("next-url");

  if (isAdminLoginRequestPath(requestPath)) {
    return children;
  }

  const admin = await requirePlatformAdmin();

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
