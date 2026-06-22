import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { adjacentTaxonomyVerticals, coreTaxonomyVerticals, deferredTaxonomyVerticals, excludedTaxonomyVerticals, getTaxonomyService, getTaxonomyVertical, taxonomyDoctorLevels, taxonomyEntityTypes, taxonomySchemaHints, taxonomyServices, taxonomySpecialties, taxonomyVerticals } from './index';

const registries = {
  verticals: taxonomyVerticals,
  entityTypes: taxonomyEntityTypes,
  doctorLevels: taxonomyDoctorLevels,
  specialties: taxonomySpecialties,
  services: taxonomyServices,
  schemaHints: taxonomySchemaHints
} as const;
const allowedAcronyms = new Set(['MRI', 'CT', 'CT Scan', 'IVF', 'ICSI', 'CBC', 'HbA1c', 'ECG', 'OPG', 'CBCT']);
const badArabicPhrases = ['الصحة النفسية الصحة', 'صحة المرأة الصحة', 'حمل متابعة متابعة', 'إدارة الوزن إدارة', 'دم اختبار', 'كبد وظائف اختبار', 'كلى وظائف اختبار', 'غدة درقية اختبار', 'مفتوح رنين مغناطيسي', 'منزلية رعاية', 'طوارئ نقل'];
const duplicateAdjacentWords = (value: string) => value.trim().split(/\s+/).some((word, index, words) => index > 0 && word === words[index - 1]);
const bySlug = <T extends { slug: string }>(items: readonly T[]) => new Map(items.map((item) => [item.slug, item]));

describe('master taxonomy registry', () => {
  it('keeps slugs unique in every registry', () => {
    for (const records of Object.values(registries)) {
      expect(new Set(records.map((record) => record.slug)).size).toBe(records.length);
    }
  });

  it('keeps cross-references valid', () => {
    const verticals = new Set(taxonomyVerticals.map((item) => item.slug));
    const specialties = new Set(taxonomySpecialties.map((item) => item.slug));
    const entityTypes = new Set(taxonomyEntityTypes.map((item) => item.slug));
    const schemaHints = new Set(taxonomySchemaHints.map((item) => item.slug));
    for (const item of taxonomyEntityTypes) {
      expect(verticals.has(item.primaryVerticalSlug)).toBe(true);
      expect(item.secondaryVerticalSlugs.every((slug) => verticals.has(slug))).toBe(true);
    }
    for (const item of taxonomySpecialties) {
      expect(item.verticalSlugs.every((slug) => verticals.has(slug))).toBe(true);
      expect(item.relatedEntityTypeSlugs.every((slug) => entityTypes.has(slug))).toBe(true);
    }
    for (const item of taxonomyServices) {
      expect(item.verticalSlugs.every((slug) => verticals.has(slug))).toBe(true);
      expect(item.relatedSpecialtySlugs.every((slug) => specialties.has(slug))).toBe(true);
      expect(item.relatedEntityTypeSlugs.every((slug) => entityTypes.has(slug))).toBe(true);
      expect(schemaHints.has(item.schemaHintSlug)).toBe(true);
      expect(item.schemaHint).toBe(item.schemaHintSlug);
    }
  });

  it('enforces Arabic label QA rules', () => {
    for (const records of Object.values(registries)) {
      for (const record of records) {
        expect(record.labelAr.trim().length).toBeGreaterThan(0);
        if (!allowedAcronyms.has(record.labelAr)) expect(record.labelAr).not.toBe(record.labelEn);
        expect(badArabicPhrases.some((phrase) => record.labelAr.includes(phrase))).toBe(false);
        expect(duplicateAdjacentWords(record.labelAr)).toBe(false);
        expect(record.descriptionAr).toMatch(/[\u0600-\u06FF]/);
      }
    }
  });

  it('keeps core and adjacent verticals labeled in Arabic', () => {
    for (const vertical of taxonomyVerticals.filter((item) => item.isCore || item.isAdjacent)) {
      expect(vertical.labelAr).toMatch(/[\u0600-\u06FF]/);
    }
  });

  it('enforces semantic mapping guardrails', () => {
    const specialties = bySlug(taxonomySpecialties);
    const entities = bySlug(taxonomyEntityTypes);
    const services = bySlug(taxonomyServices);
    const physiotherapy = specialties.get('physiotherapy');
    expect(physiotherapy?.verticalSlugs).toContain('physiotherapy-rehabilitation');
    expect(physiotherapy?.isMentalHealth).toBe(false);
    expect(physiotherapy?.relatedEntityTypeSlugs).toEqual(expect.arrayContaining(['physiotherapy-center', 'rehabilitation-center']));

    const counselingCenter = entities.get('counseling-center');
    expect(counselingCenter).toMatchObject({ requiresLicense: 'required', requiresMedicalReview: 'required_before_index', isHumanHealthcare: true });
    expect(counselingCenter?.medicalRiskLevel).not.toBe('none');
    expect(counselingCenter?.secondaryVerticalSlugs).toContain('mental-health');

    for (const slug of ['gynecology-consultation', 'pregnancy-follow-up', 'antenatal-care', 'postnatal-care', 'pap-smear']) {
      expect(services.get(slug)?.relatedSpecialtySlugs).toContain('obstetrics-gynecology');
    }
    expect(services.get('breast-screening')?.relatedSpecialtySlugs).toEqual(expect.arrayContaining(['radiology']));

    for (const slug of ['fertility-consultation', 'ivf', 'icsi', 'semen-analysis', 'ovulation-tracking']) {
      expect(services.get(slug)).toMatchObject({ family: 'ivf-fertility', verticalSlugs: ['ivf-fertility'] });
      expect(services.get(slug)?.relatedSpecialtySlugs).toEqual(expect.arrayContaining(['reproductive-medicine', 'infertility-ivf']));
      expect(services.get(slug)?.relatedEntityTypeSlugs).toEqual(expect.arrayContaining(['ivf-center', 'fertility-clinic']));
    }

    for (const slug of ['scaling-polishing', 'tooth-extraction', 'wisdom-tooth-extraction', 'teeth-whitening', 'gum-treatment', 'pediatric-dentistry']) {
      expect(services.get(slug)).toMatchObject({ family: 'dental-care', verticalSlugs: ['dental'] });
      expect(services.get(slug)?.relatedSpecialtySlugs).toContain('dentistry');
      expect(services.get(slug)?.relatedEntityTypeSlugs).toContain('dental-clinic');
    }
  });

  it('keeps excluded and deferred verticals out of core healthcare', () => {
    const verticals = bySlug(taxonomyVerticals);
    for (const slug of ['healthy-food', 'healthy-meal-delivery', 'restaurants']) {
      expect(verticals.get(slug)?.scope).toBe('excluded');
      expect(verticals.get(slug)?.publicLaunchPhase).toBe('excluded');
      expect(verticals.get(slug)?.isCore).toBe(false);
      expect(verticals.get(slug)?.isAdjacent).toBe(false);
    }
    expect(verticals.get('beauty-nonmedical')?.isCore).toBe(false);
    expect(verticals.get('pet-shops')?.isCore).toBe(false);
    const hybrid = bySlug(taxonomyEntityTypes).get('pet-clinic-shop-hybrid');
    expect(hybrid?.primaryVerticalSlug).toBe('pet-clinics');
    expect(hybrid?.secondaryVerticalSlugs).toContain('pet-shops');
  });


  it('preserves pure lookup helpers and derived vertical exports', () => {
    expect(coreTaxonomyVerticals.every((vertical) => vertical.scope === 'core')).toBe(true);
    expect(adjacentTaxonomyVerticals.every((vertical) => vertical.scope === 'adjacent')).toBe(true);
    expect(deferredTaxonomyVerticals.every((vertical) => vertical.scope === 'deferred')).toBe(true);
    expect(excludedTaxonomyVerticals.every((vertical) => vertical.scope === 'excluded')).toBe(true);
    expect(getTaxonomyVertical('women-health')?.labelAr).toBe('صحة المرأة');
    expect(getTaxonomyService('blood-test')?.labelAr).toBe('تحليل دم');
  });

  it('exports deterministic seed-ready JSON with matching registry counts', () => {
    const exportPath = path.join(process.cwd(), 'data/taxonomy/master-taxonomy-seed.json');
    expect(fs.existsSync(exportPath)).toBe(true);
    const exported = JSON.parse(fs.readFileSync(exportPath, 'utf8')) as { version: string; registries: Record<keyof typeof registries, unknown[]> };
    expect(exported.version).toBe('v1');
    for (const family of Object.keys(registries) as Array<keyof typeof registries>) {
      expect(Array.isArray(exported.registries[family])).toBe(true);
      expect(exported.registries[family]).toHaveLength(registries[family].length);
    }
  });
});
