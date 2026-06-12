import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  localeDirection,
  isSupportedCountry,
  isSupportedLocale,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata";

import {
  ProviderOnboardingForm,
  type ProviderFormCopy,
} from "./provider-onboarding-form";

type Params = { locale: string; country: string };

type IconName =
  | "profile"
  | "language"
  | "contact"
  | "review"
  | "services"
  | "offers"
  | "clinic"
  | "doctor"
  | "dental"
  | "pharmacy"
  | "lab"
  | "hospital"
  | "wellness"
  | "pet"
  | "question";

type ProviderPageCopy = {
  metadataTitle: string;
  metadataDescription: string;
  badge: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  heroNote: string;
  heroVisualTitle: string;
  heroVisualSubtitle: string;
  heroVisualPills: readonly string[];
  microBenefits: readonly string[];
  audienceTitle: string;
  audienceDescription: string;
  audienceItems: readonly { title: string; icon: IconName }[];
  benefitsTitle: string;
  benefitsDescription: string;
  benefits: readonly { title: string; description: string; icon: IconName }[];
  processTitle: string;
  processSteps: readonly { title: string; description: string }[];
  reviewTitle: string;
  reviewIntro: string;
  reviewItems: readonly string[];
  formSectionTitle: string;
  formSectionHelper: string;
  faqTitle: string;
  faqDescription: string;
  faqs: readonly { question: string; answer: string }[];
  finalCtaTitle: string;
  finalCtaBody: string;
  finalCta: string;
  disclaimer: string;
  form: ProviderFormCopy;
};

const copyByLocale: Record<SupportedLocale, ProviderPageCopy> = {
  en: {
    metadataTitle: "For providers in Oman | DrMuscat",
    metadataDescription:
      "Request a reviewed bilingual public discovery presence on DrMuscat for healthcare, beauty, wellness, dental, pharmacy, lab, hospital and pet-care providers in Oman.",
    badge: "For providers in Oman",
    title: "Build a reviewed public presence on DrMuscat",
    description:
      "DrMuscat helps healthcare, beauty, wellness, dental, pharmacy, lab, hospital, and pet-care providers in Oman prepare a clear bilingual discovery profile for future public listing pages.",
    primaryCta: "Request onboarding review",
    secondaryCta: "See how it works",
    heroNote:
      "No instant publishing, rankings, reviews, or paid placement are promised. Public information is reviewed before any listing is prepared.",
    heroVisualTitle: "Reviewed discovery presence",
    heroVisualSubtitle: "Public profile preparation for Oman providers",
    heroVisualPills: ["Profile", "Location", "Contact", "Review"],
    microBenefits: [
      "Bilingual discovery presence",
      "Public contact readiness",
      "Reviewed provider information",
    ],
    audienceTitle: "Who can join DrMuscat?",
    audienceDescription:
      "DrMuscat is being prepared for a broad healthcare, beauty, wellness, and pet-care ecosystem across Oman.",
    audienceItems: [
      { title: "Clinics", icon: "clinic" },
      { title: "Doctors", icon: "doctor" },
      { title: "Dental clinics", icon: "dental" },
      { title: "Pharmacies", icon: "pharmacy" },
      { title: "Laboratories", icon: "lab" },
      { title: "Hospitals & polyclinics", icon: "hospital" },
      { title: "Beauty & wellness providers", icon: "wellness" },
      { title: "Pet clinics", icon: "pet" },
    ],
    benefitsTitle: "Why providers use DrMuscat",
    benefitsDescription:
      "A DrMuscat listing is designed to help people understand who you are, where you are, and how to reach you through reviewed public information.",
    benefits: [
      {
        title: "Public discovery profile",
        description:
          "Prepare a clear public profile with your name, category, city, area, services, and contact options after review.",
        icon: "profile",
      },
      {
        title: "Bilingual presence",
        description:
          "Support English and Arabic discovery for audiences in Oman without inventing unsupported claims.",
        icon: "language",
      },
      {
        title: "Contact readiness",
        description:
          "Prepare public phone, WhatsApp, website, address, and directions information when it is safe and confirmed.",
        icon: "contact",
      },
      {
        title: "Reviewed public information",
        description:
          "DrMuscat is structured around reviewed public data, not fake ratings, fake reviews, or unsupported badges.",
        icon: "review",
      },
      {
        title: "Service visibility",
        description:
          "Show broad service categories clearly so users can understand what your center offers before contacting you.",
        icon: "services",
      },
      {
        title: "Future provider-approved offers",
        description:
          "Offers may be supported later only when provider-approved, reviewed, and clearly presented as public information.",
        icon: "offers",
      },
    ],
    processTitle: "How onboarding works",
    processSteps: [
      {
        title: "Submit your request",
        description:
          "Share your business details, contact person, public contact channels, provider type, city, and preferred language.",
      },
      {
        title: "DrMuscat reviews public information",
        description:
          "The team reviews whether the submitted details are suitable for a neutral public discovery profile.",
      },
      {
        title: "Profile preparation",
        description:
          "Approved public details can be prepared for future listing pages with call, WhatsApp, website, or directions readiness where available.",
      },
    ],
    reviewTitle: "What we review before a profile is prepared",
    reviewIntro:
      "Every provider profile should be based on public, safe, and confirmation-ready information.",
    reviewItems: [
      "Business or provider name",
      "Provider category",
      "City and area",
      "Public phone and WhatsApp",
      "Website and public address",
      "Map or directions readiness",
      "Public service categories",
      "Bilingual wording where available",
    ],
    formSectionTitle: "Request onboarding review",
    formSectionHelper:
      "Send your interest to the DrMuscat provider team. We will review the submitted public information before any profile is prepared.",
    faqTitle: "Provider questions before joining",
    faqDescription:
      "Clear answers for clinic owners, managers, doctors, pharmacists, lab owners, wellness providers, and pet clinic teams.",
    faqs: [
      {
        question: "Is DrMuscat a booking platform?",
        answer:
          "Not at this stage. DrMuscat is currently focused on public discovery and provider visibility. Booking may be considered in a later phase only if it is designed, approved, and clearly communicated to providers.",
      },
      {
        question:
          "Will my center be published immediately after I submit the form?",
        answer:
          "No. Submitting the form does not guarantee immediate publication. DrMuscat reviews public provider information first to make sure it is suitable for a neutral discovery profile.",
      },
      {
        question: "Does this request give my business a verified badge?",
        answer:
          "No. This onboarding request does not create verified, claimed, sponsored, or ranked status. Any future verification or claim workflow would require a separate approved process.",
      },
      {
        question: "What information does DrMuscat review first?",
        answer:
          "The first review usually focuses on the provider name, provider type, city, area, public contact details, website, address or map information, and broad service categories.",
      },
      {
        question: "Can my profile appear in English and Arabic?",
        answer:
          "Yes. DrMuscat is designed for bilingual public discovery. English and Arabic wording should be clear, accurate, and free from unsupported medical, legal, licensing, or credential claims.",
      },
      {
        question: "Can I add offers or packages later?",
        answer:
          "Offers may be supported in a future phase only when they are provider-approved, reviewed, and clearly presented as public information. This form is currently for onboarding interest and public information review.",
      },
      {
        question: "Does DrMuscat provide medical advice?",
        answer:
          "No. DrMuscat is a discovery and visibility platform. It does not provide medical advice, diagnosis, treatment recommendations, or clinical guarantees. Users should confirm medical details directly with providers.",
      },
      {
        question: "Can prices or insurance information be listed?",
        answer:
          "Only if the information is provider-submitted or officially public, and even then it should be presented carefully as subject to confirmation. Unverified pricing or insurance acceptance should not be published.",
      },
      {
        question:
          "Will being on DrMuscat guarantee Google ranking or new patients?",
        answer:
          "No. DrMuscat pages are designed to be structured and SEO-friendly, but rankings, traffic, leads, and patient acquisition cannot be guaranteed.",
      },
      {
        question: "What happens if my submitted information is incomplete?",
        answer:
          "Incomplete or unclear information may be held for review, marked as needing more details, or skipped until it can be confirmed from a safe public or provider-submitted source.",
      },
    ],
    finalCtaTitle: "Ready to prepare your public discovery profile?",
    finalCtaBody:
      "Send your onboarding request and help DrMuscat review the public information needed to prepare your provider presence.",
    finalCta: "Request onboarding review",
    disclaimer:
      "DrMuscat is a discovery and visibility platform. It does not provide medical advice, diagnosis, treatment recommendations, provider verification, or guaranteed results. Provider information may require review before publication. Users should confirm services, availability, prices, offers, insurance, and clinical details directly with the provider.",
    form: {
      eyebrow: "Provider request",
      title: "Request onboarding review",
      description:
        "Send your interest to the DrMuscat provider team. We will review the submitted public information before any profile is prepared.",
      requiredNote:
        "Required fields are checked by the browser before submission.",
      labels: {
        centerName: "Center or business name",
        contactName: "Contact person",
        phone: "Phone",
        whatsapp: "WhatsApp (optional)",
        email: "Email (optional)",
        providerType: "Provider type",
        cityText: "City",
        areaText: "Area (optional)",
        preferredLanguage: "Preferred language",
        message: "Message (optional)",
        consent:
          "I agree that DrMuscat may contact me about provider onboarding and review of public information.",
        honeypot: "Website",
      },
      placeholders: {
        centerName: "Example Medical Center",
        contactName: "Your name",
        phone: "+968 ...",
        whatsapp: "+968 ...",
        email: "name@example.com",
        cityText: "Muscat",
        areaText: "Al Khuwair",
        message: "Tell us which services or public details you want reviewed.",
      },
      providerTypeOptions: [
        { value: "clinic", label: "Clinic" },
        { value: "medical_center", label: "Medical center or hospital" },
        { value: "dental_clinic", label: "Dental clinic" },
        { value: "pharmacy", label: "Pharmacy" },
        { value: "lab", label: "Lab" },
        { value: "wellness", label: "Beauty or wellness provider" },
        { value: "other", label: "Other, including pet clinic" },
      ],
      languageOptions: [
        { value: "en", label: "English" },
        { value: "ar", label: "Arabic" },
        { value: "en-ar", label: "English and Arabic" },
      ],
      submit: "Send onboarding request",
      submitting: "Sending request…",
      success: "Thank you. Your request was received for review.",
      error:
        "We could not send the request. Please check the fields and try again.",
    },
  },
  ar: {
    metadataTitle: "لمقدمي الخدمات في عُمان | DrMuscat",
    metadataDescription:
      "اطلب حضوراً عاماً ثنائي اللغة ومراجعاً على DrMuscat لمقدمي الرعاية الصحية والتجميل والرفاهية وطب الأسنان والصيدليات والمختبرات والمستشفيات ورعاية الحيوانات الأليفة في عُمان.",
    badge: "لمقدمي الخدمات في عُمان",
    title: "أنشئ حضوراً عاماً مُراجعاً على DrMuscat",
    description:
      "يساعد DrMuscat مقدمي خدمات الرعاية الصحية والتجميل والرفاهية وطب الأسنان والصيدليات والمختبرات والمستشفيات وعيادات الحيوانات الأليفة في عُمان على تجهيز ملف تعريفي واضح ثنائي اللغة لصفحات الاكتشاف العامة مستقبلاً.",
    primaryCta: "اطلب مراجعة الانضمام",
    secondaryCta: "تعرّف على آلية العمل",
    heroNote:
      "لا نعد بالنشر الفوري أو الترتيب أو المراجعات أو الظهور المدفوع. تتم مراجعة المعلومات العامة قبل تجهيز أي ملف للنشر.",
    heroVisualTitle: "حضور اكتشاف بعد المراجعة",
    heroVisualSubtitle: "تجهيز ملف عام لمقدمي الخدمات في عُمان",
    heroVisualPills: ["الملف", "الموقع", "التواصل", "المراجعة"],
    microBenefits: [
      "حضور ثنائي اللغة",
      "جاهزية بيانات التواصل العامة",
      "معلومات مقدم خدمة بعد المراجعة",
    ],
    audienceTitle: "من يمكنه الانضمام إلى DrMuscat؟",
    audienceDescription:
      "يتم تجهيز DrMuscat لخدمة منظومة واسعة من الرعاية الصحية والتجميل والرفاهية ورعاية الحيوانات الأليفة في عُمان.",
    audienceItems: [
      { title: "العيادات", icon: "clinic" },
      { title: "الأطباء", icon: "doctor" },
      { title: "عيادات الأسنان", icon: "dental" },
      { title: "الصيدليات", icon: "pharmacy" },
      { title: "المختبرات", icon: "lab" },
      { title: "المستشفيات والمجمعات الطبية", icon: "hospital" },
      { title: "مقدمو التجميل والرفاهية", icon: "wellness" },
      { title: "عيادات الحيوانات الأليفة", icon: "pet" },
    ],
    benefitsTitle: "لماذا يهتم مقدمو الخدمات بـ DrMuscat؟",
    benefitsDescription:
      "صُمم ظهورك على DrMuscat ليساعد الناس على فهم من أنت وأين تقع وكيف يمكنهم التواصل معك من خلال معلومات عامة تتم مراجعتها.",
    benefits: [
      {
        title: "ملف اكتشاف عام",
        description:
          "جهّز ملفاً عاماً واضحاً يتضمن الاسم والفئة والمدينة والمنطقة والخدمات وطرق التواصل بعد المراجعة.",
        icon: "profile",
      },
      {
        title: "حضور ثنائي اللغة",
        description:
          "ادعم الظهور بالعربية والإنجليزية لجمهور عُمان دون إنشاء ادعاءات غير مؤكدة.",
        icon: "language",
      },
      {
        title: "جاهزية التواصل",
        description:
          "جهّز الهاتف العام والواتساب والموقع الإلكتروني والعنوان والاتجاهات عندما تكون المعلومات مؤكدة وآمنة للنشر.",
        icon: "contact",
      },
      {
        title: "معلومات عامة بعد المراجعة",
        description:
          "يعتمد DrMuscat على معلومات عامة تتم مراجعتها، وليس على تقييمات أو مراجعات أو شارات غير حقيقية.",
        icon: "review",
      },
      {
        title: "وضوح الخدمات",
        description:
          "اعرض فئات الخدمات العامة بوضوح ليساعد المستخدمين على فهم ما يقدمه مركزك قبل التواصل.",
        icon: "services",
      },
      {
        title: "عروض مستقبلية بموافقة مقدم الخدمة",
        description:
          "قد يتم دعم العروض لاحقاً فقط عندما تكون بموافقة مقدم الخدمة وبعد المراجعة وبصياغة واضحة كمعلومات عامة.",
        icon: "offers",
      },
    ],
    processTitle: "كيف تتم عملية الانضمام؟",
    processSteps: [
      {
        title: "أرسل طلبك",
        description:
          "شارك بيانات النشاط، الشخص المسؤول، قنوات التواصل العامة، نوع مقدم الخدمة، المدينة، ولغة التواصل المفضلة.",
      },
      {
        title: "يراجع DrMuscat المعلومات العامة",
        description:
          "يراجع الفريق ما إذا كانت البيانات مناسبة لملف اكتشاف عام ومحايد.",
      },
      {
        title: "تجهيز الملف",
        description:
          "يمكن تجهيز البيانات العامة المعتمدة لصفحات الإدراج المستقبلية مع جاهزية الاتصال أو الواتساب أو الموقع أو الاتجاهات عند توفرها.",
      },
    ],
    reviewTitle: "ما الذي نراجعه قبل تجهيز الملف؟",
    reviewIntro:
      "يجب أن يعتمد كل ملف لمقدم خدمة على معلومات عامة وآمنة وقابلة للتأكيد.",
    reviewItems: [
      "اسم النشاط أو مقدم الخدمة",
      "فئة مقدم الخدمة",
      "المدينة والمنطقة",
      "الهاتف العام والواتساب",
      "الموقع الإلكتروني والعنوان العام",
      "جاهزية الخريطة أو الاتجاهات",
      "فئات الخدمات العامة",
      "الصياغة الثنائية اللغة عند توفرها",
    ],
    formSectionTitle: "اطلب مراجعة الانضمام",
    formSectionHelper:
      "أرسل اهتمامك إلى فريق مقدمي الخدمات في DrMuscat. سنراجع المعلومات العامة المرسلة قبل تجهيز أي ملف.",
    faqTitle: "أسئلة مقدمي الخدمات قبل الانضمام",
    faqDescription:
      "إجابات واضحة لأصحاب العيادات والمديرين والأطباء والصيادلة وأصحاب المختبرات ومقدمي الرفاهية وفرق عيادات الحيوانات الأليفة.",
    faqs: [
      {
        question: "هل DrMuscat منصة حجز مواعيد؟",
        answer:
          "ليس في هذه المرحلة. يركز DrMuscat حالياً على الاكتشاف العام وظهور مقدمي الخدمات. قد يتم دراسة الحجز في مرحلة لاحقة فقط إذا تم تصميمه واعتماده وتوضيحه لمقدمي الخدمات.",
      },
      {
        question: "هل سيتم نشر مركزي فوراً بعد إرسال النموذج؟",
        answer:
          "لا. إرسال النموذج لا يعني النشر الفوري. يراجع DrMuscat معلومات مقدم الخدمة العامة أولاً للتأكد من ملاءمتها لملف اكتشاف عام ومحايد.",
      },
      {
        question: "هل يمنح هذا الطلب نشاطي شارة موثّق؟",
        answer:
          "لا. طلب الانضمام لا ينشئ حالة موثّق أو مُطالب به أو ممول أو مصنّف. أي آلية تحقق أو مطالبة مستقبلية ستحتاج إلى عملية منفصلة ومعتمدة.",
      },
      {
        question: "ما المعلومات التي يراجعها DrMuscat أولاً؟",
        answer:
          "تركز المراجعة الأولى عادةً على اسم مقدم الخدمة، نوع النشاط، المدينة، المنطقة، بيانات التواصل العامة، الموقع الإلكتروني، العنوان أو الخريطة، وفئات الخدمات العامة.",
      },
      {
        question: "هل يمكن أن يظهر ملفي بالعربية والإنجليزية؟",
        answer:
          "نعم. صُمم DrMuscat لدعم الاكتشاف العام ثنائي اللغة. يجب أن تكون الصياغة بالعربية والإنجليزية واضحة ودقيقة وخالية من أي ادعاءات طبية أو قانونية أو ترخيصية أو مهنية غير مؤكدة.",
      },
      {
        question: "هل يمكنني إضافة عروض أو باقات لاحقاً؟",
        answer:
          "قد يتم دعم العروض في مرحلة مستقبلية فقط عندما تكون بموافقة مقدم الخدمة وبعد المراجعة وبصياغة واضحة كمعلومات عامة. هذا النموذج حالياً مخصص لطلب الانضمام ومراجعة المعلومات العامة.",
      },
      {
        question: "هل يقدم DrMuscat نصائح طبية؟",
        answer:
          "لا. DrMuscat منصة اكتشاف وظهور عام. لا يقدم نصائح طبية أو تشخيصاً أو توصيات علاجية أو ضمانات سريرية. يجب على المستخدمين تأكيد التفاصيل الطبية مباشرة مع مقدمي الخدمات.",
      },
      {
        question: "هل يمكن عرض الأسعار أو معلومات التأمين؟",
        answer:
          "فقط إذا كانت المعلومات مقدمة من مقدم الخدمة أو منشورة رسمياً، وحتى في هذه الحالة يجب عرضها بحذر باعتبارها قابلة للتأكيد. لا ينبغي نشر الأسعار أو قبول التأمين إذا لم تكن مؤكدة.",
      },
      {
        question: "هل يضمن ظهوري على DrMuscat ترتيباً في جوجل أو مرضى جدد؟",
        answer:
          "لا. يتم تصميم صفحات DrMuscat لتكون منظمة ومناسبة لمحركات البحث، لكن لا يمكن ضمان الترتيب أو الزيارات أو العملاء المحتملين أو اكتساب المرضى.",
      },
      {
        question: "ماذا يحدث إذا كانت المعلومات التي أرسلها غير مكتملة؟",
        answer:
          "قد يتم الاحتفاظ بالمعلومات غير المكتملة أو غير الواضحة للمراجعة، أو تعليمها على أنها تحتاج إلى تفاصيل إضافية، أو تجاوزها حتى يمكن تأكيدها من مصدر عام آمن أو من مقدم الخدمة نفسه.",
      },
    ],
    finalCtaTitle: "هل أنت مستعد لتجهيز حضورك العام؟",
    finalCtaBody:
      "أرسل طلب الانضمام وساعد DrMuscat على مراجعة المعلومات العامة اللازمة لتجهيز حضور مقدم الخدمة.",
    finalCta: "اطلب مراجعة الانضمام",
    disclaimer:
      "DrMuscat منصة اكتشاف وظهور عام. لا يقدم نصائح طبية أو تشخيصاً أو توصيات علاجية أو توثيقاً لمقدمي الخدمات أو ضمانات للنتائج. قد تتطلب معلومات مقدم الخدمة مراجعة قبل النشر. يجب على المستخدمين تأكيد الخدمات والتوفر والأسعار والعروض والتأمين والتفاصيل السريرية مباشرة مع مقدم الخدمة.",
    form: {
      eyebrow: "طلب مقدم خدمة",
      title: "اطلب مراجعة الانضمام",
      description:
        "أرسل اهتمامك إلى فريق مقدمي الخدمات في DrMuscat. سنراجع المعلومات العامة المرسلة قبل تجهيز أي ملف.",
      requiredNote: "تتحقق المتصفحات من الحقول المطلوبة قبل الإرسال.",
      labels: {
        centerName: "اسم المركز أو النشاط",
        contactName: "الشخص المسؤول للتواصل",
        phone: "الهاتف",
        whatsapp: "واتساب (اختياري)",
        email: "البريد الإلكتروني (اختياري)",
        providerType: "نوع مقدم الخدمة",
        cityText: "المدينة",
        areaText: "المنطقة (اختياري)",
        preferredLanguage: "لغة التواصل المفضلة",
        message: "رسالة (اختياري)",
        consent:
          "أوافق على أن تتواصل معي DrMuscat بخصوص الانضمام ومراجعة المعلومات العامة.",
        honeypot: "الموقع الإلكتروني",
      },
      placeholders: {
        centerName: "مثال: مركز طبي",
        contactName: "اسمك",
        phone: "+968 ...",
        whatsapp: "+968 ...",
        email: "name@example.com",
        cityText: "مسقط",
        areaText: "الخوير",
        message: "أخبرنا بالخدمات أو التفاصيل العامة التي ترغب في مراجعتها.",
      },
      providerTypeOptions: [
        { value: "clinic", label: "عيادة" },
        { value: "medical_center", label: "مركز طبي أو مستشفى" },
        { value: "dental_clinic", label: "عيادة أسنان" },
        { value: "pharmacy", label: "صيدلية" },
        { value: "lab", label: "مختبر" },
        { value: "wellness", label: "تجميل أو رفاهية" },
        { value: "other", label: "أخرى، بما في ذلك عيادة حيوانات أليفة" },
      ],
      languageOptions: [
        { value: "ar", label: "العربية" },
        { value: "en", label: "الإنجليزية" },
        { value: "en-ar", label: "العربية والإنجليزية" },
      ],
      submit: "إرسال طلب الانضمام",
      submitting: "جارٍ إرسال الطلب…",
      success: "شكراً لك. تم استلام طلبك للمراجعة.",
      error: "تعذر إرسال الطلب. يرجى مراجعة الحقول والمحاولة مرة أخرى.",
    },
  },
};

function ProviderLineIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, readonly string[]> = {
    profile: [
      "M8 19v-1.5A4.5 4.5 0 0 1 12.5 13h3A4.5 4.5 0 0 1 20 17.5V19",
      "M16.5 7.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
      "M5 4.5h14v17H5z",
    ],
    language: [
      "M5 6h9",
      "M9.5 4v2",
      "M12.5 6c-.9 3.8-3.6 6.7-7.5 8.5",
      "M6.5 9.5c1.4 2.5 3.1 4.1 5.5 5.2",
      "M14 20l3.5-8 3.5 8",
      "M15.2 17.2h4.6",
    ],
    contact: [
      "M6 7.5h12v9H6z",
      "M8 10l4 3 4-3",
      "M18.5 19.5l2-2",
      "M5.5 19.5l-2-2",
    ],
    review: ["M6 4.5h12v15H6z", "M9 9h6", "M9 12.5h4", "M9 16l1.5 1.5L15 13"],
    services: [
      "M5 7h14",
      "M5 12h14",
      "M5 17h14",
      "M8 5v4",
      "M14 10v4",
      "M10 15v4",
    ],
    offers: ["M5 7.5V5h2.5L19 16.5 16.5 19 5 7.5Z", "M9 8h.01", "M13 16l3-3"],
    clinic: ["M5 20V8l7-4 7 4v12", "M9 20v-5h6v5", "M12 8v4", "M10 10h4"],
    doctor: [
      "M8 8a4 4 0 0 0 8 0",
      "M7 20v-3a5 5 0 0 1 5-5 5 5 0 0 1 5 5v3",
      "M9 4h6",
    ],
    dental: [
      "M8 4.5c-2 1-2.5 4-.8 6.5 1 1.5 1 5.5 2.4 7.7.6 1 1.7.9 2-.2l.4-2c.2-1 1.8-1 2 0l.4 2c.3 1.1 1.4 1.2 2 .2 1.4-2.2 1.4-6.2 2.4-7.7 1.7-2.5 1.2-5.5-.8-6.5-1.5-.7-3.3.2-5 .2s-3.5-.9-5-.2Z",
    ],
    pharmacy: ["M7 4.5h10v15H7z", "M12 8v8", "M8.5 12h7"],
    lab: [
      "M10 4.5v5.2l-4 7A2.2 2.2 0 0 0 7.9 20h8.2a2.2 2.2 0 0 0 1.9-3.3l-4-7V4.5",
      "M9 4.5h6",
      "M8.2 16h7.6",
    ],
    hospital: ["M5 20V5h14v15", "M9 20v-4h6v4", "M8.5 9h7", "M12 6.5v5"],
    wellness: [
      "M12 20c-4-2.5-6-5.4-6-8.6 3.2.1 5.2 1.7 6 4.1.8-2.4 2.8-4 6-4.1 0 3.2-2 6.1-6 8.6Z",
      "M12 15.5V6",
    ],
    pet: [
      "M8.5 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
      "M18.5 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
      "M11 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
      "M16 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
      "M7.5 17.3c.2-2.4 2.2-4.3 4.5-4.3s4.3 1.9 4.5 4.3c.1 1.2-.8 2.2-2 2.2h-5c-1.2 0-2.1-1-2-2.2Z",
    ],
    question: [
      "M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-1.2 1.1-1.8 1.7-1.8 3.3",
      "M12 17.5h.01",
      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    ],
  };

  return (
    <svg
      className="provider-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

function HeroNetworkVisual({ copy }: { copy: ProviderPageCopy }) {
  return (
    <div className="provider-hero-visual" aria-hidden="true">
      <svg
        className="provider-hero-visual__network"
        viewBox="0 0 420 360"
        focusable="false"
      >
        <defs>
          <linearGradient
            id="providerNetworkLine"
            x1="40"
            x2="360"
            y1="40"
            y2="300"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2aa192" stopOpacity="0.2" />
            <stop offset="1" stopColor="#0e6e64" stopOpacity="0.72" />
          </linearGradient>
        </defs>
        <path
          d="M67 246C111 159 163 99 250 87c49-7 93 12 122 48"
          fill="none"
          stroke="url(#providerNetworkLine)"
          strokeWidth="2"
        />
        <path
          d="M87 235c45 20 92 24 141 10 50-15 87-47 113-97"
          fill="none"
          stroke="#8ecec2"
          strokeOpacity="0.45"
          strokeWidth="2"
        />
        <path
          d="M133 114c30 61 66 96 129 127"
          fill="none"
          stroke="#c9a24b"
          strokeOpacity="0.32"
          strokeWidth="2"
        />
        {[67, 133, 212, 295, 350].map((x, index) => (
          <circle
            key={x}
            cx={x}
            cy={[246, 114, 248, 91, 143][index]}
            r="7"
            fill="#ffffff"
            stroke="#0e6e64"
            strokeWidth="3"
          />
        ))}
      </svg>
      <div className="provider-hero-visual__card provider-hero-visual__card--main">
        <span>{copy.heroVisualTitle}</span>
        <strong>{copy.heroVisualSubtitle}</strong>
        <div>
          {copy.heroVisualPills.map((pill) => (
            <small key={pill}>{pill}</small>
          ))}
        </div>
      </div>
      <div className="provider-hero-visual__card provider-hero-visual__card--contact">
        <ProviderLineIcon name="contact" />
        <span>Call · WhatsApp · Directions</span>
      </div>
      <div className="provider-hero-visual__card provider-hero-visual__card--review">
        <ProviderLineIcon name="review" />
        <span>Review before public listing</span>
      </div>
    </div>
  );
}

function SectionHeader({
  id,
  eyebrow,
  title,
  description,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="provider-section-header">
      {eyebrow ? (
        <span className="provider-section-header__eyebrow">{eyebrow}</span>
      ) : null}
      <h2 id={id}>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) return {};

  const copy = copyByLocale[locale];
  return buildLocalizedMetadata({
    locale,
    country,
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

export default async function PublicProviderPlansPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, country } = await params;

  if (!isSupportedLocale(locale) || !isSupportedCountry(country)) notFound();

  const copy = copyByLocale[locale];
  const dir = localeDirection(locale);

  return (
    <main
      className="provider-onboarding-page"
      dir={dir}
      data-locale={locale}
      data-country={country}
    >
      <section
        className="provider-hero"
        aria-labelledby="provider-onboarding-title"
      >
        <div className="provider-hero__copy">
          <span className="dm2026-badge provider-badge">{copy.badge}</span>
          <h1 id="provider-onboarding-title">{copy.title}</h1>
          <p className="provider-hero__description">{copy.description}</p>
          <div className="provider-hero__actions" aria-label={copy.badge}>
            <a
              className="dm2026-button dm2026-button-primary"
              href="#provider-onboarding-form"
            >
              {copy.primaryCta}
            </a>
            <a
              className="dm2026-button dm2026-button-secondary"
              href="#provider-how-it-works"
            >
              {copy.secondaryCta}
            </a>
          </div>
          <ul className="provider-hero__micro-benefits" aria-label={copy.badge}>
            {copy.microBenefits.map((benefit) => (
              <li key={benefit}>
                <span aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
          <p className="provider-hero__note">{copy.heroNote}</p>
        </div>
        <HeroNetworkVisual copy={copy} />
      </section>

      <section
        className="provider-section"
        aria-labelledby="provider-audience-title"
      >
        <SectionHeader
          id="provider-audience-title"
          title={copy.audienceTitle}
          description={copy.audienceDescription}
        />
        <div className="provider-category-grid">
          {copy.audienceItems.map((item) => (
            <article className="provider-category-card" key={item.title}>
              <ProviderLineIcon name={item.icon} />
              <h3>{item.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section
        className="provider-section"
        aria-labelledby="provider-benefits-title"
      >
        <SectionHeader
          id="provider-benefits-title"
          title={copy.benefitsTitle}
          description={copy.benefitsDescription}
        />
        <div className="provider-benefit-grid">
          {copy.benefits.map((benefit) => (
            <article className="provider-benefit-card" key={benefit.title}>
              <ProviderLineIcon name={benefit.icon} />
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="provider-how-it-works"
        className="provider-section provider-process"
        aria-labelledby="provider-process-title"
      >
        <SectionHeader id="provider-process-title" title={copy.processTitle} />
        <ol className="provider-process__steps">
          {copy.processSteps.map((step, index) => (
            <li className="provider-process__step" key={step.title}>
              <span className="provider-process__number">0{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="provider-section provider-review"
        aria-labelledby="provider-review-title"
      >
        <div className="provider-review__copy">
          <SectionHeader
            id="provider-review-title"
            title={copy.reviewTitle}
            description={copy.reviewIntro}
          />
          <ul className="provider-review__checklist">
            {copy.reviewItems.map((item) => (
              <li key={item}>
                <span aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="provider-review__visual" aria-hidden="true">
          <ProviderLineIcon name="review" />
          <div />
          <div />
          <div />
        </div>
      </section>

      <section
        id="provider-onboarding-form"
        className="provider-section provider-form-section"
        aria-labelledby="provider-form-section-title"
      >
        <div className="provider-form-section__copy">
          <h2 id="provider-form-section-title">{copy.formSectionTitle}</h2>
          <p>{copy.formSectionHelper}</p>
        </div>
        <ProviderOnboardingForm locale={locale} copy={copy.form} />
      </section>

      <section
        className="provider-section provider-faq"
        aria-labelledby="provider-faq-title"
      >
        <SectionHeader
          id="provider-faq-title"
          title={copy.faqTitle}
          description={copy.faqDescription}
        />
        <div className="provider-faq__grid">
          {copy.faqs.map((faq) => (
            <article className="provider-faq__item" key={faq.question}>
              <ProviderLineIcon name="question" />
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="provider-section provider-final-cta"
        aria-labelledby="provider-final-cta-title"
      >
        <svg
          className="provider-final-cta__line"
          viewBox="0 0 620 160"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M16 118C125 35 224 21 316 72s191 56 288-21"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="118" cy="58" r="7" />
          <circle cx="318" cy="72" r="7" />
          <circle cx="506" cy="84" r="7" />
        </svg>
        <div>
          <h2 id="provider-final-cta-title">{copy.finalCtaTitle}</h2>
          <p>{copy.finalCtaBody}</p>
        </div>
        <a
          className="dm2026-button dm2026-button-primary"
          href="#provider-onboarding-form"
        >
          {copy.finalCta}
        </a>
      </section>

      <section
        className="provider-medical-disclaimer"
        aria-label="DrMuscat discovery and medical disclaimer"
      >
        <p>{copy.disclaimer}</p>
      </section>

      <style>{`
        .provider-onboarding-page {
          overflow: hidden;
          min-height: 100vh;
          background:
            radial-gradient(circle at 7% 3%, rgba(91, 190, 177, 0.2), transparent 26rem),
            radial-gradient(circle at 91% 12%, rgba(201, 162, 75, 0.12), transparent 24rem),
            linear-gradient(180deg, var(--dm-bg-warm, #fbfbf8) 0%, var(--dm-bg, #f7faf9) 47%, #ffffff 100%);
          color: var(--dm-teal-950, #07302c);
          padding: clamp(1rem, 2.5vw, 2rem);
        }

        .provider-hero,
        .provider-section,
        .provider-medical-disclaimer {
          width: min(1160px, 100%);
          margin-inline: auto;
        }

        .provider-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(20rem, 0.95fr);
          gap: clamp(1rem, 3vw, 2rem);
          align-items: center;
          padding-block: clamp(2rem, 6vw, 5.4rem) clamp(1.5rem, 4vw, 3.8rem);
        }

        .provider-hero__copy,
        .provider-hero-visual,
        .provider-category-card,
        .provider-benefit-card,
        .provider-process,
        .provider-review,
        .provider-form-section,
        .provider-faq__item,
        .provider-final-cta,
        .provider-medical-disclaimer,
        .provider-onboarding-form {
          border: 1px solid rgba(14, 110, 100, 0.13);
          background: rgba(255, 255, 255, 0.82);
          box-shadow: 0 24px 70px rgba(11, 40, 38, 0.08);
          backdrop-filter: blur(14px);
        }

        .provider-hero__copy {
          position: relative;
          z-index: 1;
          border-radius: clamp(1.5rem, 3vw, 2.4rem);
          padding: clamp(1.35rem, 4vw, 3rem);
        }

        .provider-badge,
        .provider-section-header__eyebrow {
          border: 1px solid rgba(14, 110, 100, 0.14);
          background: rgba(239, 246, 244, 0.78);
          color: var(--dm-teal-800, #0b4f4a);
          box-shadow: none;
        }

        .provider-hero h1 {
          max-width: 15ch;
          margin: 1rem 0;
          color: var(--dm-teal-950, #07302c);
          font-size: clamp(2.2rem, 5vw, 4.25rem);
          line-height: 1.02;
          letter-spacing: -0.055em;
        }

        [dir='rtl'] .provider-hero h1 {
          max-width: 17ch;
          line-height: 1.16;
          letter-spacing: 0;
        }

        .provider-hero__description,
        .provider-section-header p,
        .provider-benefit-card p,
        .provider-process__step p,
        .provider-form-section__copy p,
        .provider-faq__item p,
        .provider-final-cta p,
        .provider-medical-disclaimer p,
        .provider-onboarding-form p,
        .provider-onboarding-form span {
          color: var(--dm-ink-500, #5c6b6b);
          line-height: 1.75;
        }

        .provider-hero__description {
          max-width: 66ch;
          margin: 0;
          font-size: clamp(1rem, 1.7vw, 1.14rem);
        }

        .provider-hero__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.85rem;
          margin-block: 1.5rem 1.1rem;
        }

        .provider-hero__micro-benefits {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
          margin: 0 0 1rem;
          padding: 0;
          list-style: none;
        }

        .provider-hero__micro-benefits li {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          border-radius: var(--dm-radius-pill, 999px);
          background: rgba(14, 110, 100, 0.08);
          color: var(--dm-teal-800, #0b4f4a);
          padding: 0.58rem 0.8rem;
          font-size: 0.9rem;
          font-weight: 700;
        }

        .provider-hero__micro-benefits span {
          inline-size: 0.45rem;
          block-size: 0.45rem;
          border-radius: 999px;
          background: var(--dm-brand-mint, #2aa192);
        }

        .provider-hero__note {
          margin: 0;
          max-width: 70ch;
          color: var(--dm-ink-600, #45514f);
          font-size: 0.93rem;
        }

        .provider-hero-visual {
          position: relative;
          min-height: clamp(27rem, 46vw, 34rem);
          border-radius: clamp(1.5rem, 3vw, 2.5rem);
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(239, 246, 244, 0.76)),
            radial-gradient(circle at 70% 15%, rgba(91, 190, 177, 0.22), transparent 13rem);
          overflow: hidden;
        }

        .provider-hero-visual::before {
          content: '';
          position: absolute;
          inset: 1rem;
          border: 1px solid rgba(14, 110, 100, 0.1);
          border-radius: 2rem;
          background-image:
            linear-gradient(rgba(14, 110, 100, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 110, 100, 0.05) 1px, transparent 1px);
          background-size: 38px 38px;
        }

        .provider-hero-visual__network {
          position: absolute;
          inset: 1.5rem 0 auto;
          inline-size: 100%;
          opacity: 0.96;
        }

        .provider-hero-visual__card {
          position: absolute;
          display: grid;
          gap: 0.65rem;
          border: 1px solid rgba(14, 110, 100, 0.14);
          border-radius: 1.45rem;
          background: rgba(255, 255, 255, 0.72);
          box-shadow: 0 18px 50px rgba(11, 40, 38, 0.1);
          backdrop-filter: blur(18px);
          padding: 1rem;
        }

        .provider-hero-visual__card--main {
          inset-inline: clamp(1rem, 4vw, 3rem);
          bottom: 3rem;
          padding: clamp(1rem, 3vw, 1.4rem);
        }

        .provider-hero-visual__card--main span,
        .provider-hero-visual__card--contact span,
        .provider-hero-visual__card--review span {
          color: var(--dm-ink-500, #5c6b6b);
          font-size: 0.86rem;
          font-weight: 700;
        }

        .provider-hero-visual__card--main strong {
          max-width: 20ch;
          color: var(--dm-teal-950, #07302c);
          font-size: clamp(1.35rem, 3vw, 2rem);
          line-height: 1.15;
          letter-spacing: -0.03em;
        }

        .provider-hero-visual__card--main div {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .provider-hero-visual__card--main small {
          border-radius: 999px;
          background: rgba(14, 110, 100, 0.08);
          color: var(--dm-teal-800, #0b4f4a);
          padding: 0.4rem 0.6rem;
          font-weight: 800;
        }

        .provider-hero-visual__card--contact {
          top: 3rem;
          inset-inline-start: clamp(1rem, 4vw, 3rem);
          inline-size: min(15rem, calc(100% - 2rem));
        }

        .provider-hero-visual__card--review {
          top: 10rem;
          inset-inline-end: clamp(1rem, 4vw, 2.2rem);
          inline-size: min(14rem, calc(100% - 2rem));
        }

        .provider-section {
          padding-block: clamp(1.4rem, 4vw, 3.2rem);
        }

        .provider-section-header {
          max-width: 760px;
          margin-block-end: clamp(1rem, 3vw, 1.6rem);
        }

        .provider-section-header__eyebrow {
          display: inline-flex;
          border-radius: var(--dm-radius-pill, 999px);
          padding: 0.38rem 0.72rem;
          font-size: 0.78rem;
          font-weight: 800;
        }

        .provider-section-header h2,
        .provider-form-section__copy h2,
        .provider-final-cta h2,
        .provider-onboarding-form h2 {
          margin: 0 0 0.7rem;
          color: var(--dm-teal-950, #07302c);
          font-size: clamp(1.65rem, 3.2vw, 2.55rem);
          line-height: 1.14;
          letter-spacing: -0.035em;
        }

        [dir='rtl'] .provider-section-header h2,
        [dir='rtl'] .provider-form-section__copy h2,
        [dir='rtl'] .provider-final-cta h2,
        [dir='rtl'] .provider-onboarding-form h2 {
          letter-spacing: 0;
          line-height: 1.28;
        }

        .provider-section-header p,
        .provider-form-section__copy p,
        .provider-final-cta p {
          margin: 0;
          font-size: clamp(0.98rem, 1.8vw, 1.08rem);
        }

        .provider-category-grid,
        .provider-benefit-grid,
        .provider-faq__grid {
          display: grid;
          gap: 1rem;
        }

        .provider-category-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .provider-category-card,
        .provider-benefit-card,
        .provider-faq__item {
          border-radius: 1.45rem;
          padding: 1.05rem;
        }

        .provider-category-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          min-height: 6.3rem;
          background: rgba(255, 255, 255, 0.78);
        }

        .provider-category-card h3,
        .provider-benefit-card h3,
        .provider-process__step h3,
        .provider-faq__item h3 {
          margin: 0;
          color: var(--dm-teal-950, #07302c);
          font-size: 1.05rem;
          line-height: 1.28;
        }

        .provider-icon {
          flex: 0 0 auto;
          inline-size: 2.35rem;
          block-size: 2.35rem;
          border-radius: 0.95rem;
          background: linear-gradient(135deg, rgba(220, 238, 235, 0.95), rgba(255, 255, 255, 0.9));
          color: var(--dm-teal-700, #0e6e64);
          padding: 0.46rem;
        }

        .provider-icon path {
          fill: none;
          stroke: currentColor;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .provider-benefit-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .provider-benefit-card {
          min-height: 15rem;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(239, 246, 244, 0.5));
        }

        .provider-benefit-card p,
        .provider-faq__item p,
        .provider-process__step p {
          margin: 0.7rem 0 0;
        }

        .provider-process {
          position: relative;
          border-radius: 2rem;
          padding: clamp(1.2rem, 4vw, 2rem);
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(239, 246, 244, 0.72));
        }

        .provider-process__steps {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .provider-process__steps::before {
          content: '';
          position: absolute;
          top: 2rem;
          inset-inline: 10%;
          block-size: 2px;
          background: linear-gradient(90deg, transparent, rgba(14, 110, 100, 0.35), transparent);
        }

        .provider-process__step {
          position: relative;
          display: grid;
          gap: 1rem;
          border: 1px solid rgba(14, 110, 100, 0.11);
          border-radius: 1.35rem;
          background: rgba(255, 255, 255, 0.75);
          padding: 1rem;
          box-shadow: 0 14px 40px rgba(11, 40, 38, 0.06);
        }

        .provider-process__number {
          display: inline-grid;
          place-items: center;
          inline-size: 3rem;
          block-size: 3rem;
          border-radius: 1rem;
          background: var(--dm-teal-800, #0b4f4a);
          color: #ffffff;
          font-weight: 900;
        }

        .provider-review {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(17rem, 0.85fr);
          gap: clamp(1rem, 4vw, 2rem);
          align-items: center;
          border-radius: 2rem;
          padding: clamp(1.2rem, 4vw, 2rem);
        }

        .provider-review__checklist {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .provider-review__checklist li {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          border-radius: 1rem;
          background: rgba(14, 110, 100, 0.07);
          color: var(--dm-ink-700, #2e3a3b);
          padding: 0.78rem;
          font-weight: 700;
        }

        .provider-review__checklist span {
          color: var(--dm-teal-700, #0e6e64);
        }

        .provider-review__visual {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 18rem;
          border-radius: 1.6rem;
          background:
            radial-gradient(circle at 50% 32%, rgba(91, 190, 177, 0.22), transparent 9rem),
            linear-gradient(180deg, rgba(239, 246, 244, 0.82), rgba(255, 255, 255, 0.78));
        }

        .provider-review__visual .provider-icon {
          inline-size: 6.5rem;
          block-size: 6.5rem;
          border-radius: 2rem;
          padding: 1.35rem;
          box-shadow: 0 20px 55px rgba(11, 40, 38, 0.12);
        }

        .provider-review__visual div {
          position: absolute;
          inline-size: 5.5rem;
          block-size: 0.7rem;
          border-radius: 999px;
          background: rgba(14, 110, 100, 0.14);
        }

        .provider-review__visual div:nth-of-type(1) { top: 3rem; inset-inline-start: 2rem; }
        .provider-review__visual div:nth-of-type(2) { bottom: 4.5rem; inset-inline-end: 2.4rem; }
        .provider-review__visual div:nth-of-type(3) { bottom: 2.8rem; inset-inline-end: 5.4rem; inline-size: 3.5rem; }

        .provider-form-section {
          display: grid;
          grid-template-columns: minmax(16rem, 0.42fr) minmax(0, 0.58fr);
          gap: clamp(1rem, 4vw, 2rem);
          align-items: start;
          border-radius: 2rem;
          padding: clamp(1rem, 4vw, 1.5rem);
          background:
            linear-gradient(135deg, rgba(239, 246, 244, 0.86), rgba(255, 255, 255, 0.76));
        }

        .provider-form-section__copy {
          padding: clamp(0.8rem, 2vw, 1rem);
        }

        .provider-onboarding-form {
          display: grid;
          gap: 1rem;
          border-radius: 1.7rem;
          padding: clamp(1.1rem, 3vw, 1.6rem);
          background: rgba(255, 255, 255, 0.88);
        }

        .provider-onboarding-form__intro {
          display: grid;
          gap: 0.45rem;
        }

        .provider-onboarding-form__eyebrow {
          display: inline-flex;
          justify-self: start;
          border-radius: 999px;
          background: rgba(14, 110, 100, 0.08);
          color: var(--dm-teal-800, #0b4f4a) !important;
          padding: 0.34rem 0.64rem;
          font-size: 0.76rem;
          font-weight: 900;
        }

        [dir='rtl'] .provider-onboarding-form__eyebrow {
          justify-self: end;
        }

        .provider-onboarding-form__intro p,
        .provider-onboarding-form__intro span {
          margin: 0;
        }

        .provider-onboarding-form__intro > span:not(.provider-onboarding-form__eyebrow) {
          font-size: 0.88rem;
        }

        .provider-onboarding-form__grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.82rem;
        }

        .provider-onboarding-form label {
          display: grid;
          gap: 0.42rem;
          color: var(--dm-teal-950, #07302c);
          font-weight: 800;
        }

        .provider-onboarding-form label > span {
          color: var(--dm-teal-950, #07302c);
          font-size: 0.9rem;
          line-height: 1.35;
        }

        .provider-onboarding-form input,
        .provider-onboarding-form select,
        .provider-onboarding-form textarea {
          width: 100%;
          border: 1px solid rgba(14, 110, 100, 0.22);
          border-radius: 0.95rem;
          background: rgba(255, 255, 255, 0.96);
          color: var(--dm-teal-950, #07302c);
          font: inherit;
          padding: 0.78rem 0.88rem;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
        }

        .provider-onboarding-form textarea {
          min-height: 8rem;
          resize: vertical;
        }

        .provider-onboarding-form input:focus,
        .provider-onboarding-form select:focus,
        .provider-onboarding-form textarea:focus {
          border-color: rgba(14, 110, 100, 0.72);
          outline: 3px solid rgba(14, 110, 100, 0.18);
        }

        .provider-onboarding-form__message,
        .provider-onboarding-form__consent,
        .provider-onboarding-form__submit,
        .provider-onboarding-form__status {
          grid-column: 1 / -1;
        }

        .provider-onboarding-form__consent {
          display: flex !important;
          align-items: flex-start;
          gap: 0.72rem;
          border: 1px solid rgba(14, 110, 100, 0.12);
          border-radius: 1.05rem;
          background: rgba(239, 246, 244, 0.9);
          padding: 0.9rem;
        }

        .provider-onboarding-form__consent input {
          inline-size: auto;
          margin-top: 0.25rem;
        }

        .provider-onboarding-form__website {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          clip-path: inset(50%);
          white-space: nowrap;
        }

        .provider-onboarding-form__submit {
          justify-self: start;
          border: 0;
          cursor: pointer;
        }

        [dir='rtl'] .provider-onboarding-form__submit {
          justify-self: end;
        }

        .provider-onboarding-form__submit:disabled {
          cursor: progress;
          opacity: 0.75;
        }

        .provider-onboarding-form__status {
          min-height: 1.5rem;
          margin: 0;
          font-weight: 900;
        }

        .provider-onboarding-form__status--success { color: var(--dm-teal-700, #0e6e64); }
        .provider-onboarding-form__status--error { color: #b42318; }

        .provider-faq__grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .provider-faq__item {
          background: rgba(255, 255, 255, 0.78);
        }

        .provider-faq__item .provider-icon {
          inline-size: 2rem;
          block-size: 2rem;
          border-radius: 0.8rem;
          padding: 0.38rem;
        }

        .provider-final-cta {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.2rem;
          border-radius: 2rem;
          padding: clamp(1.2rem, 4vw, 2rem);
          background:
            linear-gradient(135deg, rgba(7, 48, 44, 0.96), rgba(14, 110, 100, 0.9)),
            radial-gradient(circle at 70% 20%, rgba(255, 255, 255, 0.28), transparent 14rem);
          color: #ffffff;
          overflow: hidden;
        }

        .provider-final-cta h2,
        .provider-final-cta p {
          color: #ffffff;
        }

        .provider-final-cta p {
          max-width: 60ch;
          opacity: 0.84;
        }

        .provider-final-cta__line {
          position: absolute;
          inset-inline-end: -2rem;
          top: -1rem;
          inline-size: min(32rem, 60%);
          color: rgba(255, 255, 255, 0.18);
        }

        .provider-final-cta > *:not(svg) {
          position: relative;
          z-index: 1;
        }

        .provider-medical-disclaimer {
          margin-block: clamp(1rem, 3vw, 2.5rem) clamp(2rem, 5vw, 4rem);
          border-radius: 1.35rem;
          padding: clamp(1rem, 2.5vw, 1.2rem);
          background: rgba(255, 250, 235, 0.84);
          border-color: rgba(180, 83, 9, 0.18);
          box-shadow: 0 14px 35px rgba(120, 53, 15, 0.06);
        }

        .provider-medical-disclaimer p {
          margin: 0;
          color: #71490d;
          font-size: 0.94rem;
          font-weight: 650;
        }

        @media (max-width: 980px) {
          .provider-hero,
          .provider-review,
          .provider-form-section {
            grid-template-columns: 1fr;
          }

          .provider-category-grid,
          .provider-benefit-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .provider-process__steps {
            grid-template-columns: 1fr;
          }

          .provider-process__steps::before {
            display: none;
          }
        }

        @media (max-width: 720px) {
          .provider-onboarding-page {
            padding: 0.85rem;
          }

          .provider-hero {
            padding-block-start: 1.2rem;
          }

          .provider-hero-visual {
            min-height: 29rem;
          }

          .provider-category-grid,
          .provider-benefit-grid,
          .provider-review__checklist,
          .provider-faq__grid,
          .provider-onboarding-form__grid {
            grid-template-columns: 1fr;
          }

          .provider-final-cta {
            display: grid;
          }

          .provider-hero__actions .dm2026-button,
          .provider-final-cta .dm2026-button,
          .provider-onboarding-form__submit {
            width: 100%;
            justify-content: center;
          }

          .provider-onboarding-form__submit,
          [dir='rtl'] .provider-onboarding-form__submit {
            justify-self: stretch;
          }
        }

        @media (max-width: 460px) {
          .provider-hero__copy,
          .provider-process,
          .provider-review,
          .provider-form-section,
          .provider-final-cta {
            border-radius: 1.35rem;
          }

          .provider-hero-visual__card--review {
            top: 11rem;
          }
        }
      `}</style>
    </main>
  );
}
