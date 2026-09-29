import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("shadcn class utility", () => {
  it("merges conditional Tailwind classes", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });
});
