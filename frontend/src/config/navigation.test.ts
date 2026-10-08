import { describe, expect, it } from "vitest";
import { availableEntries, BROWSE_NAV, FOOTER_NAV, isNavEntryActive, PRIMARY_NAV, RESOURCE_NAV, ROUTE_AVAILABILITY, routeHref, USER_ACTIONS, USER_NAV } from "@/config/navigation";

describe("navigation availability", () => {
  it("enables Explore and Sections for P5-01 and Search for P6-10", () => {
    for (const entry of [...PRIMARY_NAV, ...USER_NAV, ...FOOTER_NAV]) {
      expect(entry.available).toBe(ROUTE_AVAILABILITY[entry.route]);
    }
    expect(PRIMARY_NAV.find((entry) => entry.id === "search")?.available).toBe(true);
    expect(USER_ACTIONS).toContainEqual({ id: "sign-in", labelKey: "shell.signIn", available: true });
    expect(routeHref("en", "explore")).toBe("/en/explore");
    expect(routeHref("en", "sections")).toBe("/en/explore");
    expect(routeHref("en", "mobile")).toBe("/en/explore?device=mobile");
  });

  it("enables the Phase 07 indexes once their routes exist (P7-01)", () => {
    expect(availableEntries(PRIMARY_NAV).map((entry) => entry.id)).toEqual([
      "explore",
      "websites",
      "pages",
      "sections",
      "mobile",
      "categories",
      "search",
    ]);
    expect(availableEntries(FOOTER_NAV).map((entry) => entry.id)).toEqual(["home"]);
    expect(availableEntries(USER_NAV)).toEqual([]);

    // Every enabled route resolves to a real page, and no enabled route is a stub.
    expect(routeHref("en", "websites")).toBe("/en/sources");
    expect(routeHref("en", "pages")).toBe("/en/pages");
    expect(routeHref("en", "categories")).toBe("/en/categories");
  });

  it("keeps the routes that have no page behind them unavailable", () => {
    expect(ROUTE_AVAILABILITY.collections).toBe(false);
    expect(ROUTE_AVAILABILITY.profile).toBe(false);
    for (const id of ["collections", "profile"]) {
      const entry = USER_NAV.find((candidate) => candidate.id === id)!;
      expect(entry.available).toBe(false);
    }
  });

  it("groups every available header entry into Browse or Resources, never a dead end", () => {
    expect(BROWSE_NAV.map((entry) => entry.id)).toEqual(["explore", "websites", "sections", "mobile"]);
    expect(RESOURCE_NAV.map((entry) => entry.id)).toEqual(["pages", "categories"]);
    const grouped = new Set([...BROWSE_NAV, ...RESOURCE_NAV].map((entry) => entry.id));
    for (const entry of availableEntries(PRIMARY_NAV)) {
      // The search entry is owned by the header pill / compact icon instead.
      if (entry.id === "search") continue;
      expect(grouped.has(entry.id)).toBe(true);
    }
  });
});

describe("isNavEntryActive", () => {
  const entry = (id: string) => [...BROWSE_NAV, ...RESOURCE_NAV].find((candidate) => candidate.id === id)!;
  const search = (query = "") => new URLSearchParams(query);

  it("highlights index entries on their detail pages", () => {
    expect(isNavEntryActive(entry("websites"), "en", "/en/sources", search())).toBe(true);
    expect(isNavEntryActive(entry("websites"), "en", "/en/sources/acme", search())).toBe(true);
    expect(isNavEntryActive(entry("websites"), "en", "/en/explore", search())).toBe(false);
    expect(isNavEntryActive(entry("pages"), "en", "/en/pages/some-page", search())).toBe(true);
    expect(isNavEntryActive(entry("categories"), "en", "/en/categories", search())).toBe(true);
  });

  it("gives the plain and filtered feed to Sections, not Explore", () => {
    expect(isNavEntryActive(entry("sections"), "en", "/en/explore", search())).toBe(true);
    expect(isNavEntryActive(entry("sections"), "en", "/en/explore", search("styleId=minimal"))).toBe(true);
    expect(isNavEntryActive(entry("explore"), "en", "/en/explore", search())).toBe(false);
    expect(isNavEntryActive(entry("mobile"), "en", "/en/explore", search())).toBe(false);
  });

  it("gives the mobile view to Mobile only", () => {
    const mobile = search("device=mobile");
    expect(isNavEntryActive(entry("mobile"), "en", "/en/explore", mobile)).toBe(true);
    expect(isNavEntryActive(entry("sections"), "en", "/en/explore", mobile)).toBe(false);
    expect(isNavEntryActive(entry("explore"), "en", "/en/explore", mobile)).toBe(false);
  });

  it("falls back to Explore for /explore views with no header entry, like OG Images", () => {
    const og = search("formatId=og-image");
    expect(isNavEntryActive(entry("explore"), "en", "/en/explore", og)).toBe(true);
    expect(isNavEntryActive(entry("sections"), "en", "/en/explore", og)).toBe(false);
    expect(isNavEntryActive(entry("mobile"), "en", "/en/explore", og)).toBe(false);
  });
});
