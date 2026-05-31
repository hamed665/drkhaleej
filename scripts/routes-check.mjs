import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, relative, resolve } from "node:path";

const projectRoot = process.cwd();

const readSourceIfExists = (relativePath) => {
  const absolutePath = resolve(projectRoot, relativePath);

  if (!existsSync(absolutePath)) return null;

  return readFileSync(absolutePath, "utf8");
};

const sourceIncludesForbiddenServiceRoleImport = (source) =>
  /from\s+["'](?:@\/lib\/supabase\/service-role|\.\.?\/.*supabase\/service-role)["']/.test(
    source,
  ) ||
  /import\(\s*["'](?:@\/lib\/supabase\/service-role|\.\.?\/.*supabase\/service-role)["']\s*\)/.test(
    source,
  ) ||
  /require\(\s*["'](?:@\/lib\/supabase\/service-role|\.\.?\/.*supabase\/service-role)["']\s*\)/.test(
    source,
  );

const sourceImportsAdminProviderOnboardingLeads = (source) =>
  /from\s+["'](?:@\/server\/admin\/provider-onboarding-leads|\.\.?\/.*server\/admin\/provider-onboarding-leads)["']/.test(
    source,
  ) ||
  /import\(\s*["'](?:@\/server\/admin\/provider-onboarding-leads|\.\.?\/.*server\/admin\/provider-onboarding-leads)["']\s*\)/.test(
    source,
  ) ||
  /require\(\s*["'](?:@\/server\/admin\/provider-onboarding-leads|\.\.?\/.*server\/admin\/provider-onboarding-leads)["']\s*\)/.test(
    source,
  );

const sourceImportsKeywordSeedData = (source) =>
  /from\s+["'](?:@\/data\/seo\/drmuscat-keyword-seed\.json|\.\.?\/.*data\/seo\/drmuscat-keyword-seed\.json)["']/.test(
    source,
  ) ||
  /import\(\s*["'](?:@\/data\/seo\/drmuscat-keyword-seed\.json|\.\.?\/.*data\/seo\/drmuscat-keyword-seed\.json)["']\s*\)/.test(
    source,
  ) ||
  /require\(\s*["'](?:@\/data\/seo\/drmuscat-keyword-seed\.json|\.\.?\/.*data\/seo\/drmuscat-keyword-seed\.json)["']\s*\)/.test(
    source,
  );

const sourceImportsForbiddenLandingPageData = (source) =>
  sourceIncludesForbiddenServiceRoleImport(source) ||
  /from\s+["'](?:@\/(?:server\/admin|components\/admin|lib\/permissions\/admin|server\/provider|components\/provider|lib\/provider)|\.\.?\/.*(?:server\/admin|components\/admin|lib\/permissions\/admin|server\/provider|components\/provider|lib\/provider))["']/.test(
    source,
  ) ||
  /import\(\s*["'](?:@\/(?:server\/admin|components\/admin|lib\/permissions\/admin|server\/provider|components\/provider|lib\/provider)|\.\.?\/.*(?:server\/admin|components\/admin|lib\/permissions\/admin|server\/provider|components\/provider|lib\/provider))["']\s*\)/.test(
    source,
  ) ||
  /require\(\s*["'](?:@\/(?:server\/admin|components\/admin|lib\/permissions\/admin|server\/provider|components\/provider|lib\/provider)|\.\.?\/.*(?:server\/admin|components\/admin|lib\/permissions\/admin|server\/provider|components\/provider|lib\/provider))["']\s*\)/.test(
    source,
  );

const sourceIncludesSchemaOutput = (source) =>
  /schema\.org|application\/ld\+json|jsonLd|structuredData|StructuredData/.test(
    source,
  );

const sourceContainsImportStatement = (source) =>
  /(^|\n)\s*import\s+(?:[^('"\n][\s\S]*?\s+from\s+)?["'][^"']+["']/.test(
    source,
  ) || /(^|\n)\s*import\s*\(/.test(source);

const sourceIncludesLandingPageGateIntegration = (source) =>
  /landing-page-indexability|decideLandingPageGate/.test(source);

const helperForbiddenLandingPageGateTokens = [
  "Supabase",
  "supabase",
  "@supabase",
  "createSupabaseServerClient",
  "createSupabaseServiceRoleClient",
  "service-role",
  "serviceRole",
  "public-queries",
  "listPublic",
  "getPublic",
  "searchPublicCatalog",
  "@/lib/catalog",
  "drmuscat-keyword-seed.json",
  "data/seo",
  "node:fs",
  "fs",
  "node:path",
  "path",
  "next/navigation",
  "notFound",
  "src/app",
  "route.ts",
  "sitemap",
  "robots",
  "llms.txt",
  "generateMetadata",
  "generateStaticParams",
  "schema.org",
  "application/ld+json",
  "jsonLd",
  "structuredData",
  "StructuredData",
  "openGraph",
  "metadata",
  "canonicalUrl",
  "hreflang",
  "alternates",
  "ranking",
  "rank",
  "boost",
  "sponsored",
  "payment",
  "referral",
  "commission",
  "entitlement",
  "invoice",
  "provider-dashboard",
  "billing",
  "crm",
  "claim evidence",
  "license evidence",
  "admin notes",
];

const sourceIncludesForbiddenLandingPageGateHelperToken = (source) =>
  helperForbiddenLandingPageGateTokens.some((token) => source.includes(token)) ||
  /\bcanonical\b/.test(source);

const publicLandingPageQuerySkeletonPath =
  "src/lib/catalog/public-landing-page-queries.ts";

const publicLandingPageQueryHelperNames = [
  "getSpecialtyLandingGateData",
  "getSpecialtyAreaLandingGateData",
  "getAreaLandingGateData",
  "getServiceLandingGateData",
  "getServiceAreaLandingGateData",
];

const requiredPublicLandingPageQuerySkeletonTokens = [
  "ok: false",
  "helperAvailable: false",
  "entityExists: false",
  "providerCount: 0",
  "centerCount: 0",
  "exactCombinationCount: 0",
  "hasUniqueVisibleIntro: false",
  "hasLocalRelevance: false",
  "medicalReviewStatus: 'missing'",
  "canonicalIsUnique: false",
  "sourceTables: []",
];

const forbiddenPublicLandingPageQuerySkeletonTokens = [
  "Supabase",
  "supabase",
  "@supabase",
  "createSupabaseServerClient",
  "createSupabaseServiceRoleClient",
  "service-role",
  "serviceRole",
  "from(",
  ".from(",
  "select(",
  ".select(",
  "insert(",
  ".insert(",
  "update(",
  ".update(",
  "delete(",
  ".delete(",
  "upsert(",
  ".upsert(",
  "rpc(",
  ".rpc(",
  "storage",
  "channel",
  "auth",
  "public-queries",
  "public-types",
  "landing-page-indexability",
  "decideLandingPageGate",
  "data/seo",
  "drmuscat-keyword-seed.json",
  "fs",
  "node:fs",
  "path",
  "node:path",
  "next/navigation",
  "notFound",
  "src/app",
  "route.ts",
  "sitemap",
  "robots",
  "llms.txt",
  "generateMetadata",
  "generateStaticParams",
  "schema.org",
  "application/ld+json",
  "jsonLd",
  "structuredData",
  "StructuredData",
  "openGraph",
  "metadata",
  "canonicalUrl",
  "hreflang",
  "alternates",
  "ranking",
  "rank",
  "boost",
  "sponsored",
  "payment",
  "referral",
  "commission",
  "entitlement",
  "invoice",
  "provider-dashboard",
  "admin",
  "crm",
  "billing",
  "audit_logs",
  "license",
  "claim evidence",
];

const sourceIncludesForbiddenPublicLandingPageQuerySkeletonToken = (
  source,
  token,
) => {
  if (token === "canonical") return /\bcanonical\b/.test(source);

  return source.includes(token);
};

const sourceIsClientComponent = (source) =>
  /^\s*["']use client["'];?/m.test(source);

const collectSourceFiles = (relativeDirectory) => {
  const root = resolve(projectRoot, relativeDirectory);
  if (!existsSync(root)) return [];

  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory)) {
      if (entry === "node_modules" || entry === ".next" || entry === ".git") {
        continue;
      }

      const absolutePath = resolve(directory, entry);
      const stats = statSync(absolutePath);

      if (stats.isDirectory()) {
        visit(absolutePath);
        continue;
      }

      if ([".ts", ".tsx", ".js", ".jsx", ".mjs"].includes(extname(entry))) {
        files.push(absolutePath);
      }
    }
  };

  visit(root);
  return files;
};

const checks = [
  {
    name: "src/app/[locale]/[country]/page.tsx exists",
    pass: existsSync(
      resolve(projectRoot, "src/app/[locale]/[country]/page.tsx"),
    ),
  },
  {
    name: "approved discovery skeleton routes exist",
    pass: [
      "doctors",
      "centers",
      "pharmacies",
      "labs",
      "services",
      "search",
    ].every((slug) =>
      existsSync(
        resolve(projectRoot, `src/app/[locale]/[country]/${slug}/page.tsx`),
      ),
    ),
  },
  {
    name: "singular doctor detail route exists",
    pass: existsSync(
      resolve(
        projectRoot,
        "src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx",
      ),
    ),
  },
  {
    name: "approved provider route exists",
    pass: existsSync(
      resolve(projectRoot, "src/app/[locale]/[country]/for-providers/page.tsx"),
    ),
  },
  {
    name: "approved SEO-D2A specialty route scaffold exists",
    pass: existsSync(
      resolve(
        projectRoot,
        "src/app/[locale]/[country]/centers/[specialtySlug]/page.tsx",
      ),
    ),
  },
  {
    name: "approved SEO-D2A specialty-area route scaffold exists",
    pass: existsSync(
      resolve(
        projectRoot,
        "src/app/[locale]/[country]/centers/[specialtySlug]/[areaSlug]/page.tsx",
      ),
    ),
  },
  {
    name: "approved SEO-D2B area route scaffold exists",
    pass: existsSync(
      resolve(
        projectRoot,
        "src/app/[locale]/[country]/areas/[areaSlug]/page.tsx",
      ),
    ),
  },
  {
    name: "plural doctor detail entity route does not exist",
    pass: !existsSync(
      resolve(
        projectRoot,
        "src/app/[locale]/[country]/doctors/[doctorSlug]/page.tsx",
      ),
    ),
  },
  {
    name: "src/app/[locale]/centers route does not exist",
    pass: !existsSync(resolve(projectRoot, "src/app/[locale]/centers")),
  },
  {
    name: "src/app/[locale]/services route does not exist",
    pass: !existsSync(resolve(projectRoot, "src/app/[locale]/services")),
  },
  {
    name: "src/app/[locale]/areas route does not exist",
    pass: !existsSync(resolve(projectRoot, "src/app/[locale]/areas")),
  },
  {
    name: "approved SEO-D2C1 service route scaffold exists",
    pass: existsSync(
      resolve(
        projectRoot,
        "src/app/[locale]/[country]/services/[serviceSlug]/page.tsx",
      ),
    ),
  },
  {
    name: "approved SEO-D2C2 service-area route scaffold exists",
    pass: existsSync(
      resolve(
        projectRoot,
        "src/app/[locale]/[country]/services/[serviceSlug]/[areaSlug]/page.tsx",
      ),
    ),
  },
  {
    name: "article routes do not exist",
    pass: !existsSync(
      resolve(projectRoot, "src/app/[locale]/[country]/articles"),
    ),
  },
  {
    name: "branded hospital and clinic route directories do not exist",
    pass: ["hospital", "hospitals", "clinic", "clinics"].every(
      (slug) =>
        !existsSync(resolve(projectRoot, `src/app/[locale]/[country]/${slug}`)),
    ),
  },
  {
    name: "src/app/fa route does not exist",
    pass: !existsSync(resolve(projectRoot, "src/app/fa")),
  },
  {
    name: "src/app/hi route does not exist",
    pass: !existsSync(resolve(projectRoot, "src/app/hi")),
  },
  {
    name: "approved root admin route exists",
    pass:
      existsSync(resolve(projectRoot, "src/app/admin/layout.tsx")) &&
      existsSync(resolve(projectRoot, "src/app/admin/page.tsx")),
  },
  {
    name: "localized admin routes do not exist",
    pass:
      !existsSync(resolve(projectRoot, "src/app/[locale]/admin")) &&
      !existsSync(resolve(projectRoot, "src/app/[locale]/[country]/admin")) &&
      !existsSync(resolve(projectRoot, "src/app/en/admin")) &&
      !existsSync(resolve(projectRoot, "src/app/ar/admin")) &&
      !existsSync(resolve(projectRoot, "src/app/en/om/admin")) &&
      !existsSync(resolve(projectRoot, "src/app/ar/om/admin")),
  },
  {
    name: "admin provider onboarding lead list route exists",
    pass: existsSync(
      resolve(projectRoot, "src/app/admin/provider-onboarding-leads/page.tsx"),
    ),
  },
  {
    name: "admin provider onboarding lead detail route exists",
    pass: existsSync(
      resolve(
        projectRoot,
        "src/app/admin/provider-onboarding-leads/[leadId]/page.tsx",
      ),
    ),
  },
  {
    name: "localized provider onboarding lead admin routes do not exist",
    pass:
      !existsSync(
        resolve(projectRoot, "src/app/[locale]/admin/provider-onboarding-leads"),
      ) &&
      !existsSync(
        resolve(
          projectRoot,
          "src/app/[locale]/[country]/admin/provider-onboarding-leads",
        ),
      ) &&
      !existsSync(
        resolve(projectRoot, "src/app/en/admin/provider-onboarding-leads"),
      ) &&
      !existsSync(
        resolve(projectRoot, "src/app/ar/admin/provider-onboarding-leads"),
      ) &&
      !existsSync(
        resolve(projectRoot, "src/app/en/om/admin/provider-onboarding-leads"),
      ) &&
      !existsSync(
        resolve(projectRoot, "src/app/ar/om/admin/provider-onboarding-leads"),
      ),
  },
];

const i18nConfigPath = resolve(projectRoot, "src/lib/i18n/config.ts");
if (!existsSync(i18nConfigPath)) {
  console.error("FAIL: src/lib/i18n/config.ts is missing");
  process.exit(1);
}

const i18nSource = readFileSync(i18nConfigPath, "utf8");

const extractConstArray = (source, variableName) => {
  const regex = new RegExp(
    `export\\s+const\\s+${variableName}\\s*=\\s*\\[(.*?)\\]\\s+as\\s+const`,
    "s",
  );
  const match = source.match(regex);
  if (!match) return null;

  return match[1]
    .split(",")
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
};

const supportedLocales = extractConstArray(i18nSource, "supportedLocales");
const supportedCountries = extractConstArray(i18nSource, "supportedCountries");

const authServerSource = readSourceIfExists("src/lib/auth/server.ts");
const adminPermissionsSource = readSourceIfExists(
  "src/lib/permissions/admin.ts",
);
const adminLayoutSource = readSourceIfExists("src/app/admin/layout.tsx");
const adminPageSource = readSourceIfExists("src/app/admin/page.tsx");
const adminShellSource = readSourceIfExists(
  "src/components/admin/admin-shell.tsx",
);
const adminProviderOnboardingLeadsPageSource = readSourceIfExists(
  "src/app/admin/provider-onboarding-leads/page.tsx",
);
const adminProviderOnboardingLeadsListSource = readSourceIfExists(
  "src/components/admin/provider-onboarding-leads-list.tsx",
);
const adminProviderOnboardingLeadDetailPageSource = readSourceIfExists(
  "src/app/admin/provider-onboarding-leads/[leadId]/page.tsx",
);
const adminProviderOnboardingLeadDetailSource = readSourceIfExists(
  "src/components/admin/provider-onboarding-lead-detail.tsx",
);
const sitemapSource = readSourceIfExists("src/app/sitemap.ts");
const robotsSource = readSourceIfExists("src/app/robots.ts");
const llmsTextSource = readSourceIfExists("public/llms.txt");
const landingPageIndexabilitySource = readSourceIfExists(
  "src/lib/seo/landing-page-indexability.ts",
);
const publicLandingPageQuerySkeletonSource = readSourceIfExists(
  publicLandingPageQuerySkeletonPath,
);
const seoD2aSpecialtyPageSource = readSourceIfExists(
  "src/app/[locale]/[country]/centers/[specialtySlug]/page.tsx",
);
const seoD2aSpecialtyAreaPageSource = readSourceIfExists(
  "src/app/[locale]/[country]/centers/[specialtySlug]/[areaSlug]/page.tsx",
);
const seoD2bAreaPageSource = readSourceIfExists(
  "src/app/[locale]/[country]/areas/[areaSlug]/page.tsx",
);
const seoD2c1ServicePageSource = readSourceIfExists(
  "src/app/[locale]/[country]/services/[serviceSlug]/page.tsx",
);
const seoD2c2ServiceAreaPageSource = readSourceIfExists(
  "src/app/[locale]/[country]/services/[serviceSlug]/[areaSlug]/page.tsx",
);
const adminProviderOnboardingLeadsSource = readSourceIfExists(
  "src/server/admin/provider-onboarding-leads.ts",
);
const sourceFiles = collectSourceFiles("src");

checks.push({
  name: "SEO-D3C2A landing page gate helper exists",
  pass: typeof landingPageIndexabilitySource === "string",
});

checks.push({
  name: "SEO-D3C2A landing page gate helper exports decideLandingPageGate",
  pass:
    typeof landingPageIndexabilitySource === "string" &&
    /export\s+function\s+decideLandingPageGate\s*\(/.test(
      landingPageIndexabilitySource,
    ),
});

checks.push({
  name: "SEO-D3C2A landing page gate helper keeps visible noindex disabled",
  pass:
    typeof landingPageIndexabilitySource === "string" &&
    /safeForVisibleNoindex\s*:\s*false/.test(landingPageIndexabilitySource),
});

checks.push({
  name: "SEO-D3C2A landing page gate helper keeps indexing disabled",
  pass:
    typeof landingPageIndexabilitySource === "string" &&
    /safeForIndexing\s*:\s*false/.test(landingPageIndexabilitySource),
});

checks.push({
  name: "SEO-D3C2A landing page gate helper has zero import statements",
  pass:
    typeof landingPageIndexabilitySource === "string" &&
    !sourceContainsImportStatement(landingPageIndexabilitySource),
});

checks.push({
  name: "SEO-D3C2A landing page gate helper contains no forbidden runtime, route, crawler, schema, metadata, or monetization references",
  pass:
    typeof landingPageIndexabilitySource === "string" &&
    !sourceIncludesForbiddenLandingPageGateHelperToken(
      landingPageIndexabilitySource,
    ),
});

checks.push({
  name: `${publicLandingPageQuerySkeletonPath} exists for SEO-D3D2B fail-closed skeleton`,
  pass: typeof publicLandingPageQuerySkeletonSource === "string",
});

for (const helperName of publicLandingPageQueryHelperNames) {
  checks.push({
    name: `${publicLandingPageQuerySkeletonPath} exports ${helperName}`,
    pass:
      typeof publicLandingPageQuerySkeletonSource === "string" &&
      new RegExp(`export\\s+function\\s+${helperName}\\s*\\(`).test(
        publicLandingPageQuerySkeletonSource,
      ),
  });
}

for (const requiredToken of requiredPublicLandingPageQuerySkeletonTokens) {
  checks.push({
    name: `${publicLandingPageQuerySkeletonPath} fail-closed guardrail requires ${requiredToken}`,
    pass:
      typeof publicLandingPageQuerySkeletonSource === "string" &&
      publicLandingPageQuerySkeletonSource.includes(requiredToken),
  });
}

checks.push({
  name: `${publicLandingPageQuerySkeletonPath} has zero import statements`,
  pass:
    typeof publicLandingPageQuerySkeletonSource === "string" &&
    !sourceContainsImportStatement(publicLandingPageQuerySkeletonSource),
});

for (const forbiddenToken of [
  ...forbiddenPublicLandingPageQuerySkeletonTokens,
  "canonical",
]) {
  checks.push({
    name: `${publicLandingPageQuerySkeletonPath} forbidden skeleton token is absent: ${forbiddenToken}`,
    pass:
      typeof publicLandingPageQuerySkeletonSource === "string" &&
      !sourceIncludesForbiddenPublicLandingPageQuerySkeletonToken(
        publicLandingPageQuerySkeletonSource,
        forbiddenToken,
      ),
  });
}

for (const integrationToken of [
  "public-landing-page-queries",
  ...publicLandingPageQueryHelperNames,
]) {
  checks.push({
    name: `src/app route files do not reference public landing query skeleton token: ${integrationToken}`,
    pass: collectSourceFiles("src/app").every((absolutePath) => {
      const source = readFileSync(absolutePath, "utf8");
      return !source.includes(integrationToken);
    }),
  });
}

checks.push({
  name: "src/app route files do not import or reference the landing page gate helper",
  pass: collectSourceFiles("src/app").every((absolutePath) => {
    const source = readFileSync(absolutePath, "utf8");
    return !sourceIncludesLandingPageGateIntegration(source);
  }),
});

checks.push({
  name: "sitemap does not import or reference the landing page gate helper",
  pass:
    typeof sitemapSource === "string" &&
    !sourceIncludesLandingPageGateIntegration(sitemapSource),
});

checks.push({
  name: "robots does not import or reference the landing page gate helper",
  pass:
    typeof robotsSource === "string" &&
    !sourceIncludesLandingPageGateIntegration(robotsSource),
});

checks.push({
  name: "llms.txt does not mention the landing page gate helper",
  pass:
    typeof llmsTextSource === "string" &&
    !sourceIncludesLandingPageGateIntegration(llmsTextSource),
});

for (const [crawlerPath, crawlerSource] of [
  ["src/app/sitemap.ts", sitemapSource],
  ["src/app/robots.ts", robotsSource],
  ["public/llms.txt", llmsTextSource],
]) {
  for (const integrationToken of [
    "public-landing-page-queries",
    ...publicLandingPageQueryHelperNames,
  ]) {
    checks.push({
      name: `${crawlerPath} does not reference public landing query skeleton token: ${integrationToken}`,
      pass:
        typeof crawlerSource === "string" &&
        !crawlerSource.includes(integrationToken),
    });
  }
}

checks.push({
  name: "SEO-D2A scaffold routes are not included in sitemap",
  pass:
    typeof sitemapSource === "string" &&
    !/specialtySlug|areaSlug|centers\/\$\{|centers\/\[specialtySlug\]/.test(
      sitemapSource,
    ),
});

checks.push({
  name: "SEO-D2A scaffold files do not emit schema output",
  pass:
    typeof seoD2aSpecialtyPageSource === "string" &&
    typeof seoD2aSpecialtyAreaPageSource === "string" &&
    ![
      seoD2aSpecialtyPageSource,
      seoD2aSpecialtyAreaPageSource,
    ].some(sourceIncludesSchemaOutput),
});

checks.push({
  name: "SEO-D2A scaffold files do not import keyword seed data",
  pass:
    typeof seoD2aSpecialtyPageSource === "string" &&
    typeof seoD2aSpecialtyAreaPageSource === "string" &&
    ![
      seoD2aSpecialtyPageSource,
      seoD2aSpecialtyAreaPageSource,
    ].some(sourceImportsKeywordSeedData),
});

checks.push({
  name: "SEO-D2A scaffold files do not import private admin/provider or service-role data",
  pass:
    typeof seoD2aSpecialtyPageSource === "string" &&
    typeof seoD2aSpecialtyAreaPageSource === "string" &&
    ![
      seoD2aSpecialtyPageSource,
      seoD2aSpecialtyAreaPageSource,
    ].some(sourceImportsForbiddenLandingPageData),
});

checks.push({
  name: "SEO-D2B area scaffold route is not included in sitemap",
  pass:
    typeof sitemapSource === "string" &&
    !/areas\/\$\{|areas\/\[areaSlug\]|areas.*areaSlug/.test(sitemapSource),
});

checks.push({
  name: "SEO-D2B area scaffold file does not emit schema output",
  pass:
    typeof seoD2bAreaPageSource === "string" &&
    !sourceIncludesSchemaOutput(seoD2bAreaPageSource),
});

checks.push({
  name: "SEO-D2B area scaffold file does not import keyword seed data",
  pass:
    typeof seoD2bAreaPageSource === "string" &&
    !sourceImportsKeywordSeedData(seoD2bAreaPageSource),
});

checks.push({
  name: "SEO-D2B area scaffold file does not import private admin/provider or service-role data",
  pass:
    typeof seoD2bAreaPageSource === "string" &&
    !sourceImportsForbiddenLandingPageData(seoD2bAreaPageSource),
});


checks.push({
  name: "SEO-D2C1 service scaffold route is not included in sitemap",
  pass:
    typeof sitemapSource === "string" &&
    !/services\/\$\{|services\/\[serviceSlug\]|services.*serviceSlug/.test(
      sitemapSource,
    ),
});

checks.push({
  name: "SEO-D2C1 service scaffold file does not emit schema output",
  pass:
    typeof seoD2c1ServicePageSource === "string" &&
    !sourceIncludesSchemaOutput(seoD2c1ServicePageSource),
});

checks.push({
  name: "SEO-D2C1 service scaffold file does not import keyword seed data",
  pass:
    typeof seoD2c1ServicePageSource === "string" &&
    !sourceImportsKeywordSeedData(seoD2c1ServicePageSource),
});

checks.push({
  name: "SEO-D2C1 service scaffold file does not import private admin/provider or service-role data",
  pass:
    typeof seoD2c1ServicePageSource === "string" &&
    !sourceImportsForbiddenLandingPageData(seoD2c1ServicePageSource),
});


checks.push({
  name: "SEO-D2C2 service-area scaffold route is not included in sitemap",
  pass:
    typeof sitemapSource === "string" &&
    !/services\/[`'$"{[]|services.*serviceSlug.*areaSlug|services\/\[serviceSlug\]\/\[areaSlug\]/.test(
      sitemapSource,
    ),
});

checks.push({
  name: "SEO-D2C2 service-area scaffold file does not emit schema output",
  pass:
    typeof seoD2c2ServiceAreaPageSource === "string" &&
    !sourceIncludesSchemaOutput(seoD2c2ServiceAreaPageSource),
});

checks.push({
  name: "SEO-D2C2 service-area scaffold file does not import keyword seed data",
  pass:
    typeof seoD2c2ServiceAreaPageSource === "string" &&
    !sourceImportsKeywordSeedData(seoD2c2ServiceAreaPageSource),
});

checks.push({
  name: "SEO-D2C2 service-area scaffold file does not import private admin/provider or service-role data",
  pass:
    typeof seoD2c2ServiceAreaPageSource === "string" &&
    !sourceImportsForbiddenLandingPageData(seoD2c2ServiceAreaPageSource),
});

checks.push({
  name: "SEO-D2C2 service-area scaffold validates locale/country and fails closed",
  pass:
    typeof seoD2c2ServiceAreaPageSource === "string" &&
    /notFound/.test(seoD2c2ServiceAreaPageSource) &&
    /isSupportedLocale/.test(seoD2c2ServiceAreaPageSource) &&
    /isSupportedCountry/.test(seoD2c2ServiceAreaPageSource) &&
    !/generateMetadata|generateStaticParams|PublicPageShell|listPublic|getPublic|searchPublicCatalog|schema\.org|application\/ld\+json|jsonLd|structuredData|StructuredData/.test(
      seoD2c2ServiceAreaPageSource,
    ),
});

checks.push({
  name: "session-aware auth helper uses @supabase/ssr server client",
  pass:
    typeof authServerSource === "string" &&
    /from\s+["']@supabase\/ssr["']/.test(authServerSource) &&
    /createServerClient/.test(authServerSource) &&
    /cookies\s*\(/.test(authServerSource),
});

checks.push({
  name: "admin permission guard requires platform admin profile",
  pass:
    typeof adminPermissionsSource === "string" &&
    /requirePlatformAdmin/.test(adminPermissionsSource) &&
    /auth\.getUser\(\)/.test(adminPermissionsSource) &&
    /is_platform_admin/.test(adminPermissionsSource) &&
    /redirect\(\s*["']\/["']\s*\)/.test(adminPermissionsSource),
});

checks.push({
  name: "admin layout invokes requirePlatformAdmin guard before rendering shell",
  pass:
    typeof adminLayoutSource === "string" &&
    /requirePlatformAdmin/.test(adminLayoutSource) &&
    /AdminShell/.test(adminLayoutSource),
});

checks.push({
  name: "admin page and shell remain minimal server components",
  pass:
    typeof adminPageSource === "string" &&
    typeof adminShellSource === "string" &&
    !/^["']use client["'];?/m.test(adminPageSource) &&
    !/^["']use client["'];?/m.test(adminShellSource),
});


checks.push({
  name: "admin provider onboarding lead list page imports list helper",
  pass:
    typeof adminProviderOnboardingLeadsPageSource === "string" &&
    /listAdminProviderOnboardingLeads/.test(
      adminProviderOnboardingLeadsPageSource,
    ) &&
    sourceImportsAdminProviderOnboardingLeads(
      adminProviderOnboardingLeadsPageSource,
    ),
});

checks.push({
  name: "admin provider onboarding lead UI files do not import service-role client",
  pass:
    typeof adminProviderOnboardingLeadsPageSource === "string" &&
    typeof adminProviderOnboardingLeadsListSource === "string" &&
    typeof adminProviderOnboardingLeadDetailPageSource === "string" &&
    typeof adminProviderOnboardingLeadDetailSource === "string" &&
    ![
      adminProviderOnboardingLeadsPageSource,
      adminProviderOnboardingLeadsListSource,
      adminProviderOnboardingLeadDetailPageSource,
      adminProviderOnboardingLeadDetailSource,
    ].some(sourceIncludesForbiddenServiceRoleImport),
});

checks.push({
  name: "admin provider onboarding lead list component remains server-only presentation",
  pass:
    typeof adminProviderOnboardingLeadsListSource === "string" &&
    !sourceIsClientComponent(adminProviderOnboardingLeadsListSource) &&
    !sourceImportsAdminProviderOnboardingLeads(
      adminProviderOnboardingLeadsListSource,
    ),
});

checks.push({
  name: "admin provider onboarding lead detail page imports detail read helper",
  pass:
    typeof adminProviderOnboardingLeadDetailPageSource === "string" &&
    /getAdminProviderOnboardingLeadById/.test(
      adminProviderOnboardingLeadDetailPageSource,
    ) &&
    sourceImportsAdminProviderOnboardingLeads(
      adminProviderOnboardingLeadDetailPageSource,
    ),
});

checks.push({
  name: "admin provider onboarding lead detail component remains server-only presentation",
  pass:
    typeof adminProviderOnboardingLeadDetailSource === "string" &&
    !sourceIsClientComponent(adminProviderOnboardingLeadDetailSource) &&
    !sourceImportsAdminProviderOnboardingLeads(
      adminProviderOnboardingLeadDetailSource,
    ),
});

checks.push({
  name: "admin provider onboarding lead list links to detail route",
  pass:
    typeof adminProviderOnboardingLeadsListSource === "string" &&
    /`\/admin\/provider-onboarding-leads\/\$\{leadId\}`/.test(
      adminProviderOnboardingLeadsListSource,
    ) &&
    /href=\{buildLeadDetailHref\(lead\.id\)\}/.test(
      adminProviderOnboardingLeadsListSource,
    ),
});

checks.push({
  name: "admin provider onboarding lead route is not included in sitemap",
  pass:
    typeof sitemapSource === "string" &&
    !/admin\/provider-onboarding-leads/.test(sitemapSource),
});

checks.push({
  name: "provider onboarding lead admin mutation routes and actions do not exist",
  pass:
    !existsSync(
      resolve(projectRoot, "src/app/admin/provider-onboarding-leads/actions.ts"),
    ) &&
    !existsSync(
      resolve(projectRoot, "src/app/admin/provider-onboarding-leads/action.ts"),
    ) &&
    !existsSync(
      resolve(projectRoot, "src/app/admin/provider-onboarding-leads/[id]"),
    ) &&
    !existsSync(
      resolve(
        projectRoot,
        "src/app/admin/provider-onboarding-leads/[leadId]/actions.ts",
      ),
    ) &&
    !existsSync(
      resolve(
        projectRoot,
        "src/app/admin/provider-onboarding-leads/[leadId]/action.ts",
      ),
    ) &&
    !existsSync(
      resolve(
        projectRoot,
        "src/app/admin/provider-onboarding-leads/[leadId]/route.ts",
      ),
    ) &&
    !existsSync(
      resolve(projectRoot, "src/app/api/admin/provider-onboarding-leads"),
    ) &&
    !existsSync(
      resolve(projectRoot, "src/app/api/provider-onboarding-leads/status"),
    ) &&
    !existsSync(
      resolve(projectRoot, "src/app/api/provider-onboarding-leads/[id]"),
    ) &&
    typeof adminProviderOnboardingLeadsPageSource === "string" &&
    typeof adminProviderOnboardingLeadsListSource === "string" &&
    typeof adminProviderOnboardingLeadDetailPageSource === "string" &&
    typeof adminProviderOnboardingLeadDetailSource === "string" &&
    !/["']use server["']/.test(adminProviderOnboardingLeadsPageSource) &&
    !/["']use server["']/.test(adminProviderOnboardingLeadsListSource) &&
    !/["']use server["']/.test(adminProviderOnboardingLeadDetailPageSource) &&
    !/["']use server["']/.test(adminProviderOnboardingLeadDetailSource),
});

checks.push({
  name: "admin provider onboarding lead UI does not implement status updates",
  pass:
    typeof adminProviderOnboardingLeadsPageSource === "string" &&
    typeof adminProviderOnboardingLeadsListSource === "string" &&
    typeof adminProviderOnboardingLeadDetailPageSource === "string" &&
    typeof adminProviderOnboardingLeadDetailSource === "string" &&
    ![
      adminProviderOnboardingLeadsPageSource,
      adminProviderOnboardingLeadsListSource,
      adminProviderOnboardingLeadDetailPageSource,
      adminProviderOnboardingLeadDetailSource,
    ].some((source) =>
      /updateProviderOnboardingLeadStatus|setProviderOnboardingLeadStatus|statusAction|statusUpdate|updateStatus|mutate\s*\(/.test(
        source,
      ),
    ),
});

checks.push({
  name: "admin auth and guard do not import service-role client",
  pass:
    typeof authServerSource === "string" &&
    typeof adminPermissionsSource === "string" &&
    typeof adminLayoutSource === "string" &&
    typeof adminPageSource === "string" &&
    typeof adminShellSource === "string" &&
    ![
      authServerSource,
      adminPermissionsSource,
      adminLayoutSource,
      adminPageSource,
      adminShellSource,
    ].some(sourceIncludesForbiddenServiceRoleImport),
});

checks.push({
  name: "admin provider onboarding lead read helper uses admin guard and service-role",
  pass:
    typeof adminProviderOnboardingLeadsSource === "string" &&
    /import\s+\{\s*requirePlatformAdmin\s*\}\s+from\s+["']@\/lib\/permissions\/admin["']/.test(
      adminProviderOnboardingLeadsSource,
    ) &&
    /import\s+\{\s*createSupabaseServiceRoleClient\s*\}\s+from\s+["']@\/lib\/supabase\/service-role["']/.test(
      adminProviderOnboardingLeadsSource,
    ) &&
    /await\s+requirePlatformAdmin\s*\(\s*\)\s*;[\s\S]*createSupabaseServiceRoleClient\s*\(/.test(
      adminProviderOnboardingLeadsSource,
    ),
});

checks.push({
  name: "admin provider onboarding lead read helper imports stay server-only or approved admin page",
  pass: sourceFiles.every((absolutePath) => {
    const relativePath = relative(projectRoot, absolutePath);
    const source = readFileSync(absolutePath, "utf8");

    return (
      !sourceImportsAdminProviderOnboardingLeads(source) ||
      relativePath.startsWith("src/server/admin/") ||
      relativePath === "src/app/admin/provider-onboarding-leads/page.tsx" ||
      relativePath === "src/app/admin/provider-onboarding-leads/[leadId]/page.tsx"
    );
  }),
});

checks.push({
  name: "client components do not import admin provider onboarding lead read helper",
  pass: sourceFiles.every((absolutePath) => {
    const source = readFileSync(absolutePath, "utf8");

    return (
      !sourceIsClientComponent(source) ||
      !sourceImportsAdminProviderOnboardingLeads(source)
    );
  }),
});

checks.push({
  name: "admin route is not included in sitemap",
  pass:
    typeof sitemapSource === "string" &&
    !/["'`]\/(?:admin|en\/om\/admin|ar\/om\/admin)(?:\/)?["'`]/.test(
      sitemapSource,
    ),
});

checks.push({
  name: "supportedLocales contains only en and ar",
  pass:
    Array.isArray(supportedLocales) &&
    supportedLocales.length === 2 &&
    supportedLocales[0] === "en" &&
    supportedLocales[1] === "ar",
});

checks.push({
  name: "supportedCountries contains only om",
  pass:
    Array.isArray(supportedCountries) &&
    supportedCountries.length === 1 &&
    supportedCountries[0] === "om",
});

let failed = false;
for (const check of checks) {
  const status = check.pass ? "PASS" : "FAIL";
  console.log(`${status}: ${check.name}`);
  if (!check.pass) failed = true;
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log("Route contract validation passed.");
}
