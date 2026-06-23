# DrMuscat Oman Geo Model V1

## Purpose

Seed a small static Oman geo foundation for DrMuscat local discovery and future SEO entity graph work.

## Scope

This PR includes Muscat Governorate only. It adds one governorate, six Muscat wilayats, and a conservative MVP area seed.

## Command

```bash
pnpm geo:validate:oman
```

## Included seed

- Governorate: Muscat
- Wilayats: Al Amarat, Bawshar, Muscat, Muttrah, Qurayyat, Al Seeb
- MVP areas: Al Khuwair, Al Ghubrah, Al Azaiba, Ghala, Qurum, Madinat Sultan Qaboos, Ruwi, Muttrah, Al Hail, Al Khoud, Al Mawaleh, Al Seeb

## Explicit non-goals

- No runtime pages
- No dynamic routing
- No database migrations
- No provider data
- No reviews or ratings
- No sitemap, robots, llms.txt, metadata, JSON-LD, or schema changes
- No full Oman governorate or wilayat expansion yet

## Follow-up phases

- Expand the geo registry beyond Muscat
- Add route generation after the static model is stable
- Add SEO metadata and structured data in a separate approved phase
