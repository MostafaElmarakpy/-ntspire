import "server-only";
import { applyMockConfig } from "@/config/mock-config";
import type { SupportedLocale } from "@/i18n/config";
import type { GalleryData } from "./types";
import { buildGalleryData, emptyGalleryData } from "./card-model";

/**
 * The gallery's data loader. The view-model rules themselves live in
 * `card-model.ts`, which has no `server-only` import so the same rules can be
 * unit-tested and reused by the detail pages; this module only adds the service
 * boundary.
 */
export {
  assetById,
  buildGalleryData,
  deviceAvailabilityLabel,
  emptyGalleryData,
  pageById,
  pageImage,
  pageSections,
  pickSectionCrop,
  sectionById,
  sectionCrops,
  sourceById,
  sourcePages,
  sourceSections,
  toPageCard,
  toSectionCard,
  toSourceCard,
} from "./card-model";

/** Mirrors the service-layer `?__mock=` contract so the dev route is testable. */
export async function loadGalleryData(locale: SupportedLocale, mockQuery?: string): Promise<GalleryData> {
  return applyMockConfig(() => buildGalleryData(locale), mockQuery, emptyGalleryData());
}
