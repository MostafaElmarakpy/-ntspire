# PROJECT MASTER SPECIFICATION

# Real-World Design Inspiration & UI Reference Platform

> Version: v1.3 — **canonical, single source of truth.** Consolidates v1.1
> (crop-per-device model, submission deduplication, capture status polling,
> legal/copyright review timing, redirect-chain SSRF re-validation,
> similar-sections ranking rule) and v1.2 (flexible masonry sizing, full-screen
> search overlay, search-to-filter inference, explicit Arabic Websites
> shortcut), plus three additional consistency fixes found during final
> review: RTL masonry column order, required aspect-ratio fields, and
> taxonomy alignment for quick-filter chips.
>
> **This file replaces both the older v1.1 markdown copy and the v1.2 plain-text
> copy. Do not keep multiple versions of this document in the repo — Phase 0
> (Section 64) requires the docs to be internally consistent, and two files
> disagreeing on Section 14.1 (fixed-width vs. flexible-width columns) is
> exactly the kind of inconsistency that must be resolved before Phase 0
> closes.**

## 1. PROJECT PURPOSE

We are building a bilingual visual design inspiration and reference platform for designers, frontend developers, full-stack developers, product designers, and creative teams.

The product is inspired by the business/product patterns of:

- Land-book
- Iksho
- Shadcnblocks

IMPORTANT:
We are NOT cloning their branding, proprietary visual identity, copy, code, assets, or exact UI.

We are studying and combining product patterns:

- curated website inspiration
- section-level inspiration
- real UI screen references
- search and filtering
- save/collections
- desktop/mobile reference browsing
- screenshot downloads
- Figma workflow integration

The product must have its own brand, visual identity, information architecture, copy, and UX decisions.

---

# 2. CORE PRODUCT DEFINITION

The core product is:

A searchable and filterable library of real-world website and product UI references.

A Source can represent:

- a website
- a web product
- a mobile application
- another real digital product

A Source contains:

- Pages
- Screens
- Sections

A Section is NOT a React component.

A Section is a SCREENSHOT / CROPPED VISUAL REFERENCE extracted from a Page or Screen.

Example:

Source:
Example SaaS

Page:
Homepage

Sections:

- Navbar
- Hero
- Features
- Testimonials
- Pricing
- FAQ
- Footer

Each Section must maintain a relationship with its parent Page and Source.

---

# 3. CORE USER VALUE

The product solves the problem of spending too much time searching for useful real-world design references.

Users should be able to:

1. Discover inspiration
2. Search
3. Filter
4. Open a reference
5. Understand its context
6. Save it
7. Organize it into collections
8. Download the screenshot
9. Send the screenshot to Figma
10. Return later and continue research

The product should optimize for fast research and practical use, not just visual browsing.

---

# 4. PRIMARY PRODUCT LOOP

Discover → Search → Filter → Open Section → View Context → Save → Download / Figma → Use in project → Return

This loop is more important than secondary features.

---

# 5. CONTENT LOOP

Website/App Source → Capture → Page / Screen → Crop Sections → Assign Metadata → Review → Publish → Searchable Reference

The admin/content editor is responsible for quality.

---

# 6. BILINGUAL PRODUCT

The platform must support English and Arabic, in both LTR and RTL directions.

Arabic must NOT be treated as a simple translated copy of the English UI.

Arabic support must include:

- RTL layout
- Arabic navigation
- Arabic labels
- Arabic categories
- Arabic metadata
- Arabic search support
- Arabic design references
- direction metadata
- locale-aware URLs
- SEO metadata per locale

Initial locales: en, ar. Design the architecture so additional locales can be added later.

Do not hardcode user-facing strings directly inside components.

---

# 7. CONTENT LANGUAGE

language: en | ar
direction: ltr | rtl

A screenshot from an Arabic RTL website should be searchable independently from an English LTR screenshot.

---

# 8. REFERENCE TYPES

Initial content types: Website, Web page, Mobile screen, Web screen, Section, Flow (future/optional).

The primary MVP reference unit is Section = screenshot/crop.

---

# 9. SECTION MODEL _(revised — crop is per-device)_

Every Section must have: id, pageId, sourceId (through Page), title, sectionType, order, language, direction, tags, industry, style, createdAt, publishedAt, source attribution.

**Crop coordinates are per-device, not fields on Section itself.** The same
Section (e.g. "Hero") sits differently on a 1440px desktop screenshot than on
a 375px mobile screenshot, so coordinates are not reusable across devices and
must not live directly on the Section entity.

```
Section
 ├── id
 ├── pageId
 ├── sectionType
 ├── title
 ├── order
 ├── language / direction / industry / style / tags
 └── SectionCrop[]
        ├── id
        ├── sectionId
        ├── device            (desktop | mobile)
        ├── assetId           (the device-specific page screenshot)
        ├── cropX
        ├── cropY
        ├── cropWidth
        ├── cropHeight
        └── renderedAssetId   (the cropped-out screenshot for this device)
```

Rules:

- A Section MUST have at least one `SectionCrop`.
- A Section MAY have both a `desktop` and a `mobile` `SectionCrop`, each with its own coordinates and cropped asset.
- "View in Context" and "Desktop/Mobile" toggles read from the matching `SectionCrop`, not from a single shared coordinate set.
- The default card/detail screenshot is the `desktop` crop when present, falling back to `mobile`.

```
section: Hero
  SectionCrop (desktop) → page: Homepage-Desktop, crop: x,y,w,h
  SectionCrop (mobile)  → page: Homepage-Mobile,  crop: x,y,w,h
```

**Consistency fix — required dimensions:** `Asset` and `SectionCrop` MUST
store `width`/`height` (or equivalent aspect-ratio metadata) as a **required,
non-nullable field set at capture/save time**, not computed at render time.
This is not optional metadata — the masonry grid (Section 14.1) and card
skeletons depend on it to reserve correct space and avoid layout shift. Model
this explicitly as `NOT NULL` in the EF Core configuration during Phase 4
(Section 68).

---

# 10. VIEW IN CONTEXT

The UI must visually indicate which part of the full page/screen is the selected Section, and never lose the relationship between Section → Page → Source.

View in Context must resolve through the `SectionCrop` matching the device currently being viewed (Section 9), so the highlighted region and the underlying page screenshot always belong to the same device variant.

---

# 11. DESKTOP / MOBILE REFERENCE

The website itself must be fully responsive, and reference content should support Desktop/Mobile variants with a toggle. Use a phone-style frame for mobile previews where useful.

IMPORTANT: For MVP this is a screenshot/reference preview. Do NOT depend on live iframe rendering of third-party websites (X-Frame-Options, CSP, and tracking make this unreliable). Use captured screenshots.

---

# 12. HOMEPAGE

Navbar → Hero + Search → Featured Sections → Browse by Section Type → Browse by Industry → Arabic/RTL inspiration → Latest additions → Featured collections → Footer.

The homepage should NOT become a generic SaaS landing page. The primary CTA is discovery/search.

---

# 13. NAVIGATION

Desktop: Explore, Websites, Pages, Sections, Mobile, Categories, Search.
User area: Sign in, Collections, Profile.
Locale: EN / AR.

Mobile navigation must collapse cleanly into a menu/sheet.

---

# 14. EXPLORE PAGE

Required: search, filters, sorting, result count, cards, pagination/load more, loading state, empty state, error state.

Initial filters: Section Type, Industry, Style, Language, Direction, Device, Theme. Do not create dozens of filters before validating usefulness.

## 14.1 Grid Layout — Masonry / Waterfall _(flexible sizing, confirmed from UI mockup)_

The results grid is NOT a uniform-height grid. It is a masonry (waterfall) layout:

- Cards sit in **responsive columns** (e.g. 4 on large desktop, 3 on smaller desktop, 2 on tablet, 1–2 on mobile).
- **Card width is flexible** and follows its column — it must never keep a fixed pixel width when the viewport changes.
- **Image height is flexible**, driven by the asset's natural aspect ratio. A short crop (e.g. Navbar) stays short; a tall crop (e.g. Pricing, full-page capture) stays tall. Never force a uniform height, and never use `object-cover`/fixed-height containers for the normal gallery card.
- If a card is shorter than its neighbor, the next card in that column moves up immediately below it plus the standard gap — this is the defining waterfall behavior. No card waits for a row to "finish."
- Gaps come from design-system tokens, not ad-hoc per-card margins.
- Column count recomputes at each breakpoint and on resize.
- **RTL behavior (consistency fix):** in Arabic/RTL mode, the column order reads right-to-left (the first column is the rightmost one), matching the reading direction — but individual screenshots/images must **never be mirrored** (do not use `scaleX(-1))`. Only column order flips; image content stays exactly as captured.
- Implementation: use a real masonry algorithm that places each card in the currently-shortest column (CSS Grid with computed `grid-row-end`, CSS multi-column with validated accessibility, or a small maintained library like `react-masonry-css`). Plain `flex-wrap` does NOT produce this effect and must not be used.
- Each card reserves space from its known aspect ratio (Section 9's required `width`/`height` on Asset/SectionCrop) before the real image loads, to avoid layout shift.
- Hover actions (Save/Quick View) are overlays and must not affect measured card height. Touch devices need equivalent visible actions since hover doesn't exist there.
- The same flexible-width/flexible-height rule applies to Page/Website reference cards, not just Section cards. The full-resolution asset itself is never modified to fit the grid — only its _display_ is controlled.

## 14.2 Search Overlay _(full-screen, with filter inference)_

Clicking the search bar/icon opens a full-screen overlay/command-palette, not a separate page:

- Input accepts free text ("Sites, Categories, Sections or Styles…"), opens focused, supports Esc to close and Enter to search.
- A row of quick-filter chips sits under the input (content-type and attribute shortcuts). Chips are clickable filters, not decorative labels.
  - **Taxonomy alignment (consistency fix):** every quick-filter chip must map to a real value in the Section Type (15), Industry (16), or Style (17) taxonomy — or a documented synonym of one. Example chips such as "Blog" (Section Type) or "ecommerce" (→ Industry: E-commerce) are fine. Chips referencing concepts with no backing taxonomy value (e.g. "location", "brand", "card" as currently drafted) must either be added as real taxonomy tags before launch, or dropped from the default chip set — never ship a filter chip that has no data behind it.
  - **Arabic Websites** is a permanent, first-class quick filter mapping directly to `language = ar` (regardless of direction). It is a shortcut on top of the existing language/direction filters (Section 6/7), not a new data field, and works whether the matching content is LTR or RTL.
- A left-hand tab list switches between: **Trending**, **Categories** (with live result counts), **Sections**, **Styles**.
- A small device/context toggle (mobile / desktop / no context) in the top-right biases results toward a device type.

### 14.2.1 Search-to-Filter Inference

The overlay recognizes known taxonomy values inside free text and surfaces them as removable detected-filter chips (e.g. `"Arabic SaaS Hero"` → Language: Arabic, Industry: SaaS, Section: Hero). Rules:

- Detected filters appear as removable chips; removing one does not erase the original free-text query.
- Clicking a detected chip applies the filter and updates suggestions immediately.
- If a term matches multiple taxonomies, prefer the most specific valid match.
- Unknown words stay part of the free-text query.
- Support Arabic equivalents/synonyms for key MVP terms (e.g. Arabic/عربي/العربية → language = ar).
- This must be deterministic and taxonomy-driven for MVP — no LLM required just to detect known categories/section types/styles/language shortcuts.
- The same `ISearchService` abstraction (Section 34) must be used by both the overlay and the Explore results so interpretation never diverges between the two.

### 14.2.2 Search Suggestions

As the user types, show a compact panel of matching categories, section types, styles, sources/websites, recent/trending searches, detected filters, and result counts where cheap to compute. Clicking a suggestion immediately turns it into a structured filter/query.

### 14.2.3 Search Submission

Enter / "View all results" navigates to Explore with the original query + all quick-filter chips + all detected filters + device/context selection. The resulting URL/query state must be shareable/bookmarkable.

### 14.2.4 Overlay Dismissal

Dismissible via Escape, an explicit close control, or clicking outside. Focus returns to the search trigger after closing.

### 14.2.5 Performance

Reuse the same `ISearchService` used by Explore — do not build a second search engine or indexing pipeline for the overlay. Debounce free-text suggestions; do not query the database on every keystroke while typing rapidly.

---

# 15. INITIAL SECTION TYPES

Navbar, Hero, Value Proposition, Features, Logo Cloud, Stats, Testimonials, Pricing, CTA, FAQ, Contact, Team, Gallery, Blog, Login, Signup, Dashboard, Checkout, Profile, Settings, Footer.

Database-driven, not hardcoded in frontend components. Can evolve later.

---

# 16. INITIAL INDUSTRIES

SaaS, Fintech, AI, E-commerce, Agency, Portfolio, Finance, Healthcare, Education, Marketing, Travel, Food. Expandable later.

---

# 17. INITIAL STYLES

Minimal, Modern, Dark, Light, Editorial, Brutalist, Gradient, Colorful, Monochrome, Illustration, Typography-focused. Do not hardcode these values throughout the application.

---

# 18. SECTION CARD

Includes: screenshot (desktop `SectionCrop` by default), section type, source name, selected tags, language, device availability indicator.

**Flexible/masonry sizing (Section 14.1):** the card's outer container has a fixed width (set by the grid column) but an **auto height** — the screenshot renders at its natural aspect ratio (no forced crop, no fixed aspect-ratio box), and the metadata footer sits directly under the image. The card never reserves blank space to match a taller neighbor. Overlay actions (Save/quick-view) are absolutely positioned and don't affect height.

Actions: Save, Open. Hover-only quick save/quick view on desktop; equivalent always-visible actions on mobile.

## 18.1 Flexible Reference / Page Presentation

- Card width follows the responsive masonry column; image fills that width preserving its natural aspect ratio.
- A short image becomes a short card; a tall image becomes a tall card — never stretch or crop to match neighbors.
- The next card uses the freed vertical space in the same column, separated by the standard gap.
- Same rule for Section screenshots and Page/Website screenshots.
- A deliberate crop for a special presentation component (e.g. a fixed phone frame) is presentation-only and must never replace or overwrite the source asset.
- Full-page references keep their complete source ratio in the gallery; use the detail/context view for deeper inspection of very tall pages.

---

# 19. SECTION DETAIL PAGE

Breadcrumbs, large section screenshot (device-switchable via `SectionCrop` variants), title, type, source, parent page, language, direction, device(s) available, industry, style, tags, capture date, attribution.

Actions: Save, Save as Image, Send to Figma, View in Context. Related sections, related page/source.

**Similar Sections ranking rule (MVP, deterministic, non-ML):**

```
Similar Sections =
  same sectionType
  AND (shared industry OR shared style)
  ORDER BY (count of shared tags) DESC
  LIMIT 6
```

Can be swapped for an embedding-based approach later behind the same query interface without changing the UI contract.

---

# 20. SAVE

Anonymous users can browse/search/view/download-if-allowed; login required to persist a Save. Authenticated users can save/unsave/add to collections. Save is idempotent; frontend may optimistically update but the server stays authoritative.

---

# 21. COLLECTIONS

Private collections for MVP (e.g. "Arabic SaaS", "Banking Inspiration"). Fields: id, ownerId, name, description, isPublic, createdAt, updatedAt. Public/shareable collections come later.

---

# 22. SAVE AS IMAGE

Downloads the Section's device-appropriate cropped asset (`SectionCrop.renderedAssetId`, Section 9), not the full page unless explicitly requested. PNG or similar raster output. Original high-quality asset stays stored server-side.

---

# 23. FIGMA INTEGRATION

MVP/V1: import the screenshot into Figma as an image only. Do NOT convert to editable HTML-like layers in the first release.

```
User → "Send to Figma" → Figma plugin → Resolve Section (+ device variant) → Fetch image → Create Figma image/frame → Place in user's file
```

Editable Figma reconstruction (text/buttons/images/frames/layout) is an explicit future feature, separate from screenshot import. Do NOT build design-to-code or screenshot-to-editable-Figma in MVP.

---

# 24. FIGMA PLUGIN ARCHITECTURE

```
Figma Plugin → authenticated request → Section API (device param) → Asset URL → Plugin downloads image → Figma document node created
```

Plugin owns Figma-document manipulation; the API owns business authorization and content access. Do not tightly couple the plugin to frontend implementation.

---

# 25. CONTENT SUBMISSION _(with deduplication)_

User submits a URL, optionally with notes/creator name/contact info. Submission never immediately becomes public.

**Deduplication before capture:** normalize the URL (strip tracking params, normalize scheme/trailing-slash/www) and check against existing `Source` records before queuing capture:

```
submitted
 → normalize URL
 → check existing Source by normalized URL
     ├── matches existing Source → link submission to it, skip re-capture (unless admin forces one)
     └── no match → proceed to capture as a new Source
```

Full flow:

```
submitted → normalize + dedup check → capturing (only if new) → ready_for_review → published | rejected | blocked
```

Every state transition must be auditable.

---

# 26. ADMIN PANEL

Modules: Submission queue, Source management, Page management, Section editor, Crop tool (per-device), Tag manager, Category manager, User management, Moderation, Publish workflow, Analytics overview. The content editor is the most important screen.

**Status polling, not manual refresh:** because capture is an async background job (Section 31), the submission queue must poll the status endpoint every few seconds while a submission is `capturing`, so `ready_for_review` appears without a manual reload. SignalR/WebSockets are NOT required for MVP.

---

# 27. CONTENT EDITOR

Admin views full page screenshot per device, mobile screenshot, page metadata, sections. Creates a New Section by drawing/cropping a rectangle over the full-page screenshot per device (desktop crop + mobile crop, both linked to the same Section via `SectionCrop`, Section 9). Then assigns section type, title, language, direction, industry, style, tags, notes, order, and publishes.

---

# 28. IMAGE PIPELINE

PostgreSQL → metadata only. Object Storage → actual image files. CDN → public delivery. Abstraction: `IImageStorage`. Initial provider: Cloudflare R2 or another S3-compatible store. Business logic must not depend directly on R2 APIs.

---

# 29. IMAGE VARIANTS

Generate thumbnail / card / detail / download-original variants, sizes defined centrally. Use modern formats where appropriate, strip unnecessary metadata, and only generate sizes the UI actually needs.

---

# 30. IMAGE SECURITY

For future user-uploaded files: validate MIME, validate magic bytes, restrict size, re-encode, strip metadata, isolate processing, never trust file extensions. For MVP, prefer URL capture over arbitrary user image upload.

---

# 31. CAPTURE WORKER

```
POST submission → normalize + dedup check (25) → save submission → enqueue background job (only if new Source) → return status
```

```
Worker: fetch page → validate target (SSRF, 32) → capture screenshot (desktop) → capture screenshot (mobile) → save assets → status → ready_for_review
```

Background job system (Hangfire acceptable for .NET). Status must be queryable by a lightweight endpoint for admin polling (Section 26).

---

# 32. SSRF PROTECTION _(redirect-chain re-validation)_

Protect against localhost, loopback, private ranges, link-local addresses, internal services, cloud metadata endpoints. Validate scheme, hostname, resolved IP, redirects, response size, timeout.

**Every hop in a redirect chain must be re-validated, not just the final destination:**

```
for each redirect in the chain:
    resolve hostname → IP
    check IP against private/loopback/link-local/metadata ranges
    if blocked → abort immediately, mark submission failed
    else → follow this hop, repeat check on the next one
```

Checking only the first URL and the final response location is not sufficient. The capture worker should be isolated as much as practical.

---

# 33. SEARCH

MVP: PostgreSQL full text search + indexes/trigram support. Inputs: title, source name, description, section type, tags, category metadata. Filters: type, industry, style, language, direction, device, source. Returns: results, count, active filters, pagination. Do not introduce Elasticsearch/OpenSearch in MVP.

---

# 34. SEARCH ABSTRACTION

`ISearchService` (or equivalent) — domain/application layer must not depend directly on Typesense/Elasticsearch. Initial implementation: `PostgresSearch`. Future: `TypesenseSearch`, `MeilisearchSearch`.

---

# 35. REDIS

Not mandatory on day one. Use only for a concrete need: distributed caching, hot search-result caching, distributed rate limiting, short-lived state, locks, queue support if selected. Do not put Redis between every request and PostgreSQL just because it's available.

---

# 36. RATE LIMITING

Required for public endpoints, especially login, registration, search, submissions, downloads, Figma endpoints, and any public API. Different limits per endpoint category (auth: strict, submission: very strict, search: moderate, public browsing: higher). Partition by IP/user where appropriate. Return HTTP 429 when rejected.

---

# 37. CACHING

Cache public category/tag lists, featured content, popular sections, public source pages, safe GET responses. Never cache personalized collection results or private user data without careful policy. Prefer HTTP/CDN caching before application-level caching everywhere.

---

# 38. PERFORMANCE PRIORITIES

1. Image loading
2. Initial gallery rendering
3. Search response time
4. Detail page response
5. Interaction latency
6. Database optimization

Do not prematurely optimize backend code while images are the real bottleneck.

---

# 39. FRONTEND PERFORMANCE

Next.js server rendering where useful, `next/image`, lazy loading, responsive sizes, explicit width/height, skeletons, cursor pagination, minimal client-side JS, avoid unnecessary Client Components, avoid huge global state.

---

# 40. SERVER VS CLIENT COMPONENTS

Default to Server Components. Use Client Components only for interaction, browser APIs, local state, event handlers, dialogs, drag/drop, dynamic filtering UI. Don't mark whole pages as client unnecessarily.

---

# 41. FRONTEND TECHNOLOGY

Next.js, React, TypeScript, Tailwind CSS, shadcn/ui (button, dialog, drawer, dropdown, input, command, select, tabs, tooltip, sheet, toast, skeleton, etc.). Shadcnblocks may inspire/accelerate, but all final UI must be restyled to our own design system/brand.

---

# 42. UI/UX PRINCIPLE

Editorial, visual, clean, fast, image-first, high information density, not noisy, not generic SaaS. May draw inspiration from Land-book/Iksho/Shadcnblocks patterns but never clone their layout or visual identity.

---

# 43. RESPONSIVE PRODUCT

Desktop, Tablet, Mobile support. At mobile: filters become sheet/drawer, touch-friendly card actions, no hover-only functionality, collapsing navigation, 1–2 column gallery, readable detail image, accessible action buttons.

---

# 44. PHONE REFERENCE VIEW

Desktop and Mobile previews; mobile preview may use a phone frame, controlled viewport width, vertical screenshot. Reference viewing only — do not rely on rendering an external website live in an iframe.

---

# 45. ACCESSIBILITY

Semantic HTML, keyboard navigation, visible focus, accessible dialogs/filters, proper labels, meaningful alt text, color contrast, reduced-motion handling, mobile touch targets. Never rely only on color to communicate state.

---

# 46. SEO

Index: homepage, categories, section pages, source pages, public collections, page references. Avoid indexing: authenticated dashboard, admin, login, private collections, thin duplicate search-combination pages. Use Next.js metadata (title, description, canonical, alternates, Open Graph, Twitter, sitemap, robots).

---

# 47. SEO FOR ARABIC

Correct `lang`, direction, hreflang/alternate strategy, localized title/description/URLs. Do not translate visible text while leaving SEO metadata in English.

---

# 48. ANALYTICS

Track: search_performed, filter_applied, section_viewed, view_context, saved, unsaved, collection_created, image_downloaded, figma_clicked, source_opened, mobile_viewed, desktop_viewed, signup_completed, submission_created, submission_published, submission_deduplicated.

---

# 49. PRODUCT METRICS

Primary signals: searches, section views, saves, downloads, collection creation, return sessions, Figma usage, successful searches. Key metric: % of active users who search AND save references. Do not optimize initially for vanity pageviews.

---

# 50. AUTHENTICATION

MVP: email/password (+ optional Google login if straightforward). Roles: User, Editor, Admin. Authorization enforced server-side; frontend permissions are UX only.

---

# 51. FUTURE PREMIUM

Do not implement billing in first MVP unless required for validation. Design the entitlement concept now (unlimited results/saves, advanced filters, higher-res downloads, compare, more mobile previews, historical versions, advanced Figma workflow). Do not hardcode a final price before validation.

---

# 52. PROJECT ARCHITECTURE

Modular Monolith.

```
src/
  Api/
  Application/
  Domain/
  Infrastructure/
  Worker/
```

Application modules: Content, Sources, Sections, Search, Collections, Identity, Media, Submissions, Analytics, Billing (future). Infrastructure: PostgreSQL, Storage, Capture, Search, Background Jobs, external services. Do not introduce microservices.

---

# 53. DOMAIN LAYER

Must not depend on ASP.NET HTTP, EF Core, PostgreSQL, Redis, S3/R2, or Figma. Contains domain concepts and business rules only.

---

# 54. API

Versioned under `/api/v1`.

```
GET /api/v1/sources
GET /api/v1/sources/{slug}
GET /api/v1/pages
GET /api/v1/pages/{slug}
GET /api/v1/sections
GET /api/v1/sections/{id}
GET /api/v1/sections/{id}/crops?device=desktop|mobile
GET /api/v1/categories
GET /api/v1/tags
GET /api/v1/search
POST /api/v1/me/saves
DELETE /api/v1/me/saves/{id}
GET /api/v1/me/collections
POST /api/v1/me/collections
GET /api/v1/me/collections/{id}
POST /api/v1/me/collections/{id}/items
POST /api/v1/submissions
GET  /api/v1/submissions/{id}/status
```

Admin:

```
GET /api/v1/admin/submissions
GET /api/v1/admin/submissions/{id}/status
POST /api/v1/admin/submissions/{id}/approve
POST /api/v1/admin/submissions/{id}/reject
```

Additional endpoints should be derived from actual use cases, not invented prematurely.

---

# 55. API CONTRACT QUALITY

Every API defines request, response, validation, errors, pagination, filtering, sorting, authorization. Use OpenAPI. Frontend should eventually use generated TypeScript API types/client.

---

# 56. ERROR HANDLING

Consistent error responses distinguishing validation error, not found, unauthorized, forbidden, rate limited, conflict, server error. No random error shapes across endpoints.

---

# 57. TESTING

Backend: unit tests (domain/application rules), integration tests, DB integration tests. Critical: section creation, per-device crop validation, collection ownership, save idempotency, authorization, submission state machine (incl. deduplication branch), SSRF redirect-chain validation, rate limiting, search filters, source/page/section relationships. Frontend: critical interaction tests, accessibility checks, responsive smoke tests. Do not aim for arbitrary 100% coverage.

---

# 58. LOGGING / OBSERVABILITY

Structured logs for: capture failed, image processing failed, submission rejected, submission deduplicated, publish failed, Figma request failure, rate limiting, auth failures, SSRF validation blocked a redirect hop. Use Sentry or equivalent.

---

# 59. BACKUPS

PostgreSQL backup strategy, storage backup/versioning where appropriate, and a tested restore process. An untested backup is not considered proven.

---

# 60. DEPLOYMENT

Frontend: Next.js. Backend: ASP.NET Core. Database: PostgreSQL. Object Storage: R2/S3-compatible. CDN: Cloudflare or equivalent. Containerization: Docker. CI/CD: GitHub Actions. Do not introduce Kubernetes.

---

# 61. LEGAL / COPYRIGHT REVIEW _(moved earlier in the timeline)_

Because the entire content model is built on screenshots of real third-party websites, legal review must happen **before Phase 0 is considered closed**:

- boundaries of fair use for commercial screenshot display in this jurisdiction/market
- required attribution format (source name, URL, capture date — already modeled via Section 9's Source relationship)
- a takedown/removal policy and process for site-owner removal requests
- limits on reproducing full original text, logos, or brand assets beyond reference/attribution needs

This is a product-viability risk, not a technical detail — do not schedule it after significant engineering investment.

---

# 62. FIRST RELEASE SCOPE

**MUST HAVE:** bilingual UI, RTL/LTR, homepage, explore, search (overlay + inference), filters, source pages, page details, section details, per-device screenshot references, context view, save, collections, image download, desktop/mobile reference, submission by URL (with dedup), admin moderation (with status polling), content editor, per-device crop sections, metadata, SEO basics, analytics, performance basics, rate limiting, background capture (with redirect-chain SSRF validation), object storage/CDN.

**CAN WAIT:** payments, teams, browser extension, public API, AI semantic search, AI section detection, editable Figma, design-to-code, marketplace, enterprise.

---

# 63. DEVELOPMENT RULE

Build in phases. At the end of each phase: run tests, verify UI, verify architecture, summarize files changed, identify remaining issues, stop and wait for approval. Never silently start the next phase.

---

# 64. PHASE 0 — DISCOVERY

Create: PRODUCT_SPEC.md (this file), ARCHITECTURE.md, DOMAIN_MODEL.md, API_PLAN.md, UI_ROUTE_MAP.md, DEVELOPMENT_PHASES.md.

Confirm: core entities (incl. SectionCrop, Section 9, with required width/height), core user flow, content flow (incl. deduplication, Section 25), MVP boundaries, Arabic/RTL strategy (incl. masonry column-order rule, Section 14.1), Figma scope, desktop/mobile strategy, legal/copyright review outcome (Section 61 — must be resolved before Phase 0 closes).

**Do not code before these documents are consistent — and do not keep more than one version of this spec in the repo.**

---

# 65. PHASE 1 — REPOSITORY FOUNDATION

```
frontend/
backend/
```

Frontend: Next.js, TypeScript, Tailwind, shadcn/ui. Backend: ASP.NET Core, EF Core, PostgreSQL. Add formatting, linting, environment config, basic health endpoint, database connection, Docker dev environment. Do not implement all features yet.

---

# 66. PHASE 2 — DESIGN SYSTEM

Typography, colors, spacing, radius, shadows, buttons, inputs, badges, dialogs, dropdowns, sheets, cards, breadcrumbs, tabs, filter controls. Must support English/Arabic, LTR/RTL, dark/light if desired. No page should invent random styling outside the design system.

---

# 67. PHASE 3 — FRONTEND PUBLIC UI

Homepage, explore, section card, section detail (with device switcher), source/page detail, responsive navigation. Mocked data; do not connect the real backend yet. Goal: prove the UX.

---

# 68. PHASE 4 — BACKEND DOMAIN

Source, Page, Section, SectionCrop, Asset, Tag, Category, User, Collection, CollectionItem, Save, Submission. EF Core models/configurations/migrations, with Asset/SectionCrop `width`/`height` as `NOT NULL` (Section 9). Do not create unnecessary repository abstractions.

---

# 69. PHASE 5 — API

Public read APIs first (Sources, Pages, Sections+crops, Categories, Tags, Search), then Auth/Saves/Collections, then Submissions (incl. status polling), then Admin. Keep endpoint contracts consistent.

---

# 70. PHASE 6 — REAL FRONTEND DATA

Replace mocked data with API: loading, empty, error, pagination, filters, search, save, collections. Keep visual design unchanged unless real data reveals a UX issue.

---

# 71. PHASE 7 — CONTENT ADMIN

Submission queue (with polling), capture status, page editor, section cropper (per device), metadata editor, publish/reject/block, deduplication check UI feedback. This phase creates the real content pipeline.

---

# 72. PHASE 8 — IMAGE PIPELINE

Object Storage, image processing, derivatives, CDN, download, responsive images, lazy loading. Validate image quality, sizes, response time, browser rendering.

---

# 73. PHASE 9 — ARABIC

`/en`, `/ar`, localization resources, RTL layout (incl. masonry column order, Section 14.1), Arabic metadata, Arabic search normalization, locale metadata, localized SEO. Test every page in both directions.

---

# 74. PHASE 10 — PERFORMANCE + SECURITY

Rate limiting, caching, request size limits, URL capture protection, SSRF protection (incl. redirect-chain re-validation, Section 32), authorization, structured logging, performance profiling, image optimization, Core Web Vitals checks. Do not add Redis just for the checklist — add it where the architecture actually needs it.

---

# 75. PHASE 11 — FIGMA

Figma Plugin. First capability: import selected Section screenshot (device-appropriate crop) into Figma. No editable reconstruction. Stable API contracts; no dependency on frontend internals.

---

# 76. PHASE 12 — PRODUCTION HARDENING

Backup/restore test, error monitoring, rate limit testing, capture worker failure handling, retry policies, idempotency, SEO verification, mobile verification, RTL verification, accessibility review, security review, load testing of critical endpoints.

---

# 77. AGENT BEHAVIOR RULES

1. Read all project documentation before making changes.
2. Do not invent product requirements.
3. Do not add features outside the current phase.
4. Do not replace the chosen architecture without explaining why.
5. Do not introduce microservices.
6. Prefer simple solutions.
7. Do not over-abstract.
8. Preserve domain boundaries.
9. Reuse existing components before creating duplicates.
10. Do not make UI decisions that conflict with the Product Spec.
11. Do not copy proprietary UI or branding from reference sites.
12. Treat Arabic and RTL as first-class requirements.
13. Keep SEO in mind for all public content.
14. Keep accessibility in mind.
15. Explain trade-offs for meaningful architectural choices.
16. If a requirement is ambiguous, STOP and ask before making a product-level decision.
17. Never store crop coordinates directly on Section — always via SectionCrop (Section 9).
18. Never queue a capture job before the deduplication check has run (Section 25).
19. Never validate only the final URL in a redirect chain — validate every hop (Section 32).
20. Never ship a quick-filter chip that has no backing taxonomy value (Section 14.2).
21. At the end of each phase, report: what was implemented, files changed, tests run, known limitations, next recommended phase.

---

# 78. DEFINITION OF DONE

UI works, API works, validation exists, authorization exists where needed, loading/empty/error states exist, responsive behavior works, RTL behavior works, tests cover critical behavior, no obvious accessibility problem, logging/error handling is appropriate, documentation is updated.

---

# 79. IMPORTANT PRODUCT PRINCIPLE

We are building a reference/research product. The main value is not the number of pages — it's quality of content + quality of metadata + searchability + context + organization + workflow integration. Content quality is a first-class engineering/product concern.

---

# 80. FINAL PRODUCT MODEL

```
Source
 ├── Pages
 │    ├── Sections
 │    │    ├── SectionCrop (desktop) → Asset
 │    │    ├── SectionCrop (mobile)  → Asset
 │    │    ├── Tags
 │    │    ├── Category
 │    │    ├── Language
 │    │    └── Direction
 │    └── Mobile/Desktop page-level variants
 └── Attribution / metadata

User
 ├── Saves
 └── Collections

Submission
 → Deduplication check
 → Capture
 → Review
 → Publish

Section
 → View
 → Save
 → Download
 → Figma
```

---

# 81. NON-GOALS FOR MVP

Editable Figma reconstruction, design-to-code, AI image understanding, semantic search, recommendation ML, teams, enterprise, public API, browser extension, marketplace, native mobile app, microservices — unless explicitly approved later.

---

# 82. BUILD ORDER

```
Product definition → UX → Design system → Domain → Database → API →
Admin/content pipeline → Frontend integration → Image infrastructure →
Arabic/RTL → SEO/performance → Figma → production hardening
```

Do not reverse this order without a documented reason. Legal/copyright review (Section 61) must be resolved before Phase 0 closes, independent of this build order.
