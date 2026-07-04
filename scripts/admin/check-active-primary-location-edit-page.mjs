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

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function sameList(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

const pagePath = 'src/app/admin/active-centers/[centerId]/locations/edit-primary/page.tsx';
const page = readFile(pagePath);
for (const token of [
  'ACTIVE_PRIMARY_LOCATION_EDIT',
  'getAdminActiveCenterLocations(centerId)',
  'updateActiveCenterPrimaryLocationDetails',
  'Save primary location details',
  '3 fields only',
  'Address EN',
  'Address AR',
  'Map URL',
  'name="centerId"',
  'name="addressLine1En"',
  'name="addressLine1Ar"',
  'name="mapUrl"',
  'Back to active locations',
]) {
  mustHave(page, token, pagePath);
}

const allowedFieldNames = uniqueSorted(['addressLine1Ar', 'addressLine1En', 'centerId', 'mapUrl']);
const actualFieldNames = uniqueSorted([...page.matchAll(/\bname="([^"]+)"/g)].map((match) => match[1]));
if (!sameList(actualFieldNames, allowedFieldNames)) {
  throw new Error(`${pagePath} exposes unexpected form field names: ${actualFieldNames.join(', ')}`);
}

const actionPath = 'src/server/admin/active-center-address-actions.ts';
const action = readFile(actionPath);
mustHave(action, 'updateActiveCenterPrimaryLocationDetails', actionPath);
mustHave(action, 'active_center.primary_location_updated', actionPath);

const locationGuardPath = 'scripts/admin/check-active-locations-view.mjs';
const locationGuard = readFile(locationGuardPath);
mustHave(locationGuard, "import './check-active-primary-location-edit-page.mjs';", locationGuardPath);

console.log('Active primary location edit page checks passed.');
