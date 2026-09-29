# Phase 9 — Homepage & SEO basics (English)

Read first: `00-global-rules.md`; spec §12, §46–47 (English parts only), §42; master prompt §9–10, §28.

## Goal
A discovery-first homepage and correct metadata for all public pages.

## In scope
- P9-01 Homepage `/en` in this order: Navbar, Hero + Search, Featured Sections, Browse by Section Type, Browse by Industry, Arabic / RTL Inspiration, Latest Additions, Featured Collections, Footer. Must feel like a curated reference library — NOT a startup landing page, dashboard or template marketplace. Communicates immediately: "visual reference library to find real-world UI patterns".
- P9-02 Hero search opens the Phase 6 overlay (no separate search page); include quick chips incl. "Arabic Websites". Server-render content sections; Client Components only for interactions.
- P9-03 Browse blocks link to Explore with the right filters; "Arabic / RTL Inspiration" uses `language=ar` data (English UI, Arabic content — it links to the Arabic Websites filter); Featured Collections use the Phase 8 curated fixtures; Latest Additions by capture/publish date.
- P9-04 Metadata via Next.js Metadata API for home, explore, categories, sources, source, page, section pages: title, description, canonical, Open Graph, Twitter, `alternates` prepared for locales (only `en` now). Dynamic pages use `generateMetadata` from mock data.
- P9-05 `sitemap.ts` (public routes only) and `robots.ts` (disallow dev routes, private/user areas like collections). `noindex` on collections, dev routes and arbitrary filter combinations (explore with params → canonical to `/explore`).
- P9-06 Global `not-found.tsx`, `error.tsx`, `loading.tsx` polished.
- P9-07 Image `alt` text meaningful everywhere (source + section type + device).
- P9-08 Home loading/empty/error states for its data blocks.

## Out of scope
Arabic metadata, hreflang (Phase 11).

## Required tests
Metadata functions (title/canonical/OG per page type), sitemap/robots content, homepage links resolve and carry correct filters, e2e: home loads clean at both viewports, every block renders, hero search flow, axe clean.

## Exit
Global gate + report with screenshots of the homepage at 1440 and 390.
