# DrMuscat Oman Geo Model V1

## Purpose

Seed a static Oman geo foundation for DrMuscat local discovery and future SEO entity graph work.

## Scope

This model includes all 11 Oman governorates and all 63 wilayats. The area seed includes Muscat MVP areas plus a conservative first batch of non-Muscat regional center areas.

## Command

```bash
pnpm geo:validate:oman
```

## Included seed

- Governorates: 11 Oman governorates
- Wilayats: 63 Oman wilayats
- Muscat MVP areas: Al Khuwair, Al Ghubrah, Al Azaiba, Ghala, Qurum, Madinat Sultan Qaboos, Ruwi, Muttrah, Al Hail, Al Khoud, Al Mawaleh, Al Seeb
- Non-Muscat regional area seeds: Salalah, Sohar, Nizwa, Sur, Ibri, Al Buraimi, Khasab, Rustaq, Barka, Ibra, Al Duqm, Haima

## Launch logic

- Muscat governorate, Muscat wilayats, and Muscat areas are MVP Phase 1.
- Non-Muscat governorates, wilayats, and regional center area seeds are Phase 2 static data.
- Wider area-level expansion is deferred to later approved PRs.

## Explicit non-goals

- No runtime pages
- No dynamic routing
- No database migrations
- No provider data
- No reviews or ratings
- No sitemap, robots, llms.txt, metadata, JSON-LD, or schema changes
- No exhaustive non-Muscat neighborhood expansion yet

## Follow-up phases

- Add more non-Muscat area seeds in controlled regional batches
- Add route generation after the static model is stable
- Add SEO metadata and structured data in a separate approved phase
