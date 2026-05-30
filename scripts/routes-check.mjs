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
const sitemapSource = readSourceIfExists("src/app/sitemap.ts");
const adminProviderOnboardingLeadsSource = readSourceIfExists(
  "src/server/admin/provider-onboarding-leads.ts",
);
const sourceFiles = collectSourceFiles("src");

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
    ![
      adminProviderOnboardingLeadsPageSource,
      adminProviderOnboardingLeadsListSource,
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
    !/["']use server["']/.test(adminProviderOnboardingLeadsPageSource) &&
    !/["']use server["']/.test(adminProviderOnboardingLeadsListSource),
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
      relativePath === "src/app/admin/provider-onboarding-leads/page.tsx"
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
