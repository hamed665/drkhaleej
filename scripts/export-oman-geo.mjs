import fs from 'node:fs';
import path from 'node:path';

const geoPath = 'src/config/geo/oman.ts';
const outputPath = 'data/seo/oman-geo-registry.json';

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing geo file: ${filePath}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function section(source, exportName) {
  const marker = `export const ${exportName}`;
  const start = source.indexOf(marker);
  if (start === -1) return '';

  const nextExport = source.indexOf('\nexport const ', start + marker.length);
  return source.slice(start, nextExport === -1 ? source.length : nextExport);
}

function stringProp(line, prop) {
  const match = line.match(new RegExp(`${prop}: '([^']*)'`));
  return match?.[1] ?? null;
}

function rawProp(line, prop) {
  const match = line.match(new RegExp(`${prop}: ([^,}]+)`));
  if (!match) return null;

  const value = match[1].trim();
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+$/.test(value)) return Number(value);
  return value.replace(/^'|'$/g, '');
}

function prune(item) {
  return Object.fromEntries(
    Object.entries(item).filter(([, value]) => value !== null && value !== undefined && value !== ''),
  );
}

function parseRegistry(source, exportName, registryType) {
  return section(source, exportName)
    .split('\n')
    .filter((line) => line.includes("slug: '"))
    .map((line) => prune({
      type: registryType,
      slug: stringProp(line, 'slug'),
      governorateSlug: stringProp(line, 'governorateSlug'),
      wilayatSlug: stringProp(line, 'wilayatSlug'),
      labelEn: stringProp(line, 'labelEn'),
      labelAr: stringProp(line, 'labelAr'),
      countryCode: stringProp(line, 'countryCode'),
      scope: rawProp(line, 'scope'),
      publicLaunchPhase: rawProp(line, 'publicLaunchPhase'),
      isMvp: rawProp(line, 'isMvp'),
    }));
}

const source = readFile(geoPath);

const governorates = parseRegistry(source, 'OMAN_GOVERNORATES', 'governorate');
const wilayats = parseRegistry(source, 'OMAN_WILAYATS', 'wilayat');
const areas = parseRegistry(source, 'OMAN_AREAS', 'area');

const exportData = {
  generatedAt: new Date().toISOString(),
  source: 'src/config/geo/oman.ts',
  countryCode: 'OM',
  summary: {
    governorates: governorates.length,
    wilayats: wilayats.length,
    areas: areas.length,
  },
  governorates,
  wilayats,
  areas,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(exportData, null, 2)}\n`, 'utf8');

console.log(`Exported Oman geo registry to ${outputPath}`);
console.log(exportData.summary);
