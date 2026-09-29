# ntspire phased delivery plan

The current build is frontend-only and mock-data-only. Do not create or modify
`backend/` during these phases.

1. Foundation, tooling, quality gates, and English/LTR locale scaffold.
2. Domain types, taxonomy, deterministic mock data/assets, and services.
3. Design tokens, primitives, accessible app shell, and design-system route.
4. Masonry gallery, reference cards, and local mock Save core.
5. Explore route, filters, URL state, sorting, and pagination.
6. Search overlay, taxonomy inference, suggestions, and Arabic Websites chip.
7. Source/page/section detail pages, device variants, and View in Context.
8. Local mock collections.
9. Homepage content, metadata, sitemap, and robots.
10. Stabilization: full responsive, accessibility, and masonry audit.
11. Arabic UI, `ar` locale, RTL layout, aliases, and localized metadata.
12. Final review, documentation, and handoff.

## Deliberately deferred

- Arabic UI, RTL rendering, Arabic aliases, and `/ar` are Phase 11 work. Arabic
  reference content may exist as mock data from Phase 02, but the UI remains
  English/LTR through Phase 10.
- Real API, database, authentication, storage, capture, Figma, and analytics
  providers remain outside this mock-only frontend MVP.
