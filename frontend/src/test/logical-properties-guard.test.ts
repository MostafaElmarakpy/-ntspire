import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const bannedPhysicalUtilities = [
  /(?:^|[\s:])(?:-?ml-|mr-|pl-|pr-)/,
  /(?:^|[\s:])(?:left|right)-\d/,
  /(?:^|[\s:])text-(?:left|right)(?:$|[\s:])/,
  /(?:^|[\s:])rounded-[lr]-(?:none|sm|md|lg|xl|\d)/,
  /(?:^|[\s:])border-[lr](?:-\d|$)/,
  /(?:^|[\s:])float-(?:left|right)(?:$|[\s:])/,
];

describe("logical properties guard", () => {
  it("rejects banned physical directional utilities in source files", () => {
    const files = globSync("src/**/*.{ts,tsx,css}");
    const violations = files.flatMap((file) => {
      const contents = readFileSync(join(process.cwd(), file), "utf8");
      return bannedPhysicalUtilities
        .filter((utility) => utility.test(contents))
        .map((utility) => `${file}: ${utility}`);
    });

    expect(violations).toEqual([]);
  });
});
