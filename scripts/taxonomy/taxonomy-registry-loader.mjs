import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const repoRoot = process.cwd();
const files = {
  verticals: 'src/config/taxonomy/verticals.ts',
  entityTypes: 'src/config/taxonomy/entity-types.ts',
  doctorLevels: 'src/config/taxonomy/doctor-levels.ts',
  specialties: 'src/config/taxonomy/specialties.ts',
  services: 'src/config/taxonomy/services.ts',
  schemaHints: 'src/config/taxonomy/schema-hints.ts'
};
const exportNames = {
  verticals: 'taxonomyVerticals',
  entityTypes: 'taxonomyEntityTypes',
  doctorLevels: 'taxonomyDoctorLevels',
  specialties: 'taxonomySpecialties',
  services: 'taxonomyServices',
  schemaHints: 'taxonomySchemaHints'
};

export function loadMasterTaxonomy() {
  const registries = {};
  for (const [family, relativePath] of Object.entries(files)) {
    const fullPath = path.join(repoRoot, relativePath);
    const source = fs.readFileSync(fullPath, 'utf8');
    const transpiled = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
    }).outputText;
    const sandbox = { exports: {}, require: () => ({}) };
    vm.runInNewContext(transpiled, sandbox, { filename: relativePath });
    registries[family] = sandbox.exports[exportNames[family]];
  }
  return registries;
}
