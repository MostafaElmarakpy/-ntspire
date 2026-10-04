const STORAGE_KEY = "ntspire:recent-searches:v1";
export const MAX_RECENT_SEARCHES = 8;

/**
 * The identity of a search: two queries are the same query when they differ only
 * by case, punctuation or hyphenation. The parser reads "E-commerce hero" and
 * "ecommerce hero" as the same thing, so the recent list must not fill up with
 * both spellings of it.
 */
const sameSearchKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[-_]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Missing, corrupt or foreign-shaped storage all read as "no recent searches". */
export function normalizeRecentSearches(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const searches: string[] = [];

  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const key = sameSearchKey(entry);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    searches.push(entry);
    if (searches.length === MAX_RECENT_SEARCHES) break;
  }

  return searches;
}

/** Most recent first, de-duplicated by meaning, capped at the limit. */
export function addRecentSearch(current: readonly string[], query: string): string[] {
  const trimmed = query.trim();
  const needle = sameSearchKey(trimmed);
  // A query that is only punctuation is no query at all.
  if (!needle) return normalizeRecentSearches([...current]);

  const withoutDuplicate = current.filter((entry) => sameSearchKey(entry) !== needle);

  return normalizeRecentSearches([trimmed, ...withoutDuplicate]);
}

export function loadRecentSearches(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeRecentSearches(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearches(searches: readonly string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeRecentSearches([...searches])));
  } catch {
    // Private mode and quota errors are real; recent searches are a convenience,
    // so failing to persist them must never break the overlay.
  }
}
