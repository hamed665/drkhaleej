import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = process.cwd();
const reviewPath = resolve(projectRoot, "docs/DRMUSCAT_ENTITY_RELATION_MODEL_GAP_REVIEW_V1.md");

const requiredPhrases = [
  "source-of-truth",
  "public.doctor_practice_locations",
  "public.center_locations",
  "public.center_services",
  "public.doctor_services",
  "Missing practice type",
  "Missing relation review status",
  "Missing relation source and freshness fields",
  "Missing department model",
  "Missing relation candidates",
  "Missing internal link candidates",
  "doctor_practices_at_facility",
  "doctor_has_private_practice",
  "doctor_visits_facility",
  "facility_has_department",
  "pharmacy_near_facility",
  "lab_near_facility",
  "relation review status is approved",
  "A doctor profile can display multiple practice locations.",
  "No separate doctor-location SEO page by default.",
  "nearby/proximity",
  "Structured data must not claim relationships that are not visible and approved.",
  "implementation dependency order",
];

const forbiddenPhrases = [
  "uncontrolled generic graph table",
  "No automatic doctor-location public pages are allowed in this phase.",
];

if (!existsSync(reviewPath)) {
  console.error("Missing entity relation model gap review document.");
  process.exit(1);
}

const source = readFileSync(reviewPath, "utf8");
const missing = requiredPhrases.filter((phrase) => !source.includes(phrase));

if (missing.length > 0) {
  console.error("Entity relation gap review is missing required phrases:");
  for (const phrase of missing) {
    console.error(`- ${phrase}`);
  }
  process.exit(1);
}

for (const phrase of forbiddenPhrases) {
  if (!source.includes(phrase)) {
    console.error(`Entity relation gap review must preserve guardrail phrase: ${phrase}`);
    process.exit(1);
  }
}

console.log("Entity relation model gap review validation passed.");
