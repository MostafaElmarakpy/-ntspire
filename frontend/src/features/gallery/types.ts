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
  tags: string[];
  tagsLabel: string;
  language: string;
  devices: Device[];
  devicesLabel: string;
  image: CardImage;
}

export interface PageCardData {
  id: string;
  title: string;
  sourceName: string;
  language: string;
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
  pageCount: number;
  pageCountLabel: string;
  image: CardImage;
}

export interface GalleryData {
  sections: SectionCardData[];
  pages: PageCardData[];
  sources: SourceCardData[];
}
