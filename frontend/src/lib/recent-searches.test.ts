import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_RECENT_SEARCHES,
  addRecentSearch,
  loadRecentSearches,
  normalizeRecentSearches,
  saveRecentSearches,
} from "@/lib/recent-searches";

/**
 * Recent searches are a convenience stored in the browser, so every path that
 * could go wrong — missing storage, corrupt JSON, a full quota — has to degrade
 * to "no recent searches" rather than break the overlay.
 */

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("normalizeRecentSearches", () => {
  it("reads anything that is not a list of strings as no recent searches", () => {
    expect(normalizeRecentSearches(undefined)).toEqual([]);
    expect(normalizeRecentSearches(null)).toEqual([]);
    expect(normalizeRecentSearches("arabic saas hero")).toEqual([]);
    expect(normalizeRecentSearches({ 0: "hero" })).toEqual([]);
    expect(normalizeRecentSearches([1, "hero", null, "  ", "pricing"])).toEqual(["hero", "pricing"]);
  });

  it("keeps at most the maximum number of entries", () => {
    const many = Array.from({ length: MAX_RECENT_SEARCHES + 4 }, (_, index) => `query ${index}`);
    expect(normalizeRecentSearches(many)).toHaveLength(MAX_RECENT_SEARCHES);
  });
});

describe("addRecentSearch", () => {
  it("puts the newest query first", () => {
    expect(addRecentSearch(["hero"], "pricing")).toEqual(["pricing", "hero"]);
  });

  it("de-duplicates case-insensitively and ignores punctuation differences", () => {
    expect(addRecentSearch(["E-commerce hero"], "ecommerce hero")).toEqual(["ecommerce hero"]);
  });

  it("never exceeds the maximum, dropping the oldest entry", () => {
    const full = Array.from({ length: MAX_RECENT_SEARCHES }, (_, index) => `query ${index}`);
    const next = addRecentSearch(full, "newest");
    expect(next).toHaveLength(MAX_RECENT_SEARCHES);
    expect(next[0]).toBe("newest");
    expect(next).not.toContain(`query ${MAX_RECENT_SEARCHES - 1}`);
  });

  it("returns the list unchanged for a blank query", () => {
    expect(addRecentSearch(["hero"], "   ")).toEqual(["hero"]);
  });

  it("returns the list unchanged for a query that is only punctuation", () => {
    expect(addRecentSearch(["hero"], "!!!")).toEqual(["hero"]);
  });

  it("drops duplicates already sitting in the stored list", () => {
    expect(normalizeRecentSearches(["Hero", "hero", "hero "])).toEqual(["Hero"]);
  });
});

describe("recent search storage", () => {
  it("round-trips saved searches", () => {
    saveRecentSearches(["arabic saas hero", "dark ecommerce navbar"]);
    expect(loadRecentSearches()).toEqual(["arabic saas hero", "dark ecommerce navbar"]);
  });

  it("reads missing and corrupt storage as no recent searches", () => {
    expect(loadRecentSearches()).toEqual([]);

    // Written through the module first, so the key itself stays private.
    saveRecentSearches(["hero"]);
    const key = window.localStorage.key(0);
    expect(key).not.toBeNull();

    window.localStorage.setItem(key as string, "{ not json");
    expect(loadRecentSearches()).toEqual([]);

    window.localStorage.setItem(key as string, JSON.stringify({ recent: ["hero"] }));
    expect(loadRecentSearches()).toEqual([]);
  });

  it("survives a storage that refuses to write", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => saveRecentSearches(["hero"])).not.toThrow();
  });

  it("survives a storage that refuses to read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(loadRecentSearches()).toEqual([]);
  });
});
