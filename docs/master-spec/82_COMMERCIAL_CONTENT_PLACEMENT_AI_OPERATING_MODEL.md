# 82 - DrMuscat Commercial, Content, Placement, and AI Operating Model

## 1. Executive Summary

DrMuscat is not a simple listing website. It is a premium healthcare, beauty, wellness, content, offers, ads, and provider-growth platform for Oman.

The platform must support public discovery, provider growth, commercial placements, approved offers, article-led SEO, media, AI-assisted editorial workflows, admin operations, provider dashboards, analytics, and trust controls.

This document is the source of truth for how subscriptions, paid add-ons, homepage ads, special offers, article ads, article special offers, media, video, internal linking, AI assistance, and human approval workflows fit together.

This is a strategy and operating-model document only. It does not implement database tables, UI, storage, AI generation, billing, or public rendering.

## 2. Core Platform Pillars

DrMuscat is built around these pillars:

1. Public Directory - public pages for centers, clinics, doctors, pharmacies, labs, specialties, areas, services, and offers.
2. Provider Profiles - rich profiles for healthcare, beauty, wellness, and related providers.
3. Offers - approved provider offers and packages shown in controlled surfaces.
4. Ads - clearly labeled sponsored placements across homepage, articles, offers, area, and specialty pages.
5. Articles and SEO - editorial content that brings search traffic and guides users toward relevant services.
6. Media - approved images, video embeds, thumbnails, galleries, and future provider-submitted assets.
7. AI Editorial Assistant - AI can suggest, draft, and optimize, but cannot publish directly.
8. Admin Operations - the central control surface for review, approval, commercial activation, and moderation.
9. Provider Dashboard - future provider-facing view for profile, offers, placements, leads, and analytics.
10. Analytics - performance reporting for views, clicks, leads, offers, ads, articles, and revenue.
11. Trust and Compliance - clear labels, human review, no fake providers, no fake reviews, and no hidden paid ranking.

## 3. Subscription Plans

Base subscription plans describe the provider's ongoing profile and platform access level. They are separate from paid add-on placements.

### 3.1 Free Listing

Purpose:
- Fill the public directory with basic provider coverage.
- Allow approved providers to be discoverable.

Example entitlements:
- Basic listing fields.
- Basic public profile.
- Basic contact or WhatsApp CTA if approved.
- Limited media, if allowed by admin policy.
- No verified badge unless separately approved.
- Can purchase paid add-ons such as Homepage Ads or Special Offer Placement.

### 3.2 Verified Starter

Purpose:
- Give legitimate providers a more trustworthy profile with visible verification.

Example entitlements:
- Verified badge when verification requirements are met.
- Enhanced profile completeness.
- Logo and cover image.
- Limited gallery.
- Limited active official offers.
- Better CTA presentation.
- Basic analytics visibility.

### 3.3 Growth Partner

Purpose:
- Support providers that actively want leads, visibility, and content-supported growth.

Example entitlements:
- Larger gallery limit.
- More active official offers.
- Stronger CTAs.
- Enhanced analytics.
- Eligibility for bundled or discounted placement credits.
- Higher support priority.
- Visibility features that remain clearly separated from sponsored placement.

### 3.4 Premium / Ads Pro

Purpose:
- Support high-visibility providers and advertisers.

Example entitlements:
- Premium profile presentation.
- Larger media allowance.
- Higher active offer limits.
- Advanced analytics.
- Eligibility for sponsored slots and commercial campaigns.
- Potential included placement credits.
- Priority commercial support.

## 4. Paid Add-ons

Paid add-ons are commercial products that can be purchased independently of base subscription plans.

Important rule:
- A Free Listing provider can purchase paid add-ons without upgrading to a paid subscription plan.
- Paid add-ons must have owner, status, start date, end date, approval status, and display surface.
- Paid add-ons must never be disguised as organic ranking.

Initial add-ons:
1. Homepage Ads.
2. Homepage Special Offer Placement.
3. Article Ads Placement.
4. Article Special Offer Placement.

Future add-ons:
1. Area page featured slot.
2. Specialty page featured slot.
3. Offers page featured placement.
4. Newsletter campaign.
5. WhatsApp campaign.
6. CPC or CPM wallet.

## 5. Official Offer vs Special Offer Placement

Official Offer and Special Offer Placement are different concepts.

### 5.1 Official Offer

An Official Offer is approved commercial content from a provider.

Examples:
- Dental cleaning package.
- Dermatology consultation package.
- Laser hair removal discount.
- Beauty or wellness package.
- Health checkup package.

Required offer statuses:
- draft
- pending_review
- approved
- published
- paused
- expired
- rejected

Required offer controls:
- owner provider or center
- title and description
- terms
- valid dates
- approval status
- optional offer image
- public label

### 5.2 Special Offer Placement

A Special Offer Placement is a paid visibility slot for an approved offer.

Examples:
- Show this offer in Homepage Special Offers.
- Show this offer inside related article pages.
- Show this offer as featured on the offers page.
- Show this offer on a specialty or area page later.

An offer can exist without paid placement. A paid placement must point to an approved offer or remain hidden until approved.

## 6. Homepage Commercial Surfaces

The homepage supports at least two commercial surfaces:

1. Homepage Ads.
2. Homepage Special Offers.

### 6.1 Homepage Ads

Purpose:
- Promote a provider, center, campaign, or service on the homepage.

Label:
- Sponsored.

Rules:
- Must be admin approved.
- Must have a start and end date.
- Must have a clear owner.
- Must not imply medical superiority.
- Must not be hidden as organic ranking.

### 6.2 Homepage Special Offers

Purpose:
- Promote approved offers in a dedicated homepage Special Offers section.

Label:
- Official Offer, Partner Offer, or another approved commercial label.

Rules:
- Free Listing providers can buy this placement.
- Offer content must be approved first.
- Placement can be paid independently from subscription level.
- The UI should feel premium and controlled, not like a discount spam feed.

## 7. Article Page Engine

Article pages must be CMS-driven, not hardcoded per PR.

A new article should be publishable through admin workflow without code changes or deployment.

Every article page should support:
- hero image
- thumbnail
- inline images
- video block
- body sections
- FAQ
- internal links
- related services
- related areas
- related centers
- related doctors
- article ads
- article special offers
- bottom CTA
- SEO metadata
- review status

Articles should remain editorial content. Ads and offers must be separate placement blocks, not hidden inside the editorial body.

## 8. Article Placement Slots

Article pages use reusable slots. The slot system lets admins attach ads, special offers, media, related links, or CTAs without editing code.

Standard slots:
- article_after_intro
- article_mid_content
- article_after_video
- article_before_faq
- article_sidebar_desktop
- article_bottom

Allowed placement types:
- ad
- special_offer
- related_center
- related_doctor
- related_service
- related_article
- internal_cta
- video
- media

Slot rules:
- Placements must be optional.
- Empty slots must not leave broken UI.
- Short articles should not be overloaded.
- Long articles may support more commercial and related-care modules.
- Ads should never interrupt a paragraph.
- Ads should not appear before the reader reaches meaningful content.

## 9. Commercial Density Rules

Commercial placement density must protect trust, readability, and SEO.

### 9.1 Short Articles

Approximate length:
- under 900 words.

Rules:
- Maximum one commercial placement.
- Admin should choose either one ad or one special offer.
- Related internal links are allowed if they help the reader.

### 9.2 Medium Articles

Approximate length:
- 900 to 1500 words.

Rules:
- Maximum two light placements.
- One special offer plus related links or one light ad is acceptable.
- Avoid stacking ad and offer too close together.

### 9.3 Long Articles

Approximate length:
- 1500 words or more.

Rules:
- May include ad, special offer, related providers, video, FAQ, and internal links.
- Commercial blocks must remain clearly separated and labeled.
- The article must still feel like useful editorial content, not an advertorial page.

Global rules:
- Never use popups for article monetization in the initial platform model.
- Never place sponsored content before the article has delivered meaningful value.
- Never hide sponsored ranking as organic recommendation.
- Never make unreviewed medical claims.

## 10. Media and Video Rules

Media is a platform asset and requires ownership, metadata, and approval.

Media types:
- center logo
- center cover
- center gallery image
- doctor photo
- offer image
- ad image
- article hero image
- article thumbnail
- article inline image
- article video thumbnail

Media statuses:
- draft
- pending_review
- approved
- rejected
- archived

Video types:
- YouTube embed first
- Vimeo embed if needed
- uploaded video later
- AI video later

Video rules:
- Video blocks must have title, caption, thumbnail, and optional transcript.
- Video should support the article, not replace the article.
- Ads should not crowd video blocks.

AI image rules:
- AI may suggest image prompts.
- AI generated images must be treated as draft until approved.
- No fake doctors, fake patients, fake before-and-after, or misleading clinical results.
- No identifiable patient imagery without explicit approval and consent tracking.

## 11. AI Editorial Assistant

AI is an assistant, not a publisher.

AI may:
- suggest article topics
- draft articles
- suggest SEO titles and meta descriptions
- suggest FAQ entries
- suggest internal links
- suggest related offers
- suggest related centers or doctors
- suggest article placement opportunities
- suggest image prompts
- suggest video ideas

AI may not:
- auto-publish
- make medical claims without review
- invent doctors, centers, reviews, or credentials
- generate fake before-and-after content
- silently insert sponsored content into editorial text
- choose paid placements without admin approval
- bypass commercial review
- bypass medical review when medical content is involved

Inputs for AI content intelligence may include:
- Google Search Console data later
- analytics data later
- internal page views
- article performance
- directory taxonomy
- specialty and area pages
- offers and ads inventory
- provider profile data that is approved for internal use

All AI outputs must enter human review before publication.

## 12. Human Review Workflow

Article, media, offer, and commercial placement workflows must support review states.

Suggested article workflow:
- draft
- editorial_review
- medical_review
- commercial_review
- approved
- published
- archived

Medical review is required for medical content. Commercial review is required when ads, offers, or paid placements are attached.

No AI-generated article, image, offer, or sponsored copy should be publicly visible before approval.

## 13. Trust and Compliance Rules

Trust is a product feature.

Rules:
- Ads must be labeled Sponsored.
- Offers must be labeled Official Offer, Partner Offer, or another approved label.
- Paid placement must not be hidden as organic ranking.
- Medical claims require review.
- No fake doctors.
- No fake reviews.
- No fake before-and-after images.
- No AI auto-publishing.
- No commercial placement without owner, status, dates, and approval.
- No public recommendation language that implies medical superiority unless backed by an approved and compliant framework.

Safe language examples:
- Related providers in Muscat.
- Clinics offering this service.
- Official offers related to this topic.
- Sponsored placement.

Avoid language such as:
- Best doctor.
- Top clinic.
- Guaranteed result.
- Recommended by DrMuscat.

## 14. Admin Operating Model

Future admin modules should include:
- Plans
- Paid add-ons
- Offers
- Ads
- Article CMS
- Article placements
- Media approval
- AI suggestions
- Provider verification
- Review moderation
- Provider onboarding leads
- Lead notes and history
- Analytics

The admin panel is the operating center. Provider-facing self-service should come later and should initially submit changes for admin approval.

## 15. Provider Operating Model

Future provider dashboard modules should include:
- profile preview
- plan status
- media submission
- offer submission
- ad placement request
- article placement request
- leads
- analytics
- billing later

Provider submissions should default to pending review. Providers should not directly publish commercial or medical content without approval.

## 16. Analytics and Reporting

Future analytics should support:
- profile views
- WhatsApp clicks
- offer clicks
- ad impressions
- article views
- article-assisted leads
- placement performance
- revenue by plan
- revenue by add-on
- conversion by source
- provider performance
- topic performance

Analytics should help answer:
- Which article generated leads?
- Which offer got clicks?
- Which homepage ad performed?
- Which provider profile converted?
- Which specialty or area page needs content?
- Which topics should AI suggest next?

## 17. Proposed Implementation Phases

Recommended phases:

1. MON-A - Commercial contract.
2. MON-B - Existing commercial schema inspection.
3. MON-C - Admin plan assignment.
4. MON-D - Admin paid add-on or placement order.
5. OFF-A - Official Offers admin model.
6. ADS-A - Homepage Ads admin model.
7. ART-B - Article CMS data model.
8. ART-C - Admin article editor.
9. ART-D - DB-backed article rendering.
10. PLAC-A - Article placement engine.
11. MED-A - Media asset model.
12. MED-B - Admin upload and approval MVP.
13. AI-A - Read-only content intelligence.
14. AI-B - Draft generation with approval.
15. PROV-A - Read-only provider dashboard.
16. PROV-B - Provider submissions with admin approval.

Implementation order should be:
- contract first
- schema inspection second
- database only after approval
- admin operations before provider self-service
- public rendering after admin controls exist
- AI after content and approval workflows exist

## 18. Explicit Non-Goals

This document does not implement:
- database migrations
- RLS policies
- generated Supabase types
- seed data
- public UI changes
- admin UI changes
- provider dashboard
- payment gateway
- upload system
- article editor
- AI generation
- public placement rendering
- billing or wallet logic

Any implementation must be scoped into a later approved PR.
