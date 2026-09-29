You are the primary implementation agent for the frontend of this project.

PROJECT NAME: **ntspire**

Your job is to build the frontend MVP described in the project specification, using MOCK DATA ONLY.

IMPORTANT:

* Do NOT build the backend.
* Do NOT create ASP.NET Core code.
* Do NOT create PostgreSQL/EF Core code.
* Do NOT create Redis.
* Do NOT create object storage.
* Do NOT create background workers.
* Do NOT create the Figma plugin.
* Do NOT create real authentication providers.
* Do NOT call external APIs.
* Do NOT connect to a real database.
* Do NOT introduce unnecessary infrastructure.
* Everything in this phase must run locally as a frontend application with deterministic mock data.

The project specification is the source of truth:

**`docs/product-spec.md` — PROJECT MASTER SPECIFICATION v1.3**

This file already exists at the repository root under `docs/`. Read it completely,
end to end, before writing any code. Do not create a second copy of it, and do not
rely on a summarized/remembered version of it — read the actual file.

**Repository layout (already partially scaffolded):**

```
ntspire/
 ├── docs/
 │    ├── product-spec.md
 │    └── frontend-task-prompt.md   (this file)
 ├── frontend/          ← create the entire Next.js app here
 ├── backend/           ← already exists as an empty placeholder; DO NOT touch it
 ├── ARCHITECTURE.md
 ├── NEXT_STEPS.md
 ├── bug-fix.md
 ├── feature-add.md
 ├── refactor.md
 ├── system-review.md
 └── README.md
```

Every path mentioned later in this prompt as `src/app`, `src/components`, etc. is
relative to `frontend/` — i.e. `src/app` means `frontend/src/app`. Do not put the
Next.js app at the repository root; it must live entirely under `frontend/`. The
root-level `ARCHITECTURE.md`, `NEXT_STEPS.md`, `bug-fix.md`, `feature-add.md`,
`refactor.md`, and `system-review.md` already exist with a starting structure —
read and update them in place rather than recreating them from scratch.

The product is a bilingual visual design inspiration/reference platform, branded
**ntspire**, for:

* Designers
* Frontend developers
* Full-stack developers
* Product designers
* Creative teams

The product is inspired by product patterns from Land-book, Iksho, and Shadcnblocks, but the implementation must have its own:

* visual identity
* UX
* information architecture
* copy
* components
* content structure

Do NOT clone another website. Do NOT use "Land-book", "Iksho", or "Shadcnblocks" as
the product name anywhere in code, copy, metadata, or config — the product is
**ntspire** (package.json `name`, page `<title>`/metadata, footer copyright, README,
etc. must all say ntspire).

==================================================
1. CURRENT IMPLEMENTATION SCOPE
   ==================================================

Implement ONLY the frontend experience for the first MVP stage.

Focus on:

1. Design system
2. Responsive layout
3. Homepage
4. Explore page
5. Search overlay
6. Search-to-filter inference
7. Masonry/waterfall gallery
8. Section cards
9. Page/source reference cards
10. Section detail page
11. Source details
12. Page details
13. Desktop/mobile reference switching
14. View in Context experience
15. Filters
16. Save interaction
17. Mock collections
18. Save as Image mock/local behavior
19. Arabic / English
20. RTL / LTR
21. Loading states
22. Empty states
23. Error states
24. Responsive behavior
25. Accessibility basics
26. SEO basics for public pages
27. Mock analytics/event abstraction
28. Strong frontend architecture
29. Tests
30. Documentation

Do NOT implement future backend-dependent capabilities yet.

==================================================
2. IMPORTANT PRODUCT MODEL
==========================

The core hierarchy is:

Source
├── Pages / Screens
│    └── Sections
│         └── SectionCrop
│              ├── Desktop
│              └── Mobile
└── Attribution / metadata

A Section is NOT a React component.

A Section is:

A SCREENSHOT / CROPPED VISUAL REFERENCE.

Do not model a Section as HTML/CSS code or editable design layers.

The frontend mock must preserve the same conceptual model that the future backend will use.

The mock domain should therefore contain entities conceptually similar to:

* Source
* Page
* Section
* SectionCrop
* Asset
* Tag
* Category
* Collection
* CollectionItem
* Save
* SearchResult

Do not create fake backend DTO layers everywhere.

Instead, create a clean frontend domain/model structure that can later be mapped to API responses.

**Taxonomy discipline (spec Section 15/16/17 + Agent Rule 20):** Section Types,
Industries, and Styles used anywhere in mock data, filters, or search quick-filter
chips must come from one single shared taxonomy config (see Section 8 below). Never
introduce a chip, filter, or mock tag value (e.g. a stray "location" or "brand"
chip) that has no corresponding entry in that taxonomy — if a new concept is
genuinely needed, add it to the taxonomy config first, then use it everywhere
consistently.

==================================================
3. TECH STACK
=============

Use:

* Next.js
* App Router
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Next.js Server Components by default
* Client Components only where interaction/browser APIs/local state require them

Use a modern, maintainable setup.

Prefer:

* strict TypeScript
* reusable components
* composable UI primitives
* clear separation of domain/mock/UI concerns
* no giant components
* no random styling duplication
* no unnecessary abstractions

Use strong TypeScript settings.

Avoid `any` unless absolutely unavoidable.

**Package/repo name:** set `package.json` `"name"` to `ntspire` (or `ntspire-frontend`
if this repo will later sit alongside a separate backend repo).

==================================================
4. FRONTEND ARCHITECTURE
========================

Create a clean frontend architecture approximately like:

src/
app/
components/
features/
lib/
mocks/
types/
hooks/
config/
styles/

You may improve the exact folder structure if you have a strong reason.

But maintain these responsibilities:

`app/`

* routing
* layouts
* pages
* metadata
* locale handling

`components/`

* reusable UI components
* shared design system components

`features/`

* feature-level components and logic
* search
* explore
* sections
* collections
* source/page details

`mocks/`

* deterministic mock data
* mock services
* fixtures

`types/`

* domain/frontend types where appropriate

`lib/`

* utilities
* search parsing
* filtering
* local persistence helpers
* common services

`config/`

* the single shared taxonomy config (Section Types, Industries, Styles, Arabic
  search-alias tables) — the one source every filter/chip/mock-data reference
  must import from, per the taxonomy discipline rule in Section 2.

Do not place everything in one folder.

Do not create a huge generic "utils" file containing unrelated logic.

==================================================
5. MOCK-FIRST ARCHITECTURE
==========================

The application must behave like a real product even though no backend exists.

Create a mock data/service layer.

Example concept:

MockSectionService
MockSearchService
MockCollectionService
MockSourceService
MockPageService

The UI should consume these services instead of directly importing random fixture arrays into every component.

For example:

UI
↓
feature/service interface
↓
mock implementation
↓
mock fixtures

This is important because later we should be able to replace:

MockSearchService

with:

ApiSearchService

without rewriting the UI.

Do NOT create a full backend-style repository architecture in the frontend.

Keep it lightweight.

==================================================
6. MOCK DATA
============

Create realistic deterministic mock data.

Do NOT use meaningless placeholders like:

"Lorem ipsum"
"Test Website 1"
"Image 1"
"Section 1"

The data should feel like a real design inspiration product.

Create enough data to properly test:

* masonry behavior
* filtering
* search
* Arabic content
* RTL
* desktop/mobile switching
* related sections
* collections
* different image heights
* different section types
* different industries
* different styles

The dataset should contain:

At least:

* 8–12 Sources
* 12–20 Pages
* 30–50 Sections
* mixed desktop/mobile variants
* Arabic references
* English references
* RTL references
* LTR references
* different industries
* different styles
* different section types

Do not use the same image dimensions for every record.

The mock data must intentionally contain different aspect ratios so the masonry layout can be visually validated.

Example:

Navbar → short
Hero → medium
Features → tall
Pricing → tall
Footer → short

This is critical.

**Related/Similar Sections must use the deterministic rule from spec Section 19**,
not a random or invented one:

```
Similar Sections =
  same sectionType
  AND (shared industry OR shared style)
  ORDER BY (count of shared tags) DESC
  LIMIT 6
```

Implement this as a plain function over the mock dataset (e.g. `getSimilarSections()`
in the mock Section service), so it can later be swapped for a real query behind the
same interface without changing the UI.

==================================================
7. IMAGE STRATEGY
=================

**Generate mock images locally and deterministically — do not hotlink to any
external image host (no Unsplash, Picsum, placeholder.com, etc.).** A build/test run
must succeed with zero network access. Acceptable approaches:

* Programmatically generated SVG placeholders (per Section: a labeled rectangle at
  the mock's declared width/height, colored by section type or industry so the
  gallery still looks varied and readable), stored or generated under
  `public/mock-assets/` or produced at build time from the fixture data.
* A small set of real local static images (checked into the repo) sized to match
  the varied aspect ratios described in Section 6, if you prefer visual realism
  over generated placeholders.

Either way, every mock Asset/SectionCrop's `width`/`height` must match the actual
image file's real dimensions — do not declare a ratio that the image itself doesn't
have, since the masonry layout (Section 13) depends on this being accurate.

Every mock Asset / SectionCrop must expose known dimensions:

width
height

because the real system depends on aspect ratio information.

Example conceptual shape:

SectionCrop {
id
sectionId
device: "desktop" | "mobile"
assetId
width
height
cropX
cropY
cropWidth
cropHeight
renderedAssetId
}

For the frontend mock, the crop coordinates can be informational/mock data.

==================================================
8. DESIGN SYSTEM
================

Build a real reusable design system before building all pages.

Define reusable:

* typography
* spacing
* radii
* buttons
* inputs
* badges
* dialogs
* sheets
* dropdowns
* tabs
* command/search UI
* cards
* breadcrumbs
* filters
* chips
* tooltips
* skeletons
* empty states
* error states

Avoid page-specific styling whenever the same visual pattern can become a reusable component.

Do not over-componentize trivial one-line markup.

==================================================
9. PRODUCT VISUAL DIRECTION
===========================

The visual direction must be:

* editorial
* visual
* clean
* fast
* image-first
* high information density
* modern
* premium
* not noisy
* not a generic SaaS dashboard

The homepage is primarily a discovery/research experience.

Do NOT make the homepage look like:

* a generic startup landing page
* a dashboard
* a template marketplace clone

The UI should feel like a curated design reference library, branded as **ntspire**.

==================================================
10. HOMEPAGE
============

Implement:

Navbar
Hero + Search
Featured Sections
Browse by Section Type
Browse by Industry
Arabic / RTL Inspiration
Latest Additions
Featured Collections
Footer

The search experience is one of the most important parts of the homepage.

The homepage should immediately communicate:

"This is a visual reference library where I can quickly find useful real-world UI patterns."

Use realistic mock content.

==================================================
11. NAVIGATION
==============

Desktop navigation should include:

* Explore
* Websites
* Pages
* Sections
* Mobile
* Categories
* Search

User area:

* Sign in
* Collections
* Profile

Locale:

* EN
* AR

Mobile navigation must collapse into a proper menu/sheet.

Do not make mobile navigation a desktop navbar squeezed into a smaller viewport.

==================================================
12. EXPLORE PAGE
================

Implement:

* search
* filters
* sorting
* result count
* gallery
* pagination/load more behavior
* loading state
* empty state
* error state

Initial filters:

* Section Type
* Industry
* Style
* Language
* Direction
* Device
* Theme

Do not invent dozens of filters.

The taxonomy should be data-driven from the shared taxonomy config described in
Section 4 (`config/`) — not redefined ad hoc per page.

==================================================
13. MASONRY / WATERFALL GALLERY
===============================

THIS IS A CRITICAL REQUIREMENT.

Do NOT implement the gallery as a normal uniform CSS grid.

The gallery must behave like a real masonry/waterfall layout.

Requirements:

* responsive columns
* flexible card width
* natural image height
* no forced equal row heights
* no unnecessary image cropping
* no blank space caused by neighboring cards
* shorter cards remain short
* taller cards remain tall
* next card moves immediately into available vertical space
* standard design-system gap between cards
* responsive column count
* RTL column order must reverse correctly
* image content itself must NEVER be mirrored

Example:

Column A:
Tall Hero
Short Navbar
Medium CTA

Column B:
Short Stats
Tall Pricing
Short Footer

The next item must be positioned based on actual column height.

Do not use plain:

flex-wrap

to fake the behavior.

Use a real masonry approach.

Possible approaches:

* CSS Grid with row spans
* CSS columns if validated carefully
* a maintained masonry library
* measured column placement

Choose the simplest reliable approach.

Important:

The card width must follow the responsive column.

Do NOT create a fixed width like:

320px

and keep it fixed.

The image should render using its natural ratio:

height = width / aspectRatio

Use the known width/height metadata.

Avoid:

object-cover

for normal gallery cards.

Avoid:

fixed-height card containers.

Do not create blank space to align rows.

This same rule applies to:

* Section cards
* Page cards
* Website/reference cards

==================================================
14. SECTION CARD
================

A Section Card should include:

* screenshot
* section type
* source name
* selected tags
* language
* device availability
* save action
* open action

Desktop:

* hover actions can appear as overlay

Mobile/touch:

* actions must remain usable without hover

The metadata footer should naturally follow the image.

The card height must be determined by its actual image ratio and metadata.

Never make all cards the same height just to make the grid visually uniform.

==================================================
15. SEARCH OVERLAY
==================

Search is a major product feature.

Clicking the search bar/icon must open a full-screen search overlay / command-palette style UI.

Do NOT navigate to a blank search page just to start searching.

The overlay should contain:

* focused search input
* quick filter chips
* search suggestions
* result categories
* useful filters
* device/context toggle
* clear/close controls

Search input placeholder:

"Sites, Categories, Sections or Styles…"

Support:

* typing
* keyboard navigation
* Enter to search
* Escape to close
* click outside to close
* focus restoration

==================================================
16. SEARCH FILTER INFERENCE
===========================

The search input must understand known taxonomy values.

Example:

"Arabic SaaS Hero"

should detect:

Language = Arabic
Industry = SaaS
Section Type = Hero

Example:

"RTL fintech pricing mobile"

should detect:

Direction = RTL
Industry = Fintech
Section Type = Pricing
Device = Mobile

Example:

"Dark ecommerce navbar"

should detect:

Style = Dark
Industry = E-commerce
Section Type = Navbar

Detected filters should appear as removable chips.

Important:

Removing a detected chip must NOT erase the original query text.

Unknown words remain part of the free-text query.

The detection should be:

* deterministic
* taxonomy-driven
* predictable
* local

Do NOT use an LLM for this.

Create a reusable parser/service such as:

parseSearchQuery()

or equivalent.

It should support important Arabic equivalents too.

Examples:

Arabic
عربي
العربية

→ language = ar

RTL
يمين لليسار
اتجاه يمين لليسار

→ direction = rtl

The exact Arabic aliases should be organized in configuration/data (the shared
`config/` taxonomy from Section 4) rather than hardcoded randomly inside components.

==================================================
17. ARABIC WEBSITES
===================

There must be a permanent first-class quick filter:

"Arabic Websites"

This maps to:

language = ar

It is NOT a new database field.

It is a shortcut on top of the existing language filter.

It must work for both:

* RTL Arabic content
* LTR Arabic content

The UI should make discovering Arabic references easy.

==================================================
18. SEARCH SUGGESTIONS
======================

While typing, show useful suggestions such as:

* Categories
* Section Types
* Styles
* Sources/Websites
* Detected Filters
* Recent/Trending searches
* Result counts where practical

Do not make the overlay noisy.

Prioritize useful, actionable suggestions.

Clicking a suggestion should transform it into structured search/filter state.

==================================================
19. SEARCH RESULT URL
=====================

When search is submitted, navigate to Explore.

Preserve:

* original query
* active quick filters
* detected filters
* device context

The URL/query state must be shareable/bookmarkable.

Since the backend does not exist yet, implement this entirely on the frontend.

==================================================
20. SECTION DETAIL PAGE
=======================

Build a polished Section Detail page.

Include:

* breadcrumb
* large screenshot
* desktop/mobile switcher
* title
* section type
* source
* parent page
* language
* direction
* device availability
* industry
* style
* tags
* capture date
* attribution

Actions:

* Save
* Save as Image
* Send to Figma
* View in Context

Related sections (use the deterministic `getSimilarSections()` rule from Section 6 —
never an ad hoc or random selection).

Important:

In this frontend-only phase:

"Send to Figma"

should be a realistic mock interaction only.

Do not build the actual Figma plugin.

For example:

* show a toast
* show a dialog explaining that Figma integration is coming
* or simulate the action in the mock environment

Do not pretend a real Figma integration exists.

==================================================
21. VIEW IN CONTEXT
===================

The user should be able to understand where the selected section belongs in the source page.

The experience should visually maintain:

Section
→ Page
→ Source

When the user switches:

Desktop
Mobile

the matching SectionCrop must be displayed.

Do NOT reuse desktop crop coordinates for mobile.

==================================================
22. PAGE / SOURCE DETAILS
=========================

Build polished reference detail experiences for:

* Source
* Page
* Section

Keep the hierarchy obvious.

A user should always be able to navigate:

Source → Page → Section

and:

Section → Page → Source

Do not lose context.

==================================================
23. SAVE + COLLECTIONS
======================

Because there is no backend:

implement local mock persistence.

Use localStorage where useful.

The behavior should simulate:

* save
* unsave
* create collection
* add/remove section from collection

Save should behave idempotently.

The UI should update optimistically.

But keep the service abstraction ready for a future real API.

==================================================
24. SAVE AS IMAGE
=================

For the frontend mock:

implement a real browser download when possible.

Use the selected device-specific rendered image.

For a mock/local asset:

* download the appropriate image
* use a sensible filename

This should not depend on backend storage.

==================================================
25. RESPONSIVE DESIGN
=====================

The entire application must support:

* Desktop
* Tablet
* Mobile

At mobile:

* navigation collapses
* filters use a sheet/drawer
* actions remain touch-friendly
* no hover-only behavior
* gallery becomes 1–2 columns
* details remain readable
* images remain proportional
* search overlay works correctly

Do not simply shrink desktop UI.

Actually design the mobile experience.

==================================================
26. ARABIC + RTL
================

Arabic and RTL are first-class requirements.

Implement:

* `/en`
* `/ar`

or an equivalent locale architecture.

The same UI must support:

English + LTR
Arabic + RTL

Important:

RTL should affect:

* layout
* navigation
* alignment
* spacing where appropriate
* text flow
* controls
* masonry column order

RTL must NOT mirror:

* screenshots
* reference images
* logos inside screenshots
* image content

For masonry:

Arabic mode means the first visual column is the rightmost column.

==================================================
27. ACCESSIBILITY
=================

Implement:

* semantic HTML
* keyboard navigation
* visible focus
* accessible dialogs
* accessible filters
* labels
* alt text
* sensible heading hierarchy
* sufficient contrast
* touch-friendly controls
* Escape behavior
* reduced-motion consideration

Do not rely on hover only.

==================================================
28. SEO
=======

Implement basic frontend SEO for public pages.

Use Next.js metadata.

Include where appropriate:

* title
* description
* canonical
* Open Graph
* locale metadata
* sitemap
* robots

Public pages that make sense to index:

* homepage
* categories
* source pages
* page references
* section detail pages

Do not over-engineer SEO in this mock phase.

==================================================
29. MOCK ANALYTICS
==================

Create a small frontend analytics abstraction.

Examples:

trackEvent("search_performed")
trackEvent("section_viewed")
trackEvent("saved")
trackEvent("unsaved")
trackEvent("collection_created")
trackEvent("image_downloaded")
trackEvent("figma_clicked")
trackEvent("source_opened")
trackEvent("mobile_viewed")
trackEvent("desktop_viewed")

For now this can log locally or use a mock implementation.

Do not connect to a real analytics provider.

==================================================
30. STATE MANAGEMENT
====================

Do not introduce Redux or another large state library unless there is a concrete need.

Prefer:

* URL state
* React state
* context only where justified
* localStorage for mock persistence
* server/client boundaries appropriately

Search/filter state should be represented cleanly.

Do not create giant global state objects.

==================================================
31. TESTING
===========

Testing is REQUIRED.

Do not just write the UI and stop.

At minimum test:

1. Search query parsing
2. Search filter inference
3. Arabic search aliases
4. Arabic Websites shortcut
5. Filter combinations
6. Masonry/card data behavior
7. Save / unsave behavior
8. Collection behavior
9. Device switching
10. URL query state
11. Responsive-critical interaction behavior
12. Key accessibility behavior
13. Important component rendering states
14. `getSimilarSections()` deterministic ranking rule

Use a suitable frontend test setup.

Prefer:

* Vitest
* Testing Library

If browser smoke testing is practical in the existing environment, add a small Playwright smoke suite for the main user flow.

==================================================
32. MAIN USER FLOW TEST
=======================

The most important flow is:

Open Home
→ Search
→ detect filters
→ Explore results
→ open Section
→ switch desktop/mobile
→ Save
→ Add to collection
→ Download image
→ go back to Explore
→ filter again

This flow must work end-to-end in the frontend mock environment.

==================================================
33. LOADING / EMPTY / ERROR STATES
==================================

Every important async-like mocked operation should have realistic UI states.

Implement:

* loading
* empty
* error
* success

Even though the application is local/mock, the UI should be structured as if real data loading is happening.

Use controlled mock delays only where useful for testing UX.

Do not make the app feel artificially slow everywhere.

==================================================
34. CODE QUALITY
================

Follow these rules:

* strict TypeScript
* no unnecessary `any`
* no duplicated business logic
* no duplicated taxonomy definitions
* no huge component files
* no random magic strings
* no random magic numbers
* no inline business logic spread throughout JSX
* reusable components
* descriptive names
* predictable file structure
* clean imports
* no dead code
* no unused components
* no fake abstraction layers

Prefer simple code over clever code.

==================================================
35. IMPORTANT: DO NOT OVER-IMPLEMENT
====================================

Do NOT implement:

* ASP.NET backend
* database
* API routes that pretend to be the backend
* Prisma
* EF Core
* PostgreSQL
* Redis
* authentication provider
* real admin backend
* real URL submission capture
* screenshot crawling
* SSRF protection
* object storage
* CDN integration
* real Figma integration
* billing
* AI search
* embeddings
* recommendation ML
* browser extension
* marketplace
* teams/workspaces
* microservices

Those belong to later phases.

If a future capability appears in the specification but is outside the current frontend mock scope, represent it only through a clean mock UI where appropriate.

==================================================
36. DOCUMENTATION
=================

Create and maintain these files at the repository root:

ARCHITECTURE.md
NEXT_STEPS.md
bug-fix.md
feature-add.md
refactor.md
system-review.md

Also use `docs/product-spec.md` (the existing project specification, v1.3) as the
product source of truth.

Do NOT create multiple conflicting copies of the product specification.

==================================================
37. ARCHITECTURE.md
===================

Document:

* frontend architecture
* folder structure
* component boundaries
* mock service layer
* domain models
* search architecture
* localization architecture
* RTL strategy
* state management approach
* image strategy (incl. why images are generated/stored locally, no external hosts)
* testing strategy
* future API replacement strategy
* Server vs Client Component rules
* important architectural decisions
* decisions intentionally postponed

Make it practical, not academic.

==================================================
38. NEXT_STEPS.md
=================

Document the next recommended implementation phases after the frontend mock.

Example direction:

1. frontend polish
2. backend domain
3. database
4. API
5. real frontend API integration
6. content/admin pipeline
7. image pipeline
8. Arabic/SEO hardening
9. performance/security
10. Figma plugin
11. production hardening

Keep the file current as implementation progresses.

==================================================
39. bug-fix.md
==============

This file is for discovered bugs.

Use a structured format such as:

## Bug

* ID
* Date
* Area
* Severity
* Description
* Reproduction
* Root cause
* Fix
* Tests
* Status

Do not write fake bugs just to populate the document.

Start with a template and record real issues discovered during implementation/testing.

==================================================
40. feature-add.md
==================

Track new feature requests.

For each feature:

* Feature
* Reason
* Scope
* Dependencies
* UX impact
* Technical impact
* Status

Do not add speculative features automatically.

==================================================
41. refactor.md
===============

Track technical refactoring opportunities.

Include:

* issue
* current implementation
* why refactor may be needed
* proposed direction
* risk
* status

Do not refactor working code without a reason.

==================================================
42. system-review.md
====================

Perform a system review after the main implementation.

Review:

* architecture
* folder organization
* component reuse
* TypeScript quality
* responsive behavior
* accessibility
* RTL
* search
* masonry
* performance
* test quality
* SEO
* duplication
* dead code
* maintainability

Separate findings into:

Critical
Important
Nice to Have

Do not randomly rewrite the application just because a review was performed.

==================================================
43. DEVELOPMENT WORKFLOW
========================

Before coding:

1. Inspect the repository.
2. Read `docs/product-spec.md` (the project specification) completely.
3. Inspect existing frontend files.
4. Determine whether a frontend already exists.
5. Reuse good existing work where possible.
6. Do not overwrite useful code blindly.

Then:

1. Establish the frontend foundation.
2. Establish design system.
3. Build domain/mock models + shared taxonomy config.
4. Build mock services.
5. Build homepage.
6. Build Explore.
7. Build search overlay.
8. Build masonry gallery.
9. Build detail pages.
10. Add Save/Collections.
11. Add Arabic/RTL.
12. Add responsive behavior.
13. Add SEO.
14. Add tests.
15. Run full validation.
16. Review architecture.
17. Update documentation.

Do NOT jump randomly between unrelated features.

==================================================
44. PHASE CONTROL
=================

Do not start backend work.

Do not start future phases.

This implementation is frontend-only.

If you discover something that belongs to the backend:

document it in:
NEXT_STEPS.md

or:

ARCHITECTURE.md

Do not implement it anyway.

==================================================
45. VALIDATION
==============

Before running validation, confirm `package.json` defines all four scripts below;
if `typecheck` is missing (common with a fresh `create-next-app` project), add it
yourself, e.g.:

```json
"scripts": {
  "typecheck": "tsc --noEmit",
  "lint": "next lint",
  "test": "vitest run",
  "build": "next build"
}
```

When implementation is complete, run EXACTLY:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

All four must be executed.

Do not stop after the first successful command.

If any command fails:

1. Investigate the actual root cause.
2. Fix it.
3. Re-run the failed command.
4. Continue until the complete validation sequence succeeds.

Do not hide errors.

Do not silence TypeScript errors just to pass the build.

Do not disable lint rules globally just to make lint pass.

Do not weaken tests just to make them pass.

==================================================
46. MANUAL VERIFICATION
=======================

After automated validation, manually verify the main UI.

Check:

Home
Explore
Search overlay
Search inference
Arabic Websites
Filters
Masonry behavior
Section detail
Device switching
View in Context
Save
Collections
Download
Arabic
RTL
Mobile navigation
Responsive gallery
Empty states
Loading states
Error states

Pay special attention to:

1. Masonry:

   * different image heights
   * no blank row gaps
   * responsive columns
   * correct RTL ordering

2. Search:

   * natural language
   * detected filters
   * Arabic terms
   * removable chips
   * Enter navigation
   * Escape close

3. Section:

   * desktop crop
   * mobile crop
   * context
   * source/page relationships
   * similar sections use the deterministic rule, not random picks

4. Mobile:

   * no hover dependency
   * usable actions
   * readable details
   * usable filter sheet

==================================================
47. DEFINITION OF DONE FOR THIS TASK
====================================

The frontend mock implementation is considered complete only when:

* the app runs locally
* main routes work
* the UI matches the product direction and is branded as ntspire
* masonry works correctly
* search overlay works
* search filter inference works
* Arabic Websites works
* Arabic/LTR/RTL works
* section/page/source relationships are represented
* desktop/mobile references work
* save and collections work locally
* image download works
* loading/empty/error states exist
* critical interactions have tests
* all mock images and taxonomy values trace back to the shared config/mock data
  with no external network dependency and no orphan (non-taxonomy) chips
* TypeScript passes
* lint passes
* tests pass
* build passes
* documentation files exist and are updated
* system review is completed
* no backend or unnecessary infrastructure was introduced

==================================================
48. FINAL REPORT
================

At the end, provide a concise implementation report containing:

1. What was implemented
2. Main routes
3. Main components
4. Mock architecture
5. Tests added
6. Validation results
7. Files changed
8. Known limitations
9. Future backend integration points
10. Recommended next step

Also update:

ARCHITECTURE.md
NEXT_STEPS.md
bug-fix.md
feature-add.md
refactor.md
system-review.md

before declaring the task complete.

IMPORTANT FINAL RULE:

Do not claim success unless you actually ran:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

and inspected the results.

Build the frontend as if it will become the real production frontend later.

Keep today's implementation mock-only, but keep tomorrow's backend integration straightforward.
