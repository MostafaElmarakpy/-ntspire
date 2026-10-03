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

## Phase 02 handoff

Phase 03 can consume `mockServices` for the design-system shell and later
gallery work. Use `mockSearchService.search()` for result data and preserve the
known `Asset`/`SectionCrop` dimensions when reserving image space. The local
SVG assets are already generated under `frontend/public/mock-assets/`.

## Phase 03 handoff

The shared shell, light design tokens, UI primitives, retry/empty/skeleton
states, and dev-only design-system catalogue are ready. Future screens should
reuse `Container`, `PageHeader`, `FilterChip`, and the shared control primitives;
the catalogue is available only in development at `/en/dev/design-system`.
Phase 05 enables Explore, Sections, and the Mobile-to-Explore query shortcut;
remaining navigation entries stay hidden until their routes exist. The
locale-switcher space is reserved but hidden. Search overlay behavior and
inference remain Phase 06 work; Explore exposes the shared URL serializer and
SearchService needed for that handoff.

## Phase 04 handoff

The masonry gallery, the reference cards, and the save core are ready. Future
gallery surfaces should render through `MasonryGrid` — `frontend/src/lib/masonry.ts`
owns column placement — rather than CSS columns, and every card image must declare
the real `width`/`height` of its asset so that placement stays accurate.
`SaveButton` and `useSaved` are the shared save affordance; Phase 08 mounts
collections beside them, and until real accounts exist every visitor is an
anonymous owner of their own browser-local saves. The development-only gallery is
at `/en/dev/gallery` and returns 404 in a production build; its skeleton is an
in-page Suspense fallback, not a route-level `loading.tsx`, so the production
guard is not lost behind a flushed `200` shell. Explore's results were moved onto
`MasonryGrid` in a scoped correction, so Explore's URL state, filters, sorting,
and pagination are unchanged.

## Phase 05 handoff

The Explore route uses `mockSearchService.search()` for its server-rendered
first page and the same service through `/api/explore` for filters and cursor
pages. The URL state module owns canonical filter serialization and browser
history restoration. Phase 06 should reuse this service and serializer; do not
create a second result/query path. Search overlay, suggestions, and inference
remain deferred.

## Deliberately deferred

- Arabic UI, RTL rendering, Arabic aliases, and `/ar` are Phase 11 work. Arabic
  reference content may exist as mock data from Phase 02, but the UI remains
  English/LTR through Phase 10.
- Real API, database, authentication, storage, capture, Figma, and analytics
  providers remain outside this mock-only frontend MVP.
- Explore's loading/empty/error/success states are implemented with explicit
  `?__mock=` query modes; later async services should preserve this testable
  state contract.
