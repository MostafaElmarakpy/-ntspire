import { afterEach, describe, expect, it, vi } from "vitest";
import { buildDownloadFilename, downloadAsset, extensionForMimeType, slugifyPart } from "@/lib/download";

describe("extensionForMimeType", () => {
  it("maps the raster types the library stores", () => {
    expect(extensionForMimeType("image/svg+xml")).toBe("svg");
    expect(extensionForMimeType("image/png")).toBe("png");
    expect(extensionForMimeType("image/jpeg")).toBe("jpg");
    expect(extensionForMimeType("image/webp")).toBe("webp");
    expect(extensionForMimeType("image/gif")).toBe("gif");
  });

  it("is tolerant of casing and surrounding space", () => {
    expect(extensionForMimeType(" IMAGE/PNG ")).toBe("png");
  });

  it("falls back to png for an unknown type", () => {
    expect(extensionForMimeType("application/octet-stream")).toBe("png");
  });
});

describe("buildDownloadFilename", () => {
  it("follows the ntspire-<source>-<type>-<device>.<ext> shape", () => {
    expect(buildDownloadFilename({ source: "flowbase", sectionType: "hero", device: "desktop", mimeType: "image/svg+xml" }))
      .toBe("ntspire-flowbase-hero-desktop.svg");
    expect(buildDownloadFilename({ source: "nimbus-pay", sectionType: "value_proposition", device: "mobile", mimeType: "image/png" }))
      .toBe("ntspire-nimbus-pay-value-proposition-mobile.png");
  });

  it("keeps the device token exactly desktop or mobile", () => {
    expect(buildDownloadFilename({ source: "rafif", sectionType: "pricing", device: "mobile", mimeType: "image/png" })).toContain("-mobile.");
    expect(buildDownloadFilename({ source: "rafif", sectionType: "pricing", device: "desktop", mimeType: "image/png" })).toContain("-desktop.");
  });

  it("normalises a name that is not URL-safe", () => {
    expect(buildDownloadFilename({ source: "Cedarline Shop", sectionType: "Logo Cloud", device: "desktop", mimeType: "image/png" }))
      .toBe("ntspire-cedarline-shop-logo-cloud-desktop.png");
  });

  it("never produces an empty token", () => {
    expect(slugifyPart("   ")).toBe("reference");
    expect(slugifyPart("///")).toBe("reference");
    expect(buildDownloadFilename({ source: "", sectionType: "", device: "desktop", mimeType: "image/png" }))
      .toBe("ntspire-reference-reference-desktop.png");
  });
});

describe("downloadAsset", () => {
  // jsdom implements neither method, so the test provides them and removes them again.
  const defineObjectUrls = () => {
    const createObjectURL = vi.fn(() => "blob:ntspire-1");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, "revokeObjectURL", { value: revokeObjectURL, configurable: true });
    return { createObjectURL, revokeObjectURL };
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Reflect.deleteProperty(URL, "createObjectURL");
    Reflect.deleteProperty(URL, "revokeObjectURL");
  });

  it("fetches the asset, hands it to the browser as a download, and releases the object URL", async () => {
    const blob = new Blob(["image-bytes"], { type: "image/png" });
    const fetchMock = vi.fn(async () => ({ ok: true, blob: async () => blob }) as Response);
    vi.stubGlobal("fetch", fetchMock);
    const { createObjectURL, revokeObjectURL } = defineObjectUrls();

    const clicked: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this);
    });

    await downloadAsset("/mock-assets/crop-section-one-desktop.svg", "ntspire-flowbase-hero-desktop.png");

    expect(fetchMock).toHaveBeenCalledWith("/mock-assets/crop-section-one-desktop.svg");
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(clicked).toHaveLength(1);
    expect(clicked[0].download).toBe("ntspire-flowbase-hero-desktop.png");
    expect(clicked[0].href).toContain("blob:ntspire-1");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:ntspire-1");
    // The temporary anchor does not stay in the document.
    expect(document.querySelector("a[download]")).toBeNull();
  });

  it("reports a failed asset request instead of downloading an error page", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500 }) as Response));
    await expect(downloadAsset("/missing.svg", "ntspire-x-y-desktop.svg")).rejects.toThrow("Asset request failed: 500");
  });
});
