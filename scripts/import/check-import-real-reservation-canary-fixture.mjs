#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const fixturePath = path.join(process.cwd(), 'fixtures/import/import-real-reservation-canary.fixture.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

if (fixture.schemaVersion !== 'drkhaleej.import.realReservationCanary.v1') {
  throw new Error('real reservation canary fixture schema version is invalid');
}
if (!Array.isArray(fixture.cases) || fixture.cases.length < 4) {
  throw new Error('real reservation canary fixture must include at least four cases');
}
if (fixture.safety?.terminalPersistenceAllowed !== false) throw new Error('terminal persistence must remain disabled');
if (fixture.safety?.entityMutationAllowed !== false) throw new Error('entity mutation must remain disabled');
if (fixture.safety?.bulkAllowed !== false) throw new Error('bulk execution must remain disabled');

console.log('import real reservation canary fixture check passed.');
