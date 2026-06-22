#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { loadMasterTaxonomy } from './taxonomy-registry-loader.mjs';
import { validateMasterTaxonomy } from './validate-master-taxonomy.mjs';

const outputPath = path.join(process.cwd(), 'data/taxonomy/master-taxonomy-seed.json');
const registries = loadMasterTaxonomy();
const errors = validateMasterTaxonomy(registries);
if (errors.length > 0) {
  console.error('Refusing to export invalid master taxonomy:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const sortBySlug = (records) => [...records].sort((a, b) => a.slug.localeCompare(b.slug, 'en'));
const exported = {
  version: 'v1',
  generatedFrom: 'src/config/taxonomy',
  sortOrder: 'slug-ascending',
  registries: {
    verticals: sortBySlug(registries.verticals),
    entityTypes: sortBySlug(registries.entityTypes),
    doctorLevels: sortBySlug(registries.doctorLevels),
    specialties: sortBySlug(registries.specialties),
    services: sortBySlug(registries.services),
    schemaHints: sortBySlug(registries.schemaHints)
  }
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(exported, null, 2)}\n`);
console.log(`Exported deterministic master taxonomy seed JSON to ${path.relative(process.cwd(), outputPath)}.`);
