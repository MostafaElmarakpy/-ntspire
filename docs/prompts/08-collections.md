# Phase 8 — Collections (local mock persistence)

Read first: `00-global-rules.md`; spec §20–21; master prompt §23.

## Goal
Private collections that behave like the future API.

## In scope
- P8-01 `CollectionService` interface + `MockCollectionService` (localStorage): list, get, create, rename, delete, add item, remove item; ids/timestamps deterministic in tests; idempotent add/remove; safe with corrupt/unavailable storage; `Collection` fields per spec §21 (`id, ownerId, name, description, isPublic=false, createdAt, updatedAt`); `CollectionItem` links to sections.
- P8-02 "Add to collection" UI on cards and Section detail (popover/dialog): choose existing, create new inline, see which collections already contain the section, remove from a collection. Accessible.
- P8-03 Routes `/[locale]/collections` (list with counts, create/rename/delete with confirm) and `/[locale]/collections/[id]` (items in the masonry grid, remove item, empty state). Enable the Collections nav/user-menu link.
- P8-04 Saved sections view (Saves list) reachable from the user area.
- P8-05 Optimistic updates with rollback on failure; state stays consistent across tabs/pages after reload.
- P8-06 Analytics `collection_created`; saves/unsaves from Phase 4 still tracked.
- P8-07 Curated **featured collections** fixture (public, read-only) available through the service for the Phase 9 homepage — clearly separate from user collections.

## Out of scope
Public sharing, real auth (note in NEXT_STEPS that anonymous users must be prompted to sign in once real auth exists).

## Required tests
Service CRUD + idempotency + validation (empty/duplicate names, max length), corrupt storage recovery, UI flows (create → add → remove → delete), optimistic rollback, e2e: save → add to collection → reload → still there → remove; clean console; axe clean.

## Exit
Global gate + report.
