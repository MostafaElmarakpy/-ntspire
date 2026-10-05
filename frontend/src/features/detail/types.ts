import type { SectionCardData, PageCardData, SourceCardData } from "@/features/gallery/types";
import type { CropRect } from "@/lib/section-crop";
import type { Device } from "@/types/domain";

/** An image with everything `next/image` needs to reserve its space before it loads. */
export interface DetailImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/** One labelled field of a detail header. */
export interface DetailFact {
  label: string;
  value: string;
}

/** Another section on the same page, placed by its own crop for the shown device. */
export interface ContextSibling {
  id: string;
  title: string;
  crop: CropRect;
}

/**
 * One device's view of a section: the crop that is displayed, the page
 * screenshot it was cut from, and where the rectangle sits inside it. Nothing
 * in here is shared between devices — a `mobile` view carries the mobile crop's
 * own asset and coordinates.
 */
export interface SectionDeviceView {
  device: Device;
  deviceLabel: string;
  /** `SectionCrop.renderedAssetId` — the cropped asset, and what a download saves. */
  image: DetailImage;
  /** The rendered asset's media type, which decides the download's file extension. */
  imageMimeType: string;
  /** `SectionCrop.assetId` — the full page screenshot this crop was taken from. */
  pageImage: DetailImage;
  crop: CropRect;
  /** The page's sections, so context view can move between them without leaving the page. */
  siblings: ContextSibling[];
}

export interface SectionDetailData {
  id: string;
  title: string;
  isArabic: boolean;
  /** The taxonomy label of the section type, for the heading area. */
  sectionType: string;
  /** The raw section type id, used as the `<type>` token of a download filename. */
  sectionTypeId: string;
  sourceName: string;
  sourceSlug: string;
  pageTitle: string;
  pageSlug: string;
  facts: DetailFact[];
  tags: string[];
  devices: SectionDeviceView[];
  related: SectionCardData[];
  relatedPage: { title: string; slug: string; image: DetailImage };
  relatedSource: { name: string; slug: string; description: string; image: DetailImage };
}

/** A section as it appears in a page's list, with its own region on that page. */
export interface PageSectionView {
  id: string;
  title: string;
  sectionType: string;
  image: DetailImage;
  crop: CropRect;
}

export interface PageDeviceView {
  device: Device;
  deviceLabel: string;
  /** The full page screenshot for this device. */
  image: DetailImage;
  sections: PageSectionView[];
}

export interface PageDetailData {
  id: string;
  slug: string;
  title: string;
  isArabic: boolean;
  sourceName: string;
  sourceSlug: string;
  facts: DetailFact[];
  devices: PageDeviceView[];
}

export interface SourcePageSummary {
  id: string;
  slug: string;
  title: string;
  image: DetailImage;
  language: string;
  devicesLabel: string;
  sectionCount: number;
  isArabic: boolean;
}

export interface SourceDetailData {
  id: string;
  slug: string;
  name: string;
  description: string;
  url: string;
  isArabic: boolean;
  facts: DetailFact[];
  pages: SourcePageSummary[];
  sections: SectionCardData[];
}

/** A taxonomy entry on the categories index, with the count it currently has. */
export interface CategoryEntry {
  id: string;
  label: string;
  count: number;
  /** The Explore URL this entry filters to, built through the shared serializer. */
  href: string;
}

export interface CategoryGroup {
  id: string;
  title: string;
  entries: CategoryEntry[];
}

export interface CategoriesIndexData {
  groups: CategoryGroup[];
}

export interface SourcesIndexData {
  sources: SourceCardData[];
}

export interface PagesIndexData {
  pages: PageCardData[];
}
