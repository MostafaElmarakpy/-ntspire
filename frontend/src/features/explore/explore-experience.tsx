"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, SectionSkeleton } from "@/components/content-states";
import { ErrorState } from "@/components/error-state";
import { ExploreFilterSheet, ExploreFilters } from "@/features/explore/explore-filters";
import { trackExploreDeviceView, trackExploreFilterApplied } from "@/features/explore/analytics";
import { FILTER_LABELS, getExploreFilterLabel, type FilterKey } from "@/features/explore/filter-options";
import { MasonryGrid } from "@/features/gallery/masonry-grid";
import { MasonrySkeleton } from "@/features/gallery/masonry-skeleton";
import { SectionCard } from "@/features/gallery/section-card";
import type { SectionCardData } from "@/features/gallery/types";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { estimateMasonryHeight } from "@/lib/masonry";
import type { ExploreState } from "@/lib/explore-state";
import { parseExploreParams, serializeExploreParams } from "@/lib/explore-state";
import type { SearchFacets } from "@/types/domain";
import type { ExplorePageData } from "./types";

const FILTER_KEYS = Object.keys(FILTER_LABELS) as FilterKey[];

interface ExploreApiResponse {
  data?: ExplorePageData;
  error?: boolean;
}

async function requestExplorePage(
  state: ExploreState,
  locale: SupportedLocale,
  options: { cursor?: string; mockMode?: string } = {},
): Promise<ExplorePageData> {
  const params = new URLSearchParams(serializeExploreParams(state));
  params.set("locale", locale);
  if (options.cursor) params.set("cursor", options.cursor);
  if (options.mockMode) params.set("__mock", options.mockMode);

  const response = await fetch(`/api/explore?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Explore request failed");
  const result = await response.json() as ExploreApiResponse;
  if (result.error || !result.data) throw new Error("Explore request failed");
  return result.data;
}

interface ExploreExperienceProps {
  locale: SupportedLocale;
  state: ExploreState;
  initialData: ExplorePageData;
  initialError: boolean;
}

interface ActiveChip {
  key: keyof ExploreState;
  label: string;
  value: string;
}

/** Sort stays in the results toolbar rather than the sidebar: it orders, it does not filter. */
function ExploreSortControl({
  locale,
  state,
  onChange,
}: {
  locale: SupportedLocale;
  state: ExploreState;
  onChange: (state: ExploreState) => void;
}) {
  return (
    <label htmlFor="explore-sort" className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      <span>{t(locale, "explore.sortLabel")}</span>
      <select
        id="explore-sort"
        value={state.sortBy ?? "latest"}
        onChange={(event) => onChange({ ...state, sortBy: event.currentTarget.value === "featured" ? "featured" : undefined })}
        className="min-h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="latest">{t(locale, "explore.sortLatest")}</option>
        <option value="featured">{t(locale, "explore.sortFeatured")}</option>
      </select>
    </label>
  );
}

export function ExploreExperience({ locale, state, initialData, initialError }: ExploreExperienceProps) {
  const [activeState, setActiveState] = useState(state);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SectionCardData[]>(initialData.items);
  const [facets, setFacets] = useState<SearchFacets>(initialData.facets);
  const [total, setTotal] = useState(initialData.total);
  const [nextCursor, setNextCursor] = useState(initialData.nextCursor);
  const [pageError, setPageError] = useState(initialError);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const requestSequence = useRef(0);

  const loadResults = async (nextState: ExploreState, nextMockMode: string | undefined, addHistoryEntry: boolean) => {
    const query = serializeExploreParams(nextState);
    const destination = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    const commitHistory = () => {
      const currentLocation = `${window.location.pathname}${window.location.search}`;
      if (addHistoryEntry && currentLocation !== destination) window.history.pushState(null, "", destination);
    };

    const requestId = ++requestSequence.current;
    setActiveState(nextState);
    setLoading(true);
    setPageError(false);
    setLoadMoreError(false);
    setItems([]);

    try {
      const result = await requestExplorePage(nextState, locale, { mockMode: nextMockMode });
      if (requestId !== requestSequence.current) return;
      commitHistory();
      setItems(result.items);
      setFacets(result.facets);
      setTotal(result.total);
      setNextCursor(result.nextCursor);
    } catch {
      if (requestId === requestSequence.current) {
        commitHistory();
        setPageError(true);
      }
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const restoredState = parseExploreParams(params);
      const restoredMockMode = params.get("__mock") ?? undefined;
      const requestId = ++requestSequence.current;
      setActiveState(restoredState);
      setLoading(true);
      setPageError(false);
      setLoadMoreError(false);
      setItems([]);
      void requestExplorePage(restoredState, locale, { mockMode: restoredMockMode })
        .then((result) => {
          if (requestId !== requestSequence.current) return;
          setItems(result.items);
          setFacets(result.facets);
          setTotal(result.total);
          setNextCursor(result.nextCursor);
        })
        .catch(() => {
          if (requestId === requestSequence.current) setPageError(true);
        })
        .finally(() => {
          if (requestId === requestSequence.current) setLoading(false);
        });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [locale]);

  useEffect(() => {
    if (activeState.device) trackExploreDeviceView(activeState.device);
  }, [activeState.device]);

  const navigateToState = (nextState: ExploreState) => {
    for (const key of FILTER_KEYS) {
      if (activeState[key] !== nextState[key]) {
        trackExploreFilterApplied(key, nextState[key] ?? "cleared");
      }
    }
    void loadResults(nextState, undefined, true);
  };

  const activeChips: ActiveChip[] = [
    ...(activeState.q ? [{ key: "q" as const, label: t(locale, "explore.queryLabel"), value: activeState.q }] : []),
    ...FILTER_KEYS.flatMap((key) => activeState[key] ? [{ key, label: t(locale, FILTER_LABELS[key]), value: getExploreFilterLabel(locale, key, activeState[key]!) }] : []),
  ];

  const removeChip = (key: keyof ExploreState) => {
    const nextState = { ...activeState };
    delete nextState[key];
    navigateToState(nextState);
  };

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const nextPage = await requestExplorePage(activeState, locale, {
        cursor: nextCursor,
        mockMode: new URLSearchParams(window.location.search).get("__mock") ?? undefined,
      });
      setItems((currentItems) => {
        const knownIds = new Set(currentItems.map((item) => item.id));
        return [...currentItems, ...nextPage.items.filter((item) => !knownIds.has(item.id))];
      });
      setFacets(nextPage.facets);
      setTotal(nextPage.total);
      setNextCursor(nextPage.nextCursor);
    } catch {
      setLoadMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const count = (
    <p className="text-sm text-muted-foreground" aria-live="polite">
      {t(locale, "explore.showing")} {items.length} {t(locale, "explore.of")} {total} {t(locale, "explore.references")}
    </p>
  );
  const exploreQuery = serializeExploreParams(activeState);
  const detailHref = (sectionId: string) => `/${locale}/sections/${sectionId}${exploreQuery ? `?${exploreQuery}` : ""}`;

  return (
    <div className="-mx-5 -my-10 space-y-6 px-5 py-6 sm:-mx-8 sm:-my-14 sm:px-8 sm:py-8 lg:-mx-12 lg:px-8">
      {/*
        The visible "Explore references" header was replaced by the sidebar's
        Discover section. The heading stays in the document, visually hidden, so
        the page keeps a single top-level heading for assistive technology and
        search engines.
      */}
      <h1 className="sr-only">{t(locale, "explore.title")}</h1>

      <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
        <ExploreFilters locale={locale} state={activeState} facets={facets} total={total} onChange={navigateToState} />

        <div className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <ExploreFilterSheet locale={locale} state={activeState} facets={facets} total={total} onChange={navigateToState} />
              {count}
            </div>
            <ExploreSortControl locale={locale} state={activeState} onChange={navigateToState} />
          </div>

          {activeChips.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2" role="region" aria-label={t(locale, "explore.activeFilters")}>
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  aria-label={`${t(locale, "explore.removeFilter")} ${chip.label}: ${chip.value}`}
                  onClick={() => removeChip(chip.key)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>{chip.label}: {chip.value}</span>
                  <X className="size-4" aria-hidden="true" />
                </button>
              ))}
              <Button type="button" variant="ghost" className="min-h-10" onClick={() => navigateToState({})}>
                {t(locale, "explore.clearFilters")}
              </Button>
            </div>
          ) : null}

          {loading ? (
            <MasonrySkeleton label={`${t(locale, "explore.title")} — ${t(locale, "ui.loading")}`} />
          ) : pageError ? (
            <ErrorState
              title={t(locale, "explore.errorTitle")}
              description={t(locale, "explore.errorDescription")}
              retryLabel={t(locale, "ui.retry")}
              onRetry={() => void loadResults(activeState, undefined, true)}
            />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-4">
              <EmptyState title={t(locale, "explore.emptyTitle")} description={t(locale, "explore.emptyDescription")} />
              <Button type="button" variant="outline" className="min-h-11" onClick={() => navigateToState({})}>
                {t(locale, "explore.clearFilters")}
              </Button>
            </div>
          ) : (
            <>
              <MasonryGrid
                items={items}
                getKey={(card) => card.id}
                heightEstimator={(card) => estimateMasonryHeight(card.image)}
                renderItem={(card, { priority }) => (
                  <SectionCard
                    card={card}
                    locale={locale}
                    openHref={detailHref(card.id)}
                    priority={priority}
                  />
                )}
                label={t(locale, "explore.resultsLabel")}
              />
              {loadMoreError ? (
                <ErrorState
                  title={t(locale, "explore.errorTitle")}
                  description={t(locale, "explore.errorDescription")}
                  retryLabel={t(locale, "ui.retry")}
                  onRetry={loadMore}
                />
              ) : null}
              {loadingMore ? (
                <div className="mx-auto max-w-md" role="status" aria-label={t(locale, "ui.loading")}>
                  <SectionSkeleton width={1440} height={640} locale={locale} />
                </div>
              ) : null}
              {nextCursor ? (
                <div className="flex justify-center">
                  <Button type="button" variant="outline" className="min-h-11 px-6" onClick={loadMore} disabled={loadingMore}>
                    {t(locale, "explore.loadMore")}
                  </Button>
                </div>
              ) : (
                <p className="py-3 text-center text-sm text-muted-foreground">{t(locale, "explore.endOfResults")}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
