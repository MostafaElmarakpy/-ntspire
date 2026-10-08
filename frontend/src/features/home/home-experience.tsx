"use client";

import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Search, Menu, LayoutGrid, Sparkles, TrendingUp, LayoutDashboard } from "lucide-react";
import { EmptyState } from "@/components/content-states";
import { ErrorState } from "@/components/error-state";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { SearchOverlay } from "@/components/search-overlay";
import { SignInDialog } from "@/components/sign-in-dialog";
import { Button } from "@/components/ui/button";
import { Badge as Chip } from "@/components/ui/chip";
import { Drawer } from "@heroui/react/drawer";
import { HeroPanel } from "@/components/hero-panel";
import { SponsorSlot } from "@/components/sponsor-slot";
import { INDUSTRIES, SECTION_TYPES, STYLES, THEMES, DEVICES, TYPOGRAPHIES, COLORS, STACKS } from "@/config/taxonomy";
import { routeHref } from "@/config/navigation";
import type { ExplorePageData } from "@/features/explore/types";
import { MasonryGrid } from "@/features/gallery/masonry-grid";
import { SectionCard } from "@/features/gallery/section-card";
import { estimateMasonryHeight } from "@/lib/masonry";
import { serializeExploreParams, type ExploreState } from "@/lib/explore-state";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { useState, useId } from "react";
import type { RouteKey } from "@/config/navigation";

type BrowseCategory = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; size?: number; "aria-hidden"?: boolean }>;
  route: RouteKey;
};

interface HomeExperienceProps {
  locale: SupportedLocale;
  state: ExploreState;
  data: ExplorePageData;
  initialError: boolean;
}

function FilterSelect({
  label,
  name,
  selected,
  options,
}: {
  label: string;
  name: string;
  selected?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        name={name}
        defaultValue={selected ?? ""}
        className="min-h-9 max-w-36 appearance-none rounded-md border border-border bg-card px-3 pe-8 text-xs font-medium text-foreground shadow-soft transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function currentHomeHref(locale: SupportedLocale, state: ExploreState) {
  const query = serializeExploreParams(state);
  return query ? `/${locale}?${query}` : `/${locale}`;
}

export function HomeExperience({ locale, state, data, initialError }: HomeExperienceProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const descriptionId = useId();

  const discoverItems = [
    { label: t(locale, "explore.discoverWebsite"), href: routeHref(locale, "websites") },
    { label: t(locale, "explore.discoverSections"), href: routeHref(locale, "explore"), active: true },
    { label: t(locale, "explore.discoverMobile"), href: currentHomeHref(locale, { ...state, device: "mobile" }) },
  ];

  const browseCategories: BrowseCategory[] = [
    { id: "all", label: t(locale, "home.browseAll"), Icon: LayoutGrid, route: "explore" },
    { id: "websites", label: t(locale, "home.browseWebsites"), Icon: LayoutDashboard, route: "websites" },
    { id: "sections", label: t(locale, "home.browseSections"), Icon: LayoutGrid, route: "sections" },
    { id: "mobile", label: t(locale, "home.browseMobile"), Icon: LayoutDashboard, route: "mobile" },
    { id: "og-images", label: t(locale, "home.browseOgImages"), Icon: Sparkles, route: "ogImages" },
    { id: "app-screens", label: t(locale, "home.browseAppScreens"), Icon: TrendingUp, route: "categories" },
  ];

  const styles = STYLES.map((entry) => ({ value: entry.id, label: t(locale, entry.labelKey) }));
  const industries = INDUSTRIES.map((entry) => ({ value: entry.id, label: t(locale, entry.labelKey) }));
  const sectionTypes = SECTION_TYPES.map((entry) => ({ value: entry.id, label: t(locale, entry.labelKey) }));
  const themes = THEMES.map((entry) => ({ value: entry.id, label: t(locale, entry.labelKey) }));
  const devices = DEVICES.map((entry) => ({ value: entry.id, label: t(locale, entry.labelKey) }));

  const trendingIndustries = INDUSTRIES
    .map((industry) => ({
      ...industry,
      count: data.facets.industries[industry.id] ?? 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const featuredSections = data.items.slice(0, 6);

  return (
    <div data-home-screen className="min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex min-h-16 w-full max-w-[105rem] items-center justify-between gap-4 px-6 lg:px-10">
          <Link href={routeHref(locale, "home")} prefetch={false} aria-label={t(locale, "shell.home")} className="shrink-0 rounded-sm focus-visible:outline-none">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">n</span>
            <span className="hidden text-xl font-semibold leading-none lg:inline">{t(locale, "wordmark")}</span>
          </Link>

          <nav aria-label={t(locale, "shell.primaryNavigation")} className="hidden items-center gap-1 lg:flex">
            <span aria-label={t(locale, "shell.browse")} className="flex items-center gap-1">
              {browseCategories.map((category) => (
                <Link key={category.id} href={routeHref(locale, category.route)} prefetch={false} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary">
                  <category.Icon className="size-4" aria-hidden={true} />
                  <span>{category.label}</span>
                </Link>
              ))}
            </span>
            <span aria-hidden={true} className="mx-1 h-4 w-px shrink-0 bg-border" />
            <span aria-label={t(locale, "shell.resources")} className="flex items-center gap-1">
              <Link href={routeHref(locale, "pages")} prefetch={false} className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary">
                {t(locale, "shell.pages")}
              </Link>
              <Link href={routeHref(locale, "categories")} prefetch={false} className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary">
                {t(locale, "shell.categories")}
              </Link>
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden h-11 w-12 lg:block" aria-hidden={true} data-locale-switcher-slot />
            <div className="lg:hidden">
              <SearchOverlay locale={locale} triggerLabel={t(locale, "shell.search")} compact />
            </div>
            <SignInDialog locale={locale} presentation="icon" />
            <MobileNavMenu locale={locale} />
          </div>
        </div>
      </header>

      <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[17.5rem_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside
          aria-label={t(locale, "home.sidebarLabel")}
          className="z-20 border-b border-border bg-card lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:flex lg:flex-col lg:border-b-0 lg:border-e"
        >
          <div className="flex min-w-0 items-center justify-between px-5 py-4 lg:block lg:pb-2">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-none">
              <span aria-hidden={true} className="flex size-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">n</span>
              <h1 className="text-2xl font-semibold leading-none tracking-[-0.01em]">{t(locale, "wordmark")}</h1>
            </Link>
            <div className="flex items-center gap-2 lg:hidden">
              <SignInDialog locale={locale} />
              <MobileNavMenu locale={locale} />
            </div>
            <p className="mt-3 hidden max-w-52 text-xs leading-relaxed text-muted-foreground lg:block">
              {t(locale, "design.footerNote")}
            </p>
          </div>

          <nav aria-label={t(locale, "home.discoverLabel")} className="px-3 pb-3 lg:pt-3">
            <h2 className="hidden px-3 pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground lg:block">
              {t(locale, "explore.discover")}
            </h2>
            <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {discoverItems.map((item) => (
                <li key={item.label} className="shrink-0">
                  <Link
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                    className={`flex min-h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors hover:bg-secondary hover:text-foreground ${item.active ? "bg-secondary font-semibold text-foreground" : "text-muted-foreground"}`}
                  >
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              <li className="shrink-0">
                <span
                  aria-disabled="true"
                  className="flex min-h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground/60"
                  title={t(locale, "home.comingSoon")}
                >
                  {t(locale, "home.ogImages")}
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide">{t(locale, "home.soon")}</span>
                </span>
              </li>
            </ul>
          </nav>

          <nav aria-label={t(locale, "home.industriesLabel")} className="hidden min-h-0 flex-1 overflow-y-auto px-3 pb-4 lg:block">
            <h2 className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t(locale, "explore.industries")}
            </h2>
            <ul className="space-y-0.5">
              {INDUSTRIES.map((industry) => (
                <li key={industry.id}>
                  <Link
                    href={currentHomeHref(locale, { ...state, industryId: industry.id })}
                    aria-current={state.industryId === industry.id ? "page" : undefined}
                    className={`flex min-h-8 items-center justify-between gap-2 rounded-md px-3 text-xs transition-colors hover:bg-secondary hover:text-foreground ${state.industryId === industry.id ? "bg-secondary font-semibold text-foreground" : "text-muted-foreground"}`}
                  >
                    <span className="truncate">{t(locale, industry.labelKey)}</span>
                    <span className="text-xs tabular-nums">{data.facets.industries[industry.id] ?? 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <details className="px-3 pb-3 lg:hidden">
            <summary className="cursor-pointer rounded-md px-3 py-2 text-xs font-medium text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring">
              {t(locale, "explore.industries")}
            </summary>
            <ul className="mt-1 flex gap-1 overflow-x-auto pb-1">
              {INDUSTRIES.map((industry) => (
                <li key={industry.id} className="shrink-0">
                  <Link
                    href={currentHomeHref(locale, { ...state, industryId: industry.id })}
                    className="flex min-h-8 items-center gap-2 rounded-full border border-border bg-background px-3 text-xs text-muted-foreground"
                  >
                    {t(locale, industry.labelKey)}
                    <span className="tabular-nums">{data.facets.industries[industry.id] ?? 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </details>

          <div className="hidden space-y-3 border-t border-border px-4 py-4 lg:block">
            <a href={`mailto:${t(locale, "home.contactEmail")}`} className="flex min-h-9 items-center gap-2 rounded-md px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
              {t(locale, "home.support")}
              <ArrowRight className="ms-auto size-3.5" aria-hidden={true} />
            </a>
            <a href={`mailto:${t(locale, "home.contactEmail")}`} className="block truncate px-2 text-xs text-muted-foreground hover:text-foreground">
              {t(locale, "home.contactEmail")}
            </a>
            <div className="flex items-center justify-between gap-3 px-2">
              <span className="text-xs text-muted-foreground">{t(locale, "shell.copyright")}</span>
              <SignInDialog locale={locale} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section aria-label={t(locale, "home.referencesLabel")} className="min-w-0 px-6 py-8 sm:py-10 xl:px-10">
          {/* Hero Section */}
          <HeroPanel
            title={t(locale, "home.heroTitle")}
            description={t(locale, "home.heroDescription")}
            className="mb-8"
          />
          <div className="mx-auto max-w-3xl mb-8">
            <SearchOverlay locale={locale} triggerLabel={t(locale, "shell.search")} />
          </div>

          {/* Browse Categories */}
          <div className="mb-12 sm:mb-16">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-base font-semibold tracking-[-0.01em]">{t(locale, "home.browseCategories")}</h2>
              <Link href={routeHref(locale, "explore")} className="hidden text-sm font-medium text-primary hover:underline lg:inline-flex">
                {t(locale, "home.viewAll")}
                <ArrowRight className="ml-1 size-4" aria-hidden={true} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t(locale, "home.browseCategories")}>
              {browseCategories.map((category) => (
                <Link key={category.id} href={routeHref(locale, category.route)} prefetch={false} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:bg-secondary hover:text-foreground">
                  <category.Icon className="size-4" aria-hidden={true} />
                  <span>{category.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending Industries */}
          <div className="mb-12 sm:mb-16">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-base font-semibold tracking-[-0.01em]">{t(locale, "home.trendingIndustries")}</h2>
              <Link href={routeHref(locale, "categories")} className="hidden text-sm font-medium text-primary hover:underline lg:inline-flex">
                {t(locale, "home.viewAll")}
                <ArrowRight className="ml-1 size-4" aria-hidden={true} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t(locale, "home.trendingIndustries")}>
              {trendingIndustries.map((industry) => (
                <Link key={industry.id} href={currentHomeHref(locale, { ...state, industryId: industry.id })} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:bg-secondary hover:text-foreground">
                  <span>{t(locale, industry.labelKey)}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums">{industry.count}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Sections */}
          <div className="mb-12 sm:mb-16">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-base font-semibold tracking-[-0.01em]">{t(locale, "home.featuredSections")}</h2>
              <Link href={routeHref(locale, "explore")} className="hidden text-sm font-medium text-primary hover:underline lg:inline-flex">
                {t(locale, "home.viewAll")}
                <ArrowRight className="ml-1 size-4" aria-hidden={true} />
              </Link>
            </div>
            {featuredSections.length > 0 ? (
              <MasonryGrid
                items={featuredSections}
                getKey={(card) => card.id}
                heightEstimator={(card) => estimateMasonryHeight(card.image)}
                renderItem={(card, { priority }) => (
                  <SectionCard
                    card={card}
                    locale={locale}
                    openHref={`/${locale}/sections/${card.id}`}
                    priority={priority}
                  />
                )}
                label={t(locale, "explore.resultsLabel")}
                eagerRows={1}
              />
            ) : (
              <EmptyState title={t(locale, "explore.emptyTitle")} description={t(locale, "explore.emptyDescription")} />
            )}
          </div>

          {/* Trending Industries Sidebar (Desktop) */}
          <div className="hidden lg:block">
            <SponsorSlot locale={locale} />
          </div>

          {/* Filter Toolbar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <nav aria-label={t(locale, "shell.primaryNavigation")} className="hidden items-center gap-2 lg:flex">
              <SearchOverlay locale={locale} triggerLabel={t(locale, "shell.search")} />
            </nav>
            <form
              action={`/${locale}`}
              method="get"
              onSubmit={(event) => {
                event.currentTarget.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
                  if (!select.value) select.disabled = true;
                });
              }}
              className="flex min-w-0 flex-1 flex-wrap items-center gap-2 lg:flex-initial"
            >
              {state.q ? <input type="hidden" name="q" value={state.q} /> : null}
              {state.language ? <input type="hidden" name="language" value={state.language} /> : null}
              {state.direction ? <input type="hidden" name="direction" value={state.direction} /> : null}
              <FilterSelect
                label={t(locale, "explore.style")}
                name="style"
                selected={state.styleId}
                options={styles}
              />
              <FilterSelect
                label={t(locale, "explore.industry")}
                name="industry"
                selected={state.industryId}
                options={industries}
              />
              <FilterSelect
                label={t(locale, "home.type")}
                name="sectionType"
                selected={state.sectionTypeId}
                options={sectionTypes}
              />
              <FilterSelect
                label={t(locale, "explore.theme")}
                name="theme"
                selected={state.theme}
                options={themes}
              />
              <FilterSelect
                label={t(locale, "explore.device")}
                name="device"
                selected={state.device}
                options={devices}
              />
              <label className="relative">
                <span className="sr-only">{t(locale, "explore.sortLabel")}</span>
                <select
                  name="sort"
                  aria-label={t(locale, "explore.sortLabel")}
                  defaultValue={state.sortBy === "featured" ? "featured" : ""}
                  className="min-h-9 max-w-36 appearance-none rounded-md border border-border bg-card px-3 pe-8 text-xs font-medium shadow-soft focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">{t(locale, "explore.sortLatest")}</option>
                  <option value="featured">{t(locale, "explore.sortFeatured")}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute inset-e-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" aria-hidden={true} />
              </label>
              <Button type="submit" variant="outline" size="icon" className="size-9" aria-label={t(locale, "home.applyFilters")}>
                <Check aria-hidden={true} className="size-4" />
              </Button>
              {Object.values(state).some(Boolean) ? (
                <Link href={`/${locale}`} className="px-2 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  {t(locale, "explore.clearFilters")}
                </Link>
              ) : null}
            </form>
          </div>

          {/* Results */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {t(locale, "explore.showing")} {data.items.length} {t(locale, "explore.of")} {data.total} {t(locale, "explore.references")}
            </p>
            <div className="lg:hidden">
              <SearchOverlay locale={locale} compact triggerLabel={t(locale, "shell.search")} />
            </div>
          </div>

          {initialError ? (
            <ErrorState
              title={t(locale, "home.errorTitle")}
              description={t(locale, "ui.errorDescription")}
              retryLabel={t(locale, "ui.retry")}
            />
          ) : data.items.length === 0 ? (
            <EmptyState title={t(locale, "explore.emptyTitle")} description={t(locale, "explore.emptyDescription")} />
          ) : (
            <MasonryGrid
              items={data.items}
              getKey={(card) => card.id}
              heightEstimator={(card) => estimateMasonryHeight(card.image)}
              renderItem={(card, { priority }) => (
                <SectionCard
                  card={card}
                  locale={locale}
                  openHref={`/${locale}/sections/${card.id}`}
                  priority={priority}
                />
              )}
              label={t(locale, "explore.resultsLabel")}
              eagerRows={2}
            />
          )}
        </section>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer.Root isOpen={false} onOpenChange={() => {}}>
        <Drawer.Trigger
          onClick={() => {}}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-secondary lg:hidden"
        >
          <Search className="size-4" aria-hidden={true} />
          {t(locale, "explore.filterButton")}
        </Drawer.Trigger>
        <Drawer.Backdrop>
          <Drawer.Content placement="bottom">
            <Drawer.Dialog aria-describedby={descriptionId} className="max-h-[85dvh] rounded-t-lg border-t bg-background p-0">
              <Drawer.Header className="border-b border-border pe-14 text-start">
                <Drawer.Heading level={2}>{t(locale, "explore.filtersTitle")}</Drawer.Heading>
                <p id={descriptionId} className="text-sm text-muted-foreground">{t(locale, "explore.filtersDescription")}</p>
              </Drawer.Header>
              <Drawer.Body className="max-h-[calc(85dvh-11rem)] overflow-y-auto px-5 py-4">
                {/* Filters would go here */}
              </Drawer.Body>
              <Drawer.Footer className="sticky bottom-0 grid grid-cols-2 border-t border-border bg-background/95 px-5 py-4 backdrop-blur">
                <Button type="button" variant="outline" className="min-h-11">{t(locale, "explore.clearFilters")}</Button>
                <Button type="button" className="min-h-11">{t(locale, "explore.applyFilters")}</Button>
              </Drawer.Footer>
              <Drawer.CloseTrigger aria-label={t(locale, "shell.close")} className="absolute top-4 end-4 size-11" />
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer.Root>
    </div>
  );
}