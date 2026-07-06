import type { AppProps } from "next/app";

import "@/styles/globals.css";
import "@/styles/dm2026-public-templates.css";
import "@/styles/dm2026-mobile-chrome.css";
import "@/styles/dm2026-public-profile.css";
import "@/styles/dm2026-public-hero.css";
import "@/styles/dm2026-public-contact-location.css";
import "@/styles/dm2026-public-section-hierarchy.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
