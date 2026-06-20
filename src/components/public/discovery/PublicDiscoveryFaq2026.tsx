"use client";

import { useState } from "react";
import type { PublicDiscoveryFaq } from "./publicDiscoveryPageConfig";

type Props = {
  faq: PublicDiscoveryFaq;
  locale: string;
  dir: "ltr" | "rtl";
  idPrefix: string;
};

export function PublicDiscoveryFaq2026({ faq, locale, dir, idPrefix }: Props) {
  const [openIndex, setOpenIndex] = useState(0);
  const safePrefix = `${idPrefix}-${locale}`;
  const titleId = `dm2026-public-discovery-faq-title-${safePrefix}`;
  const subtitleId = `dm2026-public-discovery-faq-subtitle-${safePrefix}`;

  return (
    <section
      className="dm2026-home-faq dm2026-public-discovery-faq dm2026-container"
      dir={dir}
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
    >
      <div className="dm2026-home-faq__shell dm2026-public-discovery-faq__shell">
        <div className="dm2026-home-faq__intro dm2026-public-discovery-faq__intro">
          <span className="dm2026-badge dm2026-home-faq__badge dm2026-public-discovery-faq__badge">
            {faq.badge}
          </span>
          <div className="dm2026-home-faq__headline-group dm2026-public-discovery-faq__headline-group">
            <h2 id={titleId}>{faq.headline}</h2>
            <p id={subtitleId}>{faq.subtitle}</p>
          </div>
          <ul
            className="dm2026-home-faq__trust-chips dm2026-public-discovery-faq__trust-chips"
            aria-label={faq.badge}
          >
            {faq.trustChips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
        </div>

        <div
          className="dm2026-home-faq__accordion dm2026-public-discovery-faq__accordion"
          aria-label={faq.headline}
        >
          {faq.items.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `dm2026-public-discovery-faq-panel-${safePrefix}-${index}`;
            const buttonId = `dm2026-public-discovery-faq-button-${safePrefix}-${index}`;

            return (
              <article
                className="dm2026-home-faq__item dm2026-public-discovery-faq__item"
                data-open={isOpen ? "true" : "false"}
                key={item.question}
              >
                <h3>
                  <button
                    id={buttonId}
                    className="dm2026-home-faq__button dm2026-public-discovery-faq__button"
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span>{item.question}</span>
                    <span
                      className="dm2026-home-faq__icon dm2026-public-discovery-faq__icon"
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  className="dm2026-home-faq__panel dm2026-public-discovery-faq__panel"
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                >
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
