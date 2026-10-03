import { beforeEach, describe, expect, it } from "vitest";
import { getAnalyticsEvents, resetAnalyticsEvents } from "@/lib/analytics";
import { trackExploreDeviceView, trackExploreFilterApplied } from "./analytics";

describe("Explore analytics", () => {
  beforeEach(() => resetAnalyticsEvents());

  it("records applied filters and device-view context", () => {
    trackExploreFilterApplied("industryId", "saas");
    trackExploreDeviceView("mobile");

    expect(getAnalyticsEvents()).toEqual([
      { name: "filter_applied", props: { filter: "industryId", value: "saas" } },
      { name: "mobile_viewed", props: { device: "mobile" } },
    ]);
  });

  it("records desktop view context when the desktop filter is active", () => {
    trackExploreDeviceView("desktop");

    expect(getAnalyticsEvents()).toEqual([
      { name: "desktop_viewed", props: { device: "desktop" } },
    ]);
  });
});
