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

---

# FIX01 — Premium WhatsApp Button Activation + Visual Polish

## FIX01 summary

FIX01 keeps the original PR #170 support section intact and applies a targeted WhatsApp support UI fix only.

Changed in FIX01:

- Verified the WhatsApp URL helper returns a real `wa.me` URL only when the public env var normalizes to digits.
- Confirmed the local shell did not have `NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER` set, which means the component intentionally rendered the disabled fallback instead of an anchor.
- Added explicit active/disabled state classes and `data-whatsapp-state` markers for the floating quick-access control.
- Removed the floating wrapper `pointer-events: none` pattern so the active anchor is not dependent on descendant pointer-event overrides.
- Upgraded the floating button to a more premium DrMuscat 2026 glass/teal pill with a soft WhatsApp accent glyph, stronger readable label, premium shadow, hover/focus elevation, tap feedback and reduced-motion-safe behavior.

## WhatsApp activation fix

When `NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER` is set, the floating quick-access control renders as a real anchor:

- `href` is generated from the env var via `normalizeWhatsAppNumber` and `buildWhatsAppUrl`.
- `target="_blank"` is present.
- `rel="noopener noreferrer"` is present.
- The accessible label remains:
  - English: `Contact DrMuscat support on WhatsApp`
  - Arabic: `تواصل مع دعم DrMuscat عبر واتساب`

Expected active URL shape:

```txt
https://wa.me/96877402910?text=Hi%20DrMuscat%2C%20I%20need%20help%20finding%20public%20healthcare%20provider%20information%20in%20Oman.
```

The number is still not hardcoded in the component. It must come from:

```env
NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER=96877402910
```

## Floating button visual polish

The floating button now uses:

- compact glassy pill styling
- white/teal DrMuscat surface treatment
- soft WhatsApp green accent glyph
- stronger premium shadow
- subtle border
- readable label
- hover elevation on desktop
- active/tap feedback
- focus-visible outline
- reduced-motion-safe transition handling

It remains intentionally compact and is not a full-width sticky bar, popup, modal, chatbot or live chat widget.

## Missing env fallback reminder

If `NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER` is missing or invalid:

- No `wa.me/undefined` link is generated.
- The floating control renders as a disabled/non-active element with `aria-disabled="true"`.
- Inline support buttons render disabled/non-active fallbacks.
- The UI remains intentional and not broken-looking.

Vercel must set:

```env
NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER=96877402910
```

Format requirement:

- digits only
- country code included
- no plus sign
- no spaces
- no hyphens

## FIX01 manual QA notes

Reviewer should check:

- `/en/om` desktop
- `/ar/om` desktop
- `/en/om` mobile
- `/ar/om` mobile
- `/` after redirect

Checklist:

- Floating WhatsApp button opens WhatsApp when `NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER=96877402910` is configured.
- User support inline button opens the user-support WhatsApp message.
- Provider team inline button opens the provider-listing WhatsApp message.
- Links contain valid `wa.me` URLs.
- URL `text` parameter is encoded.
- No `wa.me/undefined` link exists when env var is missing.
- Floating button looks premium/glassy and not dead/gray when active.
- Floating button remains visible on desktop and mobile.
- Floating button does not create horizontal overflow.
- Arabic RTL remains clean.
- No backend/database/API/Supabase/SEO/package changes were made.

## FIX01 validation results

- `git status --short` — pending local FIX01 files only at documentation time.
- `pnpm lint` — passed with existing warnings in prototype/public files.
- `pnpm typecheck` — passed.
- `NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER=96877402910 pnpm build` — passed with the env var set for active-link build verification.
- `pnpm build` — passed with the local missing-env fallback.
- `pnpm routes:check` — passed.
- `pnpm seo:check` — passed.

---

# FIX02 — Functional WhatsApp Support + Circular FAB

## FIX02 summary

FIX02 keeps the homepage support section structure unchanged and targets only the WhatsApp support CTA behavior and floating visual treatment.

Changed in FIX02:

- Tightened `normalizeWhatsAppNumber` so it only returns a safe Oman WhatsApp number.
- Supported production international input `96877402910`, plus-sign input `+96877402910`, and local Oman 8-digit input `77402910` by normalizing it to `96877402910`.
- Kept the floating CTA as a real anchor only when a valid env-derived WhatsApp URL exists.
- Converted the floating CTA from a pill into a fully circular premium WhatsApp FAB on desktop and mobile.
- Moved the desktop label into a secondary companion bubble and hid it on mobile so the main control remains circular.
- Preserved safe disabled fallback behavior for missing or invalid env values.

## Root cause of broken WhatsApp click behavior

The local QA environment did not have `NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER` set, so the component correctly rendered the inactive fallback rather than an anchor.

A second reliability issue was identified in the original helper: it stripped non-digits but accepted any non-empty digit value. That meant an Oman local value such as `77402910` could produce `https://wa.me/77402910?...` instead of the required international `https://wa.me/96877402910?...` URL. FIX02 now rejects invalid lengths and prepends `968` for valid 8-digit Oman local inputs.

## FIX02 normalization rules

`normalizeWhatsAppNumber` now follows these rules:

- Strip all non-digits.
- If the cleaned value is exactly 8 digits, treat it as an Oman local mobile number and prepend `968`.
- If the cleaned value starts with `968` and is exactly 11 digits, use it as-is.
- Otherwise return `null`.
- Never generate `wa.me/undefined`.
- Never generate an active href from invalid input.

Accepted examples:

- `96877402910` → `96877402910`
- `+96877402910` → `96877402910`
- `77402910` → `96877402910`

## Env var requirement

Vercel must set:

```env
NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER=96877402910
```

Expected format remains digits-only with country code included. FIX02 also safely supports plus-sign and 8-digit local input, but production should use the full international digits-only value above.

## Desktop/mobile circular FAB behavior

The floating WhatsApp support CTA now renders as:

- a fully circular active anchor when the env var normalizes successfully
- a fully circular inactive fallback when the env var is missing or invalid
- bottom-right placement on desktop
- safe-area-aware bottom-right placement on mobile
- a centered WhatsApp-like chat/phone glyph
- a vivid WhatsApp green surface with DrMuscat-style depth, glow, shadow and glass polish
- visible keyboard focus, hover elevation and tap feedback
- a desktop companion label only; mobile remains a single circular FAB

## FIX02 manual QA notes

Reviewer should check:

- `/en/om` desktop
- `/ar/om` desktop
- `/en/om` mobile
- `/ar/om` mobile
- `/` after redirect

Checklist:

- Floating WhatsApp FAB opens WhatsApp on desktop when env is configured.
- Floating WhatsApp FAB opens WhatsApp on mobile when env is configured.
- User inline support button opens the user WhatsApp message.
- Provider inline support button opens the provider WhatsApp message.
- `96877402910`, `+96877402910`, and `77402910` normalize safely.
- `wa.me` link includes encoded `text` parameter.
- No `wa.me/undefined` link exists.
- Desktop FAB is fully circular.
- Mobile FAB is fully circular.
- FAB is premium, vivid, centered and not gray/dead.
- No horizontal overflow.
- No RTL drift or label collision.
- No SEO/database/API/Supabase/package/route/redirect changes were made.

## FIX02 validation results

- `node - <<'NODE' ...` helper normalization check — passed for `96877402910`, `+96877402910`, `77402910`, invalid short input, missing input and encoded URL output.
- `git status --short` — pending local FIX02 files only at documentation time.
- `pnpm lint` — passed with existing warnings in prototype/public files.
- `pnpm typecheck` — passed.
- `NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER=96877402910 pnpm build` — passed with production-format env.
- `NEXT_PUBLIC_DRMUSCAT_WHATSAPP_NUMBER=77402910 pnpm build` — passed with local 8-digit normalization.
- `pnpm build` — passed with missing-env fallback.
- `pnpm routes:check` — passed.
- `pnpm seo:check` — passed.
