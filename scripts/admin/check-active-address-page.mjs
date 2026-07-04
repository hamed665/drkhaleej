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

const pagePath = 'src/app/admin/active-centers/[centerId]/locations/edit-primary/page.tsx';
const page = readFile(pagePath);
for (const token of [
  'AdminActivePrimaryLocationEditPage',
  'ACTIVE_PRIMARY_LOCATION_EDIT',
  'getAdminActiveCenterLocations(centerId)',
  'updateActiveCenterPrimaryLocationDetails',
  'name="centerId"',
  'name="addressLine1En"',
  'name="addressLine1Ar"',
  'name="mapUrl"',
  '3 fields only',
  'Save primary location details',
  'Back to active locations',
]) {
  mustHave(page, token, pagePath);
}

const actionPath = 'src/server/admin/active-center-address-actions.ts';
const action = readFile(actionPath);
mustHave(action, 'updateActiveCenterPrimaryLocationDetails', actionPath);
mustHave(action, 'active_center.primary_location_updated', actionPath);

const locationGuardPath = 'scripts/admin/check-active-locations-view.mjs';
const locationGuard = readFile(locationGuardPath);
mustHave(locationGuard, "import './check-active-address-page.mjs';", locationGuardPath);

console.log('Active address page checks passed.');
