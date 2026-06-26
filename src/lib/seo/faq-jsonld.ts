import type { PublicDiscoveryFaq } from "@/components/public/discovery/publicDiscoveryPageConfig";
import { normalizePublicBrandCopy } from "@/lib/brand/public-brand-copy";

export function buildFaqJsonLd(faq: PublicDiscoveryFaq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: normalizePublicBrandCopy(item.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: normalizePublicBrandCopy(item.answer),
      },
    })),
  } as const;
}
