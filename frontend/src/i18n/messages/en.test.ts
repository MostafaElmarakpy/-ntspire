import { describe, expect, it } from "vitest";

import { getMessages, t } from "@/i18n/messages";

describe("English messages", () => {
  it("returns the English message catalog", () => {
    expect(getMessages("en").wordmark).toBe("ntspire");
  });

  it("translates supported message keys", () => {
    expect(t("en", "home.heroTitle")).toBe("Web design inspiration");
  });
});
