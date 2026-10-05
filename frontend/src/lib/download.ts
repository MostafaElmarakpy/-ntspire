import type { Device } from "@/types/domain";

/**
 * "Save as Image" downloads the section's own cropped asset for the device on
 * screen — `SectionCrop.renderedAssetId`, never the full page screenshot
 * (spec §22) — straight from the browser, with no backend involved (P7-05).
 */

const MIME_EXTENSIONS: Record<string, string> = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** The raster/serialization extension for an asset's mime type; `png` when unknown. */
export function extensionForMimeType(mimeType: string): string {
  return MIME_EXTENSIONS[mimeType.trim().toLowerCase()] ?? "png";
}

/** One filename token: lowercase, ASCII, hyphenated, never empty. */
export function slugifyPart(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "reference";
}

export interface DownloadNameParts {
  /** The source of the section, as its slug. */
  source: string;
  /** The section type id, e.g. `hero`. */
  sectionType: string;
  device: Device;
  mimeType: string;
}

/** `ntspire-<source>-<type>-<device>.<ext>` (P7-05). */
export function buildDownloadFilename({ source, sectionType, device, mimeType }: DownloadNameParts): string {
  return `ntspire-${slugifyPart(source)}-${slugifyPart(sectionType)}-${device}.${extensionForMimeType(mimeType)}`;
}

/**
 * Fetches the asset and hands it to the browser as a download, so the file the
 * user gets is exactly the bytes at that URL — nothing is re-encoded and no
 * server round trip is added.
 */
export async function downloadAsset(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Asset request failed: ${response.status}`);

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
