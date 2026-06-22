#!/usr/bin/env node
import { loadMasterTaxonomy } from './taxonomy-registry-loader.mjs';

export const allowedAcronyms = new Set(['MRI', 'CT', 'CT Scan', 'IVF', 'ICSI', 'CBC', 'HbA1c', 'ECG', 'OPG', 'CBCT']);
export const badArabicPhrases = ['الصحة النفسية الصحة', 'صحة المرأة الصحة', 'حمل متابعة متابعة', 'إدارة الوزن إدارة', 'دم اختبار', 'كبد وظائف اختبار', 'كلى وظائف اختبار', 'غدة درقية اختبار', 'مفتوح رنين مغناطيسي', 'منزلية رعاية', 'طوارئ نقل'];
const placeholderPhrases = ['taxonomy vertical for DrMuscat registry planning', 'entity type', 'service taxonomy item'];

const hasArabic = (value) => /[\u0600-\u06FF]/.test(value);
const latinCount = (value) => (value.match(/[A-Za-z]/g) ?? []).length;
const letterCount = (value) => (value.match(/[A-Za-z\u0600-\u06FF]/g) ?? []).length;
const isAllowedAcronymLabel = (value) => allowedAcronyms.has(value.trim());
const hasDuplicateAdjacentWords = (value) => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return words.some((word, index) => index > 0 && word === words[index - 1]);
};

function addUniqueSlugErrors(errors, familyName, records) {
  const seen = new Set();
  for (const record of records) {
    if (seen.has(record.slug)) errors.push(`${familyName}: duplicate slug ${record.slug}`);
    seen.add(record.slug);
  }
}

function includesAll(actual, expected) {
  return expected.every((item) => actual.includes(item));
}

export function validateMasterTaxonomy(registries = loadMasterTaxonomy()) {
  const errors = [];
  const allRecords = Object.entries(registries).flatMap(([family, records]) => records.map((record) => ({ family, record })));
  for (const [family, records] of Object.entries(registries)) addUniqueSlugErrors(errors, family, records);

  for (const { family, record } of allRecords) {
    const context = `${family}/${record.slug}`;
    if (!record.labelAr?.trim()) errors.push(`${context}: labelAr is required`);
    if (record.labelAr?.trim() === record.labelEn?.trim() && !isAllowedAcronymLabel(record.labelAr)) errors.push(`${context}: labelAr must not equal labelEn unless it is an approved acronym`);
    for (const phrase of badArabicPhrases) if (record.labelAr?.includes(phrase)) errors.push(`${context}: labelAr contains bad Arabic phrase "${phrase}"`);
    const letters = letterCount(record.labelAr ?? '');
    if (!isAllowedAcronymLabel(record.labelAr ?? '') && letters > 0 && latinCount(record.labelAr ?? '') / letters > 0.5) errors.push(`${context}: non-acronym labelAr is mostly Latin letters`);
    for (const phrase of placeholderPhrases) if ((record.labelAr ?? '').toLowerCase().includes(phrase.toLowerCase())) errors.push(`${context}: labelAr contains placeholder text`);
    if (!record.descriptionAr?.trim()) errors.push(`${context}: descriptionAr is required`);
    if (record.descriptionAr && !hasArabic(record.descriptionAr)) errors.push(`${context}: descriptionAr must contain Arabic text`);
    if (!isAllowedAcronymLabel(record.labelAr ?? '') && [...(record.labelAr ?? '').trim()].length === 1) errors.push(`${context}: labelAr is suspiciously short`);
    if (hasDuplicateAdjacentWords(record.labelAr ?? '')) errors.push(`${context}: labelAr has duplicate adjacent words`);
  }

  const verticalSlugs = new Set(registries.verticals.map((item) => item.slug));
  const specialtySlugs = new Set(registries.specialties.map((item) => item.slug));
  const entityTypeSlugs = new Set(registries.entityTypes.map((item) => item.slug));
  const schemaHintSlugs = new Set(registries.schemaHints.map((item) => item.slug));

  for (const entityType of registries.entityTypes) {
    if (!verticalSlugs.has(entityType.primaryVerticalSlug)) errors.push(`entityTypes/${entityType.slug}: missing primary vertical ${entityType.primaryVerticalSlug}`);
    for (const slug of entityType.secondaryVerticalSlugs) if (!verticalSlugs.has(slug)) errors.push(`entityTypes/${entityType.slug}: missing secondary vertical ${slug}`);
  }
  for (const specialty of registries.specialties) {
    for (const slug of specialty.verticalSlugs) if (!verticalSlugs.has(slug)) errors.push(`specialties/${specialty.slug}: missing vertical ${slug}`);
    for (const slug of specialty.relatedEntityTypeSlugs) if (!entityTypeSlugs.has(slug)) errors.push(`specialties/${specialty.slug}: missing entity type ${slug}`);
  }
  for (const service of registries.services) {
    for (const slug of service.verticalSlugs) if (!verticalSlugs.has(slug)) errors.push(`services/${service.slug}: missing vertical ${slug}`);
    for (const slug of service.relatedSpecialtySlugs) if (!specialtySlugs.has(slug)) errors.push(`services/${service.slug}: missing specialty ${slug}`);
    for (const slug of service.relatedEntityTypeSlugs) if (!entityTypeSlugs.has(slug)) errors.push(`services/${service.slug}: missing entity type ${slug}`);
    if (!schemaHintSlugs.has(service.schemaHintSlug)) errors.push(`services/${service.slug}: missing schema hint ${service.schemaHintSlug}`);
  }

  const verticalBySlug = new Map(registries.verticals.map((item) => [item.slug, item]));
  for (const slug of ['healthy-food', 'healthy-meal-delivery', 'restaurants']) {
    const vertical = verticalBySlug.get(slug);
    if (vertical?.isCore || vertical?.isAdjacent || vertical?.scope === 'core' || vertical?.scope === 'adjacent') errors.push(`verticals/${slug}: must not be core or adjacent`);
  }
  for (const slug of ['beauty-nonmedical', 'pet-shops']) if (verticalBySlug.get(slug)?.isCore) errors.push(`verticals/${slug}: must not be core`);
  const hybrid = registries.entityTypes.find((item) => item.slug === 'pet-clinic-shop-hybrid');
  if (hybrid?.primaryVerticalSlug !== 'pet-clinics' || !hybrid?.secondaryVerticalSlugs.includes('pet-shops')) errors.push('entityTypes/pet-clinic-shop-hybrid: must use pet-clinics primary and pet-shops secondary');

  const specialtyBySlug = new Map(registries.specialties.map((item) => [item.slug, item]));
  const entityBySlug = new Map(registries.entityTypes.map((item) => [item.slug, item]));
  const serviceBySlug = new Map(registries.services.map((item) => [item.slug, item]));
  const physio = specialtyBySlug.get('physiotherapy');
  if (!physio?.verticalSlugs.includes('physiotherapy-rehabilitation') || physio?.isMentalHealth !== false || !includesAll(physio?.relatedEntityTypeSlugs ?? [], ['physiotherapy-center', 'rehabilitation-center'])) errors.push('specialties/physiotherapy: invalid physiotherapy mapping');
  const counseling = entityBySlug.get('counseling-center');
  if (!counseling || counseling.requiresLicense !== 'required' || counseling.requiresMedicalReview !== 'required_before_index' || counseling.medicalRiskLevel === 'none' || counseling.isHumanHealthcare !== true || !counseling.secondaryVerticalSlugs.includes('mental-health')) errors.push('entityTypes/counseling-center: invalid risk/license/review mapping');
  for (const slug of ['gynecology-consultation', 'pregnancy-follow-up', 'antenatal-care', 'postnatal-care', 'pap-smear']) if (!serviceBySlug.get(slug)?.relatedSpecialtySlugs.includes('obstetrics-gynecology')) errors.push(`services/${slug}: must include obstetrics-gynecology`);
  if (!serviceBySlug.get('breast-screening')?.relatedSpecialtySlugs.some((slug) => ['obstetrics-gynecology', 'radiology'].includes(slug))) errors.push('services/breast-screening: must include women-health or radiology specialty');
  for (const slug of ['fertility-consultation', 'ivf', 'icsi', 'semen-analysis', 'ovulation-tracking']) {
    const service = serviceBySlug.get(slug);
    if (!service || service.family !== 'ivf-fertility' || service.verticalSlugs.join('|') !== 'ivf-fertility' || !includesAll(service.relatedSpecialtySlugs, ['reproductive-medicine', 'infertility-ivf']) || !includesAll(service.relatedEntityTypeSlugs, ['ivf-center', 'fertility-clinic'])) errors.push(`services/${slug}: invalid IVF/fertility mapping`);
  }
  for (const slug of ['scaling-polishing', 'tooth-extraction', 'wisdom-tooth-extraction', 'teeth-whitening', 'gum-treatment', 'pediatric-dentistry']) {
    const service = serviceBySlug.get(slug);
    if (!service || service.family !== 'dental-care' || service.verticalSlugs.join('|') !== 'dental' || !service.relatedSpecialtySlugs.includes('dentistry') || !service.relatedEntityTypeSlugs.includes('dental-clinic')) errors.push(`services/${slug}: invalid dental mapping`);
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = validateMasterTaxonomy();
  if (errors.length > 0) {
    console.error(`Master taxonomy validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('Master taxonomy validation passed.');
}
