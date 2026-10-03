import type { Direction } from "@/types/domain";

export interface MasonryBreakpoint {
  readonly minWidth: number;
  readonly columns: number;
}

/**
 * Column counts per viewport width: 4 large desktop / 3 laptop / 2 tablet /
 * 1 mobile, the rhythm P4-01 asks for. The widths intentionally match the four
 * widths the gallery is verified at (1440, 1024, 768, 390) so each one lands on
 * a distinct column count.
 */
export const MASONRY_BREAKPOINTS: readonly MasonryBreakpoint[] = [
  { minWidth: 1440, columns: 4 },
  { minWidth: 1024, columns: 3 },
  { minWidth: 768, columns: 2 },
  { minWidth: 0, columns: 1 },
];

/** Height of a card's text body below the screenshot, in pixels. */
export const CARD_FOOTER_ALLOWANCE = 132;

/**
 * Column count used by the server render and by the hydration render.
 *
 * The real column count depends on the viewport, which the server cannot know.
 * `useSyncExternalStore` renders the server snapshot during hydration (so the
 * markup matches) and re-renders with the measured value before paint, which
 * keeps the gallery hydration-safe on every route that server-renders cards.
 */
export const DEFAULT_MASONRY_COLUMNS = 1;

export function getColumnCount(width: number, breakpoints: readonly MasonryBreakpoint[] = MASONRY_BREAKPOINTS): number {
  const match = breakpoints.find((breakpoint) => width >= breakpoint.minWidth);
  return match ? match.columns : DEFAULT_MASONRY_COLUMNS;
}

export function normalizeColumnCount(columnCount: number): number {
  return Number.isFinite(columnCount) && columnCount >= 1 ? Math.floor(columnCount) : 1;
}

/** Height estimate from the asset's known dimensions plus the card body allowance. */
export function estimateMasonryHeight(image: { width: number; height: number }, columnWidth = 1): number {
  if (image.width <= 0 || image.height <= 0) return CARD_FOOTER_ALLOWANCE;
  return (image.height / image.width) * columnWidth + CARD_FOOTER_ALLOWANCE;
}

/**
 * Greedy shortest-column placement, the defining behaviour of a waterfall grid.
 *
 * Items are visited in ranking order and each one is appended to the column with
 * the smallest accumulated height (ties go to the earliest column), so the first
 * items form the top row in result order instead of filling one column top-to-bottom
 * the way CSS multi-column does.
 *
 * The returned array is ordered for rendering along the reading edge: with
 * `direction: "ltr"` index 0 is the leftmost column, with `"rtl"` index 0 is the
 * rightmost column. The item-to-column assignment is identical for both; only the
 * array order differs.
 */
export function distributeIntoColumns<T>(
  items: readonly T[],
  columnCount: number,
  heightEstimator: (item: T) => number,
  direction: Direction = "ltr",
): T[][] {
  const count = normalizeColumnCount(columnCount);
  const columns: T[][] = Array.from({ length: count }, () => []);
  const heights = new Array<number>(count).fill(0);

  for (const item of items) {
    let target = 0;
    for (let index = 1; index < count; index += 1) {
      if (heights[index] < heights[target]) target = index;
    }
    columns[target].push(item);
    heights[target] += Math.max(0, heightEstimator(item));
  }

  return direction === "rtl" ? [...columns].reverse() : columns;
}
