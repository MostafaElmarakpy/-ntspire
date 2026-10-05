import { describe, expect, it } from "vitest";
import { availableEntries, FOOTER_NAV, PRIMARY_NAV, ROUTE_AVAILABILITY, routeHref, USER_ACTIONS, USER_NAV } from "@/config/navigation";

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
});
