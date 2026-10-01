# Frontend Architecture

## Current Phase

Frontend-only MVP using deterministic mock data. The Next.js application lives
under `frontend/` at the repository root. `backend/` is reserved for a future
ASP.NET Core API and must remain untouched during the frontend phases.

The application MUST NOT depend on:

- ASP.NET Core
- PostgreSQL
- EF Core
- Redis
- external APIs
- real authentication providers
- object storage
- Figma APIs

## Architecture Goal

Build the frontend as if it will later connect to the real ASP.NET Core API.

The UI must not depend directly on mock fixture arrays.

Use:

```
UI
↓
Feature / Service abstraction
↓
Mock implementation
↓
Mock data
```

Later:

```
UI
↓
Feature / Service abstraction
↓
API implementation
↓
ASP.NET Core API
```

## Frontend Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Vitest + Testing Library + jsdom + jest-dom
- Playwright (desktop and mobile clean-run smoke tests)
- axe-core/playwright (introduced in Phase 03)

## Rendering Rules

Server Components are the default.

Client Components are only used when needed for:

- state
- event handlers
- browser APIs
- dialogs
- search interactions
- filters
- local persistence
- other interactive behavior

## Core Product Model

Source → Page / Screen → Section → SectionCrop → Asset

Section is a screenshot/cropped visual reference.

Section is NOT a React component.

## Phase 02 Domain Mock Layer

The deterministic domain model lives in `frontend/src/types/domain.ts`. The
relationship is `Source -> Page -> Section -> SectionCrop -> Asset`; crop
coordinates remain on `SectionCrop`, and both `Asset` and `SectionCrop` carry
required dimensions. Capture date and attribution are retained on sources and
sections so reference metadata is available without a backend.

`frontend/src/config/taxonomy.ts` is the only source for section types,
industries, styles, and filter values. Mock content is described once in
`frontend/src/mocks/mock-manifest.json`; typed fixtures derive sources, pages,
sections, crops, tags, categories, and asset metadata from that manifest.

The asset script generates local SVG wireframes only. Each declared page/device
gets a stacked full-page asset, and each section/device gets a crop asset. The
same deterministic height table is used by the generator and fixtures, so crop
coordinates point into the matching page asset and declared dimensions can be
validated from the SVG files.

Services in `frontend/src/mocks/services.ts` implement the async contracts in
`frontend/src/types/services.ts`. They call the pure `frontend/src/lib/query-engine.ts`
for filtering, text search, sorting, pagination, facets, and similarity. UI
code should import these contracts, never fixture arrays. A future API service
can replace the mock exports without changing consumers. Development-only
`mockConfig` supports delay, forced error, and forced empty modes via
`NEXT_PUBLIC_MOCK_CONFIG` or `?__mock=...`; production ignores both controls.

## Shared Taxonomy Config

Section Types, Industries, Styles, and language/direction/device/theme values
live in a **single** config module (`frontend/src/config/taxonomy.ts` or
equivalent).
Every filter, quick-filter chip, mock-data tag, and search-inference rule must
import from this one source — no component or fixture may invent a section
type/industry/style/chip value that isn't defined there. If a new value is
genuinely needed, add it to the config first, then use it everywhere.

Arabic reference content exists as data from Phase 02, but Arabic aliases are
empty until Phase 11. The Arabic Websites chip and Arabic search aliases are
introduced only in Phase 06.

## Image Strategy

Mock images are generated or stored **locally only** — no external image host
(Unsplash, Picsum, placeholder.com, etc.) is used anywhere, so the app builds,
tests, and runs with zero network access. Every mock `Asset`/`SectionCrop`
declares `width`/`height` that match the real dimensions of its image file,
because the masonry layout (below) depends on that being accurate. See
`docs/product-spec.md` Section 9 and Section 14.1 for the underlying product
requirement.

## Responsive Reference Rules

Gallery cards use masonry/waterfall behavior.

Card width follows the responsive column.

Image height follows natural aspect ratio.

Never:

- force equal card heights
- use fixed-height gallery cards
- use object-cover for normal reference cards
- mirror screenshot content in RTL

RTL changes column order, not image content.

## Search Architecture

Search logic must be isolated from UI components.

Search supports:

- free text
- taxonomy detection (against the Shared Taxonomy Config above)
- Arabic aliases
- filters
- device context

Search inference is deterministic. No LLM is required for taxonomy recognition.

## Localization

All routes live under `app/[locale]/`. Until Phase 11 only `en` is enabled:
`/` redirects to `/en`, and `/ar` is a 404. User-facing strings are centralized
in typed message modules and accessed through one helper. Components and styles
use CSS logical properties only, so the later `ar`/RTL rollout does not require
structural rewrites.

Arabic and RTL are first-class future requirements, deliberately deferred until
Phase 11.

## State Management

Prefer:

- URL state
- local React state
- localStorage when required

Do not introduce Redux or another global state library unless a concrete need is demonstrated.

## Design Principles

- editorial
- visual
- image-first
- high information density
- fast
- accessible
- responsive
- not generic SaaS
- not a clone of reference websites

## Future Integration Boundary

The frontend must be replaceable from:

Mock Services → API Services

without rewriting the main UI.

## Quality gates

Every phase runs, from `frontend/`, `typecheck`, `lint`, `test`, `build`, and `test:e2e`. The Playwright clean-run fixture treats console errors/warnings, page errors, failed requests, and HTTP errors as failures, with the sole exception of per-test declared expectations via `expectResponse({ path, status })` (exact path and exact status, scoped to the test, which fails the test if the declared response does not occur). No wildcard or global allowlists. A guard test prevents physical directional CSS utilities from entering source files.
