import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const filePath = 'src/app/[locale]/[country]/for-providers/provider-onboarding-form.tsx';
const source = await readFile(path.join(root, filePath), 'utf8');

function assertIncludes(token) {
  if (!source.includes(token)) throw new Error(`${filePath} must include ${token}`);
}

function assertNotIncludes(token) {
  if (source.includes(token)) throw new Error(`${filePath} must not include ${token}`);
}

assertIncludes("import { recordPublicFormAction } from '@/lib/observability/public-form-action';");
assertIncludes("recordPublicFormAction({ kind: 'provider', locale, country: 'om' });");

const callIndex = source.indexOf("recordPublicFormAction({ kind: 'provider', locale, country: 'om' });");
const dataIndex = source.indexOf('new FormData(form)');
if (callIndex < 0 || dataIndex < 0 || callIndex > dataIndex) {
  throw new Error('provider local action call must run before reading submitted form data.');
}

const callLine = source
  .split('\n')
  .find((line) => line.includes('recordPublicFormAction(')) ?? '';

for (const token of [
  'formData',
  'centerName',
  'contactName',
  'phone',
  'whatsapp',
  'email',
  'message',
  'cityText',
  'areaText',
  'providerType',
]) {
  if (callLine.includes(token)) throw new Error(`provider local action call must not include ${token}`);
}

assertNotIncludes('recordPublicFormAction({ kind: \'provider\', locale, country: \'om\', providerType');

console.log('provider form local action guard passed.');
