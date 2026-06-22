'use client';

import { useState } from 'react';
import type { SupportedLocale } from '@/lib/i18n/config';

type HomeFAQ2026Props = {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
  items?: readonly HomeFAQItem[];
};

export type HomeFAQItem = {
  question: string;
  answer: string;
};

type HomeFAQCopy = {
  badge: string;
  headline: string;
  subtitle: string;
  trustChips: readonly string[];
  items: readonly HomeFAQItem[];
};

export const homeFAQCopy: Record<SupportedLocale, HomeFAQCopy> = {
  en: {
    badge: 'FAQ',
    headline: 'Questions before you explore care',
    subtitle: 'Clear answers about DrMuscat, provider information, offers, and safe public discovery in Oman.',
    trustChips: ['Oman public discovery', 'Arabic + English', 'Medical-safe guidance'],
    items: [
      {
        question: 'What is DrMuscat?',
        answer:
          'DrMuscat is a public healthcare discovery platform for Oman. It helps people explore doctors, clinics, hospitals, labs, pharmacies, beauty centers, pet clinics, wellness providers, services, and special offer previews.'
      },
      {
        question: 'Does DrMuscat provide medical advice?',
        answer:
          'No. DrMuscat is for public discovery only and does not provide medical advice, diagnosis, or treatment recommendations. Always confirm medical decisions with a qualified healthcare professional.'
      },
      {
        question: 'Are provider details reviewed before publishing?',
        answer:
          'Provider details can appear after review and approval. Users should still confirm opening hours, services, prices, offers, and availability directly with the provider before visiting.'
      },
      {
        question: 'Do Special Offers mean a provider is medically better?',
        answer:
          'No. Special Offers are promotional previews and do not represent medical quality rankings. Sponsored visibility and offers should be understood separately from medical quality.'
      },
      {
        question: 'Can I contact providers directly from DrMuscat?',
        answer:
          'DrMuscat is designed to support direct actions such as WhatsApp, call, directions, and profile viewing when provider details are approved and available.'
      },
      {
        question: 'Can clinics and healthcare providers list their center?',
        answer:
          'Yes. Providers can prepare a reviewed public profile with photos, services, special offers, and direct contact actions. Full onboarding and plan details will be handled in a dedicated provider flow.'
      },
      {
        question: 'Does DrMuscat support Arabic and English?',
        answer: 'Yes. DrMuscat is built for Arabic and English discovery in Oman, with RTL-aware design for Arabic users.'
      },
      {
        question: 'Should I confirm details before visiting a provider?',
        answer:
          'Yes. Always confirm services, prices, offers, opening hours, appointment availability, and location directly with the provider before visiting.'
      }
    ]
  },
  ar: {
    badge: 'الأسئلة الشائعة',
    headline: 'أسئلة قبل استكشاف الرعاية',
    subtitle: 'إجابات واضحة حول DrMuscat ومعلومات مقدمي الخدمة والعروض والاكتشاف العام الآمن في عُمان.',
    trustChips: ['اكتشاف عام في عُمان', 'العربية + الإنجليزية', 'محتوى آمن طبياً'],
    items: [
      {
        question: 'ما هو DrMuscat؟',
        answer:
          'DrMuscat هو منصة اكتشاف عامة للرعاية الصحية في عُمان. يساعد المستخدمين على استكشاف الأطباء والعيادات والمستشفيات والمختبرات والصيدليات ومراكز التجميل والعيادات البيطرية ومقدمي خدمات الرفاهية والخدمات ومعاينات العروض الخاصة.'
      },
      {
        question: 'هل يقدم DrMuscat نصائح طبية؟',
        answer:
          'لا. DrMuscat مخصص للاكتشاف العام فقط، ولا يقدم نصائح طبية أو تشخيصاً أو توصيات علاجية. يجب دائماً تأكيد القرارات الطبية مع مختص رعاية صحية مؤهل.'
      },
      {
        question: 'هل تتم مراجعة تفاصيل مقدمي الخدمة قبل النشر؟',
        answer:
          'يمكن أن تظهر تفاصيل مقدمي الخدمة بعد المراجعة والاعتماد. ومع ذلك، يجب على المستخدمين تأكيد ساعات العمل والخدمات والأسعار والعروض والتوفر مباشرة مع مقدم الخدمة قبل الزيارة.'
      },
      {
        question: 'هل تعني العروض الخاصة أن مقدم الخدمة أفضل طبياً؟',
        answer:
          'لا. العروض الخاصة هي معاينات ترويجية ولا تمثل ترتيباً لجودة طبية. يجب فهم الظهور المدعوم والعروض بشكل منفصل عن جودة الخدمة الطبية.'
      },
      {
        question: 'هل يمكنني التواصل مباشرة مع مقدمي الخدمة عبر DrMuscat؟',
        answer:
          'تم تصميم DrMuscat لدعم إجراءات التواصل المباشر مثل واتساب والاتصال والاتجاهات وعرض الملف عندما تكون تفاصيل مقدم الخدمة معتمدة ومتاحة.'
      },
      {
        question: 'هل يمكن للعيادات ومقدمي الرعاية الصحية إدراج مراكزهم؟',
        answer:
          'نعم. يمكن لمقدمي الخدمة تجهيز ملف عام بعد المراجعة، مع الصور والخدمات والعروض الخاصة وإجراءات التواصل المباشر. سيتم التعامل مع تفاصيل الانضمام والخطط في مسار مخصص لمقدمي الخدمة.'
      },
      {
        question: 'هل يدعم DrMuscat العربية والإنجليزية؟',
        answer:
          'نعم. تم بناء DrMuscat لدعم الاكتشاف بالعربية والإنجليزية في عُمان، مع تصميم مناسب لاتجاه الكتابة من اليمين إلى اليسار للمستخدمين العرب.'
      },
      {
        question: 'هل يجب تأكيد التفاصيل قبل زيارة مقدم الخدمة؟',
        answer:
          'نعم. يجب دائماً تأكيد الخدمات والأسعار والعروض وساعات العمل وتوفر المواعيد والموقع مباشرة مع مقدم الخدمة قبل الزيارة.'
      }
    ]
  }
};

export function HomeFAQ2026({ locale, dir, items }: HomeFAQ2026Props) {
  const copy = homeFAQCopy[locale];
  const renderedItems = items && items.length > 0 ? items : copy.items;
  const [openIndex, setOpenIndex] = useState(0);
  const titleId = `dm2026-home-faq-title-${locale}`;
  const subtitleId = `dm2026-home-faq-subtitle-${locale}`;

  return (
    <section className="dm2026-home-faq dm2026-container" dir={dir} aria-labelledby={titleId} aria-describedby={subtitleId}>
      <div className="dm2026-home-faq__shell">
        <div className="dm2026-home-faq__intro">
          <span className="dm2026-badge dm2026-home-faq__badge">{copy.badge}</span>
          <div className="dm2026-home-faq__headline-group">
            <h2 id={titleId}>{copy.headline}</h2>
            <p id={subtitleId}>{copy.subtitle}</p>
          </div>
          <ul className="dm2026-home-faq__trust-chips" aria-label={copy.badge}>
            {copy.trustChips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
        </div>

        <div className="dm2026-home-faq__accordion" aria-label={copy.headline}>
          {renderedItems.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `dm2026-home-faq-panel-${locale}-${index}`;
            const buttonId = `dm2026-home-faq-button-${locale}-${index}`;

            return (
              <article className="dm2026-home-faq__item" data-open={isOpen ? 'true' : 'false'} key={item.question}>
                <h3>
                  <button
                    id={buttonId}
                    className="dm2026-home-faq__button"
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span>{item.question}</span>
                    <span className="dm2026-home-faq__icon" aria-hidden="true" />
                  </button>
                </h3>
                <div id={panelId} className="dm2026-home-faq__panel" role="region" aria-labelledby={buttonId} hidden={!isOpen}>
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
