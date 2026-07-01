import './check-profile-relation-limit-guard.mjs';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();

function readFile(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`Missing required file: ${relativePath}`);
  return fs.readFileSync(absolutePath, 'utf8');
}

function assertIncludes(content, token, label) {
  if (!content.includes(token)) throw new Error(`${label} is missing required token: ${token}`);
}

function assertNotIncludes(content, token, label) {
  if (content.includes(token)) throw new Error(`${label} contains forbidden token: ${token}`);
}

const listingCardPath = 'src/components/public/public-listing-card.tsx';
const listingCard = readFile(listingCardPath);
for (const token of ['listingHref', "'View profile'", "'عرض الملف'", "'center'", "'doctor'"]) {
  assertIncludes(listingCard, token, listingCardPath);
}

const centerDetailPath = 'src/components/public/public-center-detail.tsx';
const centerDetail = readFile(centerDetailPath);
for (const token of ['publicDoctorDetailRoute', 'doctorProfileLabel', 'View doctor profile', 'عرض ملف الطبيب']) {
  assertIncludes(centerDetail, token, centerDetailPath);
}

const doctorDetailPath = 'src/components/public/public-doctor-detail.tsx';
const doctorDetail = readFile(doctorDetailPath);
for (const token of ['publicCenterDetailRoute', 'centerProfileLabel', 'View center profile', 'عرض ملف المركز']) {
  assertIncludes(doctorDetail, token, doctorDetailPath);
}

const vagueAnchors = [
  ['Click', ' here'].join(''),
  ['Read', ' more'].join(''),
  '>More<',
  '>Profile<',
  '>Details<',
];
for (const token of vagueAnchors) {
  assertNotIncludes(listingCard, token, listingCardPath);
  assertNotIncludes(centerDetail, token, centerDetailPath);
  assertNotIncludes(doctorDetail, token, doctorDetailPath);
}

const docPath = 'docs/seo/profile-graph-anchor-text.md';
const doc = readFile(docPath);
for (const token of ['Profile graph anchor text guard', 'View profile', 'View doctor profile', 'View center profile']) {
  assertIncludes(doc, token, docPath);
}

console.log('Profile graph anchor text guard passed.');
