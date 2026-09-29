# System Review

Review the frontend after implementation.

## Architecture
- [ ] Folder structure (frontend/ vs backend/ placeholder respected)
- [ ] Component boundaries
- [ ] Mock service separation
- [ ] Future API integration boundary
- [ ] Shared taxonomy config used everywhere (no orphan chips/values)

## UI / UX
- [ ] Homepage
- [ ] Explore
- [ ] Search overlay
- [ ] Search inference
- [ ] Filters
- [ ] Masonry
- [ ] Section detail
- [ ] Source/Page hierarchy
- [ ] Similar Sections uses the deterministic rule (Spec Section 19), not a random pick

## Responsive
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile
- [ ] Touch interactions
- [ ] No hover-only functionality

## Arabic / RTL
- [ ] Arabic UI (Phase 11 only)
- [ ] RTL layout (Phase 11 only)
- [ ] RTL masonry ordering (unit-tested before UI enablement)
- [ ] Images are not mirrored
- [ ] Arabic search aliases (Phase 11 only)

## Accessibility
- [ ] Keyboard navigation
- [ ] Focus states
- [ ] Dialog accessibility
- [ ] Labels
- [ ] Alt text
- [ ] Contrast

## Images / Data Integrity
- [ ] No external image host / network dependency
- [ ] Every mock Asset/SectionCrop width/height matches its real image
- [ ] Mock dataset sizes meet spec minimums (8–12 Sources, 30–50 Sections, etc.)

## SEO
- [ ] Metadata present on public pages (title, description, canonical, OG)
- [ ] No indexing of admin/auth/private pages
- [ ] Locale metadata correct for /en and /ar

## Performance
- [ ] Image loading
- [ ] Lazy loading
- [ ] Server/client boundaries
- [ ] Unnecessary client components
- [ ] Large bundle risks

## Code Quality
- [ ] TypeScript
- [ ] Duplication
- [ ] Dead code
- [ ] Magic values
- [ ] Component complexity
- [ ] Test quality

## Validation
- [ ] npm run typecheck
- [ ] npm run lint
- [ ] npm run test
- [ ] npm run build
- [ ] npm run test:e2e (clean console/network fixture)
- [ ] axe serious/critical violations checked where the phase requires it

## Findings

### Critical

### Important

### Nice to Have
