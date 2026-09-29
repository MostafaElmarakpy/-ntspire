import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const bannedPhysicalUtilities = [
  ["m", "l-"], ["m", "r-"], ["p", "l-"], ["p", "r-"],
  ["left", "-"], ["right", "-"], ["text", "-left"], ["text", "-right"],
  ["rounded", "-l"], ["rounded", "-r"], ["border", "-l"], ["border", "-r"],
  ["float", "-left"], ["float", "-right"],
].map((parts) => parts.join(""));

describe("logical properties guard", () => {
  it("rejects banned physical directional utilities in source files", () => {
    const files = globSync("src/**/*.{ts,tsx,css}");
    const violations = files.flatMap((file) => {
      const contents = readFileSync(join(process.cwd(), file), "utf8");
      return bannedPhysicalUtilities
        .filter((utility) => contents.includes(utility))
        .map((utility) => `${file}: ${utility}`);
    });

    expect(violations).toEqual([]);
  });
});
