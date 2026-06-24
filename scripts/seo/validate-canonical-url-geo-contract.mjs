import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = process.cwd();
const contractPath = resolve(projectRoot, "docs/DRMUSCAT_CANONICAL_URL_GEO_CONTRACT_V1.md");

const requiredPhrases = [
  "canonical URL",
  "Country → Governorate → Wilayat → City or Settlement → Area or Neighborhood",
  "Slug policy",
  "Alias and redirect policy",
  "Indexability contract",
  "Internal linking implications",
  "Breadcrumb contract",
  "Sitemap contract",
  "Robots and LLM contract",
  "Ad and UI slot compatibility",
  "Implementation dependency order",
  "/{locale}/{country}/doctors/{doctorSlug}",
  "/{locale}/{country}/hospitals/{facilitySlug}",
  "/{locale}/{country}/areas/{governorateSlug}/{wilayatSlug}/{areaSlug}",
  "A doctor has one canonical profile per locale/country.",
  "Search result URLs with query parameters are crawl-trap risks and must default to noindex.",
  "Internal links must point to canonical URLs",
  "Sitemap must not include:",
  "No raw import, admin notes, private metadata, or unapproved entity facts may appear in LLM-facing files.",
  "`/areas/{areaSlug}` is not allowed as an indexable canonical route because area slugs are not globally unique.",
];

const forbiddenPermissionPhrases = [
  "`/areas/{areaSlug}` is allowed as an indexable canonical route",
  "global area slug canonical routes are allowed",
  "area slugs are globally unique",
];

if (!existsSync(contractPath)) {
  console.error("Missing canonical URL and geo contract document.");
  process.exit(1);
}

const source = readFileSync(contractPath, "utf8");
const missing = requiredPhrases.filter((phrase) => !source.includes(phrase));
const forbidden = forbiddenPermissionPhrases.filter((phrase) => source.includes(phrase));

if (missing.length > 0) {
  console.error("Canonical URL and geo contract is missing required phrases:");
  for (const phrase of missing) {
    console.error(`- ${phrase}`);
  }
  process.exit(1);
}

if (forbidden.length > 0) {
  console.error("Canonical URL and geo contract contains forbidden permission phrases:");
  for (const phrase of forbidden) {
    console.error(`- ${phrase}`);
  }
  process.exit(1);
}

console.log("Canonical URL and geo contract validation passed.");
