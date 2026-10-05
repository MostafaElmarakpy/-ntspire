import type { Device, SectionCrop } from "@/types/domain";

/** The crop geometry of a `SectionCrop`, without the asset references around it. */
export interface CropRect {
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

/** The pixel size a rectangle is expressed in — the asset's own, or the rendered box's. */
export interface ImageSize {
  width: number;
  height: number;
}

export interface CssRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * The crop a card or detail view shows when no device has been chosen yet
 * (spec §9: the desktop crop is the default, the mobile crop the fallback).
 */
export const DEFAULT_CROP_DEVICE: Device = "desktop";

/**
 * The crops a section actually has, in a stable order, so a device switcher can
 * disable the variants that do not exist instead of inventing coordinates.
 */
export function availableDevices(crops: readonly SectionCrop[]): Device[] {
  return (["desktop", "mobile"] as const).filter((device) => crops.some((crop) => crop.device === device));
}

export function hasCropFor(crops: readonly SectionCrop[], device: Device): boolean {
  return crops.some((crop) => crop.device === device);
}

/**
 * The single crop to display for a device.
 *
 * Coordinates are per device and are never reusable across devices (spec §9),
 * so this only ever returns a crop whose own `device` matches what was asked
 * for. The fallback to the other device exists only to choose which crop is
 * shown by default when nothing was asked for — it never moves a rectangle
 * from one device's page screenshot onto another's.
 */
export function pickCrop(crops: readonly SectionCrop[], device?: Device): SectionCrop | undefined {
  if (device) {
    const exact = crops.find((crop) => crop.device === device);
    if (exact) return exact;
  }
  return crops.find((crop) => crop.device === DEFAULT_CROP_DEVICE) ?? crops[0];
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const ratio = (value: number, total: number) => (total > 0 ? clamp((value / total) * 100, 0, 100) : 0);

/**
 * The crop rectangle as a percentage of the page screenshot it was taken from.
 *
 * Percentages are what the highlight is drawn with: the screenshot is rendered
 * `width: 100%; height: auto`, so its laid-out size differs from its pixel size
 * at every viewport, and a percentage rectangle stays correct at all of them.
 */
export function cropRectToPercent(crop: CropRect, image: ImageSize): CssRect {
  if (image.width <= 0 || image.height <= 0) return { left: 0, top: 0, width: 0, height: 0 };
  const left = ratio(crop.cropX, image.width);
  const top = ratio(crop.cropY, image.height);
  return {
    left,
    top,
    width: clamp(ratio(crop.cropWidth, image.width), 0, 100 - left),
    height: clamp(ratio(crop.cropHeight, image.height), 0, 100 - top),
  };
}

/**
 * The same rectangle in pixels, for a screenshot rendered at `rendered` rather
 * than at its intrinsic size — the geometry a scroll-into-view calculation or a
 * pointer hit test needs.
 */
export function cropRectToPixels(crop: CropRect, image: ImageSize, rendered: ImageSize): CssRect {
  const percent = cropRectToPercent(crop, image);
  return {
    left: (percent.left / 100) * rendered.width,
    top: (percent.top / 100) * rendered.height,
    width: (percent.width / 100) * rendered.width,
    height: (percent.height / 100) * rendered.height,
  };
}

/** The offset that centres `rect` inside a viewport `viewportHeight` tall. */
export function centeringScrollTop(rect: CssRect, viewportHeight: number): number {
  return Math.max(0, rect.top + rect.height / 2 - viewportHeight / 2);
}
