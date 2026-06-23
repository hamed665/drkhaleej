import fs from 'node:fs';
import path from 'node:path';

const registryFiles = {
  verticals: 'src/config/taxonomy/verticals.ts',
  doctorLevels: 'src/config/taxonomy/doctor-levels.ts',
  entityTypes: 'src/config/taxonomy/entity-types.ts',
  specialties: 'src/config/taxonomy/specialties.ts',
  services: 'src/config/taxonomy/services.ts',
};

const outputPath = 'data/seo/taxonomy-registry.json';

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing taxonomy file: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function stringProp(line, prop) {
  const match = line.match(new RegExp(`${prop}: '([^']*)'`));
  return match?.[1] ?? null;
}

function rawProp(line, prop) {
  const match = line.match(new RegExp(`${prop}: ([^,}]+)`));
  if (!match) return null;
  const raw = match[1].trim();
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (/^\d+$/.test(raw)) return Number(raw);
  return raw.replace(/^'|'$/g, '');
}

function arrayProp(line, prop) {
  const match = line.match(new RegExp(`${prop}: \\[([^\\]]*)\\]`));
  if (!match) return [];
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
}

function parseRegistry(filePath) {
  return readFile(filePath)
    .split('\n')
    .filter((line) => line.includes("slug: '"))
    .map((line) => ({
      slug: stringProp(line, 'slug'),
      labelEn: stringProp(line, 'labelEn'),
      labelAr: stringProp(line, 'labelAr'),
      descriptionEn: stringProp(line, 'descriptionEn'),
      descriptionAr: stringProp(line, 'descriptionAr'),
      scope: rawProp(line, 'scope'),
      publicLaunchPhase: rawProp(line, 'publicLaunchPhase'),
      topicalRisk: rawProp(line, 'topicalRisk'),
      requiresLicense: rawProp(line, 'requiresLicense'),
      requiresQualification: rawProp(line, 'requiresQualification'),
      isMedicalDoctor: rawProp(line, 'isMedicalDoctor'),
      isDental: rawProp(line, 'isDental'),
      isMentalHealth: rawProp(line, 'isMentalHealth'),
      parentSlug: rawProp(line, 'parentSlug'),
      family: rawProp(line, 'family'),
      verticals: arrayProp(line, 'verticals'),
      relatedSpecialtySlugs: arrayProp(line, 'relatedSpecialtySlugs'),
      relatedEntityTypes: arrayProp(line, 'relatedEntityTypes'),
      medicalRiskLevel: rawProp(line, 'medicalRiskLevel'),
      requiresMedicalReview: rawProp(line, 'requiresMedicalReview'),
      requiresMedicalDisclaimer: rawProp(line, 'requiresMedicalDisclaimer'),
      schemaHint: rawProp(line, 'schemaHint'),
    }))
    .map((item) => Object.fromEntries(Object.entries(item).filter(([, value]) => {
      if (value === null || value === undefined) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })));
}

const registry = Object.fromEntries(
  Object.entries(registryFiles).map(([name, filePath]) => [name, parseRegistry(filePath)]),
);

const exportData = {
  generatedAt: new Date().toISOString(),
  source: 'static-taxonomy-config',
  summary: Object.fromEntries(Object.entries(registry).map(([name, items]) => [name, items.length])),
  ...registry,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(exportData, null, 2)}\n`, 'utf8');

console.log(`Exported taxonomy registry to ${outputPath}`);
console.log(exportData.summary);
