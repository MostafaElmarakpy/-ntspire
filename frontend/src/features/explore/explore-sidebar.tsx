"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { INDUSTRIES } from "@/config/taxonomy";
import { routeHref } from "@/config/navigation";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import type { ExploreState } from "@/lib/explore-state";
import type { SearchFacets } from "@/types/domain";
import { EXPLORE_FILTERS, type FilterDefinition, type FilterKey } from "@/features/explore/filter-options";

export interface ExploreSidebarProps {
  locale: SupportedLocale;
  state: ExploreState;
  facets: SearchFacets;
  /** Live total for the current filter set, shown as the "All" count. */
  total: number;
  onChange: (state: ExploreState) => void;
}

const GROUP_HEADING_CLASS = "px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground";

/**
 * The sidebar lists are single-select, so choosing the entry that is already
 * applied clears it — the same "All / pick one" behaviour the removed dropdown
 * row had, expressed as a toggle.
 */
function toggleFilter(state: ExploreState, key: FilterKey, value: string): ExploreState {
  return state[key] === value ? clearFilter(state, key) : { ...state, [key]: value };
}

function clearFilter(state: ExploreState, key: keyof ExploreState): ExploreState {
  const next = { ...state };
  delete next[key];
  return next;
}

function optionClass(active: boolean): string {
  return cn(
    "flex min-h-10 w-full items-center justify-between gap-3 rounded-md px-3 py-1.5 text-start text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
    active && "bg-secondary font-semibold text-foreground",
  );
}

function OptionButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      // Spelled out so the count is part of a stable, predictable name instead of
      // depending on how the name-from-content algorithm joins two adjacent spans.
      aria-label={count === undefined ? undefined : `${label} ${count}`}
      aria-pressed={active}
      onClick={onClick}
      className={optionClass(active)}
    >
      <span className="min-w-0 truncate">{label}</span>
      {count === undefined ? null : <span className="shrink-0 text-xs tabular-nums">{count}</span>}
    </button>
  );
}

function SidebarSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-0.5">
      <h2 id={id} className={GROUP_HEADING_CLASS}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * A collapsible filter group. Groups that carry an applied value start expanded,
 * so an active filter is never hidden behind a collapsed heading when the page
 * loads from a URL (including a restored history entry).
 */
function FilterGroup({
  definition,
  idPrefix,
  locale,
  state,
  facets,
  total,
  expanded,
  onToggle,
  onChange,
}: ExploreSidebarProps & { definition: FilterDefinition; idPrefix: string; expanded: boolean; onToggle: () => void }) {
  const headingId = `${idPrefix}-${definition.key}`;
  const listId = `${headingId}-options`;
  const selected = state[definition.key];

  return (
    <section aria-labelledby={headingId} className="space-y-0.5">
      <h2 id={headingId}>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={onToggle}
          className={cn(
            "flex min-h-10 w-full items-center justify-between gap-2 rounded-md text-start transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring",
            GROUP_HEADING_CLASS,
          )}
        >
          <span className="min-w-0 truncate">{t(locale, definition.labelKey)}</span>
          <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 transition-transform", expanded && "rotate-180")} />
        </button>
      </h2>
      <ul id={listId} hidden={!expanded} className="space-y-0.5">
        <li>
          <OptionButton
            label={t(locale, "explore.allOptions")}
            count={total}
            active={!selected}
            onClick={() => onChange(clearFilter(state, definition.key))}
          />
        </li>
        {definition.options.map((option) => (
          <li key={option.id}>
            <OptionButton
              label={t(locale, option.labelKey)}
              count={facets[definition.facetKey][option.id] ?? 0}
              active={selected === option.id}
              onClick={() => onChange(toggleFilter(state, definition.key, option.id))}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The persistent Explore sidebar: the Discover reference-type entries, the
 * Industry taxonomy with live facet counts, and every remaining filter as a
 * collapsible group. Rendered once in the desktop column and once inside the
 * mobile sheet, so both breakpoints share a single filter implementation.
 */
export function ExploreSidebar({ locale, state, facets, total, onChange }: ExploreSidebarProps) {
  const [expandedOverride, setExpandedOverride] = useState<Partial<Record<FilterKey, boolean>>>({});
  // Both containers (the desktop column and the mobile sheet) can be mounted at
  // once, so every landmark label needs an id that is unique per instance.
  const idPrefix = useId();
  const groups = EXPLORE_FILTERS.filter((definition) => definition.key !== "industryId");
  const sectionsActive = !state.device;
  const mobileActive = state.device === "mobile";

  return (
    <div className="space-y-5">
      <nav aria-labelledby={`${idPrefix}-discover`} className="space-y-0.5">
        <h2 id={`${idPrefix}-discover`} className={GROUP_HEADING_CLASS}>
          {t(locale, "explore.discover")}
        </h2>
        <ul className="space-y-0.5">
          <li>
            {/*
              The source library's index. Its href comes from the navigation
              config, so the sidebar and the header can never disagree about
              where "Websites" lives, and it is never a dead end.
            */}
            <a href={routeHref(locale, "websites")} className={optionClass(false)}>
              <span className="min-w-0 truncate">{t(locale, "explore.discoverWebsite")}</span>
            </a>
          </li>
          <li>
            <button
              type="button"
              aria-current={sectionsActive ? "true" : undefined}
              onClick={() => onChange(clearFilter(state, "device"))}
              className={optionClass(sectionsActive)}
            >
              <span className="min-w-0 truncate">{t(locale, "explore.discoverSections")}</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              aria-current={mobileActive ? "true" : undefined}
              onClick={() => onChange({ ...state, device: "mobile" })}
              className={optionClass(mobileActive)}
            >
              <span className="min-w-0 truncate">{t(locale, "explore.discoverMobile")}</span>
            </button>
          </li>
        </ul>
      </nav>

      <SidebarSection id={`${idPrefix}-industries`} title={t(locale, "explore.industries")}>
        <ul className="space-y-0.5">
          <li>
            <OptionButton
              label={t(locale, "explore.allOptions")}
              count={total}
              active={!state.industryId}
              onClick={() => onChange(clearFilter(state, "industryId"))}
            />
          </li>
          {INDUSTRIES.map((industry) => (
            <li key={industry.id}>
              <OptionButton
                label={t(locale, industry.labelKey)}
                count={facets.industries[industry.id] ?? 0}
                active={state.industryId === industry.id}
                onClick={() => onChange(toggleFilter(state, "industryId", industry.id))}
              />
            </li>
          ))}
        </ul>
      </SidebarSection>

      {groups.map((definition) => (
        <FilterGroup
          key={definition.key}
          definition={definition}
          idPrefix={idPrefix}
          locale={locale}
          state={state}
          facets={facets}
          total={total}
          onChange={onChange}
          expanded={expandedOverride[definition.key] ?? Boolean(state[definition.key])}
          onToggle={() =>
            setExpandedOverride((current) => ({
              ...current,
              [definition.key]: !(current[definition.key] ?? Boolean(state[definition.key])),
            }))
          }
        />
      ))}
    </div>
  );
}
