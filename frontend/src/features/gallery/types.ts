import type { Device } from "@/types/domain";

export interface CardImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface SectionCardData {
  id: string;
  title: string;
  sectionType: string;
  sourceName: string;
  sourceSlug: string;
  sourceInitial: string;
  tags: string[];
  tagsLabel: string;
  language: string;
  /** Derived from the domain `language` id. Feeds the dev-only Arabic marker; no fixture data involved. */
  isArabic: boolean;
  devices: Device[];
  devicesLabel: string;
  image: CardImage;
}

export interface PageCardData {
  id: string;
  title: string;
  sourceName: string;
  language: string;
  /** Derived from the domain `language` id. Feeds the dev-only Arabic marker; no fixture data involved. */
  isArabic: boolean;
  direction: string;
  devicesLabel: string;
  sectionCount: number;
  sectionCountLabel: string;
  image: CardImage;
}

export interface SourceCardData {
  id: string;
  name: string;
  description: string;
  industry: string;
  /**
   * Sources carry no language of their own, so this is true when any of the
   * source's pages is Arabic. Feeds the dev-only Arabic marker only.
   */
  isArabic: boolean;
  pageCount: number;
  pageCountLabel: string;
  image: CardImage;
}

export interface GalleryData {
  sections: SectionCardData[];
  pages: PageCardData[];
  sources: SourceCardData[];
}
