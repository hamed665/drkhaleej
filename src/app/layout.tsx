import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { isSupportedLocale, localeDirection } from "@/lib/i18n/config";
import { defaultMetadata } from "@/lib/seo/meta";
import "@/styles/globals.css";
import "@/styles/dm2026-public-templates.css";
import "@/styles/dm2026-mobile-chrome.css";
import "@/styles/dm2026-public-profile.css";
import "@/styles/dm2026-public-hero.css";

export const metadata: Metadata = defaultMetadata;

function isAdminRequestPath(path: string | null): boolean {
  return path === "/admin" || path?.startsWith("/admin/") === true;
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const localeHeader =
    requestHeaders.get("x-drkhaleej-locale") ??
    requestHeaders.get("x-drmuscat-locale");
  const locale =
    localeHeader && isSupportedLocale(localeHeader) ? localeHeader : "en";
  const requestPath =
    requestHeaders.get("x-next-url") ??
    requestHeaders.get("x-matched-path") ??
    requestHeaders.get("next-url");
  const body = isAdminRequestPath(requestPath) ? (
    children
  ) : (
    <AppShell>{children}</AppShell>
  );

  return (
    <html lang={locale} dir={localeDirection(locale)}>
      <body>{body}</body>
    </html>
  );
}
