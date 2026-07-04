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

const actionPath = 'src/server/admin/active-center-address-actions.ts';
const action = readFile(actionPath);
for (const token of [
  '"use server";',
  'updateActiveCenterPrimaryLocationDetails',
  'requireAdminPermission("active_centers.public_state.update")',
  'formData, "centerId", 64',
  'formData, "addressLine1En", 300',
  'formData, "addressLine1Ar", 300',
  'formData, "mapUrl", 2048',
  '.from("centers")',
  '.eq("status", "active")',
  '.eq("is_active", true)',
  '.from("center_locations")',
  '.eq("center_id", centerId)',
  '.eq("is_primary", true)',
  'address_line1_en: addressLine1En',
  'address_line1_ar: addressLine1Ar',
  'map_url: mapUrl',
  'active_center.primary_location_updated',
  'revalidatePath(enPath)',
  'revalidatePath(arPath)',
]) {
  mustHave(action, token, actionPath);
}

const auditPath = 'src/server/admin/audit-log.ts';
const audit = readFile(auditPath);
mustHave(audit, '| "active_center.primary_location_updated"', auditPath);

const locationGuardPath = 'scripts/admin/check-active-locations-view.mjs';
const locationGuard = readFile(locationGuardPath);
mustHave(locationGuard, "import './check-active-address-action.mjs';", locationGuardPath);

console.log('Active address action checks passed.');
