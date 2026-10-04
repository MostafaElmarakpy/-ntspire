import { INDUSTRIES, SECTION_TYPES, STYLES } from "@/config/taxonomy";
import { normalizeSearchTerm } from "@/lib/search-parser";
import type { Source } from "@/types/domain";
import type { SearchSuggestion } from "@/types/services";

export const SUGGESTION_LIMIT = 8;

interface SuggestionSource {
  id: string;
  /** The English label or alias used for matching. Labels are resolved for display by the caller. */
  terms: readonly string[];
}

/**
 * Ranks a term against the typed query, or rejects it outright.
 *
 * A term only scores if it actually *contains* what the user typed — without
 * that check every entry would score, and a nonsense query would return the
 * first entries in declaration order instead of nothing.
 *
 * Among matching terms, a name that *starts* with the query is a better guess
 * than one that merely contains it, and a match on the entry's own id beats a
 * match on one of its aliases. Ties fall back to the taxonomy's declaration
 * order, so the same input always suggests the same list.
 */
function score(needle: string, terms: readonly string[]): number | null {
  let best: number | null = null;

  for (const [index, term] of terms.entries()) {
    const normalized = normalizeSearchTerm(term);
    if (!normalized) continue;

    const position = normalized.indexOf(needle);
    if (position === -1) continue;

    const prefixBonus = position === 0 ? 0 : 1;
    // `index === 0` is always the entry's own id, because callers put it first.
    const idBonus = index === 0 ? 0 : 1;
    const candidate = prefixBonus * 2 + idBonus;

    if (best === null || candidate < best) best = candidate;
  }

  return best;
}

/** The entry's own id comes first, so `score` can tell an id match from an alias match. */
const toSuggestionSources = (entries: readonly { id: string; aliases?: { en: string[] } }[]): SuggestionSource[] =>
  entries.map((entry) => ({ id: entry.id, terms: [entry.id, ...(entry.aliases?.en ?? [])] }));

/**
 * Deterministic, local suggestion ranking over the shared taxonomy plus the mock
 * sources. No index, no second search engine — the overlay and Explore both read
 * the same taxonomy config, so the two can never disagree about what a term
 * means.
 */
export function buildSuggestions(
  query: string,
  sources: readonly Source[],
  limit: number = SUGGESTION_LIMIT,
): SearchSuggestion[] {
  const needle = normalizeSearchTerm(query);
  if (!needle) return [];

  const groups: Array<{ kind: SearchSuggestion["kind"]; entries: SuggestionSource[] }> = [
    { kind: "sectionType", entries: toSuggestionSources(SECTION_TYPES) },
    { kind: "industry", entries: toSuggestionSources(INDUSTRIES) },
    { kind: "style", entries: toSuggestionSources(STYLES) },
    { kind: "source", entries: sources.map((source) => ({ id: source.id, terms: [source.name] })) },
  ];

  const ranked: Array<{ suggestion: SearchSuggestion; score: number; order: number }> = [];
  let order = 0;

  for (const group of groups) {
    for (const entry of group.entries) {
      const entryScore = score(needle, entry.terms);
      order += 1;
      if (entryScore === null) continue;
      ranked.push({
        suggestion: { kind: group.kind, id: entry.id, ...(group.kind === "source" ? { label: entry.terms[0] } : {}) },
        score: entryScore,
        order,
      });
    }
  }

  return ranked
    .sort((a, b) => a.score - b.score || a.order - b.order)
    .slice(0, limit)
    .map((entry) => entry.suggestion);
}
