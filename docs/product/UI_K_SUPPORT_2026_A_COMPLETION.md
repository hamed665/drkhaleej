# UI-K-SUPPORT-2026-A — Support / WhatsApp Contact Foundation Completion

## 1. Final scope

PR #170 adds a minimal, premium, medical-safe WhatsApp support contact foundation to the localized DrMuscat homepage only.

Implemented scope:

- Inline Support / WhatsApp Contact section.
- Compact floating WhatsApp quick-access button for desktop and mobile.
- Tiny dependency-free WhatsApp URL helper.
- Safe disabled fallback when `NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER` is not configured.

Not implemented:

- No chatbot.
- No AI assistant.
- No live chat widget.
- No backend.
- No database.
- No ticketing system.
- No analytics or tracking.
- No route creation.
- No medical advice flow.

## 2. Files changed

- `src/components/home/HomeSupportContact2026.tsx`
- `src/components/home/HomePage2026HeaderHero.tsx`
- `src/styles/dm2026-home.css`
- `src/lib/contact/whatsapp.ts`
- `docs/product/UI_K_SUPPORT_2026_A_COMPLETION.md`

## 3. Support section placement

The homepage composition now mounts Support / WhatsApp Contact after Trust/Safety and before the site footer.

Final homepage order:

1. Header
2. Search Hero
3. Entity Clarity
4. Featured Provider Board
5. Discovery Categories
6. Special Offers
7. Provider CTA
8. FAQ
9. Trust/Safety
10. Support / WhatsApp Contact
11. Footer

Existing major homepage sections were not reordered except for adding the Support / WhatsApp Contact section after Trust/Safety.

## 4. Floating WhatsApp quick-access behavior

The floating quick-access button:

- Uses the user-support WhatsApp message by default.
- Reads the phone number from `NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER`.
- Builds `https://wa.me/{number}?text={encodedMessage}` only when a normalized number exists.
- Renders disabled/non-active if the env var is missing or normalizes to an empty value.
- Does not create `wa.me/undefined`.
- Has no popup, modal, chatbot, auto-open behavior, analytics, or external script.

## 5. Desktop UX notes

Desktop behavior:

- Floating compact button appears at the bottom inline-end corner.
- Visual treatment is premium white/teal with a subtle WhatsApp accent dot, not a loud full-green bubble.
- Inline support section uses a compact glass/ivory/teal shell with two distinct support cards.
- Floating button is intentionally compact and does not visually compete with primary homepage CTAs.

## 6. Mobile UX notes

Mobile behavior:

- Inline support section stacks cleanly.
- Support cards become compact mobile rows with comfortable tap targets.
- Floating quick-access button remains compact in a safe bottom corner.
- CSS uses logical properties and safe-area environment variables.
- No full-width sticky bottom bar, popup, modal, or intrusive overlay was added.
- Styles are constrained with `max-inline-size` to avoid horizontal overflow.

## 7. English / Arabic copy used

### English

- Eyebrow: `Support`
- Headline: `Need help using DrMuscat?`
- Subtitle: `Choose the right WhatsApp path for public discovery help or provider listing support. We do not provide medical advice.`
- User card title: `Need help finding public provider information?`
- User card body: `Message DrMuscat support on WhatsApp for help with public discovery. We do not provide medical advice.`
- User button: `WhatsApp support`
- User WhatsApp message: `Hi DrMuscat, I need help finding public healthcare provider information in Oman.`
- Provider card title: `Want to list or claim your center?`
- Provider card body: `Contact our provider team to prepare your public profile, services, offers and contact actions.`
- Provider button: `Provider team`
- Provider WhatsApp message: `Hi DrMuscat, I want to list or claim my center on DrMuscat.`
- Floating button label: `WhatsApp`
- Floating accessible label: `Contact DrMuscat support on WhatsApp`

### Arabic

- Eyebrow: `الدعم`
- Headline: `هل تحتاج مساعدة في استخدام DrMuscat؟`
- Subtitle: `اختر مسار واتساب المناسب للمساعدة في الاكتشاف العام أو دعم إدراج مقدمي الخدمة. لا نقدم نصائح طبية.`
- User card title: `هل تحتاج مساعدة في العثور على معلومات عامة؟`
- User card body: `راسل دعم DrMuscat عبر واتساب للمساعدة في الاكتشاف العام. لا نقدم نصائح طبية.`
- User button: `دعم واتساب`
- User WhatsApp message: `مرحباً DrMuscat، أحتاج مساعدة في العثور على معلومات عامة عن مقدمي الرعاية الصحية في عُمان.`
- Provider card title: `هل تريد إدراج أو مطالبة مركزك؟`
- Provider card body: `تواصل مع فريق مقدمي الخدمة لتجهيز ملفك العام والخدمات والعروض وطرق التواصل.`
- Provider button: `فريق مقدمي الخدمة`
- Provider WhatsApp message: `مرحباً DrMuscat، أريد إدراج أو مطالبة مركزي على DrMuscat.`
- Floating button label: `واتساب`
- Floating accessible label: `تواصل مع دعم DrMuscat عبر واتساب`

## 8. WhatsApp URL helper behavior

Added `src/lib/contact/whatsapp.ts` with:

- `normalizeWhatsAppNumber(value?: string): string | null`
- `buildWhatsAppUrl(number: string | null, message: string): string | null`

Helper behavior:

- Removes spaces, plus signs, parentheses, hyphens, and any non-digit characters by keeping digits only.
- Returns `null` when no digits remain.
- Encodes the message with `encodeURIComponent`.
- Builds `https://wa.me/{number}?text={encodedMessage}`.
- Does not add tracking parameters.
- Does not use external libraries.
- Does not throw if the env var is missing.
- Does not hardcode the project WhatsApp number.

## 9. Required env var

`NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER` is required to activate WhatsApp links.

## 10. Vercel env value for this project

Configure Vercel with:

```env
NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER=96877402910
```

Expected format:

- digits only
- country code included
- no plus sign
- no spaces
- no hyphens

Do not hardcode this number directly into components.

## 11. Missing env fallback behavior

If `NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER` is missing or normalizes to no digits:

- The page still builds.
- Inline support actions render in a disabled/non-active state.
- The floating quick-access button renders in a disabled/non-active state.
- No broken `wa.me/undefined` link is generated.
- The UI remains premium and intentional-looking.

## 12. Medical-safety boundaries

The support surface is limited to:

- public discovery help
- public provider information
- provider listing support
- center claim support
- public profile preparation
- services, offers and contact actions

Confirmed not included:

- diagnosis
- treatment advice
- emergency support
- urgent medical help
- medical triage
- appointment booking or appointment guarantees
- guaranteed provider recommendations
- ranking recommendations
- guaranteed provider quality

## 13. RTL notes

- Component uses the passed `dir` value.
- CSS uses logical properties such as `inline-size`, `inset-inline-end`, and `inset-block-end`.
- Arabic headline letter spacing and paragraph line-height are adjusted for natural RTL rendering.
- Mobile layout stacks without horizontal overflow.

## 14. Confirmation no chatbot/live chat/backend/ticketing was added

Confirmed:

- No chatbot UI was added.
- No AI assistant UI was added.
- No live chat script was added.
- No popup or modal was added.
- No backend support flow was added.
- No ticketing system was added.

## 15. Confirmation no DB/API/Supabase/RLS/migration/SEO/package changes

Confirmed:

- No database files changed.
- No Supabase files changed.
- No RLS changes were added.
- No migrations were added or edited.
- No API routes were added or edited.
- No routes were added or edited.
- No metadata, schema, JSON-LD, sitemap, robots, or `llms.txt` changes were made.
- No package or lockfile changes were made.

## 16. Validation results

- `git status --short` — pending local PR files only at documentation time.
- `pnpm lint` — passed with existing warnings in prototype/public files.
- `pnpm typecheck` — passed.
- `pnpm build` — passed.
- `pnpm routes:check` — passed.
- `pnpm seo:check` — passed.

## 17. Manual QA notes

Manual QA paths for reviewer:

- `/`
- `/en/om`
- `/ar/om`

Checklist:

- Root `/` should still redirect to `/en/om`.
- `/en/om` should load the English homepage.
- `/ar/om` should load the Arabic homepage.
- Inline Support section should appear after Trust/Safety and before Footer.
- Floating WhatsApp quick-access button should appear on desktop and mobile.
- Floating button should remain compact and premium.
- No full-width sticky bottom bar should exist.
- No popup/modal/chatbot/live chat should exist.
- WhatsApp links should be valid when `NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER` is configured.
- No `wa.me/undefined` links should be emitted when the env var is missing.
- Prefilled messages should be URL-encoded.
- English and Arabic support messages should match approved copy.
- Arabic RTL layout should remain clean.
- No horizontal overflow should appear on mobile.
- Header, footer, Search Hero, Entity Clarity, FAQ and Trust content should remain unchanged except the new support placement.

## 18. Next PR recommendation

Recommended next PR:

- `UI-K-SEO-2026-A — Structured Data Governance`

Alternative next PR:

- `UI-K-CONTENT-2026-A — Medical Editorial / Articles Foundation`
