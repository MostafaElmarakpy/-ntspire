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
`NEXT_PUBLIC_MOCK_CONFIG` or `?__mock=...`; production ignores environment-wide
controls but honors explicit query modes for deterministic state testing.

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

## Phase 03 Design System and Shell

The light-only interface uses semantic CSS variables in `frontend/src/app/globals.css`.
The monochrome gallery palette pairs near-black ink (`--primary: #111111`) with
neutral washes on a warm near-white surface (`--background: #fafafa`, cards
`#ffffff`, hairlines `#ececec`); running meta text uses a darker gray
(`--muted-foreground: #6e6e6e`) because the spec's `#8a8a8a` falls below the
axe 4.5:1 gate at small sizes and survives only as `--muted-faint` for
large/decorative text. Type is a single self-hosted OFL Inter variable face
for everything — no remote font or asset request is required. Body copy is
15px/1.5 with antialiased rendering. Spacing follows a compact 4px-based
scale, cards use a 12px radius (`--radius-card`) with hairline borders or an
ultra-soft shadow (`--shadow-soft`), controls stay 8px, and `--masonry-gap`
is the shared gallery-gap token (20px narrow, 24px base, 32px very wide).
Focus treatment and reduced-motion behavior are global.

`AppShell` wraps supported locale routes with a skip link, responsive header,
main landmark, and footer. Navigation entries declare route availability in
`frontend/src/config/navigation.ts`; owning phases enable their destinations.
Phase 05 enables Explore, Sections, and the Mobile query shortcut. The
locale-switcher space is reserved but hidden.
The mobile sheet and sign-in explanation dialog are leaf Client Components;
the remaining shell and route content stay Server Components.

Reusable design-system primitives live in `frontend/src/components/` and the
small shadcn set in `frontend/src/components/ui/`. All generated utilities were
normalized to logical properties. The `/[locale]/dev/design-system` catalogue
is development-only and presents component states for visual and axe review;
it is not a product homepage or a sitemap route.

## Phase 04 Masonry and Save

The gallery is a true waterfall grid, not CSS multi-column. `distributeIntoColumns`
in `frontend/src/lib/masonry.ts` is a pure function that appends each item to the
currently shortest column, so an item's placement follows the current column
heights instead of the browser's own balance heuristic. CSS `columns` was
rejected because it fills columns by height first and therefore breaks ranking
order: on a three-column board the first three ranked references can all land in
the same column, which contradicts `docs/product-spec.md` (results are ordered by
relevance). Column count comes from `MASONRY_BREAKPOINTS` (1440/1024/768/0 →
4/3/2/1); the count is a viewport fact the server cannot know, so `MasonryGrid`
reads it with `useSyncExternalStore` against a constant one-column server
snapshot, which keeps hydration warning-free and recomputes on resize. Column
placement uses a height estimate derived from each asset's declared
`width`/`height` plus a footer allowance, and every card reserves its space with
`aspect-ratio`, so images loading in never shift the layout. `eagerRows` marks the
ranked rows that are painted above the fold as eager for `next/image` (the dev
gallery uses three, Explore the default one); every other image stays lazy. The
mock assets are SVGs, for which Next's default loader already sets `unoptimized`,
so no manual flag is needed. `direction: "rtl"` reverses column array order only —
image content is never mirrored — and RTL stays disabled in the UI until Phase 11.

Saving is deliberately thin and server-shaped. `SaveService` is the interface
(`frontend/src/lib/save-service.ts`); `MockSaveService` implements it over
localStorage and resolves the saved id set, treating missing or corrupt storage as
empty. `frontend/src/lib/saved-store.ts` is the module-level store that the
`useSaved` hook subscribes to with `useSyncExternalStore`; a save flips the card
optimistically, then the service result is authoritative (a mismatched result
wins and is rolled back to, and `saved`/`unsaved` analytics fire only after the
service settles). Until real accounts arrive in Phase 08 every visitor is an
anonymous owner of their own browser-local saves.

`/[locale]/dev/gallery` renders the full mock dataset in the grid and is
development-only: it calls `notFound()` when `NODE_ENV` is `production`. Its
loading skeleton is an in-page Suspense fallback rather than a route-level
`loading.tsx`, because a route-level boundary wraps the whole page and flushes a
`200` shell before the guard runs, which would leave the dev route reachable in a
production build.

## Phase 05 Explore

The localized `/[locale]/explore` page parses and serializes canonical filter
state through `frontend/src/lib/explore-state.ts`. Its first result page is
server-rendered from `mockSearchService.search()`; the same service is exposed
to client filter/history/pagination interactions by the read-only
`frontend/src/app/api/explore/route.ts` handler. `query-engine.ts` remains the
single owner of filtering, sorting, facets, and cursors. Result presentation
maps sections to local crop assets and renders them through the Phase 04
`MasonryGrid`, so the ranked order of the result page is preserved in the
columns. Filter definitions and labels are derived from the shared
taxonomy; the mobile filter sheet applies draft state, and browser history
restores state from the URL. Explore, Sections, and the Mobile query shortcut
are now enabled in navigation.

Explore's controls are a persistent sidebar rather than a page-header plus a
horizontal bar (scoped correction, `bug-fix.md` BUG-006). `explore-sidebar.tsx`
owns the whole control surface: a Discover section for the reference types this
app actually has (Website, Sections, Mobile), an always-open Industry list, and
one collapsible group per remaining filter. Each entry shows the live count from
the facets the current result set already returns, and "All" shows the filtered
total, so no extra request is needed to render the counts. Groups that carry an
applied value render expanded, so a filter restored from the URL is never hidden
behind a collapsed heading. `explore-filters.tsx` is only the responsive
container: `ExploreFilters` mounts the same sidebar in a sticky desktop column at
`lg` and above, and `ExploreFilterSheet` mounts it unchanged inside the existing
bottom Sheet below `lg`, keeping the draft/apply step. Sort and the result count
stay in the results toolbar because they order results rather than filter them,
and the masonry grid, URL state serializer, chips, and SearchService are
untouched by the correction. The page keeps a visually hidden `h1` so removing
the visible "Explore references" header does not cost the document its top-level
heading. The Discover "Website" entry is the Sources index destination, which
Phase 07 now exposes as a live Sources-index link; its current route and badge
behavior are preserved. The SearchOverlay remains Phase 06; this correction
removes only the duplicate compact header icon.

## Phase 07b SectionCard and Explore correction

Only `SectionCard` receives the Phase 07b redesign. Its source monogram links to
the Source detail route; its image and slim Section Type/source caption share a
single card-body link; Save and image-only Quick View are absolute overlays, so
they do not affect card height. PageCard and SourceCard markup and click
behavior remain unchanged.

The Explore layout uses existing spacing tokens for a tighter outer gutter and
a narrower desktop sidebar. Its `MasonryGrid` call, `distributeIntoColumns`,
height estimator, result ranking, and responsive breakpoints are unchanged.
The Explore-local `@modal` slot intercepts section links only during soft
navigation from Explore and reuses the same `SectionDetail` as the standalone
route. Adjacent results come from the current Explore query through
`mockSearchService.search()`. Cold/direct section URLs remain standalone; Quick
View is an independent image-only dialog. No taxonomy dimensions were added.

## Figma / recent.design reimagining (WS1–WS7)

The Explore feed, header, cards, and Sources landing follow the Figma
`ntspire` file (screens Desktop 1–3, Sidebar frame, Button/Avatar/Logo
components) and recent.design feed behavior, within the phase guards below.

### Extended taxonomy dimensions

Beyond Section Type, Industry, and Style, the taxonomy now carries
**Typography** (`TYPOGRAPHIES`: serif/sans/mono/display), **Color** (`COLORS`:
neutral/blue/green/violet/orange/rose/monochrome), **Stack** (`STACKS`:
react/nextjs/tailwind/vue/svelte/webflow/wordpress/framer), and **Format**
(`FORMATS`: section/og-image). Industries grew to 16 (retail, transport,
entertainment, technology added; "Food & Drink" and "Travel & Tourism" are
aliases of food/travel).

Sections carry required `typographyId`, `colorId`, `stackId`, `formatId`.
Typography/color derive deterministically from style
(`TYPOGRAPHY_BY_STYLE`, `COLOR_BY_STYLE` in fixtures, like `SECTION_HEIGHTS`);
stack derives per source (`STACK_BY_SOURCE`); heroes are `og-image` format.
Facets, filters, URL params (`typography`, `color`, `stack`, `format`),
search inference (ranked after the original dimensions, so existing
resolutions never change), suggestions, overlay detected filters, the sidebar,
and the categories index all read the same config. The pill row and every chip
render only when live facets show data behind them (spec §14.2 rule holds).

### Header

Borderless D2-style shell: exported Figma logo SVG (`public/brand/`,
`Wordmark` renders it with `priority`), Browse/Resources nav groups
(`BROWSE_NAV`, `RESOURCE_NAV` in `navigation.ts` — only real, available
routes), a centered search pill (`HeaderSearchPill`, client leaf) opening the
Phase 06 overlay in controlled mode and owning the `/` + ⌘K shortcuts, and
icon actions (compact search on mobile, avatar `SignInDialog`, mobile menu).
The Figma `+`/bookmark actions are deferred: no submission/collections routes
exist behind them, and the header never links to a dead end.

### Cards and buttons

The icon-button primitive (`overlay` variant + `icon-overlay` size) matches
the Figma Button component: 32px box, 10px radius, translucent card fill,
hairline border, 16px lucide icon. Card overlays (Save, Quick View) and header
icon actions use it. SectionCard keeps its 07b structure minus the caption
(top-left source monogram per the Figma geometry, hover/touch overlays with
Save + Open); the caption was removed so cards are image-only.

### Explore feed and Sources landing

Explore's content column carries a horizontally scrollable quick-pill row
(`ExploreQuickPills`, curated in `EXPLORE_QUICK_PILLS`, facet-gated, same
toggle contract as the sidebar) above the existing chips, count, sort pill,
and `MasonryGrid` — ranking, placement, and breakpoints unchanged. The sidebar
matches the Figma Sidebar frame: Discover and every filter render as plain
text rows (no pills), counts are zero-padded figures with natural-number
accessible names, the desktop column is 280px, and the frame's bottom sponsor
block (mailto pills + copyright) closes the sidebar itself rather than a
separate slot beside it. The Sources index opens with the D3 hero panel
(`HeroPanel`, condensed display type) followed by sources, a sponsor slot, and
a static jobs teaser (local rows, mailto actions only — no hiring backend).

### Brand type

Display type is the same self-hosted OFL Inter variable
(`public/fonts/`, `--font-body` → `font-sans` utility) as everything else: one
family across body, headings, hero, and wordmark-adjacent text, in the
recent.design gallery spirit. The trial brand fonts (Greed, Exposure) and the
earlier Oswald/serif display faces cannot ship. No remote font or asset request exists.

## HeroUI adoption (pilot + expand)

`@heroui/react@3.2.6` (v3 line: Tailwind-v4/React-19 rewrite) is installed with
per-component CSS imports only — never the full bundle. The shared token
bridge (`themes/shared/theme.css` + utilities) plus the default variables feed
HeroUI semantics; our unlayered `:root` tokens win every collision, so the
brand palette and radius scale stay authoritative, with explicit bridges for
`--surface/--overlay` (→ card/popover) and `--field-radius` (→ 8px). One known
collision is fenced, not renamed: HeroUI reads `--muted` as secondary *text*
while ours is a surface tint, so `.tabs__tab` re-points it at
`--muted-foreground` in that scope.

Swapped: FilterChip→Chip, ui/skeleton→Skeleton, Sheets→Drawer (compound
Root/Trigger/Content/Dialog/Header/Body/Footer, placements right/bottom),
Badge, Input (search combobox internals untouched), Tabs, Select (both demo
only), Tooltip reverted (HeroUI forces a nesting wrapper). Kept custom:
Button (cva variants incl. Figma `overlay` spec + Radix `asChild` SPA links),
Breadcrumb (SPA links), Toggle/ToggleGroup (`radiogroup` contract),
SaveButton logic, masonry, search-overlay internals, sonner. Rule: a HeroUI
primitive must preserve the asserted aria/i18n/routing contract or it stays
out (BUG-017 trigger-less Root, BUG-018 badge placement, BUG-019
breadcrumbs/tooltip/tabs-muted). Every drawer Root owns a `Drawer.Trigger`.

## Future Integration Boundary

The frontend must be replaceable from:

Mock Services → API Services

without rewriting the main UI.

## Quality gates

Every phase runs, from `frontend/`, `typecheck`, `lint`, `test`, `build`, and `test:e2e`. The Playwright clean-run fixture treats console errors/warnings, page errors, failed requests, and HTTP errors as failures, with the sole exception of per-test declared expectations via `expectResponse({ path, status })` (exact path and exact status, scoped to the test, which fails the test if the declared response does not occur). No wildcard or global allowlists. A guard test prevents physical directional CSS utilities from entering source files.
