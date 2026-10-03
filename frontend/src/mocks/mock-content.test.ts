import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { MOCK_ASSETS, MOCK_PAGES, MOCK_SOURCES } from "@/mocks/fixtures";

const assetDirectory = path.join(process.cwd(), "public", "mock-assets");

/**
 * Real companies, products and websites that must never appear in mock content.
 * `docs/prompts/00-global-rules.md` § "Mock data content rules" requires
 * realistic-but-fictional Source names, and says the rule applies everywhere mock
 * content is generated or referenced: fixture data, generated SVG filenames and
 * content, page titles, attribution text, and test fixtures. These are the real
 * brands that an earlier revision of the fixture set used.
 */
const REAL_BRANDS = [
  "linear",
  "revolut",
  "notion",
  "airtable",
  "patagonia",
  "figma",
  "mubawab",
  "careem",
  "salla",
  "arc browser",
  "مبوب",
  "كريم",
  "سلة",
];

const assetFiles = () => fs.readdirSync(assetDirectory).filter((file) => file.endsWith(".svg"));

/** Filenames and contents together, because the generator writes titles into the SVG body. */
const assetText = () =>
  assetFiles()
    .map((file) => `${file}\n${fs.readFileSync(path.join(assetDirectory, file), "utf8")}`)
    .join("\n");

describe("mock content rules", () => {
  it("keeps real company names out of fixture data, asset filenames, and asset content", () => {
    const haystack = `${JSON.stringify(MOCK_SOURCES)}\n${JSON.stringify(MOCK_PAGES)}\n${assetText()}`.toLowerCase();
    const found = REAL_BRANDS.filter((brand) => haystack.includes(brand));
    expect(found, `real brand names present in mock content: ${found.join(", ")}`).toEqual([]);
  });

  it("points every source at a reserved .example domain, so no real site is referenced", () => {
    const hostnames = MOCK_SOURCES.map((source) => new URL(source.url).hostname);
    expect(hostnames.filter((hostname) => !hostname.endsWith(".example"))).toEqual([]);
  });

  it("keeps the asset directory in step with the fixtures, so a rename leaves no orphan files", () => {
    const declared = new Set(MOCK_ASSETS.map((asset) => `${asset.id}.svg`));
    const onDisk = new Set(assetFiles());
    expect(assetFiles().filter((file) => !declared.has(file))).toEqual([]);
    expect([...declared].filter((file) => !onDisk.has(file))).toEqual([]);
  });
});
