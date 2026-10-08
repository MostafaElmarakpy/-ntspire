"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DEVICES,
  DIRECTIONS,
  getTaxonomyEntry,
  INDUSTRIES,
  LANGUAGES,
  QUICK_FILTER_CHIPS,
  SECTION_TYPES,
  STYLES,
  THEMES,
  type QuickFilterChip,
} from "@/config/taxonomy";
import { trackEvent } from "@/lib/analytics";
import { serializeExploreParams, type ExploreState } from "@/lib/explore-state";
import { parseSearchQuery, type SearchFilters } from "@/lib/search-parser";
import { addRecentSearch, loadRecentSearches, saveRecentSearches } from "@/lib/recent-searches";
import { t, type MessageKey } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import type { SearchFacets, Theme } from "@/types/domain";
import type { SearchSuggestion } from "@/types/services";

/**
 * Long enough that typing a word does not fire a request per keystroke, short
 * enough that suggestions still feel like they keep up.
 */
const SUGGESTION_DEBOUNCE_MS = 200;
const TRENDING_LIMIT = 6;

type FilterDimension = keyof OverlayFilters;
type OverlayFilters = SearchFilters & { theme?: Theme };
type OverlayTab = "trending" | "categories" | "sections" | "styles";

const TABS: ReadonlyArray<{ id: OverlayTab; labelKey: MessageKey }> = [
  { id: "trending", labelKey: "search.tabTrending" },
  { id: "categories", labelKey: "search.tabCategories" },
  { id: "sections", labelKey: "search.tabSections" },
  { id: "styles", labelKey: "search.tabStyles" },
];

/** Which filter each quick-filter chip writes. The chips are configuration, not markup. */
const QUICK_CHIP_DIMENSIONS: Record<QuickFilterChip["type"], FilterDimension> = {
  sectionType: "sectionTypeId",
  industry: "industryId",
  style: "styleId",
  language: "language",
};

const SUGGESTION_DIMENSIONS: Record<Exclude<SearchSuggestion["kind"], "source">, FilterDimension> = {
  sectionType: "sectionTypeId",
  industry: "industryId",
  style: "styleId",
  typography: "typographyId",
  color: "colorId",
  stack: "stackId",
};

const EMPTY_FACETS: SearchFacets = {
  sectionTypes: {},
  industries: {},
  styles: {},
  typographies: {},
  colors: {},
  stacks: {},
  formats: {},
  languages: {},
  devices: {},
  directions: {},
  themes: {},
  sources: {},
};

const EMPTY_FILTERS: OverlayFilters = {};

/** Resolves any filter to its label through the shared taxonomy — the overlay never invents its own. */
function filterLabelKey(dimension: FilterDimension, value: string): MessageKey | undefined {
  switch (dimension) {
    case "sectionTypeId": return getTaxonomyEntry("sectionType", value)?.labelKey;
    case "industryId": return getTaxonomyEntry("industry", value)?.labelKey;
    case "styleId": return getTaxonomyEntry("style", value)?.labelKey;
    case "typographyId": return getTaxonomyEntry("typography", value)?.labelKey;
    case "colorId": return getTaxonomyEntry("color", value)?.labelKey;
    case "stackId": return getTaxonomyEntry("stack", value)?.labelKey;
    case "language": return LANGUAGES.find((entry) => entry.id === value)?.labelKey;
    case "direction": return DIRECTIONS.find((entry) => entry.id === value)?.labelKey;
    case "device": return DEVICES.find((entry) => entry.id === value)?.labelKey;
    case "theme": return THEMES.find((entry) => entry.id === value)?.labelKey;
  }
}

/**
 * Writes a filter value after checking it against the shared taxonomy. Every
 * value here arrives as a plain string from config or from a server suggestion,
 * so this lookup — not a type assertion — is what keeps the state honest.
 */
function withFilter(filters: OverlayFilters, dimension: FilterDimension, value: string): OverlayFilters {
  switch (dimension) {
    case "sectionTypeId": return getTaxonomyEntry("sectionType", value) ? { ...filters, sectionTypeId: value } : filters;
    case "industryId": return getTaxonomyEntry("industry", value) ? { ...filters, industryId: value } : filters;
    case "styleId": return getTaxonomyEntry("style", value) ? { ...filters, styleId: value } : filters;
    case "typographyId": return getTaxonomyEntry("typography", value) ? { ...filters, typographyId: value } : filters;
    case "colorId": return getTaxonomyEntry("color", value) ? { ...filters, colorId: value } : filters;
    case "stackId": return getTaxonomyEntry("stack", value) ? { ...filters, stackId: value } : filters;
    case "language": { const hit = LANGUAGES.find((entry) => entry.id === value)?.id; return hit ? { ...filters, language: hit } : filters; }
    case "direction": { const hit = DIRECTIONS.find((entry) => entry.id === value)?.id; return hit ? { ...filters, direction: hit } : filters; }
    case "device": { const hit = DEVICES.find((entry) => entry.id === value)?.id; return hit ? { ...filters, device: hit } : filters; }
    case "theme": { const hit = THEMES.find((entry) => entry.id === value)?.id; return hit ? { ...filters, theme: hit } : filters; }
  }
}

function withoutFilter(filters: OverlayFilters, dimension: FilterDimension): OverlayFilters {
  const next: OverlayFilters = { ...filters };
  delete next[dimension];
  return next;
}

interface OverlayOption {
  key: string;
  label: string;
  count?: number;
  apply: () => void;
}

/**
 * The dialog body.
 *
 * Radix unmounts closed dialog content, so this component is created fresh on
 * every open: recent searches, dismissed chips and the highlighted row all start
 * clean by construction, with no reset effects to keep in step.
 */
function SearchPanel({ locale, onDismiss }: { locale: SupportedLocale; onDismiss: () => void }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [applied, setApplied] = useState<OverlayFilters>(EMPTY_FILTERS);
  const [deviceContext, setDeviceContext] = useState<"desktop" | "mobile" | undefined>();
  const [dismissed, setDismissed] = useState<ReadonlySet<FilterDimension>>(new Set());
  const [tab, setTab] = useState<OverlayTab>("trending");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [facets, setFacets] = useState<SearchFacets>(EMPTY_FACETS);
  const [total, setTotal] = useState<number | null>(null);
  const [recent, setRecent] = useState<string[]>(loadRecentSearches);
  // The option the keyboard is on, held by key rather than index: when a new
  // list arrives, a key that no longer exists simply stops being highlighted.
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = useId();
  const panelId = useId();

  const parsed = useMemo(() => parseSearchQuery(text), [text]);
  const trimmedText = text.trim();

  const labelFor = useCallback(
    (dimension: FilterDimension, value: string) => {
      const key = filterLabelKey(dimension, value);
      return key ? t(locale, key) : value;
    },
    [locale],
  );

  // A detected filter can be removed without touching the typed text, and stays
  // removed for as long as the overlay is open, so re-detection cannot undo the user.
  const detected = useMemo(
    () => (Object.entries(parsed.filters) as Array<[FilterDimension, string]>)
      .filter(([dimension]) => !dismissed.has(dimension))
      .map(([dimension, value]) => ({ dimension, value })),
    [parsed, dismissed],
  );

  const effective = useMemo(() => {
    let next: OverlayFilters = { ...applied };
    for (const entry of detected) {
      if (next[entry.dimension] === undefined) next = withFilter(next, entry.dimension, entry.value);
    }
    if (deviceContext) next = { ...next, device: deviceContext };
    return next;
  }, [applied, detected, deviceContext]);

  // What the overlay previews and what it submits must be the same thing, free
  // text included, so the counts shown here match the results page exactly.
  const previewQuery = useMemo(() => {
    const state: ExploreState = { ...effective };
    if (parsed.q) state.q = parsed.q;
    return serializeExploreParams(state);
  }, [effective, parsed.q]);

  /* The input is inside a dialog, so it has to be focused explicitly once the
     portal has mounted. */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* Debounced suggestions. In-flight requests are left to finish rather than
     aborted, so a fast typist never produces cancelled requests, and the
     previous list stays on screen until the next one arrives. */
  useEffect(() => {
    if (!trimmedText) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      fetch(`/api/search/suggest?q=${encodeURIComponent(trimmedText)}`)
        .then((response) => (response.ok ? (response.json() as Promise<{ data?: { suggestions?: SearchSuggestion[] } }>) : null))
        .then((payload) => {
          if (!cancelled && payload?.data) setSuggestions(payload.data.suggestions ?? []);
        })
        .catch(() => {
          // Offline or failed lookup: keep the previous list rather than flashing empty.
        });
    }, SUGGESTION_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmedText]);

  /* Live counts. This reads the Explore route, so the overlay and Explore go
     through one SearchService and can never report different totals. */
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/explore?locale=${locale}${previewQuery ? `&${previewQuery}` : ""}`)
      .then((response) => (response.ok ? (response.json() as Promise<{ data?: { facets?: SearchFacets; total?: number } }>) : null))
      .then((payload) => {
        if (cancelled || !payload?.data) return;
        setFacets(payload.data.facets ?? EMPTY_FACETS);
        setTotal(payload.data.total ?? 0);
      })
      .catch(() => {
        // Counts are an enhancement; the overlay still works without them.
      });

    return () => {
      cancelled = true;
    };
  }, [locale, previewQuery]);

  const toggle = useCallback((dimension: FilterDimension, value: string) => {
    setApplied((current) => (current[dimension] === value ? withoutFilter(current, dimension) : withFilter(current, dimension, value)));
  }, []);

  const submit = useCallback(() => {
    if (trimmedText) {
      const next = addRecentSearch(recent, trimmedText);
      saveRecentSearches(next);
      setRecent(next);
    }

    trackEvent("search_performed", {
      hasQuery: parsed.q.length > 0,
      filterCount: Object.keys(effective).length,
      device: deviceContext ?? "none",
    });

    onDismiss();
    router.push(`/${locale}/explore${previewQuery ? `?${previewQuery}` : ""}`);
  }, [deviceContext, effective, locale, onDismiss, parsed.q, previewQuery, recent, router, trimmedText]);

  const applySuggestion = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.kind === "source") {
      // Explore's URL state has no source filter, so a source resolves to a text
      // search on its name, which the search engine already matches.
      setText(suggestion.label ?? suggestion.id);
      return;
    }
    // Destructured so the narrowed kind survives into the state updater below.
    const { kind, id } = suggestion;
    setApplied((current) => withFilter(current, SUGGESTION_DIMENSIONS[kind], id));
    setText("");
  }, []);

  const facetEntries = useMemo(() => {
    const sectionEntries = SECTION_TYPES.map((entry) => ({ dimension: "sectionTypeId" as FilterDimension, id: entry.id, labelKey: entry.labelKey, count: facets.sectionTypes[entry.id] ?? 0, order: 0 }));
    const categoryEntries = INDUSTRIES.map((entry) => ({ dimension: "industryId" as FilterDimension, id: entry.id, labelKey: entry.labelKey, count: facets.industries[entry.id] ?? 0, order: 1 }));
    const styleEntries = STYLES.map((entry) => ({ dimension: "styleId" as FilterDimension, id: entry.id, labelKey: entry.labelKey, count: facets.styles[entry.id] ?? 0, order: 2 }));

    // "Trending" is a deterministic ranking of what is actually most common in the
    // current result set — no analytics backend is invented for it.
    const trending = [...sectionEntries, ...categoryEntries, ...styleEntries]
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count || a.order - b.order)
      .slice(0, TRENDING_LIMIT);

    return { trending, categories: categoryEntries, sections: sectionEntries, styles: styleEntries };
  }, [facets]);

  /** One flat, ordered list: whatever the keyboard walks is whatever is on screen. */
  const options: OverlayOption[] = useMemo(() => {
    if (trimmedText) {
      return suggestions.map((suggestion) => {
        if (suggestion.kind === "source") {
          return { key: `source-${suggestion.id}`, label: suggestion.label ?? suggestion.id, apply: () => applySuggestion(suggestion) };
        }
        return {
          key: `${suggestion.kind}-${suggestion.id}`,
          label: labelFor(SUGGESTION_DIMENSIONS[suggestion.kind], suggestion.id),
          apply: () => applySuggestion(suggestion),
        };
      });
    }

    return facetEntries[tab].map((entry) => ({
      key: `${entry.dimension}-${entry.id}`,
      label: t(locale, entry.labelKey),
      count: entry.count,
      apply: () => toggle(entry.dimension, entry.id),
    }));
  }, [applySuggestion, facetEntries, labelFor, locale, tab, toggle, trimmedText, suggestions]);

  const activeIndex = activeKey === null ? -1 : options.findIndex((option) => option.key === activeKey);
  const activeOption = activeIndex >= 0 ? options[activeIndex] : undefined;

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (options.length === 0) return;
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (activeIndex + delta + options.length) % options.length;
      setActiveKey(options[nextIndex]?.key ?? null);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (activeOption) activeOption.apply();
      else submit();
    }
  };

  const chipClass = (active: boolean) =>
    `inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm transition-colors ${
      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-secondary"
    }`;

  const renderOptions = (label: string) => (
    <ul id={listboxId} role="listbox" aria-label={label} className="space-y-1">
      {options.map((option, index) => (
        <li
          key={option.key}
          id={`${listboxId}-option-${index}`}
          role="option"
          aria-selected={index === activeIndex}
          // Spelled out so the count is part of a stable, predictable name instead
          // of running into the label as one word.
          aria-label={option.count === undefined ? undefined : `${option.label} ${option.count}`}
          className={`flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-md px-3 text-sm ${index === activeIndex ? "bg-secondary" : ""}`}
          onMouseEnter={() => setActiveKey(option.key)}
          onClick={option.apply}
        >
          <span className="min-w-0 truncate">{option.label}</span>
          {option.count === undefined ? null : <span className="shrink-0 text-xs text-muted-foreground">{option.count}</span>}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex max-h-[85vh] flex-col" data-testid="search-overlay">
      <div className="flex flex-col gap-3 border-b border-border p-4">
        <div className="flex items-center gap-3 rounded-md border border-border bg-muted px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <Input
            ref={inputRef}
            role="combobox"
            aria-label={t(locale, "shell.searchInputLabel")}
            aria-expanded
            aria-controls={panelId}
            aria-autocomplete="list"
            {...(activeOption ? { "aria-activedescendant": `${listboxId}-option-${activeIndex}` } : {})}
            placeholder={t(locale, "shell.searchPlaceholder")}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onInputKeyDown}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t(locale, "search.quickFiltersLabel")}>
          {QUICK_FILTER_CHIPS.map((chip) => {
            const dimension = QUICK_CHIP_DIMENSIONS[chip.type];
            const active = applied[dimension] === chip.value;
            return (
              <button key={chip.id} type="button" className={chipClass(active)} aria-pressed={active} onClick={() => toggle(dimension, chip.value)}>
                {t(locale, chip.labelKey)}
              </button>
            );
          })}
          <button type="button" className={chipClass(showMoreFilters)} aria-pressed={showMoreFilters} aria-expanded={showMoreFilters} onClick={() => setShowMoreFilters((current) => !current)}>
            {t(locale, "search.moreFilters")}
          </button>
        </div>

        {showMoreFilters ? (
          <div className="flex flex-wrap gap-2" data-testid="more-filters">
            {LANGUAGES.map((entry) => (
              <button key={`language-${entry.id}`} type="button" className={chipClass(applied.language === entry.id)} aria-pressed={applied.language === entry.id} onClick={() => toggle("language", entry.id)}>{t(locale, entry.labelKey)}</button>
            ))}
            {DIRECTIONS.map((entry) => (
              <button key={`direction-${entry.id}`} type="button" className={chipClass(applied.direction === entry.id)} aria-pressed={applied.direction === entry.id} onClick={() => toggle("direction", entry.id)}>{t(locale, entry.labelKey)}</button>
            ))}
            {THEMES.map((entry) => (
              <button key={`theme-${entry.id}`} type="button" className={chipClass(applied.theme === entry.id)} aria-pressed={applied.theme === entry.id} onClick={() => toggle("theme", entry.id)}>{t(locale, entry.labelKey)}</button>
            ))}
          </div>
        ) : null}

        {detected.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2" data-testid="detected-filters">
            <span className="text-xs font-medium text-muted-foreground">{t(locale, "search.detectedLabel")}</span>
            {detected.map((entry) => {
              const label = labelFor(entry.dimension, entry.value);
              return (
                <button
                  key={`detected-${entry.dimension}`}
                  type="button"
                  className={chipClass(true)}
                  aria-label={`${t(locale, "search.removeDetected")}: ${label}`}
                  onClick={() => setDismissed((current) => new Set(current).add(entry.dimension))}
                >
                  {label}
                  <span aria-hidden="true">×</span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t(locale, "search.deviceContext")}>
            {([undefined, "desktop", "mobile"] as const).map((value) => (
              <button
                key={value ?? "any"}
                type="button"
                className={chipClass(deviceContext === value)}
                aria-pressed={deviceContext === value}
                onClick={() => setDeviceContext(value)}
              >
                {value ? labelFor("device", value) : t(locale, "search.deviceAny")}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {total === null ? "" : `${total} ${t(locale, "search.resultCount")}`}
          </p>
        </div>
      </div>

      <div id={panelId} className="min-h-0 flex-1 overflow-y-auto p-4">
        {trimmedText ? (
          options.length > 0 ? renderOptions(t(locale, "search.suggestionsLabel")) : <p className="text-sm text-muted-foreground">{t(locale, "search.noSuggestions")}</p>
        ) : (
          <div className="space-y-4">
            <div role="tablist" aria-label={t(locale, "search.filtersPanelLabel")} className="flex flex-wrap gap-2">
              {TABS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  id={`${panelId}-tab-${entry.id}`}
                  aria-selected={tab === entry.id}
                  aria-controls={`${panelId}-tabpanel`}
                  className={chipClass(tab === entry.id)}
                  onClick={() => setTab(entry.id)}
                >
                  {t(locale, entry.labelKey)}
                </button>
              ))}
            </div>

            <div role="tabpanel" id={`${panelId}-tabpanel`} aria-labelledby={`${panelId}-tab-${tab}`} className="space-y-3">
              {recent.length > 0 ? (
                <div>
                  <p className="pb-1 text-xs font-medium text-muted-foreground">{t(locale, "search.recentSearches")}</p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((query) => (
                      <button key={`recent-chip-${query}`} type="button" className={chipClass(false)} onClick={() => setText(query)}>{query}</button>
                    ))}
                  </div>
                </div>
              ) : null}

              {options.length > 0 ? renderOptions(t(locale, "search.filtersPanelLabel")) : <p className="text-sm text-muted-foreground">{t(locale, "search.noResults")}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border p-4">
        <Button type="button" onClick={submit}>{t(locale, "shell.searchViewAll")}</Button>
      </div>
    </div>
  );
}

export function SearchOverlay({
  locale,
  triggerLabel,
  compact = false,
  open: controlledOpen,
  onOpenChange,
  shortcut = false,
}: {
  locale: SupportedLocale;
  /** Omit to render no trigger; the parent then owns `open` and `onOpenChange`. */
  triggerLabel?: string;
  compact?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Lets a custom trigger (e.g. the header search pill) own the `/` and ⌘K shortcuts. */
  shortcut?: boolean;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  /**
   * The shell renders several search entry points — the desktop navigation
   * entry, the compact icon beside it and the row inside the mobile menu — so
   * only the primary, always-present trigger owns the global shortcut.
   * Registering it more than once would stack several overlays on one keypress.
   */
  const ownsShortcut = shortcut || (!compact && triggerLabel !== undefined);

  useEffect(() => {
    if (!ownsShortcut) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = Boolean(target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable));

      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
        return;
      }
      // `/` is only a shortcut while the user is not already typing somewhere else.
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ownsShortcut, setOpen]);

  const trigger = triggerLabel === undefined ? null : compact ? (
    <Button type="button" variant="outline" size="icon" className="min-h-11 min-w-11" aria-label={triggerLabel}>
      <Search aria-hidden="true" />
    </Button>
  ) : (
    <button type="button" className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground" aria-label={triggerLabel}>
      <Search className="size-4" aria-hidden="true" />
      <span>{triggerLabel}</span>
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent closeLabel={t(locale, "shell.close")} className="p-0 sm:max-w-3xl">
        <DialogTitle className="sr-only">{t(locale, "shell.search")}</DialogTitle>
        <DialogDescription className="sr-only">{t(locale, "search.dialogDescription")}</DialogDescription>
        <SearchPanel locale={locale} onDismiss={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
