# DrMuscat — Design System & Page Foundation

A reusable visual + UX system so future DrMuscat pages stay consistent.
Open **`design-system.html`** for the living, rendered version (toggle العربية to preview RTL).

> Medium note: this is a static HTML/CSS/JS prototype with **mock data only** — no backend, auth, DB, payments or real search. Routes are represented as static files (`providers.html`, etc.); a real build would map them to `/en/...` and `/ar/...`.

---

## 1. Files

| File | Purpose |
|---|---|
| `app.css` | All design tokens + component styles (single source) |
| `app.js` | Behaviour: header scroll, mobile menu, search suggestions, chips, carousel, scroll-reveal, **EN⇄AR language**, form submit, mobile filters |
| `data.js` | Shared mock data (`window.DM_DATA`): providers, categories, areas, articles |
| `DrMuscat.html` | Homepage |
| `providers.html` | Provider listing / search results |
| `provider.html` | Provider profile |
| `category.html` | Category landing (e.g. Dental) |
| `area.html` | Area landing (e.g. Al Khuwair) |
| `articles.html` / `article.html` | Articles listing + detail |
| `list-your-center.html` | Claim / lead form + mock success |
| `design-system.html` | Living styleguide (this doc, rendered) |

Every page includes the same `<svg>` icon sprite, header, footer, then `data.js` + `app.js`.

---

## 2. Color tokens (CSS variables in `:root`)

| Token | Hex | Use |
|---|---|---|
| `--green` | `#0F4B4A` | Primary — CTA, active nav, focus ring, selected chip |
| `--green-h` | `#13605E` | Primary hover |
| `--green-d` | `#0A3A39` | Deep — CTA band gradient, footer accents |
| `--teal` / `--pale-teal` | `#6FB7AA` / `#DDEBE8` | Accent, hover borders, soft fills |
| `--ivory` | `#F7F2EA` | Page background |
| `--pearl` | `#F1EADD` | Alt surface / bands |
| `--sand` | `#E9DDC7` | Warm detail |
| `--white` | `#fffdf9` | Cards / surfaces |
| `--gold` | `#C6A15B` | **Sparingly**: eyebrow rule, Claimed badge, offer, dividers |
| `--ink` / `--ink-2` / `--ink-3` | `#1C2422` / `#5d6b66` / `#8a948f` | Text primary / secondary / muted |
| `--line` / `--line-2` | `#DED7CA` / `#d2c8b4` | Borders |
| `--success` | `#1f7a4d` | Verified / open (`.pill-ok`) |
| `--warning` | `#9a6a1c` | Offer / claimed (`.pill-offer`) |
| `--error` | `#9c3636` | Form errors (`.error-notice`, `.field-error`) |

Depth comes from **warm green-tinted shadows** (`--sh-1/2/3`), never black. Focus = `--glow`.

---

## 3. Typography

- **English:** Spectral (serif display) · Manrope (UI/body) · IBM Plex Mono (code/labels).
- **Arabic:** Alexandria (headings) · IBM Plex Sans Arabic (body/UI).

Arabic is **not** mirrored English — handled by `body[dir="rtl"]` overrides:

| Class | English | Arabic |
|---|---|---|
| `.display` | Spectral 400, `clamp(40px,5vw,64px)`, lh 1.04 | Alexandria **500**, `clamp(2.2rem,3.8vw,3.3rem)`, lh **1.4** |
| `.h2` | Spectral, up to 42px | Alexandria 500, up to ~2.1rem |
| `.lead` | 19px, lh 1.6 | 1.06rem, lh **1.9** |
| UI (nav/btn/chip) | Manrope 600/700 | weight **500**, compact |

Rule: **Arabic large headings are smaller and lighter than English**; Arabic body gets more line-height; Arabic UI stays compact. Latin names/numerals inside Arabic use `.lat` (stays LTR).

---

## 4. Spacing / radius / shadow / motion

- **Spacing scale:** `--s-1…--s-22` (4px base). Semantic: `--sec-pad` 88 / `--sec-pad-m` 60, `--card-pad` 24, `--grid-gap` 22, `--form-gap` 20, `--nav-gap` 28, `--chip-gap` 10.
- **Radius:** `--r-sm` 10 · `--r-md` 14 · `--r-lg` 20 · `--r-xl` 28 · `--r-pill`.
- **Shadow:** `--sh-1` card · `--sh-2` hover · `--sh-3` dropdown/sheet · `--glow` focus.
- **Motion:** `--t-btn` 170ms · `--t-card` 280ms · `--t-drop` 220ms · `--t-menu` 360ms · `--t-reveal` 520ms. Easing `--e-premium` `cubic-bezier(.22,1,.36,1)`, `--e-surface` `cubic-bezier(.16,1,.3,1)`. All gated by `prefers-reduced-motion`.

---

## 5. Component classes

**Layout/nav:** `.site-header`(+`.scrolled`), `.nav a`(+`.active`), `.m-menu`, `.lang`, `.foot`, `.wrap`, `.sec`, `.sec-head`, `.crumbs`, `.page-hero`.
**Buttons:** `.btn`, `.btn-2`, `.btn-ghost-d`, `.btn-on-dark`, `.btn.sm/.lg/.block`, `.iconbtn`.
**Search/filter:** `.search-rail` + `.sr-field` + `.sr-suggest`, `.chip`(+`.is-selected`) in `[data-chipgroup]`, `.filters`/`.filter-opt`, `.sortbtn`.
**Cards:** `.provider` (+`.pv-media`,`.pv-logo`,`.pv-body`,`.trust-line`,`.pv-actions`,`.pv-cta`,`.pv-util`), `.cat`, `.area`, `.article`, `.qa` (emergency), `.cta-band`, `.panel`.
**Badges/tags:** `.badge`(+`.gold`), `.tag`, `.pill-ok`, `.pill-offer`, `.trust-line`(+`.wa`).
**Forms:** `.field-row`(+`.has-error`), `.inp`, `.sel`, `.txt`, `.field-error`, `.success`(+`.show`), `.benefits`/`.benefit`.
**Utility states:** `.skeleton`/`.skel-line`, `.empty-state`, `.error-notice`, `.linkpills`/`.linkpill`, `.prose`, `.disclaimer`, `.metarow`.
**Media placeholders:** `.media` + variant `.provider` / `.wellness` / `.beauty` / `.article` + `.wm` icon watermark.
**Reveal:** `.reveal`, `.stagger` (JS adds `.in` then `.settled`).

States are defined for every interactive element: default / hover / active / `:focus-visible` / disabled (+ loading via `.skeleton`).

---

## 6. Mock data (`window.DM_DATA`)

Bilingual fields are `{en, ar}`. Helpers: `byCategory(slug)`, `byArea(slug)`, `provider(slug)`, `cat(slug)`, `areaBy(slug)`, `article(slug)`.

- **provider:** `id, slug, logo, category, area, name, verificationStatus, claimedStatus, shortDescription, services[], tags[], whatsapp, phone, directionsUrl, openingHours, licenseInfo, hasOffer, respondsOnWhatsapp, placeholderVariant, wm`
- **category:** `slug, name, subtitle, description, icon, featured`
- **area:** `slug, name, providerCount, featuredCategories[]`
- **article:** `slug, title, category, excerpt, readTime, date, placeholderVariant, wm`

Use this one source rather than re-hardcoding per page.

---

## 7. Routing & SEO conventions

Locale-first: `/en/...` and `/ar/...`. Every page sets `lang` (`en-OM`/`ar-OM`) + `dir`, has one clear `<h1>`, breadcrumbs, readable content, no fake reviews/ratings.

| Route | Template |
|---|---|
| `/en` · `/ar` | `DrMuscat.html` |
| `/en/providers` | `providers.html` |
| `/en/providers/[slug]` | `provider.html` |
| `/en/categories/[category]` | `category.html` |
| `/en/areas/[area]` | `area.html` |
| `/en/articles` · `/en/articles/[slug]` | `articles.html` · `article.html` |
| `/en/list-your-center` | `list-your-center.html` |

---

## 8. RTL & mobile rules

**RTL:** `dir=rtl` flips layout/nav/cards/icons (`.flip` on chevrons/arrows); Arabic headings smaller+lighter; numerals & Latin names use `.lat`; language switcher always shows the *target* language ("العربية" on EN, "English" on AR) and persists via `localStorage('dm_lang')`.

**Mobile:** no horizontal scroll; search rail stacks full-width; filters become a full-screen sheet (`[data-filter-open]`/`[data-filter-close]`); touch targets ≥44px; carousels swipe with scroll-snap; mobile menu is a blurred full-screen sheet with staggered items.

---

## 9. Remaining limitations

- Static prototype: file-based routes, not real `/en` `/ar` framework routing; no lint/typecheck/build/PR step.
- Mock data only; no real search, submit, auth, or external fetch.
- Placeholders are intentional CSS gradients + icon watermarks (no real photography yet).
- Detail pages (provider/category/area/article) render one representative record; wiring `DM_DATA` by slug at runtime is the next step when moved into a framework.
