# DrMuscat Oman Geo Model V1

## Purpose

Seed a static Oman geo foundation for DrMuscat local discovery and future SEO entity graph work.

## Scope

This model now includes all 11 Oman governorates and all 63 wilayats. The area seed remains intentionally conservative and Muscat-only.

## Command

```bash
pnpm geo:validate:oman
```

## Included seed

- Governorates: 11 Oman governorates
- Wilayats: 63 Oman wilayats
- MVP areas: Al Khuwair, Al Ghubrah, Al Azaiba, Ghala, Qurum, Madinat Sultan Qaboos, Ruwi, Muttrah, Al Hail, Al Khoud, Al Mawaleh, Al Seeb

## Launch logic

- Muscat governorate and Muscat wilayats are MVP Phase 1.
- Non-Muscat governorates and wilayats are seeded as Phase 2 static data.
- Area-level expansion outside Muscat is deferred to a later approved PR.

## Explicit non-goals

- No runtime pages
- No dynamic routing
- No database migrations
- No provider data
- No reviews or ratings
- No sitemap, robots, llms.txt, metadata, JSON-LD, or schema changes
- No area-level expansion outside Muscat yet

## Follow-up phases

- Add non-Muscat area seeds in controlled regional batches
- Add route generation after the static model is stable
- Add SEO metadata and structured data in a separate approved phase
