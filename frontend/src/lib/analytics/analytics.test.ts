import { beforeEach, describe, expect, it } from "vitest";

import {
  getAnalyticsEvents,
  resetAnalyticsEvents,
  trackEvent,
} from "@/lib/analytics";

describe("mock analytics", () => {
  beforeEach(() => {
    resetAnalyticsEvents();
  });

  it("buffers typed events for tests", () => {
    trackEvent("saved", { sectionId: "section-hero" });

    expect(getAnalyticsEvents()).toEqual([
      {
        name: "saved",
        props: { sectionId: "section-hero" },
      },
    ]);
  });

  it("clears the in-memory buffer", () => {
    trackEvent("unsaved");
    resetAnalyticsEvents();

    expect(getAnalyticsEvents()).toEqual([]);
  });
});
