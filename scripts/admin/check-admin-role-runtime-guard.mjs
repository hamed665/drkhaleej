import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const targetPath = 'src/server/admin/permissions.ts';
const absolutePath = path.join(repoRoot, targetPath);

if (!fs.existsSync(absolutePath)) {
  throw new Error(`Missing required file: ${targetPath}`);
}

const content = fs.readFileSync(absolutePath, 'utf8');

function assertIncludes(token) {
  if (!content.includes(token)) {
    throw new Error(`${targetPath} is missing required token: ${token}`);
  }
}

function assertNotIncludes(token) {
  if (content.includes(token)) {
    throw new Error(`${targetPath} contains forbidden token: ${token}`);
  }
}

assertIncludes('async function resolveAdminRole');
assertIncludes('createSupabaseServiceRoleClient');
assertIncludes('.from("profiles")');
assertIncludes('.select("metadata")');
assertIncludes('metadata.admin_role');
assertIncludes('value in adminRoles');
assertIncludes('const role = await resolveAdminRole(profile);');
assertIncludes('?? "super_admin"');
assertNotIncludes('const role: AdminRoleKey = "super_admin";');

console.log('Admin role runtime guard checks passed.');
