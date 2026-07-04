import './check-active-address-action.mjs';

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

function readFile(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) throw new Error(`Missing required file: ${file}`);
  return fs.readFileSync(full, 'utf8');
}

function mustHave(text, token, label) {
  if (!text.includes(token)) throw new Error(`${label} missing token: ${token}`);
}

const helperPath = 'src/server/admin/active-center-locations.ts';
const helper = readFile(helperPath);
for (const token of [
  'getAdminActiveCenterLocations',
  'requireAdminPermission("active_centers.public_state.update")',
  '.from("center_locations")',
  'map_url',
]) {
  mustHave(helper, token, helperPath);
}

const pagePath = 'src/app/admin/active-centers/[centerId]/locations/page.tsx';
const page = readFile(pagePath);
for (const token of [
  'ACTIVE_CENTER_LOCATIONS_READONLY',
  'getAdminActiveCenterLocations(centerId)',
  'Read-only view for active center location records.',
  'Open map URL',
]) {
  mustHave(page, token, pagePath);
}

const avPath = 'scripts/admin/check-av.mjs';
const av = readFile(avPath);
mustHave(av, "import './check-active-locations-view.mjs';", avPath);

console.log('Active locations view checks passed.');
