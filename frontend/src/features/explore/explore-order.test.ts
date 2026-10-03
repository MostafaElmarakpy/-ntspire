import { describe, expect, it } from "vitest";
import { MOCK_ASSETS, MOCK_SECTION_CROPS, MOCK_SECTIONS } from "@/mocks/fixtures";
import { distributeIntoColumns, estimateMasonryHeight } from "@/lib/masonry";

/**
 * Regression guard for the Explore gallery layout.
 *
 * Explore used to render its ranked results with CSS multi-column
 * (`columns-3`/`columns-4`). CSS multi-column fills each column top to bottom, so
 * the three highest-ranked references could all land in the same column and the
 * visible top row was an arbitrary slice. These tests pin the property that
 * matters: the ranked results are placed in ranking order, one per column across
 * the top row.
 */

/** The ranking order the search engine returns, resolved to the crop Explore renders. */
const rankedItems = MOCK_SECTIONS.map((section) => {
  const crops = MOCK_SECTION_CROPS.filter((crop) => crop.sectionId === section.id);
  const crop = crops.find((candidate) => candidate.device === "desktop") ?? crops[0];
  const asset = MOCK_ASSETS.find((candidate) => candidate.id === crop?.renderedAssetId);
  if (!crop || !asset) throw new Error(`Mock section ${section.id} has no renderable crop`);
  return { id: section.id, image: { width: crop.width, height: crop.height } };
});

/** What the first Explore page shows. */
const firstPage = rankedItems.slice(0, 12);
const heightOf = (item: (typeof rankedItems)[number]) => estimateMasonryHeight(item.image);

/** Reads the grid row by row across columns, i.e. how a sighted reader scans it. */
const visualOrder = <T,>(columns: T[][]): T[] => {
  const rows = Math.max(0, ...columns.map((column) => column.length));
  const order: T[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (const column of columns) {
      if (row < column.length) order.push(column[row]);
    }
  }
  return order;
};

const columnOf = (columns: { id: string }[][], id: string) =>
  columns.findIndex((column) => column.some((item) => item.id === id));

describe("Explore masonry ordering", () => {
  it("has genuinely uneven card heights, so the ordering tests are not trivially balanced", () => {
    expect(new Set(firstPage.map(heightOf)).size).toBeGreaterThan(3);
  });

  it("distributes every ranked result exactly once", () => {
    const columns = distributeIntoColumns(firstPage, 3, heightOf);
    const placedIds = columns.flat().map((item) => item.id);
    expect(placedIds.slice().sort()).toEqual(firstPage.map((item) => item.id).slice().sort());
  });

  it("places the highest-ranked results across the top row, not stacked in one column", () => {
    for (const columnCount of [1, 2, 3, 4]) {
      const columns = distributeIntoColumns(firstPage, columnCount, heightOf);
      expect(columns.map((column) => column[0]?.id)).toEqual(
        firstPage.slice(0, columnCount).map((item) => item.id),
      );
    }
  });

  it("never puts the top three ranked results in the same column", () => {
    const columns = distributeIntoColumns(firstPage, 3, heightOf);
    const positions = ["0", "1", "2"].map((rank) => columnOf(columns, firstPage[Number(rank)].id));
    expect(new Set(positions).size).toBe(3);
  });

  it("reads back in ranking order when every card has the same height", () => {
    for (const columnCount of [2, 3, 4]) {
      const columns = distributeIntoColumns(firstPage, columnCount, () => 100);
      expect(visualOrder(columns)).toEqual(firstPage);
    }
  });
});
