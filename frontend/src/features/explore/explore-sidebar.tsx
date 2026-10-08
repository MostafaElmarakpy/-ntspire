"use client";

import { useId, useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronDown, Mail } from "lucide-react";
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

const GROUP_HEADING_CLASS = "px-1 py-1 text-sm text-muted-foreground";

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

/**
 * Figma Sidebar rows are plain editorial text: no pill, no background, no
 * border. The label carries the weight (medium ink when applied, muted
 * otherwise) and the live count sits beside it in a lighter tabular figure,
 * zero-padded the way the frame shows it ("02").
 */
function optionClass(active: boolean): string {
  return cn(
    "flex min-h-10 w-full items-baseline justify-start gap-2 px-1 py-1 text-start text-[15px] leading-7 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
    active ? "font-medium text-foreground" : "text-muted-foreground",
  );
}

/**
 * Discover entries are the same Figma text rows, without counts — the frame
 * lists Website / Sections / Mobile / OG Images as plain lines with the
 * applied entry in ink. No toggle pills anywhere in the sidebar.
 */
function discoverRowClass(active: boolean): string {
  return cn(
    "flex min-h-10 w-full items-baseline px-1 py-1 text-start text-[15px] leading-7 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
    active ? "font-medium text-foreground" : "text-muted-foreground",
  );
}

/** Zero-padded display count, Figma-style ("02"). The accessible name keeps
 * the natural number so assistive technology and existing contracts read
 * "SaaS 5", not "SaaS 05". */
function padCount(count: number): string {
  return String(count).padStart(2, "0");
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
      // The name keeps the natural number ("SaaS 5") while the visible figure is
      // zero-padded per the Figma frame ("05").
      aria-label={count === undefined ? undefined : `${label} ${count}`}
      aria-pressed={active}
      onClick={onClick}
      className={optionClass(active)}
    >
      <span className="min-w-0 truncate">{label}</span>
      {count === undefined ? null : <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{padCount(count)}</span>}
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
            "flex min-h-10 w-full items-baseline justify-between gap-2 px-1 py-1 text-start transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
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
 * The persistent Explore sidebar, matching the Figma Sidebar frame: a caption,
 * the Discover reference-type entries as plain text rows, the Industry
 * taxonomy with live facet counts, and every remaining filter as a
 * collapsible group in the same text-row language. The frame's bottom sponsor
 * block closes the sidebar. Rendered once in the desktop column and once
 * inside the mobile drawer, so both breakpoints share a single filter
 * implementation.
 */
export function ExploreSidebar({ locale, state, facets, total, onChange }: ExploreSidebarProps) {
  const [expandedOverride, setExpandedOverride] = useState<Partial<Record<FilterKey, boolean>>>({});
  // Both containers (the desktop column and the mobile drawer) can be mounted at
  // once, so every landmark label needs an id that is unique per instance.
  const idPrefix = useId();
  const groups = EXPLORE_FILTERS.filter((definition) => definition.key !== "industryId");
  const sectionsActive = !state.device && !state.formatId;
  const mobileActive = state.device === "mobile";
  const ogImagesActive = state.formatId === "og-image";

  const toggleFormat = (): ExploreState => {
    if (ogImagesActive) return clearFilter(state, "formatId");
    return { ...state, formatId: "og-image" };
  };

  return (
    <div className="space-y-7">
      <p className="px-1 text-sm text-muted-foreground">{t(locale, "explore.sidebarCaption")}</p>
      <nav aria-labelledby={`${idPrefix}-discover`} className="space-y-1">
        <h2 id={`${idPrefix}-discover`} className={GROUP_HEADING_CLASS}>
          {t(locale, "explore.discover")}
        </h2>
        <ul className="space-y-0">
          <li>
            {/*
              The source library's index. Its href comes from the navigation
              config, so the sidebar and the header can never disagree about
              where "Websites" lives, and it is never a dead end.
            */}
            <a href={routeHref(locale, "websites")} className={discoverRowClass(false)}>
              <span>{t(locale, "explore.discoverWebsite")}</span>
            </a>
          </li>
          <li>
            <button
              type="button"
              aria-current={sectionsActive ? "true" : undefined}
              onClick={() => onChange(clearFilter(clearFilter(state, "device"), "formatId"))}
              className={discoverRowClass(sectionsActive)}
            >
              <span>{t(locale, "explore.discoverSections")}</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              aria-current={mobileActive ? "true" : undefined}
              onClick={() => onChange({ ...state, device: "mobile" })}
              className={discoverRowClass(mobileActive)}
            >
              <span>{t(locale, "explore.discoverMobile")}</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              aria-current={ogImagesActive ? "true" : undefined}
              onClick={() => onChange(toggleFormat())}
              className={discoverRowClass(ogImagesActive)}
            >
              <span>{t(locale, "explore.discoverOgImages")}</span>
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

      {/*
        The Figma Sidebar frame's bottom block: sponsor call to action, contact
        email, and copyright. Both actions are mailto links, so the sidebar
        never points at a dead end. There is no social button: no profile URL
        exists behind it.
      */}
      <footer className="space-y-3 border-t border-border pt-5">
        <a
          href={`mailto:${t(locale, "sponsor.email")}?subject=${encodeURIComponent(t(locale, "sponsor.subject"))}`}
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 text-[15px] font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>{t(locale, "sponsor.cta")}</span>
          <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
        </a>
        <a
          href={`mailto:${t(locale, "sponsor.email")}`}
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 text-[15px] text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="min-w-0 truncate">{t(locale, "sponsor.email")}</span>
          <Mail className="size-4 shrink-0" aria-hidden="true" />
        </a>
        <p className="px-1 text-center text-sm text-muted-foreground">{t(locale, "explore.sidebarCopyright")}</p>
      </footer>
    </div>
  );
}
