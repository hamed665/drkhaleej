import "server-only";

import { headers } from "next/headers";

const defaultAdminRedirectPath = "/admin";

export function normalizeInternalNextPath(
  nextPath: string | null | undefined,
): string {
  const trimmedNextPath = nextPath?.trim();

  if (!trimmedNextPath) {
    return defaultAdminRedirectPath;
  }

  if (!trimmedNextPath.startsWith("/") || trimmedNextPath.startsWith("//")) {
    return defaultAdminRedirectPath;
  }

  try {
    const parsedPath = new URL(trimmedNextPath, "https://drmuscat.local");

    if (parsedPath.origin !== "https://drmuscat.local") {
      return defaultAdminRedirectPath;
    }

    return `${parsedPath.pathname}${parsedPath.search}${parsedPath.hash}`;
  } catch {
    return defaultAdminRedirectPath;
  }
}

export async function getRequestOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";

  if (!host) {
    return "";
  }

  return `${protocol}://${host}`;
}

export function buildAdminLoginRedirectUrl(origin: string): string | undefined {
  if (!origin) {
    return undefined;
  }

  const redirectUrl = new URL("/auth/callback", origin);
  redirectUrl.searchParams.set("next", defaultAdminRedirectPath);

  return redirectUrl.toString();
}
