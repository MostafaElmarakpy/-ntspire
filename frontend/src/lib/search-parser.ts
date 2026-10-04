import { DEVICES, DIRECTIONS, INDUSTRIES, LANGUAGES, SECTION_TYPES, STYLES } from "@/config/taxonomy";
import type { Device, Direction, Locale } from "@/types/domain";

export type SearchFilters = {
  sectionTypeId?: string;
  industryId?: string;
  styleId?: string;
  language?: Locale;
  direction?: Direction;
  device?: Device;
};

export type SearchParserResult = {
  /** Whatever the query said that no taxonomy entry claimed. Never lost. */
  q: string;
  filters: SearchFilters;
};

/**
 * `aliases.ar` is deliberately part of the shape even though it stays empty
 * until Phase 11: adding Arabic search aliases then must be a data change only,
 * never a parser change.
 */
type AliasEntry = { id: string; aliases?: Partial<Record<Locale, string[]>> };

export interface SearchTaxonomy {
  sectionTypes: readonly AliasEntry[];
  industries: readonly AliasEntry[];
  styles: readonly AliasEntry[];
}

const defaultTaxonomy: SearchTaxonomy = {
  sectionTypes: SECTION_TYPES,
  industries: INDUSTRIES,
  styles: STYLES,
};

/**
 * Lower-cases, turns `-`/`_` into word breaks and drops punctuation, so
 * "E-commerce", "e-commerce" and "e commerce" all reduce to the same phrase.
 * Unicode-aware so Arabic aliases survive Phase 11 unchanged.
 */
export const normalizeSearchTerm = (value: string) =>
  value
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

type FilterDimension = keyof SearchFilters;

/**
 * Declaration order is the tie-breaker when a phrase matches several
 * dimensions, so the most content-like reading wins: a word is more usefully a
 * section type than a device name.
 */
const dimensionRank: Record<FilterDimension, number> = {
  sectionTypeId: 0,
  industryId: 1,
  styleId: 2,
  language: 3,
  direction: 4,
  device: 5,
};

type Candidate = { dimension: FilterDimension; id: string; exactId: boolean };

/** Non-taxonomy shortcuts: language, direction and device are fixed vocabularies, not taxonomy lists. */
const shortcutVocabulary: Array<{ dimension: FilterDimension; id: string; aliases: string[] }> = [
  { dimension: "language", id: "en", aliases: ["en", "english"] },
  { dimension: "language", id: "ar", aliases: ["ar", "arabic", "arabic websites"] },
  { dimension: "direction", id: "ltr", aliases: ["ltr", "left to right"] },
  { dimension: "direction", id: "rtl", aliases: ["rtl", "right to left"] },
  { dimension: "device", id: "desktop", aliases: ["desktop"] },
  { dimension: "device", id: "mobile", aliases: ["mobile"] },
];

/** "software as a service" is the longest phrase the taxonomy currently defines. */
const MAX_ALIAS_WORDS = 4;

/** True when `phrase` is a better reading of the same words than `current`.
 *
 * "Most specific valid match" is resolved in this order: a phrase that *is* the
 * entry's id beats a phrase that is merely one of its aliases (the `finance`
 * industry beats the `fintech` entry, whose alias list also contains
 * "Finance"); then the dimension order above; then the earlier definition.
 * Every step is deterministic, so the same query always resolves the same way.
 */
const isMoreSpecific = (candidate: Candidate, current: Candidate) => {
  if (candidate.exactId !== current.exactId) return candidate.exactId;
  return dimensionRank[candidate.dimension] < dimensionRank[current.dimension];
};

/**
 * First mention wins, so a repeated term cannot flip an earlier decision.
 *
 * Identity values are re-checked against the shared taxonomy before they are
 * written, which is what keeps a plain string from becoming a `Locale`,
 * `Direction` or `Device` by assertion alone.
 */
function recordFilter(filters: SearchFilters, matched: Candidate): void {
  switch (matched.dimension) {
    case "sectionTypeId": if (filters.sectionTypeId === undefined) filters.sectionTypeId = matched.id; return;
    case "industryId": if (filters.industryId === undefined) filters.industryId = matched.id; return;
    case "styleId": if (filters.styleId === undefined) filters.styleId = matched.id; return;
    case "language": {
      const id = LANGUAGES.find((entry) => entry.id === matched.id)?.id;
      if (id && filters.language === undefined) filters.language = id;
      return;
    }
    case "direction": {
      const id = DIRECTIONS.find((entry) => entry.id === matched.id)?.id;
      if (id && filters.direction === undefined) filters.direction = id;
      return;
    }
    case "device": {
      const id = DEVICES.find((entry) => entry.id === matched.id)?.id;
      if (id && filters.device === undefined) filters.device = id;
    }
  }
}

function buildAliasLookup(taxonomy: SearchTaxonomy, locale: Locale): Map<string, Candidate> {
  const lookup = new Map<string, Candidate>();

  const add = (phrase: string, candidate: Candidate) => {
    const key = normalizeSearchTerm(phrase);
    if (!key) return;
    const current = lookup.get(key);
    if (!current || isMoreSpecific(candidate, current)) lookup.set(key, candidate);
  };

  const addTaxonomy = (entries: readonly AliasEntry[], dimension: FilterDimension) => {
    for (const entry of entries) {
      add(entry.id, { dimension, id: entry.id, exactId: true });
      for (const alias of entry.aliases?.[locale] ?? []) {
        add(alias, { dimension, id: entry.id, exactId: false });
      }
    }
  };

  addTaxonomy(taxonomy.sectionTypes, "sectionTypeId");
  addTaxonomy(taxonomy.industries, "industryId");
  addTaxonomy(taxonomy.styles, "styleId");

  for (const shortcut of shortcutVocabulary) {
    for (const alias of shortcut.aliases) {
      // Only the canonical id counts as an exact match; "arabic websites" is a
      // phrase that happens to name the `ar` language, not the id itself.
      add(alias, { dimension: shortcut.dimension, id: shortcut.id, exactId: normalizeSearchTerm(shortcut.id) === normalizeSearchTerm(alias) });
    }
  }

  return lookup;
}

/**
 * Deterministic, taxonomy-driven inference — no LLM, no network, no state.
 *
 * The query is scanned left to right, and at each position the longest phrase
 * that matches any known alias is consumed. Consuming phrases rather than single
 * words is what makes multi-word aliases ("value proposition", "software as a
 * service", "call to action") work; scanning longest-first is what stops
 * "arabic websites" from being read as the bare "arabic".
 *
 * Anything no alias claims is returned, in its original spelling and order, as
 * `q` — the caller never loses the user's words just because it recognised some
 * of them.
 */
export function parseSearchQuery(
  input: string,
  taxonomy: SearchTaxonomy = defaultTaxonomy,
  locale: Locale = "en",
): SearchParserResult {
  const lookup = buildAliasLookup(taxonomy, locale);
  // Matching happens on normalized words, but the leftover free text keeps the
  // user's own spelling and order — recognising some of their words must not
  // quietly rewrite the rest of their query.
  const words = input.trim().split(/\s+/).filter((word) => normalizeSearchTerm(word) !== "");
  const normalizedWords = words.map(normalizeSearchTerm);
  const filters: SearchFilters = {};
  const remaining: string[] = [];

  for (let index = 0; index < words.length; ) {
    let matched: Candidate | undefined;
    let matchedLength = 0;

    for (let length = Math.min(MAX_ALIAS_WORDS, words.length - index); length >= 1; length -= 1) {
      const candidate = lookup.get(normalizedWords.slice(index, index + length).join(" "));
      if (candidate) {
        matched = candidate;
        matchedLength = length;
        break;
      }
    }

    if (matched) {
      recordFilter(filters, matched);
      index += matchedLength;
      continue;
    }

    remaining.push(words[index]);
    index += 1;
  }

  return { q: remaining.join(" ").trim(), filters };
}
