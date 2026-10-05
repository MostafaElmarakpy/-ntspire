/**
 * Slugs are the URL-facing spelling of an entity id.
 *
 * The product spec fixes the route shapes (`/[locale]/sources/[slug]`,
 * `/[locale]/pages/[slug]`) but never defines how a slug is formed, and the
 * data model carries no `slug` field. The mock ids are already stable,
 * URL-safe and readable, so the slug is the id with its entity prefix removed:
 * `source-flowbase` -> `flowbase`, and a page id such as `flowbase-home` is
 * already a slug. That keeps exactly one identifier per entity — no second name
 * that can drift away from the record the way a generated, name-derived slug
 * could — and needs no change to the domain model.
 *
 * Flagged in `docs/phase-reports/07-detail-pages.md` as the one product-visible
 * decision this phase had to make without a spec rule to follow.
 */

export const SOURCE_ID_PREFIX = "source-";

/** `source-flowbase` -> `flowbase`; an id without the prefix is returned as-is. */
export function sourceSlug(sourceId: string): string {
  return sourceId.startsWith(SOURCE_ID_PREFIX) ? sourceId.slice(SOURCE_ID_PREFIX.length) : sourceId;
}

/** Page ids are already slug-shaped, so this exists to name the rule, not to change it. */
export function pageSlug(pageId: string): string {
  return pageId;
}

export function findSourceBySlug<T extends { id: string }>(sources: readonly T[], slug: string): T | undefined {
  if (!slug) return undefined;
  return sources.find((source) => sourceSlug(source.id) === slug);
}

export function findPageBySlug<T extends { id: string }>(pages: readonly T[], slug: string): T | undefined {
  if (!slug) return undefined;
  return pages.find((page) => pageSlug(page.id) === slug);
}
