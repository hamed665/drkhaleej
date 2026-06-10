# DrMuscat Media SEO, Video & Image Performance Spec V1

## Status and Authority

- Status: Documentation-only.
- Authority: Media SEO, image/video performance, accessibility, structured data eligibility, and Core Web Vitals planning only.
- This specification does not authorize implementation.
- This specification does not authorize media upload implementation.
- This specification does not authorize video hosting.
- This specification does not authorize image processing pipeline.
- This specification does not authorize YouTube embed component creation.
- This specification does not authorize image/video sitemap implementation.
- This specification does not authorize schema implementation.
- This specification must be read together with:
  - `docs/platform/DRMUSCAT_PUBLIC_ROUTE_SEO_INVENTORY_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_CMS_CONTENT_MODEL_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_AI_BRIEF_DRAFT_WORKFLOW_SPEC_V1.md`
  - `docs/platform/DRMUSCAT_SEO_REPORTING_ANALYTICS_SPEC_V1.md`
- Future implementation requires separate PHASED_BUILD_ONLY approval with explicit allowed files, route impact, database impact, RLS/security impact, privacy impact, media policy impact, and validation gates.

## Four-Axis Mapping

- Execution Phase: Phase 0 — Spec Freeze and Schema Patch / documentation alignment only.
- Lock Scope: Phase 0 — Repository Readiness.
- Product Module: Phase 0 — Setup Only / documentation alignment.
- Subphase ID: `ALIGN-MEDIA-SEO-PERFORMANCE-V1`.

## 1. Purpose

This specification defines future image, video, and media rules for DrMuscat. It prepares the platform for SEO-safe, privacy-safe, accessibility-aware, performance-aware media planning before any upload, storage, processing, embed, sitemap, schema, CMS, or dashboard implementation begins.

It must support:

- SEO-friendly media.
- Fast page loads.
- Core Web Vitals safety.
- Accessible media.
- Image/video metadata.
- YouTube/lazy video embeds.
- Provider/doctor/media content later.
- Article media later.
- Offer media later.
- Before/after media with strict policy.
- Schema eligibility planning.
- Media moderation and review.
- No private patient data exposure.

No implementation is authorized by this specification.

## 2. Media Type Taxonomy

Future media types may include the following planning categories. Public/private nature, review, SEO eligibility, and performance sensitivity must be finalized in a future approved implementation phase.

| Media type | Purpose | Public/private nature | Review requirement | SEO eligibility | Performance sensitivity | Medical/privacy sensitivity |
| --- | --- | --- | --- | --- | --- | --- |
| Logo | DrMuscat brand or platform identity usage. | Public when used on public pages. | Brand/admin review. | Eligible only when visible and accurate. | Low to medium; must be optimized. | Low unless misuse implies endorsement. |
| Provider logo | Identify a clinic, center, hospital, pharmacy, lab, salon, wellness provider, dental practice, or pet clinic. | Public after provider/admin approval. | Provider/admin approval required. | Eligible for profile pages when accurate. | Low to medium; dimensions required. | Medium due to identity/trust implications. |
| Provider cover image | Present approved provider facility or brand context. | Public after moderation. | Admin moderation required. | Eligible only when relevant and visible. | High if used as hero/LCP image. | Medium; must not reveal private patients. |
| Provider gallery image | Show approved provider facility, room, equipment, or environment. | Public after moderation. | Admin moderation required. | Eligible when public, relevant, and metadata complete. | High; gallery images must be lazy-loaded. | Medium to high if people/patients appear. |
| Doctor profile image | Identify an approved doctor or clinician profile. | Public after doctor/provider/admin approval. | Doctor/provider/admin approval required. | Eligible when identity is verified. | Low to medium; dimensions required. | High for identity, credentials, and consent accuracy. |
| Article hero image | Support article topic and above-the-fold presentation. | Public after editorial approval. | Editor and SEO/accessibility review; medical review when sensitive. | Eligible when visible and relevant. | High; may be LCP candidate. | Medium to high for medical imagery. |
| Article inline image | Explain or support article content. | Public after editorial approval. | Editor and SEO/accessibility review; medical review when sensitive. | Eligible when visible and relevant. | Medium; lazy-load if non-critical. | Medium to high for medical imagery. |
| Infographic | Explain concepts visually. | Public after editorial approval. | Editor, SEO/accessibility, and medical review when applicable. | Eligible if supported by visible text. | Medium to high; must remain readable. | Medium if medical claims are included. |
| Offer image | Support an approved offer or campaign. | Public after offer/admin approval. | Admin and compliance-sensitive review where needed. | Eligible only when truthful and visible. | Medium; must be optimized. | Medium for healthcare advertising/claims. |
| Sponsored media | Identify sponsored or paid content visually. | Public only with approved sponsorship labeling. | Owner/admin and compliance review. | Eligible only with truthful labeling and metadata. | Medium. | Medium to high for sponsored healthcare claims. |
| YouTube embed | Display approved external video with lazy/facade loading. | Public when embedded on public page. | Editorial/admin review; medical review when sensitive. | Eligible only when visible with metadata. | High; iframe loading must be controlled. | Medium to high depending content. |
| Self-hosted video later | Host approved video directly after storage/bandwidth/transcoding policy. | Future public or private depending policy. | Admin, technical, and content review required. | Future-only after policy approval. | Very high; can harm CWV if unmanaged. | Medium to high depending content. |
| Provider video tip | Provider-created educational or promotional tip. | Public only after moderation. | Provider/admin/editor review; medical review when clinical. | Eligible only with visible supporting content. | High; lazy/facade required. | High if medical advice or claims appear. |
| Doctor video tip | Doctor-created educational tip. | Public only after doctor/provider/admin approval. | Doctor/provider/admin/editor review; medical review when clinical. | Eligible only with verified identity and supporting content. | High. | High for medical advice, identity, and claims. |
| Story media | Short-lived or lightweight promotional/educational media. | Future public or private depending policy. | Admin moderation required. | Usually limited unless permanent and indexable. | Medium to high. | Medium to high if people or treatments appear. |
| Before/after image | Compare outcomes for cosmetic, dental, wellness, or medical procedures. | Blocked by default until explicit policy approval. | Provider, admin, medical/legal/privacy review required. | Not eligible until strict consent/policy gates exist. | High; must not degrade UX. | Very high. |
| Document/source attachment for internal review only | Store evidence, source, license, consent, or review material. | Private/internal only. | Internal reviewer access only. | Not SEO eligible. | Low public performance impact because it must not be public. | High; may contain sensitive/legal material. |

## 3. Media Metadata Model

Future metadata planning may include:

- `media_id`.
- `owner_entity_type`.
- `owner_entity_id`.
- `content_id`.
- `media_type`.
- `storage_path`.
- `external_url`.
- `provider`.
- `title`.
- `alt_text`.
- `caption`.
- `credit`.
- `source`.
- `language`.
- `width`.
- `height`.
- `aspect_ratio`.
- `format`.
- `file_size`.
- `duration`.
- `thumbnail_id`.
- `transcript`.
- `blur_placeholder`.
- `lqip`.
- `dominant_color`.
- `compression_status`.
- `lcp_candidate`.
- `lazy_load`.
- `priority_load`.
- `public_visibility`.
- `review_status`.
- `medical_sensitive`.
- `contains_person`.
- `contains_patient`.
- `before_after`.
- `schema_eligible`.
- `sitemap_eligible`.
- `created_by`.
- `approved_by`.
- `approved_at`.

No table implementation is authorized by this metadata model.

## 4. Image Performance Rules

Future image implementation must follow these planning rules:

- Always store width and height.
- Prevent CLS by reserving space.
- Prefer AVIF/WebP where possible.
- Provide responsive sizes.
- Compress images before public display.
- Use lazy loading for non-critical images.
- Use priority loading only for true LCP hero images.
- Avoid huge provider gallery images.
- Avoid third-party image hotlinking unless approved.
- Use placeholders carefully.
- Do not make hidden images LCP candidates.
- Do not use media to hide text content required for SEO.
- Keep public images aligned with visible page purpose and approved metadata.

## 5. Video Performance Rules

Future video implementation must follow these planning rules:

- YouTube embeds are preferred first over self-hosted video.
- Use a lazy/facade YouTube embed strategy.
- Do not load heavy iframes before interaction unless approved.
- Provide thumbnail.
- Provide title/caption.
- Provide transcript where possible.
- Avoid autoplay with sound.
- Avoid layout shift from video embeds.
- Self-hosted video is future-only after storage, bandwidth, and transcoding policy.
- Video widgets must not block main content rendering.
- Video content must not replace visible text content required for SEO.
- Video embeds must respect accessibility, privacy, and consent rules approved in the future.

## 6. Accessibility Rules

Future media implementation must include:

- Meaningful alt text for informative images.
- Empty alt text for decorative images.
- Captions where useful.
- Transcripts for video where possible.
- Avoidance of text-only-in-image content.
- Avoidance of flashing or unsafe visual effects.
- Keyboard-accessible video controls where applicable.
- Accessible play buttons.
- Readable captions/subtitles where possible.
- Arabic/English media metadata alignment.
- Human review for sensitive medical imagery and identity-bearing media.

## 7. SEO Rules

Future SEO-safe media rules:

- Media supports content, not replaces it.
- Alt text must be descriptive, not keyword-stuffed.
- Captions should be useful and truthful.
- Filenames should be clean and descriptive where future workflow supports it.
- Image sitemap eligibility is only for approved public images.
- Video sitemap eligibility is only for approved public video pages.
- Schema is allowed only when media is visible and metadata is complete.
- No fake image/video metadata.
- No hidden media schema.
- No fake thumbnails.
- No misleading before/after media.
- No private patient media.
- No media may create unsupported medical, credential, provider, or outcome claims.

## 8. Structured Data Eligibility

### ImageObject eligibility

`ImageObject` is possible only if:

- The image is public.
- The image is visible.
- Image metadata is complete.
- The image is relevant.
- There is no privacy issue.
- There is no fake attribution.

### VideoObject eligibility

`VideoObject` is possible only if:

- The video is public and visible.
- Title, description, and thumbnail exist.
- Duration is known where possible.
- Transcript is available where possible.
- Upload/embed date is known where possible.
- The page has visible supporting content.
- There are no fake claims.
- There is no private patient data.
- Review approval exists.

### MedicalClinic/Physician media eligibility

- Profile images/logos are allowed only after provider/doctor approval.
- No false identity is allowed.
- No fake credentials are allowed.
- No misleading before/after media is allowed.

Structured data eligibility is planning-only and does not authorize schema implementation.

## 9. Before/After Media Rules

Before/after media is high-risk and default blocked until explicit policy approval. Future use must follow these requirements:

- Requires provider approval.
- Requires admin review.
- May require medical/legal review.
- Requires consent policy before implementation.
- No patient-identifying details.
- No misleading claims.
- No guaranteed outcomes.
- No AI-generated fake before/after.
- No hidden edits.
- No use before explicit policy approval.
- Default blocked until policy exists.

## 10. Provider and Doctor Media Rules

Future provider and doctor media rules:

- Provider logos must be approved.
- Provider gallery images must be moderated.
- Doctor profile images must match approved doctor profile.
- No stolen images.
- No fake facilities.
- No fake equipment.
- No fake certificates.
- No private patient photos.
- No misleading treatment outcomes.
- Provider-uploaded media is future-only after moderation workflow.
- Media must not imply unverified credentials, locations, equipment, specialties, or outcomes.

## 11. Article and CMS Media Rules

Future article and CMS media rules:

- Every article hero image must have dimensions and an alt policy.
- Medical-sensitive images require review.
- Infographic content must be readable and supported by visible text.
- Video articles need transcript where possible.
- AI-generated media suggestions require human approval.
- Media should not create unsupported claims.
- CMS media status must block unreviewed sensitive media.
- Media attached to medical, dental, cosmetic, wellness, pharmacy, lab, hospital, pet clinic, or provider content must align with approved trust and review workflows.

## 12. Media Review Workflow

Future statuses:

- `draft`.
- `pending_review`.
- `approved`.
- `rejected`.
- `blocked`.
- `archived`.

Review gates:

- Editor review.
- SEO/accessibility review.
- Medical review when sensitive.
- Legal/privacy review when people, patients, or before-after media are involved.
- Owner/admin approval for sensitive or sponsored media.

No workflow tables, status transitions, dashboards, or upload paths are implemented by this specification.

## 13. Core Web Vitals Gates

Future media implementation must protect Core Web Vitals:

- LCP target under 2.5s where possible.
- INP target under 200ms where possible.
- CLS target under 0.1 where possible.
- Media must not cause layout shift.
- Heavy video embeds must be lazy.
- Image dimensions are required.
- Priority image must be limited to the true hero.
- Provider galleries must be lazy-loaded.
- Comments, stories, and media widgets must not block main content.
- Performance regression should block implementation PRs if measurable.
- Media-heavy public pages must keep SEO-critical content visible without relying on media-only content.

## 14. Media Storage and CDN Planning

Future media storage and delivery planning only:

- Storage provider must be approved.
- CDN/cache policy must be approved.
- Image transformation policy must be approved.
- Video hosting policy must be approved.
- File size limits must be approved.
- Allowed formats must be approved.
- Upload scanning/moderation policy must be approved.
- Deletion/retention policy must be approved.

No storage implementation is authorized by this section.

## 15. AI Media Assistance Rules

AI may suggest:

- Image concepts.
- Alt text drafts.
- Captions.
- Infographic outlines.
- Video title ideas.
- Transcript summaries.
- Thumbnail concepts.
- Media placement recommendations.

AI must not:

- Publish media.
- Generate fake provider photos.
- Generate fake doctor photos.
- Generate fake before/after results.
- Invent captions.
- Invent credits.
- Remove consent requirements.
- Create misleading medical imagery.
- Bypass moderation.

AI suggestions must remain drafts for human review and must not create public assets, metadata, schema, routes, or media records without future approval.

## 16. Explicit Non-Implementation

This specification implements none of the following:

- No media tables.
- No upload component.
- No image processing.
- No video hosting.
- No YouTube component.
- No CDN setup.
- No storage changes.
- No image sitemap.
- No video sitemap.
- No schema implementation.
- No AI media generation.
- No provider media dashboard.
- No package/env/config changes.
- No code changes.

## 17. Future PR Sequence

Recommended future PR sequence:

1. Media Policy / Consent / Before-After Policy Spec.
2. Media Database Foundation.
3. Media Upload Admin UI.
4. Provider Media Moderation Workflow.
5. Article Media Component Implementation.
6. Lazy YouTube Embed Component.
7. Image/Video Sitemap Implementation only after policy approval.

These are recommendations only. They do not approve implementation, database changes, upload UI, media processing, storage, CDN, schema, sitemap, route changes, dashboards, or AI media generation.

## 18. Completion Report Requirements

Final Codex report for this file must include:

- Confirmation documentation-only.
- Files created/changed.
- No code/routes/migrations/RLS/API/server actions changed.
- No media/upload/schema/sitemap implementation.
- No analytics/tracking/dashboard implementation.
- Summary of media rules.
- Validation results.
- Blockers/conflicts.
