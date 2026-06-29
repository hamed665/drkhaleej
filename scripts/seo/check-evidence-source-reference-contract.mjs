import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const contractPath = 'src/config/geo/location-candidate-evidence-source-reference-contract.ts';

const contract = readFileSync(resolve(projectRoot, contractPath), 'utf8');

if (!contract.includes('OMAN_LOCATION_CANDIDATE_EVIDENCE_SOURCE_REFERENCE_CONTRACT')) {
  console.error('Missing evidence source reference contract.');
  process.exit(1);
}

console.log('Evidence source reference contract validation passed.');
