import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();

const checks = [
  {
    name: 'src/app/[locale]/[country]/page.tsx exists',
    pass: existsSync(resolve(projectRoot, 'src/app/[locale]/[country]/page.tsx'))
  },
  {
    name: 'approved discovery skeleton routes exist',
    pass: [
      'doctors',
      'centers',
      'pharmacies',
      'labs',
      'services',
      'search'
    ].every((slug) => existsSync(resolve(projectRoot, `src/app/[locale]/[country]/${slug}/page.tsx`)))
  },
  {
    name: 'singular doctor detail route exists',
    pass: existsSync(resolve(projectRoot, 'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx'))
  },
  {
    name: 'approved provider route exists',
    pass: existsSync(resolve(projectRoot, 'src/app/[locale]/[country]/for-providers/page.tsx'))
  },
  {
    name: 'plural doctor detail entity route does not exist',
    pass: !existsSync(resolve(projectRoot, 'src/app/[locale]/[country]/doctors/[doctorSlug]/page.tsx'))
  },
  {
    name: 'src/app/[locale]/centers route does not exist',
    pass: !existsSync(resolve(projectRoot, 'src/app/[locale]/centers'))
  },
  {
    name: 'src/app/fa route does not exist',
    pass: !existsSync(resolve(projectRoot, 'src/app/fa'))
  },
  {
    name: 'src/app/hi route does not exist',
    pass: !existsSync(resolve(projectRoot, 'src/app/hi'))
  }
];

const i18nConfigPath = resolve(projectRoot, 'src/lib/i18n/config.ts');
if (!existsSync(i18nConfigPath)) {
  console.error('FAIL: src/lib/i18n/config.ts is missing');
  process.exit(1);
}

const i18nSource = readFileSync(i18nConfigPath, 'utf8');

const extractConstArray = (source, variableName) => {
  const regex = new RegExp(`export\\s+const\\s+${variableName}\\s*=\\s*\\[(.*?)\\]\\s+as\\s+const`, 's');
  const match = source.match(regex);
  if (!match) return null;

  return match[1]
    .split(',')
    .map((item) => item.trim().replace(/^['\"]|['\"]$/g, ''))
    .filter(Boolean);
};

const supportedLocales = extractConstArray(i18nSource, 'supportedLocales');
const supportedCountries = extractConstArray(i18nSource, 'supportedCountries');

checks.push({
  name: 'supportedLocales contains only en and ar',
  pass:
    Array.isArray(supportedLocales) &&
    supportedLocales.length === 2 &&
    supportedLocales[0] === 'en' &&
    supportedLocales[1] === 'ar'
});

checks.push({
  name: 'supportedCountries contains only om',
  pass:
    Array.isArray(supportedCountries) &&
    supportedCountries.length === 1 &&
    supportedCountries[0] === 'om'
});

let failed = false;
for (const check of checks) {
  const status = check.pass ? 'PASS' : 'FAIL';
  console.log(`${status}: ${check.name}`);
  if (!check.pass) failed = true;
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log('Route contract validation passed.');
}
