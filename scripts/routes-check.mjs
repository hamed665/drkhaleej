import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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
    .map((item) => item.trim().replace(/^['\"]|['\"]$/g, ""))
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
const sitemapSource = readSourceIfExists("src/app/sitemap.ts");

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
