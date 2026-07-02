import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();

function readFile(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing required file: ${relativePath}`);
  }

  return fs.readFileSync(absolutePath, 'utf8');
}

function assertIncludes(content, token, label) {
  if (!content.includes(token)) {
    throw new Error(`${label} is missing required token: ${token}`);
  }
}

function assertNotIncludes(content, token, label) {
  if (content.includes(token)) {
    throw new Error(`${label} contains forbidden token: ${token}`);
  }
}

const routeHelperPath = 'src/lib/routes/public.ts';
const routeHelper = readFile(routeHelperPath);
for (const token of [
  'publicCenterDetailRoute',
  'publicDoctorDetailRoute',
  '`/${locale}/${country}/center/${centerSlug}`',
  '`/${locale}/${country}/doctor/${doctorSlug}`',
  'publicCenterDetailRoutePattern',
  'publicDoctorDetailRoutePattern',
  '^\\/(en|ar)\\/(om)\\/center\\/',
  '^\\/(en|ar)\\/(om)\\/doctor\\/',
]) {
  assertIncludes(routeHelper, token, routeHelperPath);
}

const listingCardPath = 'src/components/public/public-listing-card.tsx';
const listingCard = readFile(listingCardPath);
for (const token of [
  'import Link from',
  'function listingHref',
  "family: 'center' | 'doctor'",
  '`/${locale}/${country.toLowerCase()}/${family}/${slug}`',
  "listingHref(props.locale, props.item.defaultCountry, 'center', props.item.slug)",
  "listingHref(props.locale, props.item.defaultCountry, 'doctor', props.item.slug)",
  'View profile',
  'عرض الملف',
  'Profile coming soon',
]) {
  assertIncludes(listingCard, token, listingCardPath);
}
for (const forbiddenToken of [
  'PublicContactActions',
  'contactActions',
  'tel:',
  'mailto:',
  'wa.me',
  'Book now',
  'Open now',
  'rating',
  'insurance',
  'Verified',
]) {
  assertNotIncludes(listingCard, forbiddenToken, listingCardPath);
}

const listingGridPath = 'src/components/public/public-listing-grid.tsx';
const listingGrid = readFile(listingGridPath);
for (const token of [
  'PublicListingCard',
  'variant: \'center\'',
  'variant: \'doctor\'',
  'variant: \'service\'',
  '<PublicListingCard locale={props.locale} variant="center" item={item} />',
  '<PublicListingCard locale={props.locale} variant="doctor" item={item} />',
  '<PublicListingCard locale={props.locale} variant="service" item={item} />',
]) {
  assertIncludes(listingGrid, token, listingGridPath);
}

const listingContentPath = 'src/components/public/public-directory-listing-content.tsx';
const listingContent = readFile(listingContentPath);
for (const token of [
  'PublicListingGrid',
  'PublicCenterSummary[]',
  'PublicDoctorSummary[]',
  'PublicServiceSummary[]',
  'variant="center"',
  'variant="doctor"',
  'variant="service"',
]) {
  assertIncludes(listingContent, token, listingContentPath);
}

const centerRoutePath = 'src/app/[locale]/[country]/center/[centerSlug]/page.tsx';
const centerRoute = readFile(centerRoutePath);
for (const token of [
  'generateMetadata',
  'getPublicCenterBySlug',
  'PublicCenterDetail',
  'PublicContactActions',
  'PublicPageShell',
  'PublicListingError',
  'buildNoindexFallbackMetadata',
  'robots: { index: false, follow: true }',
  'return buildNoindexFallbackMetadata({',
  'pathname: `/center/${centerSlug}`',
  'notFound()',
  'fallbackTitle',
  'fallbackDescription',
  'heroActions={heroActions}',
]) {
  assertIncludes(centerRoute, token, centerRoutePath);
}
for (const forbiddenToken of [
  'Book now',
  'Open now',
  'AggregateRating',
  'ratingValue',
  'reviewCount',
  'insurance',
  'sitemapPolicy',
  'generateStaticParams',
]) {
  assertNotIncludes(centerRoute, forbiddenToken, centerRoutePath);
}

const doctorRoutePath = 'src/app/[locale]/[country]/doctor/[doctorSlug]/page.tsx';
const doctorRoute = readFile(doctorRoutePath);
for (const token of [
  'generateMetadata',
  'getPublicDoctorBySlug',
  'getPublicImportDoctorProfile',
  'GuardedImportProfilePage',
  'PublicDoctorDetail',
  'PublicPageShell',
  'PublicListingError',
  'buildNoindexFallbackMetadata',
  'robots: { index: false, follow: true }',
  'pathname: `/doctor/${doctorSlug}`',
  'notFound()',
  'Doctor Profile | DrKhaleej',
]) {
  assertIncludes(doctorRoute, token, doctorRoutePath);
}
for (const forbiddenToken of [
  'AggregateRating',
  'ratingValue',
  'reviewCount',
  'insurance',
  'sitemapPolicy',
  'generateStaticParams',
]) {
  assertNotIncludes(doctorRoute, forbiddenToken, doctorRoutePath);
}

const centerDetailPath = 'src/components/public/public-center-detail.tsx';
const centerDetail = readFile(centerDetailPath);
for (const token of [
  'publicDoctorDetailRoute',
  'doctorProfileLabel',
  'View doctor profile',
  'عرض ملف الطبيب',
  'This is not a license or MOH approval claim.',
  'not medical advice, diagnosis, emergency guidance, or a guarantee of provider availability',
  'showCallbackRequest',
  'showSafeContactFallback',
  'showVerification',
  'visibleServices.length > 0 ?',
  'visibleDoctors.length > 0 ?',
]) {
  assertIncludes(centerDetail, token, centerDetailPath);
}
for (const token of [
  'futureSlots',
  'futureTitle',
  'renderLocationActions',
  'verificationPlaceholder',
]) {
  assertNotIncludes(centerDetail, token, centerDetailPath);
}

const doctorDetailPath = 'src/components/public/public-doctor-detail.tsx';
const doctorDetail = readFile(doctorDetailPath);
for (const token of [
  'publicCenterDetailRoute',
  'centerProfileLabel',
  'View center profile',
  'عرض ملف المركز',
  'This is not a license or MOH approval claim.',
  'Discovery safety note',
  'Confirm clinical details directly with the provider before making care decisions.',
  'Future doctor profile sections',
  'Reviews',
  'Ratings',
]) {
  assertIncludes(doctorDetail, token, doctorDetailPath);
}

const listingSafetyPath = 'scripts/seo/check-public-listing-card-safety.mjs';
const listingSafety = readFile(listingSafetyPath);
assertIncludes(listingSafety, "import './check-public-profile-readiness-smoke.mjs';", listingSafetyPath);

console.log('Public profile readiness smoke guard passed.');
