import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PublicPageShell } from '@/components/public/public-page-shell';
import {
  isSupportedCountry,
  isSupportedLocale,
  localeDirection,
  type SupportedLocale,
} from '@/lib/i18n/config';
import { buildLocalizedMetadata } from '@/lib/seo/metadata';

const sourcePolicyPathname = '/source-policy';

type Params = { locale: string; country: string };

type PolicySection = {
  title: string;
  body: string;
  items: readonly string[];
};

type SourcePolicyCopy = {
  metadataTitle: string;
  metadataDescription: string;
  badge: string;
  title: string;
  description: string;
  sections: readonly PolicySection[];
};

const copyByLocale: Record<SupportedLocale, SourcePolicyCopy> = {
  en: {
    metadataTitle: 'Source policy | DrKhaleej',
    metadataDescription:
      'How DrKhaleej treats public directory sources, correction requests, sponsored visibility, and user confirmation for Oman healthcare discovery.',
    badge: 'Source policy',
    title: 'How DrKhaleej handles public directory information.',
    description:
      'This page explains the boundaries for public source review, correction requests, sponsored visibility, and user confirmation. It is a directory policy page, not medical advice.',
    sections: [
      {
        title: 'Directory scope',
        body: 'DrKhaleej presents public discovery information so people can find and compare directory facts before confirming details directly with a provider.',
        items: [
          'DrKhaleej is not a healthcare provider, regulator, insurer, booking guarantee, diagnosis tool, treatment recommender, or emergency service.',
          'Directory facts should be confirmed directly with the listed provider before a visit or decision.',
        ],
      },
      {
        title: 'Source review',
        body: 'Provider and facility details should be based on reviewed public sources or reviewed provider-submitted information.',
        items: [
          'A listing should not imply official verification unless a documented verification process supports that exact wording.',
          'If source and location details conflict, the item should stay under review until the conflict is resolved.',
        ],
      },
      {
        title: 'Corrections',
        body: 'Users and providers should be able to request corrections when public directory information needs review.',
        items: [
          'Correction requests should include the affected URL, field, supporting source or explanation, and contact details for follow-up.',
          'Corrections may require review before public information changes.',
        ],
      },
      {
        title: 'Sponsored visibility',
        body: 'Sponsored visibility must stay separate from directory facts and must not change the factual information shown on a provider profile.',
        items: [
          'Sponsored copy must not imply ranking, endorsement, official recommendation, clinical quality, or outcome superiority.',
          'Sponsored placement does not make a provider the best, first, only, or officially recommended provider.',
        ],
      },
    ],
  },
  ar: {
    metadataTitle: '\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u0645\u0635\u0627\u062f\u0631 | DrKhaleej',
    metadataDescription:
      '\u0643\u064a\u0641 \u064a\u062a\u0639\u0627\u0645\u0644 DrKhaleej \u0645\u0639 \u0645\u0635\u0627\u062f\u0631 \u0627\u0644\u062f\u0644\u064a\u0644 \u0627\u0644\u0639\u0627\u0645\u0629 \u0648\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u062a\u0635\u062d\u064a\u062d \u0648\u0627\u0644\u0638\u0647\u0648\u0631 \u0627\u0644\u0645\u062f\u0639\u0648\u0645 \u0644\u0627\u0643\u062a\u0634\u0627\u0641 \u0627\u0644\u0631\u0639\u0627\u064a\u0629 \u0627\u0644\u0635\u062d\u064a\u0629 \u0641\u064a \u0639\u064f\u0645\u0627\u0646.',
    badge: '\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u0645\u0635\u0627\u062f\u0631',
    title: '\u0643\u064a\u0641 \u064a\u062a\u0639\u0627\u0645\u0644 DrKhaleej \u0645\u0639 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u062f\u0644\u064a\u0644 \u0627\u0644\u0639\u0627\u0645\u0629.',
    description:
      '\u062a\u0648\u0636\u062d \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u062d\u062f\u0648\u062f \u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0645\u0635\u0627\u062f\u0631 \u0627\u0644\u0639\u0627\u0645\u0629 \u0648\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u062a\u0635\u062d\u064a\u062d \u0648\u0627\u0644\u0638\u0647\u0648\u0631 \u0627\u0644\u0645\u062f\u0639\u0648\u0645. \u0647\u064a \u0635\u0641\u062d\u0629 \u0633\u064a\u0627\u0633\u0629 \u062f\u0644\u064a\u0644\u060c \u0648\u0644\u064a\u0633\u062a \u0646\u0635\u064a\u062d\u0629 \u0637\u0628\u064a\u0629.',
    sections: [
      {
        title: '\u0646\u0637\u0627\u0642 \u0627\u0644\u062f\u0644\u064a\u0644',
        body: '\u064a\u0639\u0631\u0636 DrKhaleej \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0643\u062a\u0634\u0627\u0641 \u0639\u0627\u0645\u0629 \u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646 \u0639\u0644\u0649 \u0641\u0647\u0645 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u062f\u0644\u064a\u0644 \u0642\u0628\u0644 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0645\u0639 \u0645\u0642\u062f\u0645 \u0627\u0644\u062e\u062f\u0645\u0629.',
        items: [
          'DrKhaleej \u0644\u064a\u0633 \u0645\u0642\u062f\u0645 \u0631\u0639\u0627\u064a\u0629 \u0635\u062d\u064a\u0629 \u0623\u0648 \u062c\u0647\u0629 \u062a\u0646\u0638\u064a\u0645\u064a\u0629 \u0623\u0648 \u0634\u0631\u0643\u0629 \u062a\u0623\u0645\u064a\u0646 \u0623\u0648 \u0636\u0645\u0627\u0646 \u062d\u062c\u0632 \u0623\u0648 \u062e\u062f\u0645\u0629 \u0637\u0648\u0627\u0631\u0626.',
          '\u064a\u062c\u0628 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0645\u0628\u0627\u0634\u0631\u0629 \u0645\u0639 \u0645\u0642\u062f\u0645 \u0627\u0644\u062e\u062f\u0645\u0629 \u0642\u0628\u0644 \u0627\u0644\u0632\u064a\u0627\u0631\u0629 \u0623\u0648 \u0627\u0644\u0642\u0631\u0627\u0631.',
        ],
      },
      {
        title: '\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0645\u0635\u0627\u062f\u0631',
        body: '\u064a\u062c\u0628 \u0623\u0646 \u062a\u0633\u062a\u0646\u062f \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0645\u0642\u062f\u0645\u064a\u0646 \u0648\u0627\u0644\u0645\u0646\u0634\u0622\u062a \u0625\u0644\u0649 \u0645\u0635\u0627\u062f\u0631 \u0639\u0627\u0645\u0629 \u0645\u0631\u0627\u062c\u0639\u0629 \u0623\u0648 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0645\u0642\u062f\u0645\u0629 \u062a\u0645\u062a \u0645\u0631\u0627\u062c\u0639\u062a\u0647\u0627.',
        items: [
          '\u0644\u0627 \u064a\u062c\u0628 \u0627\u0644\u0625\u064a\u062d\u0627\u0621 \u0628\u0623\u0646 \u0643\u0644 \u0642\u0627\u0626\u0645\u0629 \u062a\u0645 \u062a\u062d\u0642\u064a\u0642\u0647\u0627 \u0631\u0633\u0645\u064a\u0627 \u0645\u0627 \u0644\u0645 \u062a\u0643\u0646 \u0647\u0646\u0627\u0643 \u0639\u0645\u0644\u064a\u0629 \u0645\u0648\u062b\u0642\u0629 \u062a\u062f\u0639\u0645 \u0630\u0644\u0643.',
          '\u0639\u0646\u062f \u062a\u0639\u0627\u0631\u0636 \u0627\u0644\u0645\u0635\u062f\u0631 \u0648\u0627\u0644\u0645\u0648\u0642\u0639\u060c \u064a\u0628\u0642\u0649 \u0627\u0644\u0639\u0646\u0635\u0631 \u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u062d\u062a\u0649 \u064a\u062a\u0645 \u062d\u0644 \u0627\u0644\u062a\u0639\u0627\u0631\u0636.',
        ],
      },
      {
        title: '\u0627\u0644\u062a\u0635\u062d\u064a\u062d\u0627\u062a',
        body: '\u064a\u0645\u0643\u0646 \u0644\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646 \u0648\u0627\u0644\u0645\u0642\u062f\u0645\u064a\u0646 \u0637\u0644\u0628 \u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062a\u064a \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u062a\u0635\u062d\u064a\u062d.',
        items: [
          '\u064a\u0641\u0636\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u062a\u0623\u062b\u0631 \u0648\u0627\u0644\u062d\u0642\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u062a\u0635\u062d\u064a\u062d\u0647 \u0648\u0645\u0635\u062f\u0631 \u062f\u0627\u0639\u0645 \u0623\u0648 \u0634\u0631\u062d.',
          '\u0642\u062f \u062a\u062a\u0637\u0644\u0628 \u0627\u0644\u062a\u0635\u062d\u064a\u062d\u0627\u062a \u0645\u0631\u0627\u062c\u0639\u0629 \u0642\u0628\u0644 \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0639\u0627\u0645\u0629.',
        ],
      },
      {
        title: '\u0627\u0644\u0638\u0647\u0648\u0631 \u0627\u0644\u0645\u062f\u0639\u0648\u0645',
        body: '\u064a\u062c\u0628 \u0623\u0646 \u064a\u0628\u0642\u0649 \u0627\u0644\u0638\u0647\u0648\u0631 \u0627\u0644\u0645\u062f\u0639\u0648\u0645 \u0645\u0646\u0641\u0635\u0644\u0627 \u0639\u0646 \u062d\u0642\u0627\u0626\u0642 \u0627\u0644\u062f\u0644\u064a\u0644.',
        items: [
          '\u0644\u0627 \u064a\u062c\u0628 \u0623\u0646 \u064a\u0648\u062d\u064a \u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u062f\u0639\u0648\u0645 \u0628\u062a\u0631\u062a\u064a\u0628 \u0623\u0648 \u062a\u0632\u0643\u064a\u0629 \u0623\u0648 \u062a\u0648\u0635\u064a\u0629 \u0631\u0633\u0645\u064a\u0629 \u0623\u0648 \u062c\u0648\u062f\u0629 \u0633\u0631\u064a\u0631\u064a\u0629 \u0623\u0648 \u0623\u0641\u0636\u0644\u064a\u0629 \u0646\u062a\u0627\u0626\u062c.',
          '\u0627\u0644\u0638\u0647\u0648\u0631 \u0627\u0644\u0645\u062f\u0639\u0648\u0645 \u0644\u0627 \u064a\u062c\u0639\u0644 \u0627\u0644\u0645\u0642\u062f\u0645 \u0627\u0644\u0623\u0641\u0636\u0644 \u0623\u0648 \u0627\u0644\u0623\u0648\u0644 \u0623\u0648 \u0627\u0644\u0648\u062d\u064a\u062f \u0623\u0648 \u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647 \u0631\u0633\u0645\u064a\u0627.',
        ],
      },
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};
  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({
    locale,
    country,
    pathname: sourcePolicyPathname,
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

export default async function SourcePolicyPage({ params }: { params: Promise<Params> }) {
  const { locale, country } = await params;
  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const copy = copyByLocale[locale];

  const content = (
    <section className="mx-auto grid w-full max-w-5xl gap-5 px-6 py-10 sm:px-8 lg:px-10">
      {copy.sections.map((section) => (
        <article key={section.title} className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700">
            {section.items.map((item) => (
              <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );

  return (
    <PublicPageShell
      dir={localeDirection(locale)}
      heroBadge={copy.badge}
      heroTitle={copy.title}
      heroDescription={copy.description}
      content={content}
    />
  );
}
