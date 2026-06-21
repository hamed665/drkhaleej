export type AdminModuleStatus =
  | "Active"
  | "Read-only"
  | "Partial"
  | "Planned"
  | "Coming next"
  | "Requires schema";

export type AdminModule = {
  title: string;
  description: string;
  status: AdminModuleStatus;
  href?: string;
};

export type AdminModuleGroup = {
  title: string;
  description: string;
  modules: AdminModule[];
};

export const adminModuleGroups: AdminModuleGroup[] = [
  {
    title: "Operations",
    description:
      "Provider intake, draft profile preparation, and core supply operations.",
    modules: [
      {
        title: "Provider Leads",
        description:
          "Review onboarding submissions, update status/priority, and create draft centers from approved leads.",
        status: "Active",
        href: "/admin/provider-onboarding-leads",
      },
      {
        title: "Draft Centers",
        description:
          "Manage internal draft center records, taxonomy assignments, quality checks, and review workflow.",
        status: "Active",
        href: "/admin/draft-centers",
      },
      {
        title: "Centers / Clinics",
        description:
          "Future full center management after activation, ownership, and publishing rules are approved.",
        status: "Planned",
      },
      {
        title: "Doctors",
        description:
          "Future doctor profile operations after the doctor management workflow is approved.",
        status: "Planned",
      },
      {
        title: "Services / Specialties",
        description:
          "Future service and specialty administration after schema and taxonomy permissions are approved.",
        status: "Planned",
      },
    ],
  },
  {
    title: "Content & CMS",
    description:
      "Read-only inventory and planned editorial controls. No live publishing in this foundation.",
    modules: [
      {
        title: "Site Content",
        description:
          "Inventory current public content areas, sources, language coverage, and future editability.",
        status: "Planned",
        href: "/admin/content",
      },
      {
        title: "FAQs",
        description:
          "Planned FAQ management model for bilingual questions, answers, ordering, and JSON-LD validation.",
        status: "Planned",
        href: "/admin/content/faqs",
      },
      {
        title: "Articles / Wiki",
        description:
          "Planned article and wiki controls for medical review, media, SEO fields, and preview workflow.",
        status: "Planned",
        href: "/admin/content/articles",
      },
      {
        title: "SEO Metadata",
        description:
          "Planned SEO control surface for page metadata, canonical, hreflang, schema status, and validation.",
        status: "Planned",
        href: "/admin/content/seo",
      },
      {
        title: "Navigation / Menus",
        description:
          "Planned header and footer navigation management without changing public navigation in this PR.",
        status: "Planned",
        href: "/admin/content/navigation",
      },
    ],
  },
  {
    title: "Media",
    description:
      "Future media governance for entity images and editorial assets. Upload remains disabled.",
    modules: [
      {
        title: "Media Library",
        description:
          "Planned media asset catalog, usage assignment, review status, alt text, captions, and archive controls.",
        status: "Planned",
        href: "/admin/media",
      },
      {
        title: "Logos / Covers",
        description:
          "Future center and homepage logo or cover image workflows after media permissions are approved.",
        status: "Requires schema",
      },
      {
        title: "Gallery Images",
        description:
          "Future gallery asset review and assignment controls for provider profile presentation.",
        status: "Requires schema",
      },
      {
        title: "Article Images",
        description:
          "Future editorial image assignment, alt text, and review workflow for article content.",
        status: "Requires schema",
      },
    ],
  },
  {
    title: "Commercial",
    description:
      "Manual commercial assignment foundations only. No payments, offers publishing, or ad wallet.",
    modules: [
      {
        title: "Offers",
        description:
          "Future official offer model and workflow; no offer publishing or fake offers are available here.",
        status: "Planned",
      },
      {
        title: "Center Subscriptions",
        description:
          "Assign existing plan catalog entries to centers from the protected admin workspace.",
        status: "Active",
        href: "/admin/center-subscriptions",
      },
      {
        title: "Commercial Add-ons",
        description:
          "Assign internal Homepage Ads and Special Offer Placement add-ons without public rendering changes.",
        status: "Active",
        href: "/admin/commercial-addons",
      },
      {
        title: "Sponsored Placements",
        description:
          "Future sponsored placement governance after ranking, disclosure, and placement rules are approved.",
        status: "Planned",
      },
    ],
  },
  {
    title: "Governance",
    description:
      "Platform oversight surfaces. Authentication and login behavior remain unchanged.",
    modules: [
      {
        title: "Audit Log",
        description:
          "Read-only audit log for actor, permission, action, entity, summary, and reason.",
        status: "Read-only",
        href: "/admin/audit-log",
      },
      {
        title: "Admin Settings",
        description:
          "Read-only settings and access overview foundation; no role mutation controls.",
        status: "Read-only",
        href: "/admin/settings",
      },
      {
        title: "Roles / Access Overview",
        description:
          "Read-only resolved role and grouped permission overview; assignment UI remains planned.",
        status: "Read-only",
        href: "/admin/settings",
      },
    ],
  },
];

export const partialAdminModules: AdminModule[] = [
  {
    title: "Draft center quality gate",
    description:
      "Read-only quality signals are available inside draft center detail screens.",
    status: "Partial",
    href: "/admin/draft-centers",
  },
  {
    title: "Draft center taxonomy",
    description:
      "Taxonomy assignment exists for draft centers; broader taxonomy administration remains planned.",
    status: "Partial",
    href: "/admin/draft-centers",
  },
  {
    title: "Lead history",
    description:
      "Status, priority, and draft-center creation history are visible for provider onboarding leads.",
    status: "Read-only",
    href: "/admin/provider-onboarding-leads",
  },
];
