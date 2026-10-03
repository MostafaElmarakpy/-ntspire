import { describe, expect, it } from "vitest";
import {
  CARD_FOOTER_ALLOWANCE,
  DEFAULT_MASONRY_COLUMNS,
  distributeIntoColumns,
  estimateMasonryHeight,
  getColumnCount,
} from "@/lib/masonry";

interface Item {
  id: string;
  height: number;
}

const item = (id: string, height: number): Item => ({ id, height });

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

describe("distributeIntoColumns", () => {
  it("returns no columns for an empty list", () => {
    expect(distributeIntoColumns([], 3, (entry: Item) => entry.height)).toEqual([[], [], []]);
  });

  it("keeps every item exactly once", () => {
    const items = [item("a", 100), item("b", 500), item("c", 250), item("d", 700), item("e", 90)];
    const columns = distributeIntoColumns(items, 3, (entry) => entry.height);
    expect(visualOrder(columns).sort((left, right) => left.id.localeCompare(right.id))).toEqual(items.slice().sort((left, right) => left.id.localeCompare(right.id)));
  });

  it("preserves ranking order across the top row", () => {
    const items = Array.from({ length: 12 }, (_, index) => item(`item-${index}`, 100));
    const columns = distributeIntoColumns(items, 4, (entry) => entry.height);

    expect(visualOrder(columns).slice(0, 4)).toEqual(items.slice(0, 4));
    expect(visualOrder(columns)).toEqual(items);
  });

  it("places each item in the currently shortest column", () => {
    const items = [item("tall", 400), item("short", 100), item("medium", 200)];
    const columns = distributeIntoColumns(items, 2, (entry) => entry.height);

    // tall -> column 0 (400). short -> column 1 (100). medium -> column 1 is
    // still shortest (100 < 400), so it stacks under short.
    expect(columns[0].map((entry) => entry.id)).toEqual(["tall"]);
    expect(columns[1].map((entry) => entry.id)).toEqual(["short", "medium"]);
  });

  it("breaks height ties toward the earliest column", () => {
    const items = [item("a", 100), item("b", 100), item("c", 100), item("d", 100)];
    const columns = distributeIntoColumns(items, 2, (entry) => entry.height);

    expect(columns[0].map((entry) => entry.id)).toEqual(["a", "c"]);
    expect(columns[1].map((entry) => entry.id)).toEqual(["b", "d"]);
  });

  it("keeps a balanced total height across columns", () => {
    const items = [item("a", 300), item("b", 120), item("c", 220), item("d", 80), item("e", 260)];
    const columns = distributeIntoColumns(items, 3, (entry) => entry.height);
    const totals = columns.map((column) => column.reduce((sum, entry) => sum + entry.height, 0));

    expect(Math.max(...totals) - Math.min(...totals)).toBeLessThanOrEqual(320);
  });

  it("puts everything in one column when only one is requested", () => {
    const items = [item("a", 10), item("b", 20)];
    expect(distributeIntoColumns(items, 1, (entry) => entry.height)).toEqual([items]);
  });

  it("treats an invalid column count as a single column", () => {
    const items = [item("a", 10), item("b", 20)];
    expect(distributeIntoColumns(items, 0, (entry) => entry.height)).toEqual([items]);
  });

  it("reverses the column order for rtl so the first column reads right to left", () => {
    const items = [item("a", 100), item("b", 100), item("c", 100)];
    const ltr = distributeIntoColumns(items, 3, (entry) => entry.height, "ltr");
    const rtl = distributeIntoColumns(items, 3, (entry) => entry.height, "rtl");

    expect(rtl).toEqual([...ltr].reverse());
    expect(rtl[0].map((entry) => entry.id)).toEqual(["c"]);
    expect(rtl[2].map((entry) => entry.id)).toEqual(["a"]);
  });
});

describe("getColumnCount", () => {
  it("maps viewport widths onto the responsive column counts", () => {
    expect(getColumnCount(390)).toBe(1);
    expect(getColumnCount(767)).toBe(1);
    expect(getColumnCount(768)).toBe(2);
    expect(getColumnCount(1023)).toBe(2);
    expect(getColumnCount(1024)).toBe(3);
    expect(getColumnCount(1439)).toBe(3);
    expect(getColumnCount(1440)).toBe(4);
    expect(getColumnCount(1920)).toBe(4);
  });

  it("falls back to the server default for a width below every breakpoint", () => {
    expect(getColumnCount(-1, [{ minWidth: 640, columns: 2 }])).toBe(DEFAULT_MASONRY_COLUMNS);
  });
});

describe("estimateMasonryHeight", () => {
  it("derives height from the asset ratio plus the card body allowance", () => {
    expect(estimateMasonryHeight({ width: 1440, height: 720 }, 1)).toBe(0.5 + CARD_FOOTER_ALLOWANCE);
  });

  it("scales with the measured column width", () => {
    expect(estimateMasonryHeight({ width: 1000, height: 500 }, 300)).toBe(150 + CARD_FOOTER_ALLOWANCE);
  });

  it("falls back to the body allowance for unusable dimensions", () => {
    expect(estimateMasonryHeight({ width: 0, height: 0 })).toBe(CARD_FOOTER_ALLOWANCE);
  });
});
