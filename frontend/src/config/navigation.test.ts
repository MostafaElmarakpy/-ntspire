import { describe, expect, it } from "vitest";
import { availableEntries, FOOTER_NAV, PRIMARY_NAV, ROUTE_AVAILABILITY, routeHref, USER_ACTIONS, USER_NAV } from "@/config/navigation";

describe("navigation availability", () => {
  it("enables Explore and Sections for P5-01 and Search for P6-10", () => {
    for (const entry of [...PRIMARY_NAV, ...USER_NAV, ...FOOTER_NAV]) {
      expect(entry.available).toBe(ROUTE_AVAILABILITY[entry.route]);
    }
    expect(availableEntries(PRIMARY_NAV).map((entry) => entry.id)).toEqual(["explore", "sections", "mobile", "search"]);
    expect(availableEntries(FOOTER_NAV).map((entry) => entry.id)).toEqual(["home"]);
    expect(PRIMARY_NAV.find((entry) => entry.id === "search")?.available).toBe(true);
    expect(USER_ACTIONS).toContainEqual({ id: "sign-in", labelKey: "shell.signIn", available: true });
    expect(routeHref("en", "explore")).toBe("/en/explore");
    expect(routeHref("en", "sections")).toBe("/en/explore");
    expect(routeHref("en", "mobile")).toBe("/en/explore?device=mobile");
  });
});
