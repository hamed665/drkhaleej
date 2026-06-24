export type DrMuscatRoadmapStatus = 'done' | 'partial' | 'missing' | 'blocked';
export type DrMuscatRoadmapRisk = 'low' | 'medium' | 'high';
export type DrMuscatRoadmapArea =
  | 'audit'
  | 'taxonomy'
  | 'geo'
  | 'core-data-model'
  | 'import-pipeline'
  | 'public-profiles'
  | 'internal-linking'
  | 'seo'
  | 'llm'
  | 'monitoring'
  | 'multi-country';

export type DrMuscatOriginalRoadmapItem = {
  prompt: number;
  title: string;
  area: DrMuscatRoadmapArea;
  status: DrMuscatRoadmapStatus;
  risk: DrMuscatRoadmapRisk;
  implementationNotes: string;
  nextAction: string;
};

export type DrMuscatRecommendedPrompt = {
  prompt: number;
  title: string;
  area: DrMuscatRoadmapArea;
  objective: string;
  dependsOn: readonly number[];
  priority: 'p0' | 'p1' | 'p2';
};

export const DRMUSCAT_FULL_IMPLEMENTATION_AUDIT_VERSION = 'v1' as const;

export const DRMUSCAT_ORIGINAL_ROADMAP_AUDIT: readonly DrMuscatOriginalRoadmapItem[] = [
  { prompt: 1, title: 'Audit', area: 'audit', status: 'partial', risk: 'high', implementationNotes: 'Repository-level roadmap audit is being formalized in this contract.', nextAction: 'Create a durable audit matrix and keep it validated.' },
  { prompt: 2, title: 'Master Taxonomy Registry', area: 'taxonomy', status: 'partial', risk: 'high', implementationNotes: 'Taxonomy validation/export tooling exists, but the final medical taxonomy registry is not complete.', nextAction: 'Complete the master taxonomy registry after core medical models are defined.' },
  { prompt: 3, title: 'Taxonomy Seed + Validation', area: 'taxonomy', status: 'partial', risk: 'medium', implementationNotes: 'Validation and export tooling exists, but final production seed coverage is incomplete.', nextAction: 'Extend seeds after specialty, service and entity models are finished.' },
  { prompt: 4, title: 'Oman Geo Model', area: 'geo', status: 'done', risk: 'low', implementationNotes: 'Oman governorate, wilayat, area, geo route, readiness, review, evidence and publication gate foundations are implemented.', nextAction: 'Preserve Oman geo safety while generalizing country adapters.' },
  { prompt: 5, title: 'Doctor/Specialty/Subspecialty Model', area: 'core-data-model', status: 'missing', risk: 'high', implementationNotes: 'Core doctor and specialty data model is not implemented as a complete production contract.', nextAction: 'Implement after country adapter foundation.' },
  { prompt: 6, title: 'Entity/Department Model', area: 'core-data-model', status: 'missing', risk: 'high', implementationNotes: 'Clinic, hospital, center and department model is not complete.', nextAction: 'Implement entity and department contracts with stable IDs.' },
  { prompt: 7, title: 'Service Taxonomy', area: 'taxonomy', status: 'missing', risk: 'high', implementationNotes: 'Medical service taxonomy is not implemented as a production contract.', nextAction: 'Implement service taxonomy linked to specialties and entities.' },
  { prompt: 8, title: 'License Model', area: 'core-data-model', status: 'missing', risk: 'high', implementationNotes: 'Professional and entity license model is not complete.', nextAction: 'Add verification, license and claim-safe visibility model.' },
  { prompt: 9, title: 'Languages/Hours/Insurance', area: 'core-data-model', status: 'missing', risk: 'medium', implementationNotes: 'Language, opening hours and insurance support models are not complete.', nextAction: 'Add structured support models for doctor and entity profiles.' },
  { prompt: 10, title: 'QA Gate', area: 'seo', status: 'partial', risk: 'medium', implementationNotes: 'Geo-specific QA gates exist. A global public-safe QA gate for all profile and taxonomy pages is missing.', nextAction: 'Generalize QA gates after core data models.' },
  { prompt: 11, title: 'Index Threshold Config', area: 'seo', status: 'done', risk: 'low', implementationNotes: 'Geo index threshold and publication gates exist for Oman geo pages.', nextAction: 'Generalize thresholds across profile, specialty and service page types.' },
  { prompt: 12, title: 'Bulk Import Staging', area: 'import-pipeline', status: 'missing', risk: 'high', implementationNotes: 'Bulk import staging tables and workflow are not implemented.', nextAction: 'Implement after core models and Excel mapping.' },
  { prompt: 13, title: 'Excel Mapping', area: 'import-pipeline', status: 'partial', risk: 'medium', implementationNotes: 'External spreadsheet templates exist, but code-level mapping contracts are not complete.', nextAction: 'Add Excel mapping contract and validator.' },
  { prompt: 14, title: 'Normalization', area: 'import-pipeline', status: 'missing', risk: 'high', implementationNotes: 'Normalization rules for imported doctors, entities, specialties and locations are not complete.', nextAction: 'Add normalization pipeline after staging.' },
  { prompt: 15, title: 'Duplicate Detection', area: 'import-pipeline', status: 'missing', risk: 'high', implementationNotes: 'Duplicate detection for doctors and entities is not complete.', nextAction: 'Add deterministic and review-based duplicate detection.' },
  { prompt: 16, title: 'Admin Import Review', area: 'import-pipeline', status: 'missing', risk: 'high', implementationNotes: 'Admin review workflow for staged imports is not implemented.', nextAction: 'Add review states and approval gates.' },
  { prompt: 17, title: 'Public-safe Publish', area: 'import-pipeline', status: 'partial', risk: 'high', implementationNotes: 'Geo public safety gates exist, but general publish workflow for profiles is missing.', nextAction: 'Implement public-safe publish for profiles and taxonomy pages.' },
  { prompt: 18, title: 'Doctor Profile V2', area: 'public-profiles', status: 'missing', risk: 'high', implementationNotes: 'Doctor profile V2 is not complete.', nextAction: 'Build after doctor model and publish workflow.' },
  { prompt: 19, title: 'Entity Profile V2', area: 'public-profiles', status: 'missing', risk: 'high', implementationNotes: 'Entity profile V2 is not complete.', nextAction: 'Build after entity model and relation graph.' },
  { prompt: 20, title: 'Entity Relation Graph', area: 'internal-linking', status: 'missing', risk: 'high', implementationNotes: 'Relationship graph between doctors, entities, specialties, services and locations is missing.', nextAction: 'Implement stable graph with public-safe edges.' },
  { prompt: 21, title: 'Internal Linking Engine', area: 'internal-linking', status: 'missing', risk: 'high', implementationNotes: 'Internal linking engine is not complete.', nextAction: 'Build from relation graph after core models.' },
  { prompt: 22, title: 'Breadcrumb + Related Blocks', area: 'internal-linking', status: 'partial', risk: 'medium', implementationNotes: 'Geo parent labels exist, but full breadcrumb and related blocks are missing.', nextAction: 'Add universal breadcrumb and related-block contracts.' },
  { prompt: 23, title: 'Dynamic Sitemap', area: 'seo', status: 'partial', risk: 'high', implementationNotes: 'Sitemap exclusion guardrails exist, but dynamic sitemap promotion is not implemented.', nextAction: 'Implement gated sitemap generation after publish workflow.' },
  { prompt: 24, title: 'Schema Mapping', area: 'seo', status: 'missing', risk: 'high', implementationNotes: 'JSON-LD/schema mapping is intentionally blocked and not yet implemented.', nextAction: 'Implement gated schema mapping after data quality and publication gates.' },
  { prompt: 25, title: 'Local Pages', area: 'geo', status: 'partial', risk: 'medium', implementationNotes: 'Oman geo scaffold pages exist, but indexable local pages with content are not live.', nextAction: 'Promote only after evidence and gates are complete.' },
  { prompt: 26, title: 'Specialty + Area Pages', area: 'seo', status: 'missing', risk: 'high', implementationNotes: 'Specialty + area landing pages are not implemented.', nextAction: 'Build after specialty model, geo adapter and internal linking.' },
  { prompt: 27, title: 'Core Service Pages', area: 'seo', status: 'missing', risk: 'high', implementationNotes: 'Core service pages are not implemented.', nextAction: 'Build after service taxonomy and profile links.' },
  { prompt: 28, title: 'Robots + llms.txt', area: 'llm', status: 'partial', risk: 'high', implementationNotes: 'Noindex and robots metadata exist for geo pages. llms.txt and full AI-facing public documentation are missing.', nextAction: 'Add robots, llms.txt and AI-readable public index after public-safe data contracts.' },
  { prompt: 29, title: 'SEO Monitoring Dashboard', area: 'monitoring', status: 'missing', risk: 'medium', implementationNotes: 'SEO monitoring dashboard is not implemented.', nextAction: 'Build after sitemap/schema/public pages exist.' },
  { prompt: 30, title: 'SEO QA Report Automation', area: 'monitoring', status: 'partial', risk: 'medium', implementationNotes: 'CI validators exist, but reporting automation is not complete.', nextAction: 'Add QA report artifacts after full launch gates.' },
] as const;

export const DRMUSCAT_RECOMMENDED_NEXT_PROMPTS: readonly DrMuscatRecommendedPrompt[] = [
  { prompt: 33, title: 'Full Implementation Audit Matrix', area: 'audit', objective: 'Make the roadmap auditable inside the repo.', dependsOn: [1, 4, 11, 17, 23, 28, 30], priority: 'p0' },
  { prompt: 34, title: 'Country Adapter Foundation', area: 'multi-country', objective: 'Generalize geo levels, route templates, metadata policy and publication gates by country.', dependsOn: [4, 11, 17, 23], priority: 'p0' },
  { prompt: 35, title: 'Country Adapter Oman Migration', area: 'multi-country', objective: 'Move Oman-specific geo config behind the country adapter without changing public behavior.', dependsOn: [34], priority: 'p0' },
  { prompt: 36, title: 'Second Country Pilot Adapter', area: 'multi-country', objective: 'Add a disabled pilot adapter for a second country to prove extensibility.', dependsOn: [34, 35], priority: 'p1' },
  { prompt: 37, title: 'Stable ID Policy', area: 'core-data-model', objective: 'Define stable IDs for doctors, entities, specialties, services and locations.', dependsOn: [34], priority: 'p0' },
  { prompt: 38, title: 'Doctor Specialty Subspecialty Contract', area: 'core-data-model', objective: 'Create doctor, specialty and subspecialty data contracts.', dependsOn: [37], priority: 'p0' },
  { prompt: 39, title: 'Entity Department Contract', area: 'core-data-model', objective: 'Create clinic, hospital, center and department contracts.', dependsOn: [37], priority: 'p0' },
  { prompt: 40, title: 'Service Taxonomy Contract', area: 'taxonomy', objective: 'Create service taxonomy linked to specialty and entity contracts.', dependsOn: [38, 39], priority: 'p0' },
  { prompt: 41, title: 'License Verification Contract', area: 'core-data-model', objective: 'Add license and verification model for doctors and entities.', dependsOn: [38, 39], priority: 'p0' },
  { prompt: 42, title: 'Language Hours Insurance Contract', area: 'core-data-model', objective: 'Add language, opening hours and insurance support models.', dependsOn: [38, 39], priority: 'p1' },
  { prompt: 43, title: 'Excel Mapping Contract', area: 'import-pipeline', objective: 'Define canonical Excel columns mapped to core data models.', dependsOn: [38, 39, 40, 41, 42], priority: 'p0' },
  { prompt: 44, title: 'Bulk Import Staging Contract', area: 'import-pipeline', objective: 'Add staging structures for imported doctor and entity data.', dependsOn: [43], priority: 'p0' },
  { prompt: 45, title: 'Normalization Pipeline', area: 'import-pipeline', objective: 'Normalize names, phones, specialties, entities, areas and services.', dependsOn: [44], priority: 'p0' },
  { prompt: 46, title: 'Duplicate Detection Pipeline', area: 'import-pipeline', objective: 'Detect duplicate doctors and entities before publish.', dependsOn: [45], priority: 'p0' },
  { prompt: 47, title: 'Admin Import Review Workflow', area: 'import-pipeline', objective: 'Add admin review states for staged records.', dependsOn: [44, 45, 46], priority: 'p0' },
  { prompt: 48, title: 'Public-safe Publish Workflow', area: 'import-pipeline', objective: 'Publish only records that pass safety, verification and QA gates.', dependsOn: [47, 41], priority: 'p0' },
  { prompt: 49, title: 'Doctor Profile V2 Contract', area: 'public-profiles', objective: 'Define public-safe doctor profile blocks and states.', dependsOn: [38, 41, 48], priority: 'p0' },
  { prompt: 50, title: 'Doctor Profile V2 Runtime', area: 'public-profiles', objective: 'Render doctor profile pages from public-safe data.', dependsOn: [49], priority: 'p0' },
  { prompt: 51, title: 'Entity Profile V2 Contract', area: 'public-profiles', objective: 'Define public-safe entity profile blocks and states.', dependsOn: [39, 41, 48], priority: 'p0' },
  { prompt: 52, title: 'Entity Profile V2 Runtime', area: 'public-profiles', objective: 'Render entity profile pages from public-safe data.', dependsOn: [51], priority: 'p0' },
  { prompt: 53, title: 'Entity Relation Graph', area: 'internal-linking', objective: 'Build public-safe graph edges between doctors, entities, specialties, services and locations.', dependsOn: [38, 39, 40, 48], priority: 'p0' },
  { prompt: 54, title: 'Internal Linking Engine', area: 'internal-linking', objective: 'Generate contextual internal links from the relation graph.', dependsOn: [53], priority: 'p0' },
  { prompt: 55, title: 'Breadcrumb and Related Blocks', area: 'internal-linking', objective: 'Add universal breadcrumb and related blocks.', dependsOn: [53, 54], priority: 'p1' },
  { prompt: 56, title: 'Specialty Area Pages', area: 'seo', objective: 'Add gated specialty plus area pages.', dependsOn: [34, 38, 53, 54], priority: 'p0' },
  { prompt: 57, title: 'Core Service Pages', area: 'seo', objective: 'Add gated core service pages.', dependsOn: [40, 53, 54], priority: 'p0' },
  { prompt: 58, title: 'Dynamic Sitemap', area: 'seo', objective: 'Generate sitemap only from publishable and gated pages.', dependsOn: [48, 54, 56, 57], priority: 'p0' },
  { prompt: 59, title: 'Schema Mapping', area: 'seo', objective: 'Add gated schema mapping for doctors, entities, breadcrumbs, specialties and services.', dependsOn: [49, 51, 53, 58], priority: 'p0' },
  { prompt: 60, title: 'Robots and llms.txt', area: 'llm', objective: 'Add robots policy plus AI-facing llms.txt and public documentation.', dependsOn: [48, 58, 59], priority: 'p1' },
  { prompt: 61, title: 'Public Machine-readable Data', area: 'llm', objective: 'Expose public-safe machine-readable data for LLM consumption.', dependsOn: [48, 53, 59, 60], priority: 'p1' },
  { prompt: 62, title: 'SEO Monitoring Dashboard', area: 'monitoring', objective: 'Track indexability, sitemap, schema and content quality states.', dependsOn: [58, 59], priority: 'p2' },
  { prompt: 63, title: 'SEO QA Report Automation', area: 'monitoring', objective: 'Generate report artifacts for technical SEO, content and graph quality.', dependsOn: [62], priority: 'p2' },
  { prompt: 64, title: 'Launch Readiness Final Gate', area: 'audit', objective: 'Block launch until critical SEO, LLM, import and profile gates are complete.', dependsOn: [34, 48, 50, 52, 54, 58, 59, 60], priority: 'p0' },
] as const;

export const DRMUSCAT_FULL_IMPLEMENTATION_AUDIT_SUMMARY = {
  version: DRMUSCAT_FULL_IMPLEMENTATION_AUDIT_VERSION,
  originalPromptCount: DRMUSCAT_ORIGINAL_ROADMAP_AUDIT.length,
  recommendedNextPromptCount: DRMUSCAT_RECOMMENDED_NEXT_PROMPTS.length,
  recommendedCompletionMode: 'multi-country-seo-llm-complete',
  nextPrompt: 33,
  criticalPath: [33, 34, 35, 37, 38, 39, 40, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 58, 59, 60, 64],
  currentStrengths: ['oman-geo-safety', 'noindex-first-guardrails', 'publication-gates', 'ci-validators'],
  currentWeaknesses: ['core-data-models', 'import-pipeline', 'public-profiles', 'internal-linking-engine', 'schema-mapping', 'llm-surfaces', 'multi-country-adapter'],
} as const;
