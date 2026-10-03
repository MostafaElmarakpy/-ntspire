"use client";

import { Fragment, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "cn";
import { DEFAULT_MASONRY_COLUMNS, MASONRY_BREAKPOINTS, distributeIntoColumns, getColumnCount } from "@/lib/masonry";

function subscribeToViewport(onStoreChange: () => void): () => void {
  const mediaQueries = MASONRY_BREAKPOINTS.map((breakpoint) => window.matchMedia(`(min-width: ${breakpoint.minWidth}px)`));
  mediaQueries.forEach((query) => query.addEventListener("change", onStoreChange));
  window.addEventListener("resize", onStoreChange);

  return () => {
    mediaQueries.forEach((query) => query.removeEventListener("change", onStoreChange));
    window.removeEventListener("resize", onStoreChange);
  };
}

const getViewportColumns = () => getColumnCount(window.innerWidth);
const getHydrationColumns = () => DEFAULT_MASONRY_COLUMNS;

/**
 * The column count is a viewport fact the server cannot know. `useSyncExternalStore`
 * renders the server snapshot while hydrating (so the markup matches) and swaps in
 * the measured count before paint, which keeps the grid free of hydration warnings.
 */
export function useMasonryColumnCount(): number {
  return useSyncExternalStore(subscribeToViewport, getViewportColumns, getHydrationColumns);
}

interface MasonryGridProps<T> {
  items: readonly T[];
  getKey: (item: T) => string;
  heightEstimator: (item: T) => number;
  /**
   * `priority` marks the cards whose images are painted above the fold, so they
   * load eagerly and Next.js stops warning that the Largest Contentful Paint image
   * is lazy. Every other image stays lazy.
   */
  renderItem: (item: T, options: { priority: boolean }) => ReactNode;
  label: string;
  /** How many rows of ranked items count as above the fold. Defaults to the first row. */
  eagerRows?: number;
  className?: string;
}

export function MasonryGrid<T>({ items, getKey, heightEstimator, renderItem, label, eagerRows = 1, className }: MasonryGridProps<T>) {
  const columnCount = useMasonryColumnCount();
  const columns = distributeIntoColumns(items, columnCount, heightEstimator);
  const aboveTheFold = new Set(items.slice(0, columnCount * Math.max(1, eagerRows)).map(getKey));

  return (
    <div role="region" aria-label={label} className={cn("flex items-start gap-[var(--masonry-gap)]", className)}>
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="flex min-w-0 flex-1 flex-col gap-[var(--masonry-gap)]">
          {column.map((item) => (
            <Fragment key={getKey(item)}>{renderItem(item, { priority: aboveTheFold.has(getKey(item)) })}</Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}
