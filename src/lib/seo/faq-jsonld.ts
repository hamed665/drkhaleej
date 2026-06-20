import type { PublicDiscoveryFaq } from "@/components/public/discovery/publicDiscoveryPageConfig";

export function buildFaqJsonLd(faq: PublicDiscoveryFaq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  } as const;
}
